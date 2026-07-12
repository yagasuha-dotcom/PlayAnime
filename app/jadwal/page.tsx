import AnimeCard from "@/components/AnimeCard";
import { getSchedule } from "@/lib/scraper";
import { CalendarDays } from "lucide-react";

export const revalidate = 3600;

export default async function JadwalPage() {
  let schedule: Awaited<ReturnType<typeof getSchedule>> = [];
  let error = false;

  try {
    schedule = await getSchedule();
  } catch {
    error = true;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-12">
      <p className="font-mono text-xs text-ember mb-2 flex items-center gap-2">
        <CalendarDays size={14} /> MINGGU INI
      </p>
      <h1 className="font-display text-2xl md:text-4xl mb-10">JADWAL RILIS</h1>

      {error && <p className="text-mute font-mono text-sm">Gagal memuat jadwal rilis.</p>}
      {!error && schedule.length === 0 && (
        <p className="text-mute font-mono text-sm">Data jadwal tidak tersedia saat ini.</p>
      )}

      <div className="space-y-12">
        {schedule.map((day) => (
          <section key={day.day}>
            <h2 className="font-display text-xl mb-4 pb-2 border-b border-line">{day.day}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {day.animes.map((anime, i) => (
                <AnimeCard key={anime.linkId + i} anime={anime} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
