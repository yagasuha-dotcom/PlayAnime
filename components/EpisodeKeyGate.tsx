"use client";

import { useState } from "react";
import Link from "next/link";
import { Key, Lock, Sparkles, Crown, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import AdRewardModal from "@/components/AdRewardModal";
import { isDonaturActive } from "@/lib/types";

export default function EpisodeKeyGate({
  episodeRef,
  children,
}: {
  episodeRef: string;
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { user, profile, refreshProfile, loading } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [spending, setSpending] = useState(false);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [expGained, setExpGained] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="aspect-video bg-panel border border-line rounded-xl flex items-center justify-center">
        <Loader2 className="animate-spin text-ember" size={28} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="aspect-video bg-panel border border-line rounded-xl flex flex-col items-center justify-center gap-4 text-center px-6">
        <Lock className="text-ember" size={32} />
        <p className="font-mono text-sm text-mute">Login dulu buat nonton episode ini.</p>
        <Link
          href="/login"
          className="bg-ember text-ink font-mono font-bold px-6 py-2.5 rounded-full hover:bg-ember2 transition-colors"
        >
          Login
        </Link>
      </div>
    );
  }

  if (unlocked) return <>{children}</>;

  const donaturActive = profile ? isDonaturActive(profile) : false;
  const isAdmin = profile?.role === "admin";
  const hasKey = (profile?.keys ?? 0) >= 1;

  async function handleUnlock() {
    setError("");
    setSpending(true);
    const { data, error } = await supabase.rpc("spend_key_for_episode", {
      ep_ref: episodeRef,
    });
    setSpending(false);

    if (error) {
      setError("Gagal membuka episode. Coba lagi.");
      return;
    }
    if (data === -1) {
      setError("Key kamu habis. Tonton iklan dulu buat dapet key.");
      return;
    }
    await refreshProfile();
    setUnlocked(true);
  }

  return (
    <>
      <div className="aspect-video bg-panel border border-line rounded-xl flex flex-col items-center justify-center gap-4 text-center px-6">
        {donaturActive || isAdmin ? (
          <>
            <Crown className="text-amber-300" size={32} />
            <p className="font-mono text-sm text-mute">
              {donaturActive ? "Donatur" : "Admin"} — nonton unlimited tanpa potong key.
            </p>
          </>
        ) : (
          <>
            <Key className="text-ember" size={32} />
            <p className="font-mono text-sm text-mute">
              Nonton episode ini butuh <span className="text-ember">1 key</span>. Sisa key kamu:{" "}
              <span className="text-paper">{profile?.keys ?? 0}</span>
            </p>
          </>
        )}

        {error && <p className="text-red-400 font-mono text-xs">{error}</p>}

        <div className="flex gap-3">
          {(hasKey || donaturActive || isAdmin) && (
            <button
              onClick={handleUnlock}
              disabled={spending}
              className="flex items-center gap-2 bg-ember text-ink font-mono font-bold px-6 py-2.5 rounded-full hover:bg-ember2 transition-colors disabled:opacity-60"
            >
              {spending ? <Loader2 className="animate-spin" size={16} /> : <Key size={16} />}
              {donaturActive || isAdmin ? "Tonton Sekarang" : "Pakai 1 Key"}
            </button>
          )}
          {!hasKey && !donaturActive && !isAdmin && (
            <button
              onClick={() => setAdModalOpen(true)}
              className="flex items-center gap-2 bg-panel2 border border-ember text-ember font-mono font-bold px-6 py-2.5 rounded-full hover:bg-ember hover:text-ink transition-colors"
            >
              <Sparkles size={16} /> Tonton Iklan buat Key
            </button>
          )}
        </div>

        <p className="font-mono text-[11px] text-mute">
          Nonton episode juga ngasih kamu EXP acak buat naik level.
        </p>
      </div>

      <AdRewardModal open={adModalOpen} onClose={() => setAdModalOpen(false)} />
    </>
  );
}
