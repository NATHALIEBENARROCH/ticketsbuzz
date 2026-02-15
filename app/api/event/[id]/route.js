import { getEvents } from "@/lib/soapClient";

function normalizeEvents(resultValue) {
  if (!resultValue || resultValue === "") return [];
  if (Array.isArray(resultValue)) return resultValue;
  if (Array.isArray(resultValue.Event)) return resultValue.Event;
  if (resultValue.Event) return [resultValue.Event];
  return [];
}

export async function GET(request, { params }) {
  const eventId = Number.parseInt(params.id, 10);
  if (Number.isNaN(eventId)) {
    return Response.json({ error: "Invalid event id" }, { status: 400 });
  }

  try {
    const result = await getEvents({ eventID: eventId, numberOfEvents: 1 });
    const events = normalizeEvents(result.parsed?.result);
    const event = events[0] ?? null;

    if (!event) {
      return Response.json({ error: "Event not found", parseError: result.parseError }, { status: 404 });
    }

    return Response.json({ result: event });
  } catch (error) {
    console.error("Error en /api/event/[id]:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}