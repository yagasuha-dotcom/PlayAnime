import AnimeCard from "@/components/AnimeCard";
import { getByGenre } from "@/lib/scraper";

export default async function GenreDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let results: Awaited<ReturnType<typeof getByGenre>> = [];
  let error = false;

  try {
    results = await getByGenre(params.id);
  } catch {
    error = true;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-12">
      <p className="font-mono text-xs text-ember mb-2">GENRE</p>
      <h1 className="font-display text-2xl md:text-4xl mb-8 capitalize">{params.id.replace(/-/g, " ")}</h1>

      {error && <p className="text-mute font-mono text-sm">Gagal memuat data.</p>}
      {!error && results.length === 0 && (
        <p className="text-mute font-mono text-sm">Tidak ada anime ditemukan untuk genre ini.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {results.map((anime, i) => (
          <AnimeCard key={anime.linkId + i} anime={anime} />
        ))}
      </div>
    </div>
  );
}
