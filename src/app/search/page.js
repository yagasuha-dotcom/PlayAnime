"use client";

import { useState } from "react";
import AnimeCard from "@/components/AnimeCard";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/anime/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.success ? data.results : []);
    } catch (err) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-4 pb-6">
      <h1 className="text-lg font-bold text-gray-100 mb-3">Cari Anime</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Judul anime..."
          className="flex-1 box px-4 py-3 text-sm text-gray-100 placeholder:text-gray-600 outline-none focus:border-accent"
        />
        <button type="submit" className="btn-primary text-sm px-4">
          Cari
        </button>
      </form>

      {loading && <p className="text-sm text-gray-500">Mencari...</p>}

      {!loading && searched && results.length === 0 && (
        <div className="box p-4 text-center">
          <p className="text-sm text-gray-500">Tidak ditemukan hasil untuk &quot;{query}&quot;</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {results.map((anime) => (
          <AnimeCard key={anime.slug} anime={anime} showEpisode={false} />
        ))}
      </div>
    </main>
  );
}
