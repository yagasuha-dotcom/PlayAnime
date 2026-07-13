import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import KastaBadge from "@/components/KastaBadge";
import { isPremiumActive } from "@/lib/access";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = supabaseServer();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return (
      <main className="p-6 flex flex-col items-center justify-center min-h-[70vh] text-center gap-4">
        <span className="text-3xl">👤</span>
        <p className="text-gray-200 font-semibold">Belum login</p>
        <Link href="/auth/login" className="btn-primary text-sm px-8">
          Login / Daftar
        </Link>
      </main>
    );
  }

  const [dbUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, authUser.id))
    .limit(1);

  const premiumActive = isPremiumActive(dbUser);

  return (
    <main className="p-4 pb-6">
      <div className="box p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-xl font-bold text-accent">
          {(dbUser?.username || "U")[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="text-base font-bold text-gray-100">{dbUser?.username}</p>
          <p className="text-xs text-gray-500 font-mono">{dbUser?.email}</p>
          <div className="mt-1.5">
            <KastaBadge kasta={dbUser?.kasta} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="stat-tile items-center text-center">
          <span className="box-label">Level</span>
          <span className="stat-value text-accent">{dbUser?.level}</span>
        </div>
        <div className="stat-tile items-center text-center">
          <span className="box-label">Key</span>
          <span className="stat-value">{dbUser?.keyBalance}</span>
        </div>
        <div className="stat-tile items-center text-center">
          <span className="box-label">EXP</span>
          <span className="stat-value">{dbUser?.exp}</span>
        </div>
      </div>

      {premiumActive && dbUser?.premiumUntil && (
        <div className="box p-4 mt-4 border-accent/40">
          <p className="box-label text-accent">Status Donatur Aktif</p>
          <p className="text-sm text-gray-300 mt-1">
            Berlaku sampai{" "}
            {new Date(dbUser.premiumUntil).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2 mt-5">
        <Link href="/history" className="box px-4 py-3 flex items-center justify-between text-sm text-gray-200">
          Riwayat Menonton <span>→</span>
        </Link>
        <Link href="/subscribed" className="box px-4 py-3 flex items-center justify-between text-sm text-gray-200">
          Anime Subscribed <span>→</span>
        </Link>
        <Link href="/premium" className="box px-4 py-3 flex items-center justify-between text-sm text-accent">
          Upgrade Donatur <span>→</span>
        </Link>
        {dbUser?.kasta === "admin" && (
          <Link href="/admin" className="box px-4 py-3 flex items-center justify-between text-sm text-kasta-admin border-accent/40">
            Panel Admin <span>→</span>
          </Link>
        )}
      </div>

      <div className="mt-5">
        <LogoutButton />
      </div>
    </main>
  );
}
