import { getEvents } from "@/lib/soapClient";

function normalizeEvents(resultValue) {
  if (!resultValue || resultValue === "") return [];
  if (Array.isArray(resultValue)) return resultValue;
  if (Array.isArray(resultValue.Event)) return resultValue.Event;
  if (resultValue.Event) return [resultValue.Event];
  return [];
}

export async function GET(request) {
  // leer parámetro q de la URL
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  try {
    const result = await getEvents({ eventName: query, numberOfEvents: 50 });
    const events = normalizeEvents(result.parsed?.result);

    return Response.json({
      result: events,
      count: events.length,
      parseError: result.parseError,
    });
  } catch (error) {
    console.error("Error en /api/search:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}