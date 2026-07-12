import { NextResponse } from "next/server";
import { getActiveDomain } from "@/lib/scraper";

export async function GET() {
  try {
    const domain = await getActiveDomain();
    return NextResponse.json({ success: true, activeDomain: domain });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Semua domain kandidat gagal.",
      },
      { status: 500 }
    );
  }
}
