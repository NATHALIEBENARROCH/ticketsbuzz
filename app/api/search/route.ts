import { NextResponse } from "next/server";
import { callTN } from "@/lib/soapClient";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q) {
    return NextResponse.json({ result: [] });
  }

  const data = await callTN("SearchEvents", {
    keyword: q,
    page: 1,
    pageSize: 50,
  });

  const result =
    data?.result ?? data?.Result ?? data?.Events ?? data?.events ?? [];

  return NextResponse.json({ result });
}
