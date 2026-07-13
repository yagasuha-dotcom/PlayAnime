import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { db, schema } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";

export async function GET() {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "not_authenticated" }, { status: 401 });
  }

  const history = await db
    .select()
    .from(schema.watchHistory)
    .where(eq(schema.watchHistory.userId, user.id))
    .orderBy(desc(schema.watchHistory.updatedAt))
    .limit(100);

  return NextResponse.json({ success: true, history });
}

export async function POST(req) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "not_authenticated" }, { status: 401 });
  }

  const {
    animeSlug,
    animeTitle,
    animeImage,
    episodeSlug,
    episodeTitle,
    progressSeconds,
    durationSeconds,
  } = await req.json();

  const existing = await db
    .select()
    .from(schema.watchHistory)
    .where(
      and(
        eq(schema.watchHistory.userId, user.id),
        eq(schema.watchHistory.episodeSlug, episodeSlug)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(schema.watchHistory)
      .set({ progressSeconds, durationSeconds, updatedAt: new Date() })
      .where(eq(schema.watchHistory.id, existing[0].id));
  } else {
    await db.insert(schema.watchHistory).values({
      userId: user.id,
      animeSlug,
      animeTitle,
      animeImage,
      episodeSlug,
      episodeTitle,
      progressSeconds: progressSeconds || 0,
      durationSeconds: durationSeconds || 0,
    });
  }

  return NextResponse.json({ success: true });
}
