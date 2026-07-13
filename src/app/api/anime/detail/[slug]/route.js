import { NextResponse } from "next/server";
import { getAnimeDetail } from "@/lib/samehadaku";

export async function GET(req, { params }) {
  const { slug } = params;
  try {
    const data = await getAnimeDetail(slug);
    return NextResponse.json({ success: true, ...data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 502 }
    );
  }
}
