"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function IconHome({ active }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={active ? "url(#navGrad)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}
function IconCalendar({ active }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={active ? "url(#navGrad)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}
function IconClock({ active }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={active ? "url(#navGrad)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}
function IconTv({ active }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={active ? "url(#navGrad)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M8 3l4 3 4-3" />
    </svg>
  );
}
function IconUser({ active }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={active ? "url(#navGrad)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

const items = [
  { href: "/", label: "Home", Icon: IconHome },
  { href: "/jadwal", label: "Jadwal", Icon: IconCalendar },
  { href: "/history", label: "History", Icon: IconClock },
  { href: "/subscribed", label: "Subscribed", Icon: IconTv },
  { href: "/profile", label: "Profil", Icon: IconUser },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-ink-900/90 backdrop-blur-lg border-t border-line z-50">
      <svg width="0" height="0">
        <linearGradient id="navGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </svg>
      <div className="grid grid-cols-5">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium ${
                active ? "text-transparent bg-clip-text bg-brand-gradient" : "text-gray-500"
              }`}
            >
              <Icon active={active} />
              <span className={active ? "text-violet" : ""}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
