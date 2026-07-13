import Link from "next/link";

export default function AnimeCard({ anime, showEpisode = true }) {
  return (
    <Link
      href={`/anime/${anime.slug}`}
      className="box overflow-hidden flex-shrink-0 w-[150px] active:scale-[0.98] transition"
    >
      <div className="relative w-full aspect-[2/3] bg-base-700">
        {anime.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={anime.image}
            alt={anime.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
            No Image
          </div>
        )}
        {showEpisode && anime.episode && (
          <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-[11px] font-mono px-2 py-1 text-gray-100">
            {anime.episode}
          </span>
        )}
      </div>
      <div className="p-2">
        <p className="text-xs font-semibold text-gray-100 line-clamp-2 leading-snug">
          {anime.title}
        </p>
      </div>
    </Link>
  );
}
