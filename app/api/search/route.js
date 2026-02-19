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

function cleanQuery(rawQuery) {
  return rawQuery
    .replace(/\b(shows?|events?|tickets?|near me|in|at)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueByEventId(events) {
  const seen = new Set();
  const unique = [];

  for (const event of events) {
    const eventId = event?.ID ?? event?.EventID ?? JSON.stringify(event);
    if (seen.has(eventId)) continue;
    seen.add(eventId);
    unique.push(event);
  }

  return unique;
}

async function runSearch(params) {
  const response = await getEvents(params);
  const events = sortEventsByDate(normalizeEvents(response.parsed?.result));
  return { response, events };
}

export async function GET(request) {
  // leer parámetro q de la URL
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim();

  if (!query) {
    return withCorsJson({ result: [], count: 0, parseError: null }, request);
  }

  try {
    const baseSearch = await runSearch({
      eventName: query,
      performerName: query,
      numberOfEvents: 20,
    });

    let events = baseSearch.events;
    let parseError = baseSearch.response.parseError;
    let fallbackUsed = false;
    let fallbackStrategy = null;

    if (events.length === 0) {
      const cleaned = cleanQuery(query);

      if (cleaned && cleaned.toLowerCase() !== query.toLowerCase()) {
        const cleanedSearch = await runSearch({
          eventName: cleaned,
          performerName: cleaned,
          numberOfEvents: 20,
        });

        events = uniqueByEventId([...events, ...cleanedSearch.events]);
        parseError = parseError || cleanedSearch.response.parseError;

        if (cleanedSearch.events.length > 0) {
          fallbackUsed = true;
          fallbackStrategy = "cleaned-query";
        }
      }

      if (events.length === 0 && cleaned) {
        const cityVenueSearch = await runSearch({
          cityZip: cleaned,
          venueName: cleaned,
          eventName: cleaned,
          numberOfEvents: 20,
        });

        events = uniqueByEventId([...events, ...cityVenueSearch.events]);
        parseError = parseError || cityVenueSearch.response.parseError;

        if (cityVenueSearch.events.length > 0) {
          fallbackUsed = true;
          fallbackStrategy = "city-venue";
        }
      }
    }

    events = sortEventsByDate(events);

    return withCorsJson({
      result: events,
      count: events.length,
      parseError,
      fallbackUsed,
      fallbackStrategy,
    }, request);
  } catch (error) {
    console.error("Error en /api/search:", error);
    return withCorsJson({ error: error.message }, request, { status: 500 });
  }
}

export async function OPTIONS(request) {
  return corsPreflight(request);
}