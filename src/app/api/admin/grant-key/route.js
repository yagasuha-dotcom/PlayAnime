import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(req) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "not_authenticated" }, { status: 401 });
  }

  const [admin] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, user.id))
    .limit(1);

  if (!admin || admin.kasta !== "admin") {
    return NextResponse.json({ success: false, error: "forbidden" }, { status: 403 });
  }

  const { targetUserId, amount } = await req.json();

  const [target] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, targetUserId))
    .limit(1);

  if (!target) {
    return NextResponse.json({ success: false, error: "user_not_found" }, { status: 404 });
  }

  const newBalance = target.keyBalance + amount;

  await db
    .update(schema.users)
    .set({ keyBalance: newBalance })
    .where(eq(schema.users.id, targetUserId));

  await db.insert(schema.keyTransactions).values({
    userId: targetUserId,
    amount,
    reason: "admin_grant",
  });

  return NextResponse.json({ success: true, keyBalance: newBalance });
}
