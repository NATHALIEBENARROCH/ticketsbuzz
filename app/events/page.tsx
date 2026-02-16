export default async function EventsPage() {
  const res = await fetch("http://localhost:3000/api/events", {
    cache: "no-store",
  });

  const data = await res.json();
  const events = data.result || [];
  const parentIds = Array.from(
    new Set(events.map((e: any) => e.ParentCategoryID)),
  ).sort();
  console.log("ParentCategoryIDs in this response:", parentIds);

  return (
    <main style={{ padding: "40px" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>All Events</h1>

      {events.length === 0 && <p>No events found.</p>}
      <div style={{ marginBottom: 30 }}>
        <a href="/events/1">Category 1</a> | <a href="/events/2">Category 2</a>{" "}
        | <a href="/events/3">Category 3</a>
      </div>

      <ul>
        {events.map((event: any) => (
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
            <h3 style={{ marginBottom: 6 }}>{event.Name}</h3>

            <p style={{ fontWeight: "500" }}>📍 {event.Venue}</p>

            <p style={{ color: "#555" }}>
              {event.City}, {event.StateProvince}
            </p>

            <p style={{ color: "#777" }}>🗓 {event.DisplayDate}</p>

            {event.IsWomensEvent && (
              <span
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  padding: "4px 8px",
                  background: "#fde2e2",
                  color: "#b00020",
                  fontSize: "12px",
                  borderRadius: "6px",
                }}
              >
                Women’s Event
              </span>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
