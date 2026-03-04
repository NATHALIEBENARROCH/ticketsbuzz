"use client";

import { useState } from "react";

type EventPurchasePanelProps = {
  interactiveMapUrl?: string;
  ticketLink: string;
  requireMapInteraction: boolean;
};

export default function EventPurchasePanel({
  interactiveMapUrl,
  ticketLink,
  requireMapInteraction,
}: EventPurchasePanelProps) {
  const [hasInteractedWithMap, setHasInteractedWithMap] = useState(false);

  const canBuy =
    !requireMapInteraction || !interactiveMapUrl || hasInteractedWithMap;

  return (
    <section
      style={{ marginTop: 26, display: "flex", gap: 12, flexWrap: "wrap" }}
    >
      {interactiveMapUrl ? (
        <a
          href={interactiveMapUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => setHasInteractedWithMap(true)}
          style={{
            display: "inline-block",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "#fff",
            color: "#111",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Open interactive map
        </a>
      ) : null}

      <a
        href={canBuy ? ticketLink : "#"}
        target={canBuy ? "_blank" : undefined}
        rel={canBuy ? "noreferrer" : undefined}
        onClick={(event) => {
          if (!canBuy) event.preventDefault();
        }}
        style={{
          display: "inline-block",
          padding: "10px 14px",
          borderRadius: 10,
          background: canBuy ? "#111" : "#666",
          color: "#fff",
          textDecoration: "none",
          fontWeight: 600,
          cursor: canBuy ? "pointer" : "not-allowed",
          opacity: canBuy ? 1 : 0.8,
        }}
        aria-disabled={!canBuy}
      >
        Buy tickets
      </a>

      {requireMapInteraction && interactiveMapUrl && !hasInteractedWithMap ? (
        <span style={{ color: "#777", alignSelf: "center" }}>
          Open the interactive map first to continue to checkout.
        </span>
      ) : null}
    </section>
  );
}
