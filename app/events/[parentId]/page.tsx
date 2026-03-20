import Link from "next/link";
import { baseUrl } from "@/lib/api";
import { formatEventDate } from "@/lib/dateFormat";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import EventCardImage from "@/app/components/EventCardImage";
import AutoGeoCity from "@/app/components/AutoGeoCity";

type EventItem = {
  ID: number;
  Name: string;
  City?: string;
  Venue?: string;
  DisplayDate?: string;
  ParentCategoryID?: number;
  ChildCategoryID?: number | string;
  MapURL?: string;
  TicketURL?: string;
  ExternalURL?: string;
  Url?: string;
};

const PAGE_STEP = 40;
const MAX_LIMIT = 200;

function getChildCategoryKey(event: EventItem) {
  const raw = event.ChildCategoryID;
  if (raw === null || raw === undefined || raw === "") return "unknown";
  return String(raw).trim().toLowerCase();
}

function subcategoryLabel(parentId: number, key: string) {
  const labelMaps: Record<number, Record<string, string>> = {
    1: {
      "63": "Baseball (MLB)",
      "65": "Football",
      "66": "Basketball (NBA / NCAA)",
      "67": "Golf",
      "68": "Hockey",
      "69": "Motorsports",
      "53": "Rodeo",
      "50": "Boxing",
      "101": "MMA",
      "41": "Extreme Sports",
    },
    2: {
      "62": "Pop / Contemporary",
      "37": "Rock",
      "24": "Comedy / Variety",
      "22": "Alternative",
      "98": "Electronic",
      "83": "Reggae",
      "73": "International",
      "49": "Classical / Instrumental",
      "100": "Festivals",
    },
    3: {
      "35": "Family / Variety",
      "38": "Musicals",
      "32": "Plays",
      "75": "Opera",
      "82": "Dance",
      "97": "Youth Theater",
      "60": "Ballet",
      "104": "Operatic / Vocal",
    },
  };

  if (key === "unknown") return "Other";
  return labelMaps[parentId]?.[key] || `Subcategory ${key}`;
}

function normalizeCity(raw: string) {
  let city = (raw || "").trim().replace(/\+/g, " ");
  for (let index = 0; index < 3; index += 1) {
    try {
      const decoded = decodeURIComponent(city);
      if (decoded === city) break;
      city = decoded;
    } catch {
      break;
    }
  }
  return city;
}

function normalizeToken(value: string) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveEventImageCandidates(event: EventItem) {
  const artistName = (event.Name || "").trim();
  const artistPhoto = artistName
    ? `/api/artist-photo?name=${encodeURIComponent(artistName)}`
    : "";

  return [artistPhoto, "/hero.png"].filter(Boolean);
}

function buildCategoryHref(parentId: number, options: { limit: number; sub?: string; city?: string }) {
  const params = new URLSearchParams();
  params.set("limit", String(options.limit));

  if (options.sub && options.sub !== "all") {
    params.set("sub", options.sub);
  }

  if (options.city) {
    params.set("city", options.city);
  }

  return `/events/${parentId}?${params.toString()}`;
}

