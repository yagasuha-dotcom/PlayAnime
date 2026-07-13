import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import AdminUserRow from "@/components/AdminUserRow";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="p-6 text-center">
        <p className="text-gray-300">Login dulu.</p>
      </main>
    );
  }

  const [dbUser] = await db.select().from(schema.users).where(eq(schema.users.id, user.id)).limit(1);

  if (!dbUser || dbUser.kasta !== "admin") {
    return (
      <main className="p-6 flex flex-col items-center justify-center min-h-[70vh] text-center gap-3">
        <span className="text-3xl">⛔</span>
        <p className="text-gray-200 font-semibold">Akses ditolak</p>
        <p className="text-sm text-gray-500">Halaman ini khusus untuk Admin.</p>
        <Link href="/" className="btn-outline text-sm px-8 mt-2">
          Kembali
        </Link>
      </main>
    );
  }

  const users = await db.select().from(schema.users).orderBy(desc(schema.users.createdAt)).limit(100);

  return (
    <main className="p-4 pb-6">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/profile" className="text-gray-300">
          ←
        </Link>
        <h1 className="text-lg font-bold text-gray-100">Panel Admin</h1>
      </div>

      <div className="box p-4 mb-4">
        <p className="box-label">Total User</p>
        <p className="text-2xl font-bold font-mono text-accent">{users.length}</p>
      </div>

      <p className="box-label mb-2">Kelola Kasta & Key</p>
      <div className="flex flex-col gap-2">
        {users.map((u) => (
          <AdminUserRow key={u.id} user={u} />
        ))}
      </div>
    </main>
  );
}
