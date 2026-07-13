import { NextResponse } from "next/server";
import { getSchedule } from "@/lib/samehadaku";

export async function GET() {
  try {
    const data = await getSchedule();
    return NextResponse.json({ success: true, schedule: data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 502 }
    );
  }
}
