import { getEvents } from "@/lib/soapClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeEvents(resultValue) {
  if (!resultValue || resultValue === "") return [];
  if (Array.isArray(resultValue)) return resultValue;
  if (Array.isArray(resultValue.Event)) return resultValue.Event;
  if (resultValue.Event) return [resultValue.Event];
  return [];
}

export async function GET(_request, ctx) {
  // ✅ In your Next setup, params is a Promise
  const { id } = await ctx.params;

  const eventId = Number.parseInt(id, 10);
  if (!id || Number.isNaN(eventId)) {
    return Response.json(
      { error: "Invalid event id", got: id },
      { status: 400 },
    );
  }

  try {
    const result = await getEvents({ eventID: eventId, numberOfEvents: 1 });

    // Your soapClient result structure:
    const events = normalizeEvents(result?.parsed?.result);
    const event = events[0] ?? null;

    if (!event) {
      return Response.json(
        { error: "Event not found", parseError: result?.parseError },
        { status: 404 },
      );
    }

    return Response.json({ result: event });
  } catch (error) {
    console.error("Error in /api/event/[id]:", error);
    return Response.json(
      { error: error?.message || "Server error" },
      { status: 500 },
    );
  }
}
