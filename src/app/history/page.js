import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="p-6 flex flex-col items-center justify-center min-h-[70vh] text-center gap-4">
        <span className="text-3xl">🕒</span>
        <p className="text-gray-200 font-semibold">Belum login</p>
        <Link href="/auth/login" className="btn-primary text-sm px-8">
          Login / Daftar
        </Link>
      </main>
    );
  }

  const history = await db
    .select()
    .from(schema.watchHistory)
    .where(eq(schema.watchHistory.userId, user.id))
    .orderBy(desc(schema.watchHistory.updatedAt))
    .limit(100);

  return (
    <main className="p-4 pb-6">
      <h1 className="text-lg font-bold text-gray-100 mb-1">Riwayat Menonton</h1>
      <p className="text-xs text-gray-500 mb-4">Episode terakhir yang kamu tonton</p>

      {history.length === 0 && (
        <div className="box p-4 text-center">
          <p className="text-sm text-gray-500">Belum ada riwayat menonton.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {history.map((h) => {
          const progressPct =
            h.durationSeconds > 0
              ? Math.min(100, Math.round((h.progressSeconds / h.durationSeconds) * 100))
              : 0;
          return (
            <Link key={h.id} href={`/watch/${h.episodeSlug}`} className="box p-3 flex gap-3">
              <div className="w-16 h-20 rounded bg-base-700 flex-shrink-0 overflow-hidden">
                {h.animeImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={h.animeImage} alt={h.animeTitle} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-100 truncate">{h.animeTitle}</p>
                <p className="text-xs text-gray-500">{h.episodeTitle}</p>
                <div className="w-full h-1.5 bg-base-700 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
