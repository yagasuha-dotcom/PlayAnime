import { NextResponse } from "next/server";
import { searchAnime } from "@/lib/scraper";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const page = Number(searchParams.get("page") || "1");

  if (!q.trim()) {
    return NextResponse.json({ success: false, message: "Query kosong" }, { status: 400 });
  }

  try {
    const data = await searchAnime(q, page);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("search error", err);
    return NextResponse.json(
      { success: false, message: "Gagal mencari anime." },
      { status: 500 }
    );
  }
}
