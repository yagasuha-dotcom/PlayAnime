import Link from "next/link";
import { getEpisode } from "@/lib/samehadaku";
import { supabaseServer } from "@/lib/supabase-server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { isPremiumActive, hasUnlockedEpisode } from "@/lib/access";
import VideoPlayer from "@/components/VideoPlayer";
import LockedEpisode from "@/components/LockedEpisode";

export const dynamic = "force-dynamic";

export default async function WatchPage({ params }) {
  const { slug } = params;
  const supabase = supabaseServer();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return (
      <main className="p-6 flex flex-col items-center justify-center min-h-[70vh] text-center gap-4">
        <span className="text-3xl">🔐</span>
        <p className="text-gray-200 font-semibold">Login dulu untuk nonton</p>
        <Link href="/auth/login" className="btn-primary text-sm px-8">
          Login / Daftar
        </Link>
      </main>
    );
  }

  const [dbUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, authUser.id))
    .limit(1);

  const isAdmin = dbUser?.kasta === "admin";
  const premiumActive = isPremiumActive(dbUser);
  const unlocked = await hasUnlockedEpisode(authUser.id, slug);
  const canWatch = isAdmin || premiumActive || unlocked;

  let episode = null;
  let error = null;
  try {
    episode = await getEpisode(slug);
  } catch (err) {
    error = err.message;
  }

  if (error) {
    return (
      <main className="p-4">
        <div className="box p-4 border-ruby/40">
          <p className="box-label text-ruby">Gagal memuat episode</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-6">
      <div className="sticky top-0 z-20 bg-base-950 flex items-center gap-3 p-4 border-b border-line">
        <Link href={episode.animeSlug ? `/anime/${episode.animeSlug}` : "/"} className="text-gray-300">
          ←
        </Link>
        <p className="text-sm font-semibold text-gray-100 line-clamp-1">{episode.title}</p>
      </div>

      {canWatch ? (
        <VideoPlayer
          episodeSlug={slug}
          animeSlug={episode.animeSlug}
          animeTitle={episode.title}
          animeImage={null}
          episodeTitle={episode.title}
          defaultIframe={episode.defaultIframe}
          mirrors={episode.mirrors}
        />
      ) : (
        <LockedEpisode episodeSlug={slug} keyBalance={dbUser?.keyBalance || 0} />
      )}

      <div className="px-4 mt-4 flex items-center justify-between gap-3">
        <Link
          href={episode.prevEpisode ? `/watch/${episode.prevEpisode}` : "#"}
          className={`btn-outline text-sm flex-1 text-center ${
            !episode.prevEpisode && "opacity-30 pointer-events-none"
          }`}
        >
          ← Sebelumnya
        </Link>
        <Link
          href={episode.nextEpisode ? `/watch/${episode.nextEpisode}` : "#"}
          className={`btn-outline text-sm flex-1 text-center ${
            !episode.nextEpisode && "opacity-30 pointer-events-none"
          }`}
        >
          Selanjutnya →
        </Link>
      </div>

      {canWatch && episode.downloads && episode.downloads.length > 0 && (
        <div className="px-4 mt-6">
          <p className="box-label mb-2">Download</p>
          <div className="box divide-y divide-line overflow-hidden">
            {episode.downloads.map((d) => (
              <div key={d.resolution} className="p-3">
                <p className="text-xs font-mono text-gray-400 mb-1.5">{d.resolution}</p>
                <div className="flex flex-wrap gap-2">
                  {d.links.map((l, i) => (
                    <a
                      key={i}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono px-2 py-1 rounded bg-base-700 text-gray-300 border border-line"
                    >
                      {l.provider}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
