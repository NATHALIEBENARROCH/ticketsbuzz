import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "60px", fontFamily: "Arial" }}>
      {/* Header */}
      <h1 style={{ fontSize: "48px", marginBottom: "10px" }}>TicketsBuzz</h1>

      <p style={{ marginBottom: "30px", color: "#555" }}>
        Find tickets for concerts, sports, and live events.
      </p>

      {/* Search */}
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

      {/* Categories */}
      <section style={{ marginTop: "60px" }}>
        <h2 style={{ marginBottom: "25px" }}>Browse by Category</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "25px",
          }}
        >
          {/* Music */}
          <Link href="/events/2" style={cardStyle}>
            <div>
              <h3>🎵 Music</h3>
              <p>Concerts & tours</p>
            </div>
          </Link>

          {/* Sports */}
          <Link href="/events/1" style={cardStyle}>
            <div>
              <h3>🏀 Sports</h3>
              <p>Games & matches</p>
            </div>
          </Link>

          {/* All */}
          <Link href="/events" style={cardStyle}>
            <div>
              <h3>⭐ All Events</h3>
              <p>Browse everything</p>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}

/* Simple card style */
const cardStyle = {
  display: "block",
  padding: "30px",
  borderRadius: "12px",
  background: "#111",
  color: "#fff",
  textDecoration: "none",
  minHeight: "140px",
  transition: "transform 0.2s ease",
};
