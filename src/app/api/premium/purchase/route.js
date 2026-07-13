import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { db, schema } from "@/lib/db";
import { PREMIUM_PACKAGES } from "@/lib/access";

// Endpoint bikin order premium. Statusnya "pending" dulu sampai
// dikonfirmasi lewat webhook payment gateway (QRIS/e-wallet) kamu.
// Untuk sekarang disiapkan simple, tinggal sambungkan ke Midtrans/Xendit/Tripay dsb.
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

  const { months } = await req.json();
  const pkg = PREMIUM_PACKAGES.find((p) => p.months === months);

  if (!pkg) {
    return NextResponse.json(
      { success: false, error: "Paket tidak valid" },
      { status: 400 }
    );
  }

  const [order] = await db
    .insert(schema.premiumOrders)
    .values({
      userId: user.id,
      packageMonths: pkg.months,
      priceIdr: pkg.priceIdr,
      status: "pending",
    })
    .returning();

  return NextResponse.json({
    success: true,
    order,
    message: "Order dibuat. Lanjutkan pembayaran untuk aktivasi otomatis.",
  });
}
