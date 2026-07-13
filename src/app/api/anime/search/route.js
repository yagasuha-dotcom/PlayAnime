import { NextResponse } from "next/server";
import { searchAnime } from "@/lib/samehadaku";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1", 10);

  if (!q) {
    return NextResponse.json(
      { success: false, error: "Query pencarian kosong" },
      { status: 400 }
    );
  }

  try {
    const data = await searchAnime(q, page);
    return NextResponse.json({ success: true, ...data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 502 }
    );
  }
}
