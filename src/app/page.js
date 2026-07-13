import Link from "next/link";
import AnimeCard from "@/components/AnimeCard";
import Logo from "@/components/Logo";
import { getHome } from "@/lib/samehadaku";

export const revalidate = 300;

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
      {/* Hero header dengan ambient glow */}
      <div className="ambient-glow pt-5 pb-4">
        <div className="px-4 flex items-center justify-between">
          <Logo />
          <Link
            href="/premium"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-amber-soft border border-amber/30"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8l4 4 5-8 5 8 4-4-2 11H5L3 8z" />
            </svg>
            <span className="text-xs font-semibold text-amber">Premium</span>
          </Link>
        </div>
        <p className="px-4 mt-1 text-xs text-gray-500 font-mono">
          Streaming anime sub Indo — update setiap hari
        </p>
      </div>

      {/* Search */}
      <div className="px-4 mt-2">
        <Link
          href="/search"
          className="card flex items-center gap-2.5 px-4 py-3.5 text-gray-500 text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          Cari judul anime...
        </Link>
      </div>

      {/* Promo premium */}
      <div className="px-4 mt-4">
        <Link href="/premium" className="card-glow p-4 block relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gradient opacity-10 blur-2xl rounded-full" />
          <p className="eyebrow">PlayAnime Premium</p>
          <p className="text-sm text-gray-200 mt-1.5 relative">
            Mulai <span className="text-transparent bg-clip-text bg-brand-gradient font-bold">Rp 8.000</span>/bulan — bebas
            iklan &amp; akses semua episode tanpa Key.
          </p>
        </Link>
      </div>

      {/* New Update Anime */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white font-display">Update Terbaru</h2>
          <Link href="/jadwal" className="text-xs text-violet font-mono flex items-center gap-1">
            Jadwal
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        </div>

        {fetchError && (
          <div className="card p-4 border-ruby/40">
            <p className="eyebrow text-ruby">Gagal memuat</p>
            <p className="text-sm text-gray-400 mt-1">{fetchError}</p>
          </div>
        )}

        {!fetchError && newEpisodes.length === 0 && (
          <div className="card p-6 text-center">
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
