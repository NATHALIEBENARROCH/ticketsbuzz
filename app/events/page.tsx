import Link from "next/link";
import { headers } from "next/headers";
import { baseUrl } from "@/lib/api";
import { formatEventDate } from "@/lib/dateFormat";
import AutoGeoCity from "@/app/components/AutoGeoCity";

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
  const limit = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(rawLimit, MAX_LIMIT)
    : PAGE_STEP;
  const queryCity = (resolvedSearchParams?.city || "").trim();
  const detectedCity = (requestHeaders.get("x-vercel-ip-city") || "").trim();
  const activeCity = queryCity || detectedCity;

  const params = new URLSearchParams();
  params.set("numberOfEvents", String(limit));
  if (activeCity) {
    params.set("city", activeCity);
    params.set("cityScope", "city");
  }

  const res = await fetch(`${currentOrigin}/api/events?${params.toString()}`, { cache: "no-store" });

  if (!res.ok) {
    return (
      <main style={{ padding: 40, fontFamily: "Arial" }}>
        <h1 style={{ fontSize: 32, marginBottom: 10 }}>All Events</h1>
        <p style={{ color: "#b00020" }}>
          Failed to load events (HTTP {res.status})
        </p>
        <Link href="/">← Back home</Link>
      </main>
    );
  }

  const data = await res.json();
  const events: EventItem[] = data?.result ?? [];

  if (events.length === 0) {
    return (
      <main style={{ padding: 40, fontFamily: "Arial" }}>
        <h1 style={{ fontSize: 32, marginBottom: 10 }}>All Events</h1>
        <p>No events available right now.</p>
        <Link href="/">← Back home</Link>
      </main>
    );
  }

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>All Events</h1>

      <AutoGeoCity hasCity={Boolean(activeCity)} />

      <div style={{ marginBottom: 30 }}>
        <Link href={activeCity ? `/events/2?city=${encodeURIComponent(activeCity)}` : "/events/2"}>Concerts</Link> |{" "}
        <Link href={activeCity ? `/events/1?city=${encodeURIComponent(activeCity)}` : "/events/1"}>Sports</Link> |{" "}
        <Link href={activeCity ? `/events/3?city=${encodeURIComponent(activeCity)}` : "/events/3"}>Theatre</Link>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {events.map((event) => (
          <li
            key={event.ID}
            style={{
              marginBottom: "20px",
              padding: "20px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              background: "#fff",
            }}
          >
            <h3 style={{ marginBottom: 6 }}>
              {event.Name ?? "Untitled event"}
            </h3>

            <p style={{ fontWeight: "500", margin: "6px 0" }}>
              📍 {event.Venue ?? ""}
            </p>

            <p style={{ color: "#555", margin: "6px 0" }}>
              {event.City ?? ""}
              {event.City && event.StateProvince ? ", " : ""}
              {event.StateProvince ?? ""}
            </p>

            <p style={{ color: "#777", margin: "6px 0" }}>
              🗓 {formatEventDate(event.DisplayDate)}
            </p>

            <div style={{ marginTop: 12 }}>
              <Link
                href={`/event/${event.ID}`}
                style={{ textDecoration: "underline" }}
              >
                View details →
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
        {events.length >= limit && limit < MAX_LIMIT ? (
          <Link href={`/events?limit=${Math.min(limit + PAGE_STEP, MAX_LIMIT)}`}>
            Load more
          </Link>
        ) : null}

        {limit > PAGE_STEP ? <Link href="/events">Show less</Link> : null}
      </div>
    </main>
  );
}
