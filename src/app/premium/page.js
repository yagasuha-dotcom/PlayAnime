"use client";

import { useState } from "react";
import Link from "next/link";

const PACKAGES = [
  { months: 1, label: "1 Bulan", days: 30, priceIdr: 8000 },
  { months: 3, label: "3 Bulan", days: 90, priceIdr: 21000, savePercent: 12 },
  { months: 6, label: "6 Bulan", days: 180, priceIdr: 38000, savePercent: 21, best: true },
  { months: 12, label: "12 Bulan", days: 360, priceIdr: 69000, savePercent: 28 },
];

const FEATURES = [
  "Badge Donatur",
  "Bebas Iklan",
  "Semua Episode Terbuka",
  "Tanpa Perlu Key",
  "Kualitas 1080p",
  "Prioritas Server Tercepat",
];

function formatIdr(n) {
  return "Rp " + n.toLocaleString("id-ID");
}

export default function PremiumPage() {
  const [selected, setSelected] = useState(6);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleBuy() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/premium/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ months: selected }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Order dibuat! Lanjutkan pembayaran QRIS/E-Wallet.");
      } else {
        setMessage(data.error || "Gagal membuat order.");
      }
    } catch (e) {
      setMessage("Kamu perlu login dulu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="pb-6">
      <div className="p-4 flex items-center gap-3 border-b border-line">
        <Link href="/" className="text-gray-300">
          ←
        </Link>
        <div>
          <h1 className="text-lg font-bold text-gray-100">PlayAnime Donatur</h1>
          <p className="text-xs text-gray-500">Bayar sekali, bukan langganan otomatis</p>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {PACKAGES.map((pkg) => (
          <button
            key={pkg.months}
            onClick={() => setSelected(pkg.months)}
            className={`box p-4 text-left relative ${
              selected === pkg.months ? "border-accent" : ""
            }`}
          >
            {pkg.best && (
              <span className="absolute -top-2 right-4 bg-accent text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                Best
              </span>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-100">{pkg.label}</p>
                <p className="text-xs text-gray-500 font-mono">{pkg.days} hari donatur</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold font-mono text-accent">
                  {formatIdr(pkg.priceIdr)}
                </p>
                {pkg.savePercent && (
                  <p className="text-[11px] text-mint font-mono">Hemat {pkg.savePercent}%</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="px-4">
        <p className="box-label mb-2">Fitur Donatur</p>
        <div className="grid grid-cols-2 gap-2">
          {FEATURES.map((f) => (
            <div key={f} className="box px-3 py-2.5 text-xs text-gray-300">
              ✓ {f}
            </div>
          ))}
        </div>
      </div>

      {message && (
        <div className="mx-4 mt-4 box p-3 border-accent/40">
          <p className="text-sm text-accent">{message}</p>
        </div>
      )}

      <div className="px-4 mt-5">
        <button onClick={handleBuy} disabled={loading} className="btn-primary w-full text-sm disabled:opacity-50">
          {loading ? "Memproses..." : `Beli ${PACKAGES.find((p) => p.months === selected)?.label}`}
        </button>
        <p className="text-[11px] text-gray-600 text-center mt-3 font-mono">
          1x pembayaran, bukan perpanjangan otomatis. No refund.
        </p>
      </div>
    </main>
  );
}
