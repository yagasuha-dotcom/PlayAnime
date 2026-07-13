import { NextResponse } from "next/server";
import { getHome } from "@/lib/samehadaku";

export async function GET() {
  try {
    const data = await getHome();
    return NextResponse.json({ success: true, ...data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 502 }
    );
  }
}
