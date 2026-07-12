"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AnimeCard from "@/components/AnimeCard";
import type { AnimeCard as AnimeCardType } from "@/lib/scraper";
import { SearchX, Loader2 } from "lucide-react";

function SearchResults() {
  const params = useSearchParams();
  const q = params.get("q") || "";
  const [results, setResults] = useState<AnimeCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    setError(false);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setResults(json.data);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-12">
      <p className="font-mono text-xs text-ember mb-2">HASIL PENCARIAN</p>
      <h1 className="font-display text-2xl md:text-4xl mb-8">&ldquo;{q}&rdquo;</h1>

      {loading && (
        <div className="flex items-center gap-2 text-mute font-mono text-sm">
          <Loader2 className="animate-spin" size={18} /> mencari...
        </div>
      )}

      {!loading && error && (
        <div className="text-mute font-mono text-sm">Gagal memuat hasil pencarian. Coba lagi.</div>
      )}

      {!loading && !error && results.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-mute font-mono text-sm">
          <SearchX size={32} />
          Tidak ada hasil untuk pencarian ini.
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {results.map((anime, i) => (
          <AnimeCard key={anime.linkId + i} anime={anime} />
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
