import Link from "next/link";

type EventItem = {
  ID: number;
  Name?: string;
  City?: string;
  Venue?: string;
  DisplayDate?: string;
  MapURL?: string;
  InteractiveMapURL?: string;
};

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = Number(id);

  const res = await fetch("http://localhost:3000/api/events", {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Error</h1>
        <p>Could not load event.</p>
        <Link href="/events">← Back</Link>
      </main>
    );
  }

  const data = await res.json();
  const events: EventItem[] = data?.result ?? [];

  const event = events.find((e) => Number(e.ID) === eventId);

  if (!event) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Event not found</h1>
        <Link href="/events">← Back</Link>
      </main>
    );
  }

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <Link href="/events">← Back to all events</Link>

      <h1 style={{ marginTop: 20 }}>{event.Name}</h1>

      <p style={{ color: "#555" }}>
        {event.City} • {event.Venue}
      </p>

      <p style={{ color: "#777" }}>{event.DisplayDate}</p>

      {event.MapURL && (
        <div style={{ marginTop: 20 }}>
          <img
            src={event.MapURL}
            alt="Seat map"
            style={{
              maxWidth: "100%",
              border: "1px solid #ddd",
              borderRadius: 8,
            }}
          />
        </div>
      )}

      {event.InteractiveMapURL && (
        <p style={{ marginTop: 20 }}>
          <a href={event.InteractiveMapURL} target="_blank" rel="noreferrer">
            Open interactive seat map →
          </a>
        </p>
      )}
    </main>
  );
}
