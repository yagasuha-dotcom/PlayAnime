import Link from "next/link";
import { getSchedule } from "@/lib/samehadaku";

export const revalidate = 600;

export default async function JadwalPage() {
  let schedule = {};
  let error = null;
  try {
    schedule = await getSchedule();
  } catch (err) {
    error = err.message;
  }

  const days = Object.keys(schedule);

  return (
    <main className="p-4 pb-6">
      <h1 className="text-lg font-bold text-gray-100 mb-4">Jadwal Tayang</h1>

      {error && (
        <div className="box p-4 border-ruby/40 mb-4">
          <p className="box-label text-ruby">Gagal memuat</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
        </div>
      )}

      {!error && days.length === 0 && (
        <div className="box p-4 text-center">
          <p className="text-sm text-gray-500">Jadwal belum tersedia.</p>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {days.map((day) => (
          <div key={day}>
            <p className="box-label mb-2">{day}</p>
            <div className="box divide-y divide-line overflow-hidden">
              {schedule[day].map((item, i) => (
                <Link
                  key={i}
                  href={item.slug ? `/anime/${item.slug}` : "#"}
                  className="flex items-center justify-between px-4 py-3 active:bg-base-700/50"
                >
                  <span className="text-sm text-gray-100">{item.title}</span>
                  {item.time && (
                    <span className="text-xs font-mono text-accent">{item.time}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
