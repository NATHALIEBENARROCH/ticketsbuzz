"use client";

import Script from "next/script";
import { useMemo, useRef, useState } from "react";

type EventSeatMapProps = {
  eventId: number;
  mapUrl?: string;
  interactiveMapUrl?: string;
  ticketLink: string;
  wcid?: string;
};

type UnknownRenderer = ((config: Record<string, unknown>) => unknown) | undefined;

function resolveRenderer(): UnknownRenderer {
  const runtime = window as Window & {
    MapWidget3?: { render?: UnknownRenderer };
    TNMapWidget3?: { render?: UnknownRenderer };
    TNMapWidget?: { render?: UnknownRenderer };
    renderMapWidget3?: UnknownRenderer;
  };

  return (
    runtime.TNMapWidget3?.render ||
    runtime.MapWidget3?.render ||
    runtime.TNMapWidget?.render ||
    runtime.renderMapWidget3
  );
}

export default function EventSeatMap({
  eventId,
  mapUrl,
  interactiveMapUrl,
  ticketLink,
  wcid,
}: EventSeatMapProps) {
  const [widgetMounted, setWidgetMounted] = useState(false);
  const [widgetFailed, setWidgetFailed] = useState(false);
  const hasInitialized = useRef(false);

  const widgetScriptUrl =
    process.env.NEXT_PUBLIC_TN_MAPWIDGET_SCRIPT_URL?.trim() || "";
  const widgetEnabled =
    process.env.NEXT_PUBLIC_TN_ENABLE_MAPWIDGET3 === "true" &&
    Boolean(widgetScriptUrl);

  const containerId = useMemo(() => `tn-mapwidget-${eventId}`, [eventId]);

  
  function initializeWidget() {
    if (!widgetEnabled || hasInitialized.current) return;
    hasInitialized.current = true;

    try {
      const renderer = resolveRenderer();
      if (typeof renderer !== "function") {
        setWidgetFailed(true);
        return;
      }

      renderer({
        containerId,
        eventId,
        websiteConfigId: wcid,
        ticketUrl: ticketLink,
        interactiveMapUrl,
      });

      setWidgetMounted(true);
    } catch {
      setWidgetFailed(true);
    }
  }

  if (widgetEnabled) {
    return (
      <>
        <Script
          src={widgetScriptUrl}
          strategy="afterInteractive"
          onLoad={() => {
            initializeWidget();
          }}
          onError={() => setWidgetFailed(true)}
        />

        <div
          id={containerId}
          style={{
            width: "100%",
            minHeight: 520,
            borderRadius: 12,
            border: "1px solid #eee",
            background: "#fff",
          }}
        />

        {!widgetMounted && !widgetFailed ? (
          <p style={{ color: "#777", marginTop: 10 }}>Loading interactive seat map…</p>
        ) : null}

        {widgetFailed && interactiveMapUrl ? (
          <iframe
            src={interactiveMapUrl}
            title="Interactive seat map"
            style={{
              width: "100%",
              minHeight: 520,
              borderRadius: 12,
              border: "1px solid #eee",
              marginTop: 10,
              background: "#fff",
            }}
          />
        ) : null}
      </>
    );
  }

  if (interactiveMapUrl) {
    return (
      <iframe
        src={interactiveMapUrl}
        title="Interactive seat map"
        style={{
          width: "100%",
          minHeight: 520,
          borderRadius: 12,
          border: "1px solid #eee",
          background: "#fff",
        }}
      />
    );
  }

  if (mapUrl) {
    return (
      <img
        src={mapUrl}
        alt="Seat map"
        style={{
          width: "100%",
          maxWidth: 700,
          borderRadius: 12,
          border: "1px solid #eee",
          background: "#fff",
        }}
      />
    );
  }

  return <p style={{ color: "#777" }}>No seat map available for this event.</p>;
}
