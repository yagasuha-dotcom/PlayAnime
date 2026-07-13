import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import AnimeCard from "@/components/AnimeCard";

export const dynamic = "force-dynamic";

export default async function SubscribedPage() {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="p-6 flex flex-col items-center justify-center min-h-[70vh] text-center gap-4">
        <span className="text-3xl">📺</span>
        <p className="text-gray-200 font-semibold">Belum login</p>
        <Link href="/auth/login" className="btn-primary text-sm px-8">
          Login / Daftar
        </Link>
      </main>
    );
  }

  const subs = await db
    .select()
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.userId, user.id))
    .orderBy(desc(schema.subscriptions.createdAt));

  return (
    <main className="p-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-100">Subscribed Anime</h1>
        <span className="box-label">Total ({subs.length})</span>
      </div>

      {subs.length === 0 && (
        <div className="box p-6 text-center">
          <p className="text-sm text-gray-500">
            Anime yang kamu subscribe akan muncul di sini. Subscribe dulu animenya.
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {subs.map((s) => (
          <AnimeCard
            key={s.id}
            anime={{ slug: s.animeSlug, title: s.animeTitle, image: s.animeImage }}
            showEpisode={false}
          />
        ))}
      </div>
    </main>
  );
}
