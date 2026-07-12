import { NextResponse } from "next/server";
import { getGenreList } from "@/lib/scraper";

export const revalidate = 86400;

export async function GET() {
  try {
    const data = await getGenreList();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("genre list error", err);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil daftar genre." },
      { status: 500 }
    );
  }
}
