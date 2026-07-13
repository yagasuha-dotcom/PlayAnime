const CONFIG = {
  admin: {
    label: "Admin",
    className: "text-amber bg-amber-soft border border-amber/40",
  },
  donatur: {
    label: "Donatur",
    className: "text-violet bg-violet-soft border border-violet/40",
  },
  rakyat: {
    label: "Rakyat",
    className: "text-gray-400 bg-white/5 border border-line",
  },
};

export default function KastaBadge({ kasta }) {
  const cfg = CONFIG[kasta] || CONFIG.rakyat;
  return <span className={`kasta-tag ${cfg.className}`}>{cfg.label}</span>;
}
