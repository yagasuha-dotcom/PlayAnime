import Link from "next/link";
import { getAnimeDetail } from "@/lib/samehadaku";

export const revalidate = 600;

export default async function AnimeDetailPage({ params }) {
  const { slug } = params;
  let anime = null;
  let error = null;

  try {
    anime = await getAnimeDetail(slug);
  } catch (err) {
    error = err.message;
  }

  if (error) {
    return (
      <main className="p-4">
        <div className="box p-4 border-ruby/40">
          <p className="box-label text-ruby">Gagal memuat anime</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-6">
      <div className="relative">
        {anime.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={anime.image}
            alt={anime.title}
            className="w-full aspect-[3/4] object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-base-950 via-base-950/40 to-transparent" />
        <Link
          href="/"
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-gray-100"
        >
          ←
        </Link>
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-lg font-extrabold text-gray-50 leading-snug">{anime.title}</h1>
        </div>
      </div>

      <div className="px-4 mt-4 flex flex-wrap gap-2">
        {anime.genres.map((g) => (
          <span key={g} className="kasta-badge bg-white/5 border border-line text-gray-300">
            {g}
          </span>
        ))}
      </div>

      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        {Object.entries(anime.info).slice(0, 6).map(([label, value]) => (
          <div key={label} className="stat-tile">
            <span className="box-label">{label}</span>
            <span className="text-sm font-semibold text-gray-200">{value || "-"}</span>
          </div>
        ))}
      </div>

      <div className="px-4 mt-5">
        <p className="box-label mb-2">Sinopsis</p>
        <p className="text-sm text-gray-400 leading-relaxed">
          {anime.synopsis || "Sinopsis belum tersedia."}
        </p>
      </div>

      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-100">Episode</h2>
          <span className="box-label">{anime.episodeList.length} eps</span>
        </div>

        <div className="box divide-y divide-line overflow-hidden">
          {anime.episodeList.length === 0 && (
            <p className="p-4 text-sm text-gray-500">Episode belum tersedia.</p>
          )}
          {anime.episodeList.map((ep) => (
            <Link
              key={ep.slug}
              href={`/watch/${ep.slug}`}
              className="flex items-center justify-between px-4 py-3 active:bg-base-700/50"
            >
              <div>
                <p className="text-sm font-semibold text-gray-100">{ep.title}</p>
                {ep.date && <p className="text-xs text-gray-500 font-mono">{ep.date}</p>}
              </div>
              <span className="text-accent">▶</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
