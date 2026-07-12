"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UserPlus, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (username.trim().length < 3) {
      setError("Username minimal 3 karakter.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username.trim() } },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="max-w-sm mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-2xl mb-4">CEK EMAIL KAMU</h1>
        <p className="text-mute font-mono text-sm mb-6">
          Link konfirmasi sudah dikirim ke <span className="text-paper">{email}</span>. Klik link itu buat aktifkan akun, lalu login.
        </p>
        <Link href="/login" className="text-ember font-mono text-sm hover:underline">
          Ke halaman login →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <p className="font-mono text-xs text-ember mb-2">GABUNG</p>
      <h1 className="font-display text-3xl mb-8">DAFTAR</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-mono text-xs text-mute block mb-1.5">Username</label>
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-panel border border-line rounded-lg px-4 py-2.5 outline-none focus:border-ember transition-colors"
          />
        </div>
        <div>
          <label className="font-mono text-xs text-mute block mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-panel border border-line rounded-lg px-4 py-2.5 outline-none focus:border-ember transition-colors"
          />
        </div>
        <div>
          <label className="font-mono text-xs text-mute block mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-panel border border-line rounded-lg px-4 py-2.5 outline-none focus:border-ember transition-colors"
          />
        </div>

        {error && <p className="text-red-400 text-sm font-mono">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-ember text-ink font-mono font-bold py-3 rounded-full hover:bg-ember2 transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
          Daftar
        </button>
      </form>

      <p className="text-center text-mute text-sm font-mono mt-6">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-ember hover:underline">
          Login di sini
        </Link>
      </p>
    </div>
  );
}