async function fetchEventList(url: string) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return { events: [] as EventItem[], ok: false };

    const data = await response.json();
    return {
      events: (data?.result ?? []) as EventItem[],
      ok: true,
    };
  } catch {
    return { events: [] as EventItem[], ok: false };
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ parentId: string }> | { parentId: string };
  searchParams?: Promise<{ limit?: string; sub?: string; city?: string }> | { limit?: string; sub?: string; city?: string };
}) {
  const resolvedParams = await params;
  const parentId = Number(resolvedParams.parentId);
  if (!Number.isFinite(parentId)) return notFound();

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const rawLimit = Number.parseInt(resolvedSearchParams?.limit || `${PAGE_STEP}`, 10);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(rawLimit, MAX_LIMIT)
    : PAGE_STEP;
  const activeSub = (resolvedSearchParams?.sub || "all").trim().toLowerCase();
  const queryCity = normalizeCity(resolvedSearchParams?.city || "");

  const categoryLabelMap: Record<number, string> = {
    1: "Sports",
    2: "Concerts",
    3: "Theatre",
  };
  const categoryLabel = categoryLabelMap[parentId] || `Category ${parentId}`;

  const requestHeaders = await headers();
  const requestHost = requestHeaders.get("host") || "";
  const requestProto =
    requestHeaders.get("x-forwarded-proto") ||
    (requestHost.includes("localhost") ? "http" : "https");
  const currentOrigin = requestHost ? `${requestProto}://${requestHost}` : baseUrl;

  const rawDetectedCity = (requestHeaders.get("x-vercel-ip-city") || "").trim();
  const detectedCity = normalizeCity(rawDetectedCity);
  const activeCity = queryCity || detectedCity;

  const baseParams = new URLSearchParams();
  baseParams.set("parentCategoryID", String(parentId));
  baseParams.set("numberOfEvents", String(MAX_LIMIT));
  baseParams.set("diversify", "1");
  if (activeCity) {
    baseParams.set("city", activeCity);
    baseParams.set("cityScope", "city");
  }

  const baseFetch = await fetchEventList(`${currentOrigin}/api/events?${baseParams.toString()}`);
  const baseEvents = baseFetch.events;
  const normalizedActiveCity = normalizeToken(activeCity || "");
  const hasStrictCityMatches = normalizedActiveCity
    ? baseEvents.some((event) => normalizeToken(event?.City || "") === normalizedActiveCity)
    : baseEvents.length > 0;

  const featuredFetch = !hasStrictCityMatches
    ? await fetchEventList(
      `${currentOrigin}/api/featured?parentCategoryID=${parentId}&numberOfEvents=${MAX_LIMIT}`,
    )
    : { events: [] as EventItem[], ok: true };

  const events = hasStrictCityMatches
    ? baseEvents
    : (featuredFetch.events.length > 0 ? featuredFetch.events : baseEvents);

  if (events.length === 0 && !baseFetch.ok && !featuredFetch.ok) {
    return (
      <main style={{ padding: 40, fontFamily: "Arial" }}>
        <h1 style={{ fontSize: 40, marginBottom: 10 }}>{categoryLabel}</h1>
        <p style={{ color: "#b00020" }}>Failed to load events right now.</p>
        <Link href="/events">← Back to all events</Link>
      </main>
    );
  }

  const subcategoryCounts = new Map<string, number>();
  for (const event of events) {
    const sub = getChildCategoryKey(event);
    subcategoryCounts.set(sub, (subcategoryCounts.get(sub) || 0) + 1);
  }

  const availableSubcategories = Array.from(subcategoryCounts.entries())
    .sort((first, second) => second[1] - first[1])
    .map(([key]) => key);

  let filtered = events;
  const activeSubNumeric = Number.parseInt(activeSub, 10);

  if (activeSub !== "all") {
    if (Number.isFinite(activeSubNumeric)) {
      const subParams = new URLSearchParams(baseParams);
      subParams.set("childCategoryID", String(activeSubNumeric));
      const subFetch = await fetchEventList(`${currentOrigin}/api/events?${subParams.toString()}`);
      filtered = subFetch.events.length > 0
        ? subFetch.events
        : events.filter((event) => getChildCategoryKey(event) === activeSub);
    } else {
      filtered = events.filter((event) => getChildCategoryKey(event) === activeSub);
    }
  }

  const visibleEvents = filtered.slice(0, limit);
  const locationText = activeCity || "your area";

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1 style={{ fontSize: 40, marginBottom: 10 }}>{categoryLabel}</h1>

      <div style={{ marginBottom: 18 }}>
        <Link href={activeCity ? `/events?city=${encodeURIComponent(activeCity)}` : "/events"}>← Back to all events</Link>
      </div>

      <AutoGeoCity hasCity={Boolean(activeCity)} />

      <div style={{ marginBottom: 14 }}>
        <form action={`/events/${parentId}`} method="GET" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <label htmlFor="city" style={{ fontWeight: 700 }}>Location</label>
          <input
            id="city"
            name="city"
            defaultValue={activeCity}
            placeholder="Change city"
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ccc", minWidth: 220 }}
            autoComplete="address-level2"
          />
          <input type="hidden" name="limit" value={String(limit)} />
          {activeSub !== "all" ? <input type="hidden" name="sub" value={activeSub} /> : null}
          <button type="submit" style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #111", background: "#111", color: "#fff", cursor: "pointer" }}>
            Update
          </button>
          <span style={{ color: "#555" }}>Showing events near: {locationText}</span>
          {!hasStrictCityMatches && events.length > 0 ? (
            <span style={{ color: "#777" }}>No direct local matches; showing featured {categoryLabel.toLowerCase()} events.</span>
          ) : null}
        </form>
      </div>

      <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link
          href={buildCategoryHref(parentId, { limit, city: activeCity })}
          style={{
            padding: "7px 10px",
            borderRadius: 999,
            border: "1px solid #111",
            textDecoration: "none",
            background: activeSub === "all" ? "#111" : "#fff",
            color: activeSub === "all" ? "#fff" : "#111",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          All subcategories ({events.length})
        </Link>
        {availableSubcategories.map((sub) => (
          <Link
            key={sub}
            href={buildCategoryHref(parentId, { limit, sub, city: activeCity })}
            style={{
              padding: "7px 10px",
              borderRadius: 999,
              border: "1px solid #111",
              textDecoration: "none",
              background: activeSub === sub ? "#111" : "#fff",
              color: activeSub === sub ? "#fff" : "#111",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {subcategoryLabel(parentId, sub)} ({subcategoryCounts.get(sub) || 0})
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 10 }}>
        {visibleEvents.length === 0 ? (
          <p>No events for this subcategory.</p>
        ) : (
          visibleEvents.map((event) => {
            const ticketLink = event.TicketURL || event.ExternalURL || event.Url || "";
            const imageSources = resolveEventImageCandidates(event);

            return (
              <div
                key={event.ID}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 14,
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                  background: "#fff",
                }}
              >
                <EventCardImage
                  sources={imageSources}
                  alt={event.Name || "Event image"}
                  style={{
                    width: 160,
                    height: 96,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #eee",
                    flexShrink: 0,
                    background: "#f8f8f8",
                  }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>{event.Name}</div>

                  <div style={{ color: "#4b5563", marginTop: 4 }}>
                    {event.City}
                    {event.City && event.Venue ? " • " : ""}
                    {event.Venue}
                  </div>

                  <div style={{ color: "#6b7280", marginTop: 6 }}>
                    {formatEventDate(event.DisplayDate)}
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <Link href={`/event/${event.ID}`} style={{ textDecoration: "underline", color: "#1d4ed8" }}>
                      View details
                    </Link>

                    {ticketLink ? (
                      <a
                        href={ticketLink}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: "6px 10px",
                          background: "#111",
                          color: "#fff",
                          borderRadius: 6,
                          textDecoration: "none",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        Buy
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
          {filtered.length > limit && limit < MAX_LIMIT ? (
            <Link
              href={buildCategoryHref(parentId, {
                limit: Math.min(limit + PAGE_STEP, MAX_LIMIT),
                sub: activeSub !== "all" ? activeSub : undefined,
                city: activeCity,
              })}
            >
              Load more
            </Link>
          ) : null}

          {limit > PAGE_STEP ? (
            <Link
              href={buildCategoryHref(parentId, {
                limit: PAGE_STEP,
                sub: activeSub !== "all" ? activeSub : undefined,
                city: activeCity,
              })}
            >
              Show less
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}
