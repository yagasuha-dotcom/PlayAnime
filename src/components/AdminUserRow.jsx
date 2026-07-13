"use client";

import { useState } from "react";
import KastaBadge from "@/components/KastaBadge";

export default function AdminUserRow({ user }) {
  const [kasta, setKasta] = useState(user.kasta);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function changeKasta(newKasta) {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/kasta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: user.id, kasta: newKasta }),
      });
      const data = await res.json();
      if (data.success) {
        setKasta(newKasta);
        setMessage("Berhasil diubah");
      } else {
        setMessage(data.message || "Gagal");
      }
    } catch (e) {
      setMessage("Error jaringan");
    } finally {
      setLoading(false);
    }
  }

  async function grantKey(amount) {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/grant-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: user.id, amount }),
      });
      const data = await res.json();
      setMessage(data.success ? `+${amount} Key diberikan` : "Gagal");
    } catch (e) {
      setMessage("Error jaringan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="box p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-100">{user.username}</p>
          <p className="text-[11px] text-gray-500 font-mono">{user.email}</p>
        </div>
        <KastaBadge kasta={kasta} />
      </div>

      <div className="flex gap-1.5 mt-3">
        {["admin", "donatur", "rakyat"].map((k) => (
          <button
            key={k}
            onClick={() => changeKasta(k)}
            disabled={loading || kasta === k}
            className={`flex-1 text-[11px] font-mono py-1.5 rounded border ${
              kasta === k
                ? "bg-accent text-black border-accent font-semibold"
                : "border-line text-gray-400"
            } disabled:opacity-60`}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="flex gap-1.5 mt-2">
        <button
          onClick={() => grantKey(10)}
          disabled={loading}
          className="flex-1 text-[11px] font-mono py-1.5 rounded border border-line text-gray-400"
        >
          +10 Key
        </button>
        <button
          onClick={() => grantKey(50)}
          disabled={loading}
          className="flex-1 text-[11px] font-mono py-1.5 rounded border border-line text-gray-400"
        >
          +50 Key
        </button>
      </div>

      {message && <p className="text-[11px] text-accent mt-2">{message}</p>}
    </div>
  );
}
