import { NextResponse } from "next/server";
import { getEpisode } from "@/lib/samehadaku";
import { supabaseServer } from "@/lib/supabase-server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import {
  isPremiumActive,
  hasUnlockedEpisode,
} from "@/lib/access";

export async function GET(req, { params }) {
  const { slug } = params;

  try {
    const supabase = supabaseServer();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "not_authenticated", message: "Login dulu buat nonton" },
        { status: 401 }
      );
    }

    const [dbUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, authUser.id))
      .limit(1);

    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: "user_not_found" },
        { status: 404 }
      );
    }

    const premiumActive = isPremiumActive(dbUser);
    const isAdmin = dbUser.kasta === "admin";
    const unlocked = await hasUnlockedEpisode(dbUser.id, slug);

    const canWatch = isAdmin || premiumActive || unlocked;

    if (!canWatch) {
      return NextResponse.json(
        {
          success: false,
          error: "locked",
          message:
            "Episode ini terkunci. Gunakan Key (dari nonton iklan) atau upgrade ke Donatur untuk akses bebas iklan.",
          keyBalance: dbUser.keyBalance,
        },
        { status: 402 }
      );
    }

    const data = await getEpisode(slug);

    return NextResponse.json({
      success: true,
      ...data,
      accessMethod: isAdmin ? "admin" : premiumActive ? "premium" : "key_unlocked",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 502 }
    );
  }
}
