import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "PlayAnime — Index Anime Sub Indo",
  description: "Katalog & streaming anime subtitle Indonesia. Update tiap hari.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="font-body bg-ink text-paper min-h-screen bg-grain">
        <AuthProvider>
          <Nav />
          <main>{children}</main>
          <footer className="border-t border-line mt-24 py-10 px-4 md:px-10 text-mute text-sm font-mono">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-4">
              <p>PlayAnime © {new Date().getFullYear()} — index tidak resmi, semua konten milik sumber asal.</p>
              <p>dibuat untuk keperluan pribadi/edukasi.</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
