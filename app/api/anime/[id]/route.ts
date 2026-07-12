import { NextResponse } from "next/server";
import { getAnimeDetail } from "@/lib/scraper";

export const revalidate = 1800;

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await getAnimeDetail(params.id);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("anime detail error", err);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil detail anime." },
      { status: 500 }
    );
  }
}
