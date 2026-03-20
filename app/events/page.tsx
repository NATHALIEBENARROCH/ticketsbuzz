import Link from "next/link";
import { headers } from "next/headers";
import { baseUrl } from "@/lib/api";
import { formatEventDate } from "@/lib/dateFormat";
import AutoGeoCity from "@/app/components/AutoGeoCity";
import EventCardImage from "@/app/components/EventCardImage";

type EventItem = {
  ID: number;
  Name?: string;
  City?: string;
  StateProvince?: string;
  Venue?: string;
  DisplayDate?: string;
  ParentCategoryID?: number;
  MapURL?: string;
  TicketURL?: string;
  ExternalURL?: string;
  Url?: string;
};

const PAGE_STEP = 40;
const MAX_LIMIT = 200;

function normalizeToken(value: string) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCity(raw: string) {
  let city = (raw || "").trim().replace(/\+/g, " ");
  for (let i = 0; i < 3; i++) {
    try {
      const decoded = decodeURIComponent(city);
      if (decoded === city) break;
      city = decoded;
    } catch { break; }
  }
  return city;
}

async function fetchEvents(url: string): Promise<EventItem[]> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.result ?? []) as EventItem[];
  } catch { return []; }
}

function withCity(path: string, city?: string) {
  return city ? `${path}?city=${encodeURIComponent(city)}` : path;
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: Promise<{ limit?: string; city?: string }> | { limit?: string; city?: string };
}) {
  const requestHeaders = await headers();
  const requestHost = requestHeaders.get("host") || "";
  const requestProto = requestHeaders.get("x-forwarded-proto") || (requestHost.includes("localhost") ? "http" : "https");
  const currentOrigin = requestHost ? `${requestProto}://${requestHost}` : baseUrl;

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const rawLimit = Number.parseInt(resolvedSearchParams?.limit || `${PAGE_STEP}`, 10);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, MAX_LIMIT) : PAGE_STEP;

  const queryCity = normalizeCity(resolvedSearchParams?.city || "");
  const detectedCity = normalizeCity((requestHeaders.get("x-vercel-ip-city") || "").trim());
  const activeCity = queryCity || detectedCity;

  // Phase 1: fetch with city filter + diversify
  const cityParams = new URLSearchParams();
  cityParams.set("numberOfEvents", String(MAX_LIMIT));
  cityParams.set("diversify", "1");
  if (activeCity) {
    cityParams.set("city", activeCity);
    cityParams.set("cityScope", "city");
  }
  const cityEvents = await fetchEvents(`${currentOrigin}/api/events?${cityParams.toString()}`);

  // Check for strict city matches
  const normalizedActiveCity = normalizeToken(activeCity);
  const hasStrictCityMatches = normalizedActiveCity
    ? cityEvents.some((e) => normalizeToken(e?.City || "") === normalizedActiveCity)
    : cityEvents.length > 0;

  // Phase 2: featured fallback if no local matches
  let featuredEvents: EventItem[] = [];
  if (!hasStrictCityMatches) {
    featuredEvents = await fetchEvents(`${currentOrigin}/api/featured?numberOfEvents=${MAX_LIMIT}`);
  }

  // Phase 3: general fallback (no city filter) if featured also empty
  let generalEvents: EventItem[] = [];
  if (!hasStrictCityMatches && featuredEvents.length === 0) {
    const generalParams = new URLSearchParams();
    generalParams.set("numberOfEvents", String(MAX_LIMIT));
    generalParams.set("diversify", "1");
    generalEvents = await fetchEvents(`${currentOrigin}/api/events?${generalParams.toString()}`);
  }

  const allEvents = hasStrictCityMatches
    ? cityEvents
    : featuredEvents.length > 0
      ? featuredEvents
      : generalEvents;

  const events = allEvents.slice(0, limit);

  const hasLocalEvents = hasStrictCityMatches;
  const hasFeaturedFallback = !hasStrictCityMatches && featuredEvents.length > 0;
  const locationText = activeCity || "your area";

  const locationMessage = hasLocalEvents
    ? `Showing events near: ${locationText}`
    : hasFeaturedFallback
      ? `No local events found for ${locationText}. Showing featured events right now.`
      : activeCity
        ? `No local events found for ${locationText}. Showing popular events.`
        : null;

  if (events.length === 0) {
    return (
      <main style={{ padding: 40, fontFamily: "Arial" }}>
        <h1 style={{ fontSize: 32, marginBottom: 10 }}>All Events</h1>
        <AutoGeoCity hasCity={Boolean(activeCity)} />
        <p>No events available right now.</p>
        <Link href="/">← Back home</Link>
      </main>
    );
  }

  const loadMoreHref = activeCity
    ? `/events?limit=${Math.min(limit + PAGE_STEP, MAX_LIMIT)}&city=${encodeURIComponent(activeCity)}`
    : `/events?limit=${Math.min(limit + PAGE_STEP, MAX_LIMIT)}`;
  const showLessHref = activeCity ? `/events?city=${encodeURIComponent(activeCity)}` : "/events";

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>All Events</h1>

      <AutoGeoCity hasCity={Boolean(activeCity)} />

      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <form action="/events" method="GET" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label htmlFor="city-input" style={{ fontSize: 14, color: "#6b7280" }}>Location</label>
          <input
            id="city-input"
            name="city"
            type="text"
            defaultValue={activeCity}
            placeholder="Enter city"
            style={{ border: "1px solid #d1d5db", borderRadius: 20, padding: "6px 14px", fontSize: 14, outline: "none" }}
          />
          <button type="submit" style={{ background: "#1f2a5a", color: "#fff", border: "none", borderRadius: 20, padding: "6px 16px", fontSize: 14, cursor: "pointer" }}>
            Update
          </button>
        </form>
        {locationMessage && (
          <span style={{ fontSize: 13, color: "#6b7280" }}>{locationMessage}</span>
        )}
      </div>

      <div style={{ marginBottom: 24, display: "flex", gap: 12 }}>
        <Link href={withCity("/events/2", activeCity)} style={{ color: "#1d4ed8", textDecoration: "underline" }}>Concerts</Link>
        <Link href={withCity("/events/1", activeCity)} style={{ color: "#1d4ed8", textDecoration: "underline" }}>Sports</Link>
        <Link href={withCity("/events/3", activeCity)} style={{ color: "#1d4ed8", textDecoration: "underline" }}>Theatre</Link>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {events.map((event) => {
          const artistName = (event.Name || "").trim();
          const imageSources = [
            artistName ? `/api/artist-photo?name=${encodeURIComponent(artistName)}` : "",
            "/hero.png",
          ].filter(Boolean);

          return (
            <li
              key={event.ID}
              style={{
                marginBottom: "16px",
                padding: "16px",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                background: "#fff",
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
              }}
            >
              <EventCardImage
                sources={imageSources}
                alt={artistName || "Event"}
                style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: "0 0 4px", color: "#111827", fontSize: 16 }}>
                  {event.Name ?? "Untitled event"}
                </h3>
                <p style={{ margin: "2px 0", color: "#4b5563", fontSize: 14 }}>
                  {[event.City, event.StateProvince].filter(Boolean).join(", ")}
                  {event.Venue ? ` • ${event.Venue}` : ""}
                </p>
                <p style={{ margin: "2px 0", color: "#6b7280", fontSize: 13 }}>
                  {formatEventDate(event.DisplayDate)}
                </p>
                <div style={{ marginTop: 8 }}>
                  <Link href={`/event/${event.ID}`} style={{ color: "#1d4ed8", textDecoration: "underline", fontSize: 13 }}>
                    View details →
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
        {allEvents.length >= limit && limit < MAX_LIMIT ? (
          <Link href={loadMoreHref} style={{ color: "#1d4ed8", textDecoration: "underline" }}>Load more</Link>
        ) : null}
        {limit > PAGE_STEP ? <Link href={showLessHref} style={{ color: "#1d4ed8", textDecoration: "underline" }}>Show less</Link> : null}
      </div>
    </main>
  );
}