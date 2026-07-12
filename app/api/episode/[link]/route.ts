import { NextResponse } from "next/server";
import { getEpisode } from "@/lib/scraper";

export async function GET(
  _req: Request,
  { params }: { params: { link: string } }
) {
  try {
    const data = await getEpisode(params.link);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("episode error", err);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data episode." },
      { status: 500 }
    );
  }
}
