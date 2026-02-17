import Link from "next/link";

type EventItem = {
  ID: number;
  Name: string;
  City?: string;
  Venue?: string;
  DisplayDate?: string;
  ParentCategoryID?: number;
  MapURL?: string;

  // optional ticket links (if your API provides them)
  TicketURL?: string;
  ExternalURL?: string;
  Url?: string;
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ parentId: string }>;
}) {
  const { parentId } = await params;
  const parentIdNum = Number(parentId);

  const res = await fetch("http://localhost:3000/api/events", {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main style={{ padding: 40, fontFamily: "Arial" }}>
        <h1 style={{ fontSize: 40, marginBottom: 10 }}>
          Category {Number.isFinite(parentIdNum) ? parentIdNum : parentId}
        </h1>
        <p style={{ color: "#b00020" }}>
          Failed to load events (HTTP {res.status})
        </p>
        <Link href="/events">← Back to all events</Link>
      </main>
    );
  }

  const data = await res.json();
  const events: EventItem[] = data?.result ?? [];

  const filtered = events.filter(
    (e) => Number(e.ParentCategoryID) === parentIdNum,
  );

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1 style={{ fontSize: 40, marginBottom: 10 }}>Category {parentIdNum}</h1>

      <div style={{ marginBottom: 18 }}>
        <Link href="/events">← Back to all events</Link>
      </div>

      <div style={{ marginTop: 10 }}>
        {filtered.length === 0 ? (
          <p>No events in this category.</p>
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
                {/* Seat map preview (optional) */}
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

                {/* Event info */}
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
                    {event.DisplayDate}
                  </div>

                  {/* Actions */}
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
      </div>
    </main>
  );
}
