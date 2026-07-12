"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { ROLE_LABEL, ROLE_COLOR, type Profile, type UserRole } from "@/lib/types";
import { Shield, Search, Loader2, Key, Crown } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user, profile, loading } = useAuth();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && (!user || profile?.role !== "admin")) {
      router.push("/");
    }
  }, [loading, user, profile, router]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", `%${q.trim()}%`)
      .limit(10);
    setResults((data as Profile[]) || []);
    setSearching(false);
  }

  async function setRole(targetId: string, role: UserRole) {
    setBusyId(targetId);
    setMessage("");
    const days = role === "donatur" ? 30 : null;
    const { error } = await supabase.rpc("admin_set_role", {
      target_user: targetId,
      new_role: role,
      donatur_days: days,
    });
    setBusyId(null);
    if (error) {
      setMessage("Gagal: " + error.message);
      return;
    }
    setMessage(`Role berhasil diubah jadi ${ROLE_LABEL[role]}.`);
    handleSearch({ preventDefault: () => {} } as React.FormEvent);
  }

  async function grantKeys(targetId: string, amount: number) {
    setBusyId(targetId);
    setMessage("");
    const { error } = await supabase.rpc("admin_grant_keys", { target_user: targetId, amount });
    setBusyId(null);
    if (error) {
      setMessage("Gagal: " + error.message);
      return;
    }
    setMessage(`+${amount} key berhasil diberikan.`);
    handleSearch({ preventDefault: () => {} } as React.FormEvent);
  }

  if (loading || profile?.role !== "admin") {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-ember" size={28} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-10 py-12">
      <div className="flex items-center gap-2 mb-8">
        <Shield className="text-ember" size={22} />
        <h1 className="font-display text-2xl">ADMIN PANEL</h1>
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-6">
        <div className="flex-1 flex items-center bg-panel border border-line rounded-full px-4 py-2.5 focus-within:border-ember transition-colors">
          <Search size={16} className="text-mute mr-2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari username..."
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
        <button
          type="submit"
          className="bg-ember text-ink font-mono font-bold text-sm px-5 py-2.5 rounded-full hover:bg-ember2 transition-colors"
        >
          Cari
        </button>
      </form>

      {message && <p className="font-mono text-xs text-ember mb-4">{message}</p>}

      {searching && (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-ember" size={20} />
        </div>
      )}

      <div className="space-y-3">
        {results.map((r) => (
          <div key={r.id} className="bg-panel border border-line rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-mono text-sm font-bold">{r.username}</p>
                <span className={`inline-flex items-center gap-1 border rounded-full px-2 py-0.5 text-[10px] font-mono mt-1 ${ROLE_COLOR[r.role]}`}>
                  {r.role === "donatur" && <Crown size={10} />}
                  {ROLE_LABEL[r.role]}
                </span>
              </div>
              <span className="flex items-center gap-1 font-mono text-xs text-ember">
                <Key size={12} /> {r.keys}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                disabled={busyId === r.id}
                onClick={() => setRole(r.id, "rakyat_konoha")}
                className="text-xs font-mono bg-panel2 border border-line px-3 py-1.5 rounded-md hover:border-ember transition-colors disabled:opacity-50"
              >
                Jadikan Rakyat Konoha
              </button>
              <button
                disabled={busyId === r.id}
                onClick={() => setRole(r.id, "donatur")}
                className="text-xs font-mono bg-panel2 border border-amber-300/40 text-amber-300 px-3 py-1.5 rounded-md hover:bg-amber-300/10 transition-colors disabled:opacity-50"
              >
                Jadikan Donatur (30 hari)
              </button>
              <button
                disabled={busyId === r.id}
                onClick={() => setRole(r.id, "admin")}
                className="text-xs font-mono bg-panel2 border border-red-400/40 text-red-400 px-3 py-1.5 rounded-md hover:bg-red-400/10 transition-colors disabled:opacity-50"
              >
                Jadikan Admin
              </button>
              <button
                disabled={busyId === r.id}
                onClick={() => grantKeys(r.id, 5)}
                className="text-xs font-mono bg-panel2 border border-ember/40 text-ember px-3 py-1.5 rounded-md hover:bg-ember/10 transition-colors disabled:opacity-50"
              >
                +5 Key
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
