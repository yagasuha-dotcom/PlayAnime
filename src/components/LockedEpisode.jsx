"use client";

import { useState } from "react";
import Link from "next/link";

export default function LockedEpisode({ episodeSlug, keyBalance = 0 }) {
  const [balance, setBalance] = useState(keyBalance);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [watchingAd, setWatchingAd] = useState(false);

  async function handleWatchAd() {
    setWatchingAd(true);
    setMessage(null);

    // TODO produksi: ganti simulasi ini dengan SDK rewarded-ad beneran
    // (AdMob Rewarded / AppLovin MAX dsb), lalu panggil endpoint di bawah
    // dari callback "onUserEarnedReward" milik SDK tersebut.
    await new Promise((resolve) => setTimeout(resolve, 2500));

    try {
      const res = await fetch("/api/key/ad-reward", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setBalance(data.keyBalance);
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage("Gagal mendapatkan Key. Coba lagi.");
      }
    } catch (e) {
      setMessage("Terjadi kesalahan jaringan.");
    } finally {
      setWatchingAd(false);
    }
  }

  async function handleUnlock() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/key/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodeSlug }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      } else {
        setMessage(data.message || "Key tidak cukup.");
        if (data.keyBalance !== undefined) setBalance(data.keyBalance);
      }
    } catch (e) {
      setMessage("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full aspect-video bg-base-800 flex flex-col items-center justify-center gap-3 p-6 text-center">
      <span className="text-3xl">🔒</span>
      <p className="text-sm font-semibold text-gray-200">Episode Terkunci</p>
      <p className="text-xs text-gray-500">
        Rakyat perlu 1 Key untuk buka episode ini, atau upgrade ke Donatur untuk akses
        tanpa batas.
      </p>

      <div className="box px-4 py-2 mt-1">
        <span className="text-xs font-mono text-gray-400">Key kamu: </span>
        <span className="text-sm font-bold text-accent font-mono">{balance}</span>
      </div>

      {message && <p className="text-xs text-accent">{message}</p>}

      <div className="flex flex-col gap-2 w-full mt-2">
        <button
          onClick={handleUnlock}
          disabled={loading || balance < 1}
          className="btn-primary text-sm disabled:opacity-40"
        >
          {loading ? "Memproses..." : "Gunakan 1 Key untuk Buka"}
        </button>
        <button
          onClick={handleWatchAd}
          disabled={watchingAd}
          className="btn-outline text-sm disabled:opacity-40"
        >
          {watchingAd ? "Memutar Iklan..." : "🎬 Tonton Iklan (+2 Key)"}
        </button>
        <Link href="/premium" className="btn-outline text-sm border-accent/40 text-accent">
          👑 Upgrade ke Donatur
        </Link>
      </div>
    </div>
  );
}
