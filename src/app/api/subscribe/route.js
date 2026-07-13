import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { db, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";

export async function POST(req) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "not_authenticated" }, { status: 401 });
  }

  const { animeSlug, animeTitle, animeImage } = await req.json();

  const existing = await db
    .select()
    .from(schema.subscriptions)
    .where(
      and(
        eq(schema.subscriptions.userId, user.id),
        eq(schema.subscriptions.animeSlug, animeSlug)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db.delete(schema.subscriptions).where(eq(schema.subscriptions.id, existing[0].id));
    return NextResponse.json({ success: true, subscribed: false });
  }

  await db.insert(schema.subscriptions).values({
    userId: user.id,
    animeSlug,
    animeTitle,
    animeImage,
  });

  return NextResponse.json({ success: true, subscribed: true });
}
