import { NextResponse } from "next/server";
import { getHome, getActiveDomain } from "@/lib/scraper";

export const revalidate = 900; // cache 15 menit

export async function GET() {
  try {
    const data = await getHome();
    const domain = await getActiveDomain().catch(() => null);
    return NextResponse.json({ success: true, data, sourceDomain: domain });
  } catch (err) {
    console.error("home error", err);
    return NextResponse.json(
      {
        success: false,
        message:
          "Semua domain Samehadaku yang dicoba gagal diakses. Kemungkinan ada domain baru yang belum terdaftar — cek lib/scraper.ts.",
      },
      { status: 500 }
    );
  }
}
