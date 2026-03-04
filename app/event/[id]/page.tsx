import Link from "next/link";
import { baseUrl } from "@/lib/api";
import { formatEventDate } from "@/lib/dateFormat";
import EventPurchasePanel from "@/app/components/EventPurchasePanel";

type EventItem = {
  ID: number;
  Name?: string;
  City?: string;
  StateProvince?: string;
  Venue?: string;
  DisplayDate?: string;

  MapURL?: string;
  InteractiveMapURL?: string;

  TicketURL?: string;
  ExternalURL?: string;
  Url?: string;
};

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ✅ IMPORTANT: event details must call /api/event/:id (singular)
  const res = await fetch(`${baseUrl}/api/event/${id}`, { cache: "no-store" });

  if (!res.ok) {
    return (
      <main style={{ padding: 40, fontFamily: "Arial" }}>
        <h1 style={{ fontSize: 28 }}>Event not available</h1>
        <p style={{ color: "#b00020" }}>HTTP {res.status}</p>
        <Link href="/events">← Back to events</Link>
      </main>
    );
  }

  // ✅ THIS is the part you asked about:
  // API returns: { result: event }
  const data = await res.json();
  const event: EventItem | null = data?.result ?? null;

  if (!event) {
    return (
      <main style={{ padding: 40, fontFamily: "Arial" }}>
        <h1 style={{ fontSize: 28 }}>Event not available</h1>
        <Link href="/events">← Back to events</Link>
      </main>
    );
  }

  const wcid = process.env.TN_WCID || "";
  const ticketLink = `https://www.ticketnetwork.com/tickets/${event.ID}?wcid=${wcid}`;
  const requireMapInteractionBeforeBuy =
    process.env.NEXT_PUBLIC_REQUIRE_MAP_INTERACTION_BEFORE_BUY === "true";

  const venueQuery = [event.Venue, event.City, event.StateProvince]
    .filter(Boolean)
    .join(" ");
  const venueMapLink = venueQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        venueQuery,
      )}`
    : "";

  return (
    <main style={{ padding: 40, fontFamily: "Arial", maxWidth: 900 }}>
      <div style={{ marginBottom: 18 }}>
        <Link href="/events">← Back to events</Link>
      </div>

      <h1 style={{ fontSize: 36, marginBottom: 6 }}>{event.Name}</h1>

      <div style={{ color: "#555", marginBottom: 6 }}>
        📍 {event.Venue}
        {event.Venue && event.City ? " • " : ""}
        {event.City}
        {event.City && event.StateProvince ? ", " : ""}
        {event.StateProvince}
      </div>

      <div style={{ color: "#777", marginBottom: 20 }}>
        🗓 {formatEventDate(event.DisplayDate)}
      </div>

      <section style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 18, marginBottom: 10 }}>Seat map</h2>

        {event.MapURL ? (
          <img
            src={event.MapURL}
            alt="Seat map"
            style={{
              width: "100%",
              maxWidth: 700,
              borderRadius: 12,
              border: "1px solid #eee",
              background: "#fff",
            }}
          />
        ) : (
          <p style={{ color: "#777" }}>No seat map available for this event.</p>
        )}

      </section>

      <EventPurchasePanel
        interactiveMapUrl={event.InteractiveMapURL}
        ticketLink={ticketLink}
        requireMapInteraction={requireMapInteractionBeforeBuy}
      />

      {venueMapLink ? (
        <section style={{ marginTop: 12 }}>
          <a
            href={venueMapLink}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "#fff",
              color: "#111",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Venue map
          </a>
        </section>
      ) : null}
    </main>
  );
}
