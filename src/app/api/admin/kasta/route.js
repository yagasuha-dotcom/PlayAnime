import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

async function requireAdmin() {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [dbUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, user.id))
    .limit(1);

  if (!dbUser || dbUser.kasta !== "admin") return null;
  return dbUser;
}

export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, error: "forbidden", message: "Khusus Admin" },
      { status: 403 }
    );
  }

  const { targetUserId, kasta } = await req.json();
  if (!["admin", "donatur", "rakyat"].includes(kasta)) {
    return NextResponse.json(
      { success: false, error: "Kasta tidak valid" },
      { status: 400 }
    );
  }

  await db
    .update(schema.users)
    .set({ kasta })
    .where(eq(schema.users.id, targetUserId));

  return NextResponse.json({ success: true, message: `Kasta diubah menjadi ${kasta}` });
}
