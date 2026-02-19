import { getEvents } from "@/lib/soapClient";
import { corsPreflight, withCorsJson } from "@/lib/cors";

const SEARCH_CACHE_TTL_MS = Number.parseInt(process.env.SEARCH_CACHE_TTL_MS || "120000", 10);
const SEARCH_CACHE_MAX_ITEMS = Number.parseInt(process.env.SEARCH_CACHE_MAX_ITEMS || "100", 10);
const searchCache = new Map();

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

function toSearchItem(event) {
  return {
    ID: event?.ID,
    Name: event?.Name,
    Venue: event?.Venue,
    City: event?.City,
    StateProvince: event?.StateProvince,
    DisplayDate: event?.DisplayDate || event?.Date,
  };
}

function getCachedResult(cacheKey) {
  const cached = searchCache.get(cacheKey);
  if (!cached) return null;

  if (Date.now() - cached.createdAt > SEARCH_CACHE_TTL_MS) {
    searchCache.delete(cacheKey);
    return null;
  }

  return cached.value;
}

function setCachedResult(cacheKey, value) {
  searchCache.set(cacheKey, {
    createdAt: Date.now(),
    value,
  });

  if (searchCache.size <= SEARCH_CACHE_MAX_ITEMS) return;

  const oldest = searchCache.keys().next().value;
  if (oldest) searchCache.delete(oldest);
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
  const rawLimit = Number.parseInt(searchParams.get("limit") || "20", 10);
  const numberOfEvents = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(rawLimit, 50)
    : 20;

  const cacheKey = `${query.toLowerCase()}|${numberOfEvents}`;

  if (!query) {
    return withCorsJson({ result: [], count: 0, parseError: null }, request);
  }

  const cachedResult = getCachedResult(cacheKey);
  if (cachedResult) {
    return withCorsJson(cachedResult, request, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  }

  try {
    const baseSearch = await runSearch({
      eventName: query,
      performerName: query,
      numberOfEvents,
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
          numberOfEvents,
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
          numberOfEvents,
        });

        events = uniqueByEventId([...events, ...cityVenueSearch.events]);
        parseError = parseError || cityVenueSearch.response.parseError;

        if (cityVenueSearch.events.length > 0) {
          fallbackUsed = true;
          fallbackStrategy = "city-venue";
        }
      }
    }

    events = sortEventsByDate(events).map(toSearchItem);

    const payload = {
      result: events,
      count: events.length,
      parseError,
      fallbackUsed,
      fallbackStrategy,
    };

    setCachedResult(cacheKey, payload);

    return withCorsJson(payload, request, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error en /api/search:", error);
    return withCorsJson({ error: error.message }, request, { status: 500 });
  }
}

export async function OPTIONS(request) {
  return corsPreflight(request);
}