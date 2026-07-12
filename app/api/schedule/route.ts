import { NextResponse } from "next/server";
import { getSchedule } from "@/lib/scraper";

export const revalidate = 3600;

export async function GET() {
  try {
    const data = await getSchedule();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("schedule error", err);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil jadwal rilis." },
      { status: 500 }
    );
  }
}
