const mockEvents = [
  {
    id: "1",
    title: "Drake Live",
    city: "Toronto",
    date: "2026-05-12",
    venue: "Scotiabank Arena",
    price: 150,
  },
  {
    id: "2",
    title: "Canadiens vs Bruins",
    city: "Montreal",
    date: "2026-04-20",
    venue: "Bell Centre",
    price: 95,
  },
  {
    id: "3",
    title: "Coldplay World Tour",
    city: "Vancouver",
    date: "2026-07-02",
    venue: "BC Place",
    price: 180,
  },
];

export default function Search({ searchParams }: any) {
  const q = (searchParams?.q || "").toLowerCase();

  const results = mockEvents.filter(
    (e) => e.title.toLowerCase().includes(q) || e.city.toLowerCase().includes(q)
  );

  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Search Results</h1>

      <p>
        Showing results for: <b>{q}</b>
      </p>

      <hr style={{ margin: "20px 0" }} />

      {results.length === 0 && <p>No events found.</p>}

      {results.map((e) => (
        <div
          key={e.id}
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            marginBottom: "20px",
            borderRadius: "8px",
          }}
        >
          <h3>{e.title}</h3>

          <p>
            {e.city} — {e.date}
          </p>
          <p>{e.venue}</p>
          <p>From ${e.price}</p>

          <a href={`/event/${e.id}`}>View Event →</a>
        </div>
      ))}
    </main>
  );
}
