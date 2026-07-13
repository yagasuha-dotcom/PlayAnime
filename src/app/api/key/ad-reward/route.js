import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { grantKeyFromAd } from "@/lib/access";

// Endpoint ini dipanggil dari callback SSV (Server-Side Verification) provider iklan
// (misalnya AdMob Rewarded Ad callback), ATAU dari client setelah event "ad completed"
// kalau belum pakai SSV. Untuk produksi rilis Play Store, WAJIB pindah ke SSV provider
// biar ga bisa dicurangi (reward tanpa nonton iklan beneran).
export async function POST(req) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "not_authenticated" },
      { status: 401 }
    );
  }

  const result = await grantKeyFromAd(user.id);

  if (!result.ok) {
    return NextResponse.json(
      { success: false, error: result.reason },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `+${result.gained} Key diterima!`,
    keyBalance: result.keyBalance,
  });
}
