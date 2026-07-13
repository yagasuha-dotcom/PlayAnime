"use client";

import { useEffect, useRef, useState } from "react";

export default function VideoPlayer({
  episodeSlug,
  animeSlug,
  animeTitle,
  animeImage,
  episodeTitle,
  defaultIframe,
  mirrors,
}) {
  const [activeSource, setActiveSource] = useState(defaultIframe);
  const [activeLabel, setActiveLabel] = useState("Default");
  const trackedRef = useRef(false);

  // Player anime mostly diserve lewat iframe embed pihak ketiga (mirror),
  // makanya kita render dalam <iframe> full-width. Ini emang cara umum situs
  // streaming anime bekerja karena video-nya dihost provider eksternal.
  useEffect(() => {
    if (!trackedRef.current && animeSlug) {
      trackedRef.current = true;
      fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          animeSlug,
          animeTitle,
          animeImage,
          episodeSlug,
          episodeTitle,
          progressSeconds: 0,
          durationSeconds: 0,
        }),
      }).catch(() => {});
    }
  }, [animeSlug, animeTitle, animeImage, episodeSlug, episodeTitle]);

  if (!activeSource) {
    return (
      <div className="w-full aspect-video bg-base-800 flex items-center justify-center">
        <p className="text-sm text-gray-500">Sumber video tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="w-full aspect-video bg-black">
        <iframe
          key={activeSource}
          src={activeSource}
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          className="w-full h-full"
          referrerPolicy="no-referrer"
        />
      </div>

      {mirrors && mirrors.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none px-4 py-3">
          {[{ label: "Default", iframe: defaultIframe }, ...mirrors]
            .filter((m) => m.iframe)
            .map((m) => (
              <button
                key={m.label}
                onClick={() => {
                  setActiveSource(m.iframe);
                  setActiveLabel(m.label);
                }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-box text-xs font-mono border ${
                  activeLabel === m.label
                    ? "bg-accent text-black border-accent font-semibold"
                    : "border-line text-gray-400"
                }`}
              >
                {m.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
