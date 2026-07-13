import Link from "next/link";
import AnimeCard from "@/components/AnimeCard";
import { getHome } from "@/lib/samehadaku";

export const revalidate = 300; // cache 5 menit biar ga scrape tiap request

export default async function HomePage() {
  let newEpisodes = [];
  let fetchError = null;

  try {
    const data = await getHome();
    newEpisodes = data.newEpisodes;
  } catch (err) {
    fetchError = err.message;
  }

  return (
    <main className="pb-4">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-100">
            Play<span className="text-accent">Anime</span>
          </h1>
          <p className="text-xs text-gray-500 font-mono">Nonton Anime Sub Indo</p>
        </div>
        <Link
          href="/premium"
          className="box px-3 py-2 flex items-center gap-1.5 border-accent/40"
        >
          <span className="text-accent">👑</span>
          <span className="text-xs font-semibold text-accent">Premium</span>
        </Link>
      </div>

      {/* Search */}
      <div className="px-4">
        <Link
          href="/search"
          className="box flex items-center gap-2 px-4 py-3 text-gray-500 text-sm"
        >
          🔍 Cari Anime Di Sini
        </Link>
      </div>

      {/* Promo box, table style */}
      <div className="px-4 mt-4">
        <div className="box p-4">
          <p className="box-label">PlayAnime Premium</p>
          <p className="text-sm text-gray-200 mt-1">
            Mulai <span className="text-accent font-bold">Rp 8.000</span>/bulan — bebas
            iklan, akses semua episode tanpa Key.
          </p>
        </div>
      </div>

      {/* New Update Anime */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-100">Update Terbaru</h2>
          <Link href="/jadwal" className="text-xs text-accent font-mono">
            Lihat Jadwal &gt;
          </Link>
        </div>

        {fetchError && (
          <div className="box p-4 border-ruby/40">
            <p className="box-label text-ruby">Gagal memuat</p>
            <p className="text-sm text-gray-400 mt-1">{fetchError}</p>
          </div>
        )}

        {!fetchError && newEpisodes.length === 0 && (
          <div className="box p-4">
            <p className="text-sm text-gray-500">Belum ada data. Coba refresh.</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {newEpisodes.map((anime) => (
            <AnimeCard key={anime.slug} anime={anime} showEpisode />
          ))}
        </div>
      </div>
    </main>
  );
}
