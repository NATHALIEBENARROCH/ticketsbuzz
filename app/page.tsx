export default function Home() {
  return (
    <main style={{ padding: "60px", fontFamily: "Arial" }}>
      <h1 style={{ fontSize: "48px", marginBottom: "10px" }}>TicketsBuzz</h1>

      <p style={{ marginBottom: "30px", color: "#555" }}>
        Find tickets for concerts, sports, and live events.
      </p>

      <form action="/search" style={{ display: "flex", gap: "10px" }}>
        <input
          name="q"
          placeholder="Search artist, team, city..."
          style={{
            padding: "12px",
            width: "320px",
            fontSize: "16px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />

        <button
          style={{
            padding: "12px 20px",
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Search
        </button>
      </form>
    </main>
  );
}
