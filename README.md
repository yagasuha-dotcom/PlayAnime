# PlayAnime

Web index & streaming anime sub Indo, scraping langsung dari Samehadaku (tanpa depend ke API pihak ketiga yang bisa mati sewaktu-waktu).

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Cheerio (scraper langsung ke HTML Samehadaku, jalan di API routes Next.js sendiri)

## PENTING: soal domain sumber — AUTO FAILOVER

Situs Samehadaku **sering ganti domain** (histori: `.com → .tv → .moe → .vip → .care → .cam → .now → .how → .li`) karena diblokir Internet Positif. Untuk ngatasin ini, `lib/scraper.ts` **otomatis coba beberapa domain kandidat berurutan** tiap kali ada request, dan cache domain yang hidup selama 10 menit. Jadi kalau satu domain mati, sistem otomatis pindah ke domain berikutnya di list — ga perlu redeploy manual tiap kali domain ganti.

**Cek domain mana yang lagi aktif dipakai:**
```
https://domain-lo.vercel.app/api/status
```

**Kalau SEMUA domain di list mati** (situs pindah ke domain yang benar-benar baru dan belum terdaftar):

1. Buka `lib/scraper.ts`, cari array `CANDIDATE_DOMAINS`
2. Cari domain terbaru: search google "samehadaku domain terbaru", atau cek `t.me/s/samehadaku_care` (channel Telegram resmi mereka suka post domain baru)
3. Tambahkan ke array itu (paling atas biar dicoba duluan), commit & push — Vercel auto-redeploy

Kalau mau override total tanpa edit kode, set env var `SAMEHADAKU_BASE_URL` di Vercel — ini akan dicoba **pertama** sebelum kandidat lain di list.

Selector CSS di `lib/scraper.ts` sudah dibuat dengan beberapa fallback class name yang umum dipakai tema WordPress anime, tapi kalau situs sumber redesign total (bukan cuma ganti domain, tapi ganti tampilan), scraper perlu disesuaikan ulang selector-nya juga.

## Setup di Termux

```bash
pkg install nodejs git -y
git clone <repo-lo>
cd playanime
npm install
cp .env.example .env.local
npm run dev
```

Buka `http://localhost:3000`

## Deploy ke Vercel (workflow lo yang biasa)

```bash
git add .
git commit -m "init playanime"
git push origin main
```

Lalu di Vercel dashboard:
1. Import repo dari GitHub
2. Tambahkan Environment Variable: `SAMEHADAKU_BASE_URL` = domain aktif
3. Deploy

Setelah itu tiap `git push`, Vercel auto-deploy seperti biasa.

## Struktur folder

```
app/
  api/           <- API routes (proxy scraper, dipanggil dari client)
    home/
    search/
    anime/[id]/
    episode/[link]/
    genre/
    genre/[id]/
    schedule/
  anime/[id]/    <- halaman detail anime
  watch/[link]/  <- halaman nonton episode
  search/        <- halaman hasil pencarian
  genre/         <- halaman list genre & per-genre
  jadwal/        <- halaman jadwal rilis mingguan
lib/
  scraper.ts     <- semua logic scraping ada di sini
components/
  Nav.tsx
  AnimeCard.tsx
```

## Fitur Sistem Key, Role, Level & Chat

PlayAnime pakai **Supabase** buat auth, database, dan realtime chat.

### Cara setup Supabase (sekali aja)

1. Daftar/login di [supabase.com](https://supabase.com), buat project baru (pilih region Singapore biar cepat dari Indonesia)
2. Buka **SQL Editor** di dashboard, copy-paste seluruh isi file `supabase/schema.sql`, klik **Run**
3. Buka **Project Settings → API**, copy `Project URL` dan `anon public key`
4. Isi ke `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
   ```
5. Buka **Authentication → Providers**, pastikan Email provider aktif. Kalau mau skip email confirmation waktu development, matikan "Confirm email" di **Authentication → Settings**

### Cara jadi admin pertama kali

1. Register akun biasa dulu lewat `/register`
2. Di Supabase SQL Editor, jalankan:
   ```sql
   update profiles set role = 'admin' where username = 'username_kamu';
   ```
3. Login ulang → akan muncul akses ke `/admin`

Dari situ, admin bisa naikkan user lain jadi admin/donatur/kasih key lewat panel `/admin`.

### Sistem Key (nonton episode)

- User baru dapet **3 key gratis** pas register
- Nonton 1 episode = potong **1 key**
- Dapet key baru dengan nonton iklan (tombol "Tonton Iklan buat Key" — 15 detik lalu klaim)
- **Donatur** dan **Admin** nonton **unlimited** tanpa potong key
- Semua transaksi key dicatat di tabel `key_transactions` (anti-curang — potongan key dan reward diproses di server via RPC, bukan diatur dari client)

### Sistem Role

| Role | Deskripsi |
|---|---|
| **Rakyat Konoha** | Role default semua user baru. Perlu key buat nonton. |
| **Donatur** | Upgrade premium (30 hari default, admin bisa set manual). Nonton unlimited. |
| **Admin** | Akses `/admin` buat kelola role & key user lain. Nonton unlimited. |

### Sistem Level & EXP

- Tiap nonton 1 episode → dapet EXP acak (10-29 EXP)
- Level naik otomatis pakai rumus `level = floor(sqrt(exp/50)) + 1`
- Progress bar EXP muncul di halaman `/profile`

### Chat Public

- Real-time pakai Supabase Realtime (`/chat`)
- Semua user login bisa kirim pesan (max 500 karakter)
- User bisa hapus pesan sendiri, admin bisa hapus pesan siapa aja
- Badge role muncul di samping tiap pesan

### Ad-Reward (Adsterra)

Default-nya jalan **mode simulasi** (timer 15 detik doang, ga ada iklan asli) — biar bisa langsung dites tanpa setup apa-apa dulu.

Buat pasang iklan asli:
1. Daftar di [adsterra.com](https://adsterra.com) sebagai publisher
2. Ambil kode "Social Bar" atau ad unit reward mereka, catat publisher key-nya
3. Isi `NEXT_PUBLIC_ADSTERRA_KEY` di `.env.local`
4. Edit `components/AdRewardModal.tsx` bagian `useEffect` yang load script — sesuaikan `src` sama snippet asli dari dashboard Adsterra (tiap ad unit formatnya agak beda, copy persis dari dashboard mereka)

Ini bagian yang paling perlu disesuaikan manual karena tiap ad network kasih snippet embed yang berbeda-beda dan mereka suka update format-nya.

## Catatan legal
Ini scraper tidak resmi. Semua konten anime milik pemegang hak masing-masing dan disediakan oleh situs sumber (Samehadaku), bukan di-hosting oleh project ini. Pakai untuk keperluan pribadi/edukasi.

## Kalau mau ubah tema warna
Edit `tailwind.config.ts` bagian `colors` — palet sekarang: hitam (`ink`), merah ember (`ember`/`ember2`), krem (`paper`).
