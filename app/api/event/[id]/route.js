import { getEvents } from "@/lib/soapClient";

export async function GET(request, { params }) {
  const eventId = Number.parseInt(params.id, 10);
  if (Number.isNaN(eventId)) {
    return Response.json({ error: "Invalid event id" }, { status: 400 });
  }

  try {
    const result = await getEvents({ eventID: eventId, numberOfEvents: 1 });
    const parsedResult = result.parsed?.result ?? null;

    if (!parsedResult) {
      return Response.json(
        {
          error: "SOAP response not parsed",
          parseError: result.parseError,
          xmlPreview: result.xml?.slice(0, 500)
        },
        { status: 502 }
      );
    }

    return Response.json({ result: parsedResult });
  } catch (error) {
    console.error("Error en /api/event/[id]:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}