const CONFIG = {
  admin: { label: "Admin", color: "text-kasta-admin bg-accent/10 border border-accent/40" },
  donatur: { label: "Donatur", color: "text-kasta-donatur bg-kasta-donatur/10 border border-kasta-donatur/40" },
  rakyat: { label: "Rakyat", color: "text-kasta-rakyat bg-white/5 border border-line" },
};

export default function KastaBadge({ kasta }) {
  const cfg = CONFIG[kasta] || CONFIG.rakyat;
  return <span className={`kasta-badge ${cfg.color}`}>{cfg.label}</span>;
}
