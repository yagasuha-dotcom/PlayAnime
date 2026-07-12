import { NextResponse } from "next/server";
import { getByGenre } from "@/lib/scraper";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");

  try {
    const data = await getByGenre(params.id, page);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("genre by id error", err);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil anime berdasarkan genre." },
      { status: 500 }
    );
  }
}
