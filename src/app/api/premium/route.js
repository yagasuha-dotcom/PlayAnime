import { NextResponse } from "next/server";
import { PREMIUM_PACKAGES } from "@/lib/access";

export async function GET() {
  return NextResponse.json({ success: true, packages: PREMIUM_PACKAGES });
}
