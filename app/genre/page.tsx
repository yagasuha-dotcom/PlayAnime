import Link from "next/link";
import { getGenreList } from "@/lib/scraper";
import { Tag } from "lucide-react";

export const revalidate = 86400;

export default async function GenrePage() {
  let genres: Awaited<ReturnType<typeof getGenreList>> = [];
  let error = false;

  try {
    genres = await getGenreList();
  } catch {
    error = true;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-12">
      <p className="font-mono text-xs text-ember mb-2">JELAJAHI</p>
      <h1 className="font-display text-2xl md:text-4xl mb-8">GENRE</h1>

      {error && (
        <p className="text-mute font-mono text-sm">Gagal memuat daftar genre.</p>
      )}

      <div className="flex flex-wrap gap-3">
        {genres.map((g) => (
          <Link
            key={g.id}
            href={`/genre/${g.id}`}
            className="flex items-center gap-2 bg-panel border border-line px-4 py-2 rounded-full text-sm hover:border-ember hover:text-ember transition-colors focus-ring"
          >
            <Tag size={14} /> {g.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
