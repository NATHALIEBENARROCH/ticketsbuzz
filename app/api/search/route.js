import { getEvents } from "@/lib/soapClient";
import { corsPreflight, withCorsJson } from "@/lib/cors";

function normalizeEvents(resultValue) {
  if (!resultValue || resultValue === "") return [];
  if (Array.isArray(resultValue)) return resultValue;
  if (Array.isArray(resultValue.Event)) return resultValue.Event;
  if (resultValue.Event) return [resultValue.Event];
  return [];
}

function toEventTimestamp(event) {
  const rawDate = event?.Date || event?.DisplayDate;
  if (!rawDate) return Number.POSITIVE_INFINITY;
  const parsed = Date.parse(rawDate);
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

function sortEventsByDate(events) {
  return [...events].sort((firstEvent, secondEvent) => {
    return toEventTimestamp(firstEvent) - toEventTimestamp(secondEvent);
  });
}

export async function GET(request) {
  // leer parámetro q de la URL
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim();

  if (!query) {
    return withCorsJson({ result: [], count: 0, parseError: null }, request);
  }

  try {
    const result = await getEvents({
      eventName: query,
      performerName: query,
      numberOfEvents: 20,
    });
    const events = sortEventsByDate(normalizeEvents(result.parsed?.result));

    return withCorsJson({
      result: events,
      count: events.length,
      parseError: result.parseError,
    }, request);
  } catch (error) {
    console.error("Error en /api/search:", error);
    return withCorsJson({ error: error.message }, request, { status: 500 });
  }
}

export async function OPTIONS(request) {
  return corsPreflight(request);
}