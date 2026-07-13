"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = supabaseBrowser();

    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    // Insert profil ke tabel users (kasta default = rakyat)
    if (data.user) {
      await fetch("/api/auth/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: data.user.id, username, email }),
      });
    }

    setLoading(false);
    setDone(true);
  }

  if (done) {
    return (
      <main className="p-6 flex flex-col items-center justify-center min-h-screen text-center gap-3">
        <span className="text-3xl">✅</span>
        <p className="text-gray-100 font-semibold">Akun berhasil dibuat!</p>
        <p className="text-sm text-gray-500">Cek email untuk verifikasi, lalu login.</p>
        <Link href="/auth/login" className="btn-primary text-sm px-8 mt-2">
          Ke Halaman Login
        </Link>
      </main>
    );
  }

  return (
    <main className="p-6 flex flex-col justify-center min-h-screen">
      <h1 className="text-2xl font-extrabold text-gray-100 mb-1">
        Daftar Play<span className="text-accent">Anime</span>
      </h1>
      <p className="text-sm text-gray-500 mb-6">Buat akun baru, gratis</p>

      <form onSubmit={handleRegister} className="flex flex-col gap-3">
        <input
          required
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="box px-4 py-3 text-sm text-gray-100 placeholder:text-gray-600 outline-none focus:border-accent"
        />
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
          minLength={6}
          placeholder="Password (min 6 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="box px-4 py-3 text-sm text-gray-100 placeholder:text-gray-600 outline-none focus:border-accent"
        />

        {error && <p className="text-xs text-ruby">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary text-sm mt-2 disabled:opacity-50">
          {loading ? "Membuat akun..." : "Daftar"}
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-5">
        Sudah punya akun?{" "}
        <Link href="/auth/login" className="text-accent font-semibold">
          Login
        </Link>
      </p>
    </main>
  );
}
