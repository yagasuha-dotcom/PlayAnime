"use client";

import EpisodeKeyGate from "@/components/EpisodeKeyGate";

export default function WatchPlayer({
  episodeRef,
  streamUrl,
  title,
}: {
  episodeRef: string;
  streamUrl: string;
  title: string;
}) {
  return (
    <EpisodeKeyGate episodeRef={episodeRef}>
      <div className="aspect-video bg-panel border border-line rounded-xl overflow-hidden mb-4">
        {streamUrl ? (
          <iframe src={streamUrl} className="w-full h-full" allowFullScreen title={title} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-mute font-mono text-sm text-center px-6">
            Player tidak ditemukan. Coba pilih mirror di bawah, atau struktur halaman sumber mungkin berubah.
          </div>
        )}
      </div>
    </EpisodeKeyGate>
  );
}
