"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Menu, X, Key, MessageCircle, User, Crown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { isDonaturActive } from "@/lib/types";

export default function Nav() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setOpen(false);
  }

  const links = [
    { href: "/", label: "Beranda" },
    { href: "/jadwal", label: "Jadwal Rilis" },
    { href: "/genre", label: "Genre" },
    { href: "/chat", label: "Chat", icon: MessageCircle },
  ];

  const donaturActive = profile ? isDonaturActive(profile) : false;

  return (
    <header className="sticky top-0 z-50 bg-ink/90 backdrop-blur border-b border-line">
      <div className="max-w-7xl mx-auto px-4 md:px-10 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="font-display text-lg tracking-tight shrink-0">
          Play<span className="text-ember">Anime</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 font-mono text-sm text-mute">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-paper transition-colors focus-ring rounded flex items-center gap-1">
              {l.icon && <l.icon size={14} />}
              {l.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="hidden md:flex items-center bg-panel border border-line rounded-full px-4 py-2 w-56 focus-within:border-ember transition-colors">
          <Search size={16} className="text-mute mr-2 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari judul anime..."
            className="bg-transparent outline-none text-sm w-full placeholder:text-mute"
          />
        </form>

        {user && profile ? (
          <Link
            href="/profile"
            className="hidden md:flex items-center gap-3 bg-panel border border-line rounded-full pl-3 pr-4 py-1.5 hover:border-ember transition-colors shrink-0"
          >
            <span className="flex items-center gap-1 font-mono text-xs text-ember">
              <Key size={13} /> {profile.keys}
            </span>
            <span className="w-px h-4 bg-line" />
            <span className="flex items-center gap-1.5 text-sm">
              {donaturActive ? <Crown size={14} className="text-amber-300" /> : <User size={14} />}
              {profile.username}
            </span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="hidden md:block bg-ember text-ink font-mono font-bold text-sm px-5 py-2 rounded-full hover:bg-ember2 transition-colors shrink-0"
          >
            Login
          </Link>
        )}

        <button
          className="md:hidden text-paper"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-line px-4 py-4 flex flex-col gap-4 bg-ink">
          <form onSubmit={handleSearch} className="flex items-center bg-panel border border-line rounded-full px-4 py-2">
            <Search size={16} className="text-mute mr-2 shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari judul anime..."
              className="bg-transparent outline-none text-sm w-full placeholder:text-mute"
            />
          </form>

          {user && profile ? (
            <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 bg-panel border border-line rounded-full px-4 py-2.5">
              <span className="flex items-center gap-1 font-mono text-xs text-ember">
                <Key size={13} /> {profile.keys}
              </span>
              <span className="w-px h-4 bg-line" />
              <span className="flex items-center gap-1.5 text-sm">
                {donaturActive ? <Crown size={14} className="text-amber-300" /> : <User size={14} />}
                {profile.username}
              </span>
            </Link>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)} className="bg-ember text-ink font-mono font-bold text-sm px-5 py-2.5 rounded-full text-center">
              Login
            </Link>
          )}

          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="font-mono text-sm text-mute hover:text-paper flex items-center gap-2">
              {l.icon && <l.icon size={14} />}
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
