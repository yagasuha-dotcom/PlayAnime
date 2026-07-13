# PlayAnime

Aplikasi nonton anime sub Indo, scraping Samehadaku multi-domain (auto-failover), dengan sistem 3 kasta (Admin / Donatur / Rakyat) dan sistem Key dari iklan.

## Fitur

- **Streaming beneran**: tiap episode diambil live dari Samehadaku (iframe player + mirror server + link download), bukan cuma poster.
- **Multi-domain auto-failover**: kalau domain Samehadaku diblokir ISP, otomatis coba domain lain (`src/lib/samehadaku.js`).
- **3 Kasta**:
  - **Admin**: akses semua episode gratis, kelola kasta & key user lain.
  - **Donatur (Premium, Rp 8.000/bulan)**: bebas iklan, semua episode terbuka tanpa Key.
  - **Rakyat**: nonton gratis pakai **Key** (1 Key = buka 1 episode). Key didapat dari nonton iklan reward (+2 Key/iklan).
- Search, jadwal tayang, riwayat nonton (dengan progress bar), subscribe anime, profil, panel admin.
- UI dark, gaya kotak/table (terinspirasi tampilan rfloys, bukan fiturnya).

## Setup dari Termux

```bash
pkg install nodejs git -y
git clone https://github.com/yagasuha-dotcom/playanime.git
cd playanime
npm install
cp .env.example .env.local
```

Isi `.env.local`:
1. Buat project baru di [supabase.com](https://supabase.com).
2. Ambil `Project URL` dan `anon public key` dari Settings > API → isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Ambil `DATABASE_URL` dari Settings > Database > Connection String (pilih mode **Transaction**, port 6543 lebih stabil buat serverless).
4. Buka Supabase SQL Editor, jalankan isi file `db/manual_migration.sql`.
5. Setelah kamu daftar akun pertama di app, jalankan di SQL Editor:
   ```sql
   update users set kasta = 'admin' where email = 'emailmu@gmail.com';
   ```

Jalankan lokal:
```bash
npm run dev
```

## Deploy ke Vercel (dari Termux)

```bash
npm i -g vercel
vercel login
vercel --prod
```
Masukkan env vars yang sama (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`) di Vercel dashboard > Settings > Environment Variables, lalu redeploy.

## Sistem Key & Iklan (PENTING sebelum rilis Play Store)

File `src/components/LockedEpisode.jsx` dan `src/app/api/key/ad-reward/route.js` sekarang pakai **simulasi** (delay 2.5 detik = anggap iklan selesai). Sebelum publish ke Play Store, kamu WAJIB:

1. Ajukan & pasang **AdMob Rewarded Ad** (atau provider lain kayak AppLovin MAX / Unity Ads).
2. Ganti simulasi di `LockedEpisode.jsx` dengan SDK rewarded-ad asli.
3. Idealnya pasang **Server-Side Verification (SSV)** dari AdMob supaya reward key tidak bisa dicurangi (bypass tanpa nonton iklan). AdMob SSV akan callback ke `api/key/ad-reward` dengan signature yang perlu diverifikasi.

Kalau app dibungkus jadi APK (TWA/Capacitor) buat submit ke Play Store, `manifest.json` sudah disiapkan di `public/manifest.json`.

## Sistem Pembayaran Premium

`src/app/api/premium/purchase/route.js` bikin order status `pending`. Kamu perlu sambungkan ke payment gateway QRIS/e-wallet (Midtrans, Xendit, atau Tripay — semua support QRIS Indonesia) lalu panggil `src/app/api/premium/webhook/route.js` dari webhook mereka setelah pembayaran sukses. Jangan lupa isi bagian verifikasi signature di file webhook itu sebelum production.

## Struktur Penting

```
src/lib/samehadaku.js       -> scraper multi-domain (home, search, detail, episode, jadwal, genre)
src/lib/access.js           -> logic kasta, premium check, key unlock
db/schema.js                -> skema Drizzle (users, keys, history, subscriptions, orders)
src/app/watch/[slug]/       -> halaman nonton (player asli / locked screen)
src/app/admin/              -> panel admin (ubah kasta & kasih key manual)
```

## Catatan Domain Samehadaku

Domain di `DOMAINS` array (`src/lib/samehadaku.js`) mungkin perlu di-update berkala kalau semua domain lama mati/diblokir total. Tinggal tambah domain baru di array itu, urutan paling atas = paling diprioritaskan.
