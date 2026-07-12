import Link from "next/link";
import { Star, PlayCircle } from "lucide-react";
import type { AnimeCard as AnimeCardType } from "@/lib/scraper";

export default function AnimeCard({ anime, index }: { anime: AnimeCardType; index?: number }) {
  return (
    <Link
      href={`/anime/${anime.linkId}`}
      className="card-tilt group block bg-panel border border-line rounded-xl overflow-hidden focus-ring"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-panel2">
        {anime.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={anime.image}
            alt={anime.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-mute text-xs font-mono">
            no image
          </div>
        )}

        {typeof index === "number" && (
          <span className="absolute top-2 left-2 font-display text-2xl text-outline">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}

        {anime.episode && (
          <span className="absolute bottom-2 left-2 bg-ember text-ink text-xs font-mono font-bold px-2 py-0.5 rounded">
            {anime.episode}
          </span>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
          <PlayCircle className="text-ember" size={36} />
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-ember transition-colors">
          {anime.title}
        </h3>
        <div className="flex items-center gap-2 mt-1.5 font-mono text-xs text-mute">
          {anime.rating && (
            <span className="flex items-center gap-1">
              <Star size={12} className="text-ember2 fill-ember2" /> {anime.rating}
            </span>
          )}
          {anime.status && <span>{anime.status}</span>}
        </div>
      </div>
    </Link>
  );
}
