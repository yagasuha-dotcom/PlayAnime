import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata = {
  title: "PlayAnime",
  description: "Nonton anime terbaru, sub Indo, gratis & premium.",
  manifest: "/manifest.json",
  themeColor: "#08090c",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#08090c",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-base-950 pb-20">
        <div className="max-w-md mx-auto min-h-screen bg-base-950 relative">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
