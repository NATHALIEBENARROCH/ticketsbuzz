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
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <h3>{event.Name}</h3>
            <p>
              {event.City}, {event.StateProvince}
            </p>
            <p>{event.DisplayDate}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
