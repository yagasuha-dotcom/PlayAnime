import Link from "next/link";
import { getEpisode } from "@/lib/scraper";
import { ChevronLeft, ChevronRight, Download, ArrowLeft } from "lucide-react";
import WatchPlayer from "@/components/WatchPlayer";

export default async function WatchPage({
  params,
}: {
  params: { link: string };
}) {
  let ep;
  try {
    ep = await getEpisode(params.link);
  } catch {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center font-mono text-mute">
        Gagal memuat episode. Coba lagi nanti.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-10 py-8">
      {ep.animeId && (
        <Link href={`/anime/${ep.animeId}`} className="inline-flex items-center gap-1 font-mono text-xs text-mute hover:text-ember mb-4">
          <ArrowLeft size={14} /> kembali ke detail anime
        </Link>
      )}

      <h1 className="font-display text-xl md:text-3xl mb-6">{ep.title}</h1>

      <WatchPlayer episodeRef={params.link} streamUrl={ep.streamUrl} title={ep.title} />

      {ep.mirrors.length > 0 && (
        <div className="mb-8">
          <p className="font-mono text-xs text-mute mb-2">MIRROR SERVER</p>
          <div className="flex flex-wrap gap-2">
            {ep.mirrors.map((m, i) => (
              <span key={i} className="bg-panel border border-line px-3 py-1.5 rounded-lg text-xs font-mono text-mute">
                {m.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-10 font-mono text-sm">
        {ep.prevEpisode ? (
          <Link href={`/watch/${ep.prevEpisode}`} className="flex items-center gap-1 bg-panel border border-line px-4 py-2 rounded-full hover:border-ember transition-colors">
            <ChevronLeft size={16} /> Sebelumnya
          </Link>
        ) : <span />}
        {ep.nextEpisode ? (
          <Link href={`/watch/${ep.nextEpisode}`} className="flex items-center gap-1 bg-ember text-ink font-bold px-4 py-2 rounded-full hover:bg-ember2 transition-colors">
            Selanjutnya <ChevronRight size={16} />
          </Link>
        ) : <span />}
      </div>

      {ep.downloadLinks.length > 0 && (
        <section>
          <h2 className="font-display text-lg mb-4 flex items-center gap-2">
            <Download size={18} className="text-ember" /> DOWNLOAD
          </h2>
          <div className="space-y-4">
            {ep.downloadLinks.map((group, i) => (
              <div key={i} className="bg-panel border border-line rounded-lg p-4">
                <p className="font-mono text-xs text-ember mb-2">{group.quality || `Opsi ${i + 1}`}</p>
                <div className="flex flex-wrap gap-2">
                  {group.links.map((l, j) => (
                    <a
                      key={j}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono bg-panel2 border border-line px-3 py-1.5 rounded-md hover:border-ember hover:text-ember transition-colors"
                    >
                      {l.name}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
