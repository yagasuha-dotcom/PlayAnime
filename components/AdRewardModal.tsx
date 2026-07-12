"use client";

import { useState, useEffect, useRef } from "react";
import { X, Key, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

const AD_DURATION_SECONDS = 15;

// Slot Adsterra kamu. Daftar dulu di adsterra.com, ambil "Social Bar" atau
// "Rewarded" script tag mereka, taruh publisher key di env NEXT_PUBLIC_ADSTERRA_KEY.
// Selama key belum diisi, komponen ini jalan mode simulasi (timer doang).
const ADSTERRA_KEY = process.env.NEXT_PUBLIC_ADSTERRA_KEY;

export default function AdRewardModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const supabase = createClient();
  const { refreshProfile } = useAuth();
  const [phase, setPhase] = useState<"watching" | "claiming" | "done">("watching");
  const [secondsLeft, setSecondsLeft] = useState(AD_DURATION_SECONDS);
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setPhase("watching");
    setSecondsLeft(AD_DURATION_SECONDS);
  }, [open]);

  // Load skrip iklan Adsterra kalau key sudah diisi
  useEffect(() => {
    if (!open || !ADSTERRA_KEY || !adContainerRef.current) return;
    const script = document.createElement("script");
    script.src = `//pl-adsterra-placeholder.com/${ADSTERRA_KEY}/invoke.js`;
    script.async = true;
    adContainerRef.current.appendChild(script);
    return () => {
      if (adContainerRef.current) adContainerRef.current.innerHTML = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open || phase !== "watching") return;
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [open, phase, secondsLeft]);

  async function handleClaim() {
    setPhase("claiming");
    const { error } = await supabase.rpc("claim_ad_key", { reward_amount: 1 });
    if (!error) {
      await refreshProfile();
      setPhase("done");
    } else {
      setPhase("watching");
      setSecondsLeft(3);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-ink/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-panel border border-line rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-mute hover:text-paper"
          aria-label="Tutup"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Key size={20} className="text-ember" />
          <h2 className="font-display text-xl">DAPETIN KEY</h2>
        </div>

        {phase === "watching" && (
          <>
            <p className="text-mute font-mono text-sm mb-4">
              Tonton iklan sampai selesai buat dapet 1 key nonton gratis.
            </p>

            <div
              ref={adContainerRef}
              className="aspect-video bg-panel2 border border-line rounded-lg mb-4 flex items-center justify-center overflow-hidden"
            >
              {!ADSTERRA_KEY && (
                <div className="text-center px-6">
                  <p className="text-mute font-mono text-xs mb-2">MODE SIMULASI</p>
                  <p className="text-mute font-mono text-xs">
                    Iklan asli akan tampil di sini setelah publisher key Adsterra diisi di{" "}
                    <code className="text-ember">.env.local</code>
                  </p>
                </div>
              )}
            </div>

            <div className="w-full bg-panel2 rounded-full h-2 mb-4 overflow-hidden">
              <div
                className="bg-ember h-full transition-all duration-1000 ease-linear"
                style={{
                  width: `${((AD_DURATION_SECONDS - secondsLeft) / AD_DURATION_SECONDS) * 100}%`,
                }}
              />
            </div>

            {secondsLeft > 0 ? (
              <p className="text-center font-mono text-sm text-mute">
                Tunggu <span className="text-ember">{secondsLeft}</span> detik lagi...
              </p>
            ) : (
              <button
                onClick={handleClaim}
                className="w-full bg-ember text-ink font-mono font-bold py-3 rounded-full hover:bg-ember2 transition-colors"
              >
                Klaim 1 Key
              </button>
            )}
          </>
        )}

        {phase === "claiming" && (
          <div className="flex flex-col items-center py-10 gap-3">
            <Loader2 className="animate-spin text-ember" size={32} />
            <p className="text-mute font-mono text-sm">Memproses...</p>
          </div>
        )}

        {phase === "done" && (
          <div className="flex flex-col items-center py-10 gap-3">
            <CheckCircle2 className="text-ember" size={40} />
            <p className="font-mono text-sm">+1 Key berhasil ditambahkan!</p>
            <button
              onClick={onClose}
              className="mt-2 bg-panel2 border border-line px-6 py-2 rounded-full font-mono text-sm hover:border-ember transition-colors"
            >
              Tutup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
