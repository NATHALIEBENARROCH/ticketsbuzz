import Link from "next/link";
import { baseUrl } from "@/lib/api";

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

export default async function EventsPage() {
  const res = await fetch(`${baseUrl}/api/events`, { cache: "no-store" });

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

      <div style={{ marginBottom: 30 }}>
        <Link href="/events/2">Concerts</Link> |{" "}
        <Link href="/events/1">Sports</Link> |{" "}
        <Link href="/events/3">Theater</Link>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {events.slice(0, 100).map((event) => (
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
              🗓 {event.DisplayDate ?? ""}
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
    </main>
  );
}
