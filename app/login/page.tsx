"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message === "Invalid login credentials" ? "Email atau password salah." : error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <p className="font-mono text-xs text-ember mb-2">MASUK</p>
      <h1 className="font-display text-3xl mb-8">LOGIN</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          {loading ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />}
          Masuk
        </button>
      </form>

      <p className="text-center text-mute text-sm font-mono mt-6">
        Belum punya akun?{" "}
        <Link href="/register" className="text-ember hover:underline">
          Daftar di sini
        </Link>
      </p>
    </div>
  );
}
