"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { ROLE_LABEL, ROLE_COLOR, isDonaturActive, expForLevel } from "@/lib/types";
import { Key, Sparkles, LogOut, Crown, Loader2 } from "lucide-react";
import AdRewardModal from "@/components/AdRewardModal";

interface KeyTx {
  id: string;
  amount: number;
  reason: string;
  episode_ref: string | null;
  created_at: string;
}

const REASON_LABEL: Record<string, string> = {
  ad_reward: "Nonton iklan",
  watch_episode: "Nonton episode",
  admin_grant: "Diberikan admin",
  donatur_bonus: "Bonus donatur",
};

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const { user, profile, loading, signOut } = useAuth();
  const [txs, setTxs] = useState<KeyTx[]>([]);
  const [adModalOpen, setAdModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("key_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setTxs(data as KeyTx[]);
      });
  }, [user, supabase]);

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-ember" size={28} />
      </div>
    );
  }

  const donaturActive = isDonaturActive(profile);
  const currentLevelExp = expForLevel(profile.level);
  const nextLevelExp = expForLevel(profile.level + 1);
  const progressPct = Math.min(
    100,
    ((profile.exp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100
  );

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-10 py-12">
      <div className="bg-panel border border-line rounded-2xl p-6 md:p-8 mb-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-3xl mb-2">{profile.username}</h1>
            <span
              className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1 text-xs font-mono ${ROLE_COLOR[profile.role]}`}
            >
              {profile.role === "donatur" && <Crown size={12} />}
              {ROLE_LABEL[profile.role]}
              {profile.role === "donatur" && !donaturActive && " (kadaluarsa)"}
            </span>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-mute hover:text-red-400 font-mono text-xs transition-colors"
          >
            <LogOut size={14} /> Keluar
          </button>
        </div>

        {/* LEVEL / EXP */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2 font-mono text-sm">
            <span>Level {profile.level}</span>
            <span className="text-mute">{profile.exp} EXP</span>
          </div>
          <div className="w-full bg-panel2 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-ember to-ember2 h-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-mute font-mono text-[11px] mt-1.5">
            {nextLevelExp - profile.exp} EXP lagi ke Level {profile.level + 1}
          </p>
        </div>

        {/* KEY BALANCE */}
        <div className="flex items-center justify-between bg-panel2 border border-line rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Key className="text-ember" size={24} />
            <div>
              <p className="font-display text-xl">{profile.keys}</p>
              <p className="font-mono text-xs text-mute">Key nonton tersisa</p>
            </div>
          </div>
          <button
            onClick={() => setAdModalOpen(true)}
            className="flex items-center gap-1.5 bg-ember text-ink font-mono font-bold text-xs px-4 py-2 rounded-full hover:bg-ember2 transition-colors"
          >
            <Sparkles size={14} /> Dapetin Key
          </button>
        </div>

        {donaturActive && (
          <p className="font-mono text-xs text-amber-300 mt-3">
            ✦ Status donatur aktif sampai {new Date(profile.donatur_until!).toLocaleDateString("id-ID")} — nonton unlimited tanpa potong key.
          </p>
        )}
      </div>

      {/* RIWAYAT */}
      <div>
        <h2 className="font-display text-lg mb-4">RIWAYAT KEY</h2>
        {txs.length === 0 ? (
          <p className="text-mute font-mono text-sm">Belum ada riwayat.</p>
        ) : (
          <div className="space-y-2">
            {txs.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between bg-panel border border-line rounded-lg px-4 py-3 font-mono text-sm"
              >
                <div>
                  <p>{REASON_LABEL[tx.reason] || tx.reason}</p>
                  <p className="text-mute text-xs">
                    {new Date(tx.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
                <span className={tx.amount > 0 ? "text-ember" : "text-mute"}>
                  {tx.amount > 0 ? "+" : ""}
                  {tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <AdRewardModal open={adModalOpen} onClose={() => setAdModalOpen(false)} />
    </div>
  );
}
