export default function Logo({ size = "text-xl" }) {
  return (
    <div className="flex items-center gap-2">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a855f7" />
            <stop offset="1" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <rect width="28" height="28" rx="8" fill="url(#logoGrad)" />
        <path d="M11 8.5L19.5 14L11 19.5V8.5Z" fill="white" />
      </svg>
      <span className={`brand-wordmark ${size}`}>PlayAnime</span>
    </div>
  );
}
