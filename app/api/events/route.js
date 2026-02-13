import { getEvents } from "@/lib/soapClient";

export async function GET() {
  try {
    const result = await getEvents({ numberOfEvents: 50 });
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
    console.error("Error en /api/events:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}