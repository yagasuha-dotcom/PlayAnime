"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = supabaseBrowser();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="p-6 flex flex-col justify-center min-h-screen">
      <h1 className="text-2xl font-extrabold text-gray-100 mb-1">
        Play<span className="text-accent">Anime</span>
      </h1>
      <p className="text-sm text-gray-500 mb-6">Login untuk lanjut nonton</p>

      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="box px-4 py-3 text-sm text-gray-100 placeholder:text-gray-600 outline-none focus:border-accent"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="box px-4 py-3 text-sm text-gray-100 placeholder:text-gray-600 outline-none focus:border-accent"
        />

        {error && <p className="text-xs text-ruby">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary text-sm mt-2 disabled:opacity-50">
          {loading ? "Masuk..." : "Login"}
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-5">
        Belum punya akun?{" "}
        <Link href="/auth/register" className="text-accent font-semibold">
          Daftar
        </Link>
      </p>
    </main>
  );
}
