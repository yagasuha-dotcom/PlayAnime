import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { activatePremium } from "@/lib/access";

// Panggil endpoint ini dari webhook payment gateway kamu (Midtrans/Xendit/Tripay)
// setelah pembayaran QRIS/e-wallet dikonfirmasi sukses.
// Amankan dengan signature verification sesuai dokumentasi gateway yang dipakai
// sebelum dipakai di production.
export async function POST(req) {
  const body = await req.json();
  const { orderId, status, signature } = body;

  // TODO: verifikasi signature sesuai payment gateway pilihanmu di sini.
  // Kalau signature invalid -> return 401.

  if (status !== "paid") {
    return NextResponse.json({ success: false, message: "Status bukan paid" });
  }

  const [order] = await db
    .select()
    .from(schema.premiumOrders)
    .where(eq(schema.premiumOrders.id, orderId))
    .limit(1);

  if (!order) {
    return NextResponse.json(
      { success: false, error: "order_not_found" },
      { status: 404 }
    );
  }

  if (order.status === "paid") {
    return NextResponse.json({ success: true, message: "Sudah diproses sebelumnya" });
  }

  await db
    .update(schema.premiumOrders)
    .set({ status: "paid", paidAt: new Date() })
    .where(eq(schema.premiumOrders.id, orderId));

  const { premiumUntil } = await activatePremium(order.userId, order.packageMonths);

  return NextResponse.json({
    success: true,
    message: "Premium diaktifkan",
    premiumUntil,
  });
}
