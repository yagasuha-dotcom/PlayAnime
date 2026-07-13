import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { unlockEpisodeWithKey } from "@/lib/access";

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

  const { episodeSlug } = await req.json();
  if (!episodeSlug) {
    return NextResponse.json(
      { success: false, error: "episodeSlug wajib diisi" },
      { status: 400 }
    );
  }

  const result = await unlockEpisodeWithKey(user.id, episodeSlug);

  if (!result.ok) {
    return NextResponse.json(
      {
        success: false,
        error: result.reason,
        message:
          result.reason === "insufficient_key"
            ? "Key kamu tidak cukup. Tonton iklan dulu untuk dapat Key (2 Key per iklan)."
            : "Gagal unlock episode",
        keyBalance: result.keyBalance,
      },
      { status: 402 }
    );
  }

  return NextResponse.json({ success: true, ...result });
}
