import { NextResponse } from "next/server";
import { getByGenre } from "@/lib/samehadaku";

export async function GET(req, { params }) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  try {
    const data = await getByGenre(params.slug, page);
    return NextResponse.json({ success: true, ...data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 502 }
    );
  }
}
