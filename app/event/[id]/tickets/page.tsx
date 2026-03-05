import TicketsClient from "./TicketsClient";

type TNEvent = {
  result: {
    ID: number;
    Name: string;
    Venue: string;
    City: string;
    StateProvince: string;
    Date: string; // ISO string
    DisplayDate?: string;
    MapURL?: string;
    VenueID?: number;
    VenueConfigurationID?: number;
  };
};

async function getEvent(id: string): Promise<TNEvent | null> {
  // Use absolute URL on server. Locally this works, on Vercel you'll swap to your env base URL.
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${base}/api/event/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as TNEvent;
  } catch {
    return null;
  }
}

function formatDateTime(iso: string) {
  // Simple + reliable formatting for display (no external libs)
  const d = new Date(iso);
  return d.toLocaleString("en-CA", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function TicketsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getEvent(id);
  const ev = data?.result;

  return (
    <div style={{ padding: 24 }}>
      <h1>Tickets</h1>

      {ev ? (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2 }}>
            {ev.Name}
          </div>

          <div style={{ marginTop: 6, opacity: 0.85, fontSize: 16 }}>
            {formatDateTime(ev.Date)}
          </div>

          <div style={{ marginTop: 6, opacity: 0.85, fontSize: 16 }}>
            {ev.Venue} • {ev.City}, {ev.StateProvince}
          </div>

          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.65 }}>
            Event ID: {ev.ID}
          </div>
        </div>
      ) : (
        <p>Event ID: {id}</p>
      )}

      <TicketsClient evtid={id} />
    </div>
  );
}
