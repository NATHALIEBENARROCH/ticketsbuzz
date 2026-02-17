"use client";

import Link from "next/link";
import { useState } from "react";

type HeaderProps = {
  /** Optional: prefill the search box (ex: on /search page) */
  defaultQuery?: string;
};

export default function Header({ defaultQuery = "" }: HeaderProps) {
  const [q, setQ] = useState(defaultQuery);

  const cities = [
    "New York",
    "Los Angeles",
    "Boston",
    "Miami",
    "Houston",
    "San Francisco",
    "Chicago",
    "Las Vegas",
  ];

  return (
    <header style={styles.header}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <Link href="/events/2" style={styles.navLink}>
            Concerts
          </Link>
          <Link href="/events/1" style={styles.navLink}>
            Sports
          </Link>
          <Link href="/events/3" style={styles.navLink}>
            Theater
          </Link>
        </div>

        <div style={styles.navCenter}>
          <Link href="/" aria-label="TicketsBuzz home" style={styles.logoLink}>
            <img src="/logo.png" alt="TicketsBuzz" style={styles.navLogo} />
          </Link>
        </div>

        <div style={styles.navRight}>
          <form action="/search" style={styles.navSearch}>
            <input
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for team or artist..."
              style={styles.navSearchInput}
            />
            <button
              style={styles.navSearchBtn}
              aria-label="Search"
              type="submit"
            >
              🔎
            </button>
          </form>
        </div>
      </nav>

      <div style={styles.subnav}>
        {cities.map((c) => (
          <Link
            key={c}
            href={`/search?q=${encodeURIComponent(c)}`}
            style={styles.subnavLink}
          >
            {c}
          </Link>
        ))}
      </div>
    </header>
  );
}

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
  navLeft: { display: "flex", gap: 18, alignItems: "center" },
  navCenter: { display: "flex", justifyContent: "center" },
  navRight: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  navLink: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 15,
  },

  logoLink: { display: "inline-flex", alignItems: "center" },
  navLogo: {
    height: 52, // bigger logo in top nav
    width: "auto",
    objectFit: "contain",
    cursor: "pointer",
  },

  navSearch: { display: "flex", alignItems: "center", gap: 8 },
  navSearchInput: {
    padding: "8px 10px",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
    width: 240,
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
};
