import Link from "next/link";
import { getAnimeDetail } from "@/lib/scraper";
import { Star, PlayCircle, Tag } from "lucide-react";

export const revalidate = 1800;

export default async function AnimeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let detail;
  try {
    detail = await getAnimeDetail(params.id);
  } catch {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center font-mono text-mute">
        Gagal memuat detail anime. Coba lagi nanti atau cek konfigurasi sumber.
      </div>
    );
  }

  return (
    <div>
      <section className="relative border-b border-line">
        {detail.image && (
          <div className="absolute inset-0 -z-10 opacity-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={detail.image} alt="" className="w-full h-full object-cover blur-2xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-ink/40 to-ink" />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-16 flex flex-col md:flex-row gap-8">
          <div className="w-40 md:w-56 shrink-0 mx-auto md:mx-0">
            <div className="aspect-[2/3] rounded-xl overflow-hidden border border-line bg-panel">
              {detail.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={detail.image} alt={detail.title} className="w-full h-full object-cover" />
              ) : null}
            </div>
          </div>

          <div className="flex-1">
            <p className="font-mono text-xs text-ember mb-2">{detail.status || "STATUS TIDAK DIKETAHUI"}</p>
            <h1 className="font-display text-2xl md:text-4xl mb-4 leading-tight">{detail.title}</h1>

            <div className="flex flex-wrap items-center gap-3 mb-5 font-mono text-sm text-mute">
              {detail.rating && (
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-ember2 fill-ember2" /> {detail.rating}
                </span>
              )}
              {Object.entries(detail.info).slice(0, 4).map(([k, v]) => (
                <span key={k}>{k}: <span className="text-paper">{v}</span></span>
              ))}
            </div>

            {detail.genre.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {detail.genre.map((g) => (
                  <span key={g} className="flex items-center gap-1 bg-panel border border-line px-3 py-1 rounded-full text-xs font-mono text-mute">
                    <Tag size={10} /> {g}
                  </span>
                ))}
              </div>
            )}

            {detail.episodes[0] && (
              <Link
                href={`/watch/${detail.episodes[0].link}`}
                className="inline-flex items-center gap-2 bg-ember text-ink font-mono font-bold text-sm px-6 py-3 rounded-full hover:bg-ember2 transition-colors focus-ring"
              >
                <PlayCircle size={18} /> TONTON EPISODE TERBARU
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-10 py-12">
        {detail.synopsis && (
          <section className="mb-12 max-w-3xl">
            <h2 className="font-display text-xl mb-3">SINOPSIS</h2>
            <p className="text-mute leading-relaxed whitespace-pre-line">{detail.synopsis}</p>
          </section>
        )}

        <section>
          <h2 className="font-display text-xl mb-4">DAFTAR EPISODE ({detail.episodes.length})</h2>
          {detail.episodes.length === 0 ? (
            <p className="text-mute font-mono text-sm">Belum ada episode terdaftar.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {detail.episodes.map((ep) => (
                <Link
                  key={ep.link}
                  href={`/watch/${ep.link}`}
                  className="flex items-center gap-3 bg-panel border border-line rounded-lg px-4 py-3 hover:border-ember transition-colors focus-ring"
                >
                  <PlayCircle size={18} className="text-ember shrink-0" />
                  <span className="text-sm truncate">{ep.title}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
