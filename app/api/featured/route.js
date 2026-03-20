import { getEvents, getHighSalesPerformers } from "@/lib/soapClient";
import { corsPreflight, withCorsJson } from "@/lib/cors";

function normalizeEvents(resultValue) {
  if (!resultValue || resultValue === "") return [];
  if (Array.isArray(resultValue)) return resultValue;
  if (Array.isArray(resultValue.Event)) return resultValue.Event;
  if (resultValue.Event) return [resultValue.Event];
  return [];
}

function normalizePerformers(resultValue) {
  if (!resultValue || resultValue === "") return [];
  if (Array.isArray(resultValue)) return resultValue;
  if (Array.isArray(resultValue.PerformerPercent)) return resultValue.PerformerPercent;
  if (resultValue.PerformerPercent) return [resultValue.PerformerPercent];
  if (Array.isArray(resultValue.Performer)) return resultValue.Performer;
  if (resultValue.Performer) return [resultValue.Performer];
  return [];
}

function normalizeToken(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toEventTimestamp(event) {
  const rawDate = event?.Date || event?.DisplayDate;
  if (!rawDate) return Number.POSITIVE_INFINITY;
  const parsed = Date.parse(rawDate);
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

function compareEventNames(firstEvent, secondEvent) {
  const firstName = normalizeToken(firstEvent?.Name);
  const secondName = normalizeToken(secondEvent?.Name);
  if (!firstName && !secondName) return 0;
  if (!firstName) return 1;
  if (!secondName) return -1;
  return firstName.localeCompare(secondName, "en", { sensitivity: "base" });
}

function sortEventsForListing(events) {
  return [...events].sort((firstEvent, secondEvent) => {
    const byDate = toEventTimestamp(firstEvent) - toEventTimestamp(secondEvent);
    if (byDate !== 0) return byDate;
    return compareEventNames(firstEvent, secondEvent);
  });
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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawCount = Number.parseInt(searchParams.get("numberOfEvents") || "8", 10);
    const numberOfEvents = Number.isFinite(rawCount) && rawCount > 0 ? Math.min(rawCount, 50) : 8;

    const rawParentCategoryID = searchParams.get("parentCategoryID");
    const parentCategoryID = rawParentCategoryID != null && rawParentCategoryID !== ""
      ? Number.parseInt(rawParentCategoryID, 10)
      : undefined;

    const performerPoolSize = Math.min(Math.max(numberOfEvents * 2, 6), 20);

    const featuredPerformersResponse = await getHighSalesPerformers({
      numReturned: performerPoolSize,
      parentCategoryID: Number.isFinite(parentCategoryID) ? parentCategoryID : undefined,
    });

    const performers = normalizePerformers(featuredPerformersResponse.parsed?.result)
      .map((item) => ({
        performerID: item?.ID,
        performerName: String(item?.Description || item?.Name || item?.PerformerName || "").trim(),
      }))
      .filter((item) => item.performerID || item.performerName);

    const topPerformers = performers.slice(0, performerPoolSize);

    const eventFetches = topPerformers.map((performer) =>
      getEvents({
        numberOfEvents: 3,
        performerID: performer.performerID,
        performerName: performer.performerName,
        parentCategoryID: Number.isFinite(parentCategoryID) ? parentCategoryID : undefined,
      }).catch(() => null)
    );

    const eventResponses = await Promise.all(eventFetches);

    const merged = [];
    for (const response of eventResponses) {
      if (!response) continue;
      merged.push(...normalizeEvents(response.parsed?.result));
    }

    const uniqueEvents = sortEventsForListing(uniqueByEventId(merged)).slice(0, numberOfEvents);

    return withCorsJson(
      {
        result: uniqueEvents,
        count: uniqueEvents.length,
        source: "high-sales-performers",
        performersConsidered: topPerformers.length,
      },
      request,
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    return withCorsJson({ error: error.message }, request, { status: 500 });
  }
}

export async function OPTIONS(request) {
  return corsPreflight(request);
}
