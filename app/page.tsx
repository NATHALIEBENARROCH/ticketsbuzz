import Link from "next/link";

export default function Home() {
  return (
    <main style={{ fontFamily: "Arial", margin: 0 }}>
      {/* Top nav */}

      {/* Hero */}
      <section style={styles.hero}>
        <img src="/hero.png" alt="TicketsBuzz hero" style={styles.heroImg} />

        <div style={styles.heroOverlay}>
          <h1 style={styles.heroTitle}>GET YOUR TICKETSBUZZ HERE!</h1>

          <form action="/search" style={styles.heroSearch}>
            <input
              name="q"
              placeholder="Search for events, artist, teams or venues"
              style={styles.heroSearchInput}
            />
            <button style={styles.heroSearchBtn}>Search</button>
          </form>

          <div style={styles.heroCtas}>
            <Link href="/events" style={styles.ctaSecondary}>
              Browse all events
            </Link>
            <Link href="/events/2" style={styles.ctaSecondary}>
              Browse concerts
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Browse by Category</h2>
        <div style={styles.grid}>
          <Link href="/events/2" style={styles.card}>
            <h3 style={styles.cardTitle}>🎵 Music</h3>
            <p style={styles.cardText}>Concerts & tours</p>
          </Link>

          <Link href="/events/1" style={styles.card}>
            <h3 style={styles.cardTitle}>🏀 Sports</h3>
            <p style={styles.cardText}>Games & matches</p>
          </Link>

          <Link href="/events/3" style={styles.card}>
            <h3 style={styles.cardTitle}>🎭 Theater</h3>
            <p style={styles.cardText}>Shows & performances</p>
          </Link>

          <Link href="/events" style={styles.card}>
            <h3 style={styles.cardTitle}>⭐ All Events</h3>
            <p style={styles.cardText}>Browse everything</p>
          </Link>
        </div>
      </section>
    </main>
  );
}

/* ================= STYLES ================= */

const styles: Record<string, React.CSSProperties> = {
  header: {
    background: "#1f2a5a",
    color: "#fff",
  },

  nav: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "14px 18px",
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: 16,
  },

  navLeft: {
    display: "flex",
    gap: 18,
    alignItems: "center",
  },

  navCenter: {
    display: "flex",
    justifyContent: "center",
  },

  navRight: {
    display: "flex",
    justifyContent: "flex-end",
  },

  navLink: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 15,
  },

  navLogo: {
    height: 54, // bigger logo
    objectFit: "contain",
    cursor: "pointer",
  },

  navSearch: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  navSearchInput: {
    padding: "8px 10px",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
    width: 220,
    outline: "none",
  },

  navSearchBtn: {
    border: "none",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
    fontSize: 16,
  },

  subnav: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "8px 18px 14px",
    display: "flex",
    gap: 18,
    flexWrap: "wrap",
    color: "rgba(255,255,255,0.85)",
  },

  subnavLink: {
    color: "rgba(255,255,255,0.85)",
    textDecoration: "none",
    fontSize: 13,
  },

  hero: {
    position: "relative",
    height: 420,
    overflow: "hidden",
    background: "#0b0f24",
  },

  heroImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    filter: "brightness(0.75)",
  },

  heroOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    paddingBottom: 50,
    alignItems: "center",
    padding: 18,
    textAlign: "center",
  },

  heroTitle: {
    color: "#fff",
    fontSize: 34,
    letterSpacing: 1,
    margin: "6px 0 16px",
    textShadow: "0 2px 16px rgba(0,0,0,0.6)",
  },

  heroSearch: {
    display: "flex",
    gap: 10,
    width: "min(720px, 92vw)",
    marginTop: 10,
  },

  heroSearchInput: {
    flex: 1,
    padding: "14px 16px",
    fontSize: 16,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.92)",
    outline: "none",
  },

  heroSearchBtn: {
    padding: "14px 18px",
    borderRadius: 999,
    border: "none",
    background: "#b11b2b",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },

  heroCtas: {
    marginTop: 14,
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },

  ctaSecondary: {
    color: "#fff",
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.35)",
    background: "rgba(0,0,0,0.15)",
    fontSize: 13,
    fontWeight: 700,
  },

  section: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "36px 18px 60px",
  },

  sectionTitle: {
    margin: "0 0 18px",
    fontSize: 22,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 16,
  },

  card: {
    display: "block",
    padding: 20,
    borderRadius: 14,

    background: "linear-gradient(180deg, #1f2a5a, #0b0f24)",

    color: "#fff",
    textDecoration: "none",

    border: "1px solid rgba(255,255,255,0.08)",

    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },

  cardTitle: {
    margin: 0,
    fontSize: 18,
  },

  cardText: {
    margin: "8px 0 0",
    color: "rgba(255,255,255,0.75)",
  },
};
