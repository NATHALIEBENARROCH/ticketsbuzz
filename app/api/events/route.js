import { getEvents } from "@/lib/soapClient";

function normalizeEvents(resultValue) {
  if (!resultValue || resultValue === "") return [];
  if (Array.isArray(resultValue)) return resultValue;
  if (Array.isArray(resultValue.Event)) return resultValue.Event;
  if (resultValue.Event) return [resultValue.Event];
  return [];
}

export async function GET() {
  try {
    const result = await getEvents({ numberOfEvents: 50 });
    const events = normalizeEvents(result.parsed?.result);

    return Response.json({
      result: events,
      count: events.length,
      parseError: result.parseError,
    });
  } catch (error) {
    console.error("Error en /api/events:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}