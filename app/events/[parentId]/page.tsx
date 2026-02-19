import Link from "next/link";
import { baseUrl } from "@/lib/api";
import { formatEventDate } from "@/lib/dateFormat";
import { notFound } from "next/navigation";

type EventItem = {
  ID: number;
  Name: string;
  City?: string;
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

function inferSubcategory(parentId: number, name?: string) {
  const text = (name || "").toLowerCase();

  if (parentId === 1) {
    if (/baseball|mlb/.test(text)) return "baseball";
    if (/basketball|nba|wnba/.test(text)) return "basketball";
    if (/football|nfl|ncaa football|cfl/.test(text)) return "football";
    if (/hockey|nhl/.test(text)) return "hockey";
    if (/soccer|fifa|mls|premier league/.test(text)) return "soccer";
    if (/golf|pga|lpga/.test(text)) return "golf";
    if (/tennis|atp|wta/.test(text)) return "tennis";
    if (/ufc|mma|boxing|wrestling/.test(text)) return "combat";
    return "other";
  }

  if (parentId === 2) {
    if (/country/.test(text)) return "country";
    if (/hip hop|rap/.test(text)) return "hip-hop";
    if (/latin|reggaeton|banda/.test(text)) return "latin";
    if (/jazz|blues/.test(text)) return "jazz-blues";
    if (/classical|symphony|orchestra/.test(text)) return "classical";
    if (/edm|dj|electronic/.test(text)) return "electronic";
    if (/rock|metal|punk/.test(text)) return "rock";
    return "pop-other";
  }

  if (parentId === 3) {
    if (/broadway|musical/.test(text)) return "musicals";
    if (/comedy|stand\-up/.test(text)) return "comedy";
    if (/ballet|dance/.test(text)) return "dance";
    if (/opera/.test(text)) return "opera";
    if (/magic/.test(text)) return "magic";
    return "plays-other";
  }

  return "other";
}

function subcategoryLabel(parentId: number, key: string) {
  const labelMaps: Record<number, Record<string, string>> = {
    1: {
      baseball: "Baseball",
      basketball: "Basketball",
      football: "Football",
      hockey: "Hockey",
      soccer: "Soccer",
      golf: "Golf",
      tennis: "Tennis",
      combat: "Combat Sports",
      other: "Other Sports",
    },
    2: {
      country: "Country",
      "hip-hop": "Hip-Hop/Rap",
      latin: "Latin",
      "jazz-blues": "Jazz & Blues",
      classical: "Classical",
      electronic: "Electronic/EDM",
      rock: "Rock/Metal",
      "pop-other": "Pop & Other",
    },
    3: {
      musicals: "Musicals",
      comedy: "Comedy",
      dance: "Dance",
      opera: "Opera",
      magic: "Magic",
      "plays-other": "Plays & Other",
    },
  };

  return labelMaps[parentId]?.[key] || key;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ parentId: string }> | { parentId: string };
  searchParams?: Promise<{ limit?: string; sub?: string }> | { limit?: string; sub?: string };
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

  const categoryLabelMap: Record<number, string> = {
    1: "Sports",
    2: "Concerts",
    3: "Theater",
  };
  const categoryLabel = categoryLabelMap[parentId] || `Category ${parentId}`;

  const res = await fetch(`${baseUrl}/api/events?parentCategoryID=${parentId}&numberOfEvents=${limit}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main style={{ padding: 40, fontFamily: "Arial" }}>
        <h1 style={{ fontSize: 40, marginBottom: 10 }}>{categoryLabel}</h1>
        <p style={{ color: "#b00020" }}>
          Failed to load events (HTTP {res.status})
        </p>
        <Link href="/events">← Back to all events</Link>
      </main>
    );
  }

  const data = await res.json();
  const events: EventItem[] = data?.result ?? [];

  const subcategoryCounts = new Map<string, number>();
  for (const event of events) {
    const sub = inferSubcategory(parentId, event.Name);
    subcategoryCounts.set(sub, (subcategoryCounts.get(sub) || 0) + 1);
  }

  const availableSubcategories = Array.from(subcategoryCounts.entries())
    .sort((first, second) => second[1] - first[1])
    .map(([key]) => key);

  const filtered = activeSub === "all"
    ? events
    : events.filter((event) => inferSubcategory(parentId, event.Name) === activeSub);
  const subQuery = activeSub !== "all" ? `&sub=${encodeURIComponent(activeSub)}` : "";

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1 style={{ fontSize: 40, marginBottom: 10 }}>{categoryLabel}</h1>

      <div style={{ marginBottom: 18 }}>
        <Link href="/events">← Back to all events</Link>
      </div>

      <form method="get" style={{ marginBottom: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <label htmlFor="sub" style={{ fontWeight: 700 }}>Subcategory</label>
        <select id="sub" name="sub" defaultValue={activeSub} style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #ccc" }}>
          <option value="all">All subcategories ({events.length})</option>
          {availableSubcategories.map((sub) => (
            <option key={sub} value={sub}>
              {subcategoryLabel(parentId, sub)} ({subcategoryCounts.get(sub) || 0})
            </option>
          ))}
        </select>
        <input type="hidden" name="limit" value={String(limit)} />
        <button type="submit" style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #111", background: "#111", color: "#fff", cursor: "pointer" }}>
          Apply
        </button>
        {activeSub !== "all" ? <Link href={`/events/${parentId}?limit=${limit}`}>Clear filter</Link> : null}
      </form>

      <div style={{ marginTop: 10 }}>
        {filtered.length === 0 ? (
          <p>No events for this subcategory.</p>
        ) : (
          filtered.slice(0, 50).map((event) => {
            const ticketLink =
              event.TicketURL || event.ExternalURL || event.Url || "";

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
                {event.MapURL ? (
                  <img
                    src={event.MapURL}
                    alt="Seat map"
                    style={{
                      width: 120,
                      borderRadius: 6,
                      opacity: 0.9,
                      flexShrink: 0,
                      border: "1px solid #eee",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 120,
                      height: 80,
                      borderRadius: 6,
                      background: "#f3f3f3",
                      border: "1px solid #eee",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#777",
                      fontSize: 12,
                    }}
                  >
                    No map
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    {event.Name}
                  </div>

                  <div style={{ color: "#555", marginTop: 4 }}>
                    {event.City}
                    {event.City && event.Venue ? " • " : ""}
                    {event.Venue}
                  </div>

                  <div style={{ color: "#777", marginTop: 6 }}>
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
                    <Link
                      href={`/event/${event.ID}`}
                      style={{ textDecoration: "underline" }}
                    >
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
          {events.length >= limit && limit < MAX_LIMIT ? (
            <Link href={`/events/${parentId}?limit=${Math.min(limit + PAGE_STEP, MAX_LIMIT)}${subQuery}`}>
              Load more
            </Link>
          ) : null}

          {limit > PAGE_STEP ? <Link href={`/events/${parentId}?sub=${encodeURIComponent(activeSub)}`}>Show less</Link> : null}
        </div>
      </div>
    </main>
  );
}
