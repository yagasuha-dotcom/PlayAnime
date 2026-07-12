import Link from "next/link";
import AnimeCard from "@/components/AnimeCard";
import { getHome } from "@/lib/scraper";
import { ArrowRight, Radio } from "lucide-react";

export const revalidate = 900;

export default async function HomePage() {
  let ongoing: Awaited<ReturnType<typeof getHome>>["ongoing"] = [];
  let completed: Awaited<ReturnType<typeof getHome>>["completed"] = [];
  let error = false;

  try {
    const data = await getHome();
    ongoing = data.ongoing;
    completed = data.completed;
  } catch {
    error = true;
  }

  return (
    <div>
      {/* HERO */}
      <section className="relative border-b border-line overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-16 md:py-24">
          <p className="font-mono text-ember text-xs tracking-widest mb-4 flex items-center gap-2">
            <Radio size={14} className="animate-pulse" /> LIVE INDEX — UPDATE HARIAN
          </p>
          <h1 className="font-display text-4xl md:text-7xl leading-[0.95] mb-6">
            NONTON ANIME<br />
            <span className="text-outline">TANPA RIBET</span>
          </h1>
          <p className="text-mute max-w-xl font-mono text-sm">
            Katalog anime subtitle Indonesia — ongoing, tamat, dan jadwal rilis mingguan, semua dalam satu tempat.
          </p>
        </div>
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-ember/10 blur-3xl" />
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-10 py-12">
        {error && (
          <div className="bg-panel border border-ember/40 rounded-xl p-6 mb-10 font-mono text-sm text-mute">
            Semua domain kandidat Samehadaku gagal diakses (sistem sudah coba beberapa domain otomatis).
            Kemungkinan situs sumber pindah ke domain yang belum terdaftar. Tambahkan domain baru ke{" "}
            <code className="text-ember">CANDIDATE_DOMAINS</code> di{" "}
            <code className="text-ember">lib/scraper.ts</code>, atau cek{" "}
            <code className="text-ember">/api/status</code> untuk lihat domain mana yang lagi dicoba.
          </div>
        )}

        {/* ONGOING */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl md:text-3xl">
              ONGOING <span className="text-ember">.</span>
            </h2>
            <Link href="/genre" className="font-mono text-xs text-mute hover:text-ember flex items-center gap-1">
              lihat semua <ArrowRight size={14} />
            </Link>
          </div>
          {ongoing.length === 0 && !error && (
            <p className="text-mute font-mono text-sm">Belum ada data.</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {ongoing.slice(0, 18).map((anime, i) => (
              <AnimeCard key={anime.linkId + i} anime={anime} index={i} />
            ))}
          </div>
        </section>

        {/* COMPLETED */}
        {completed.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl md:text-3xl">
                TAMAT <span className="text-ember">.</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {completed.slice(0, 12).map((anime, i) => (
                <AnimeCard key={anime.linkId + i} anime={anime} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
