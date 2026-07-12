import axios from "axios";
import * as cheerio from "cheerio";

// ============================================================
// AUTO DOMAIN FAILOVER
// Samehadaku ganti domain SANGAT sering (kena blokir Internet Positif
// tiap beberapa bulan). Alih-alih hardcode 1 domain, kita coba
// beberapa kandidat berurutan dan cache yang berhasil di memori.
//
// Kalau SEMUA kandidat di bawah mati, tambahkan domain baru ke
// array CANDIDATE_DOMAINS ini (paling gampang: search google
// "samehadaku domain terbaru" atau cek t.me/s/samehadaku_care),
// atau override total pakai env var SAMEHADAKU_BASE_URL.
// ============================================================

const CANDIDATE_DOMAINS = [
  process.env.SAMEHADAKU_BASE_URL, // override manual kalau ada, prioritas tertinggi
  "https://samehadaku.li",
  "https://v2.samehadaku.how",
  "https://samehadaku.how",
  "https://samehadaku.now",
  "https://samehadaku.day",
  "https://samehadaku.vip",
  "https://samehadaku.care", // catatan: per Jul 2026 ini cuma halaman redirect kosong
].filter(Boolean) as string[];

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

// Cache domain yang terakhir kali terbukti hidup, biar request
// berikutnya ga perlu coba satu-satu lagi. TTL 10 menit — cukup
// singkat supaya kalau domain itu mati mendadak, kita re-check.
let cachedDomain: { url: string; checkedAt: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000;

function makeClient(baseURL: string) {
  return axios.create({
    baseURL,
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    },
    timeout: 8000,
    validateStatus: (s) => s >= 200 && s < 400,
  });
}

async function resolveWorkingDomain(): Promise<string> {
  const now = Date.now();
  if (cachedDomain && now - cachedDomain.checkedAt < CACHE_TTL_MS) {
    return cachedDomain.url;
  }

  const errors: string[] = [];
  for (const domain of CANDIDATE_DOMAINS) {
    try {
      const client = makeClient(domain);
      await client.get("/", { timeout: 8000 });
      cachedDomain = { url: domain, checkedAt: now };
      return domain;
    } catch {
      errors.push(domain);
      continue;
    }
  }

  throw new Error(
    `Semua domain Samehadaku kandidat gagal diakses (${errors.join(", ")}). ` +
      `Tambahkan domain baru ke CANDIDATE_DOMAINS di lib/scraper.ts, atau set env SAMEHADAKU_BASE_URL.`
  );
}

async function getHtml(path: string) {
  const domain = await resolveWorkingDomain();
  try {
    const client = makeClient(domain);
    const { data } = await client.get(path);
    return cheerio.load(data);
  } catch (err) {
    // Domain yang tadinya hidup mendadak gagal di request spesifik ini
    // (misal rate-limit / down sementara) — invalidate cache biar next
    // request coba re-resolve dari awal.
    cachedDomain = null;
    throw err;
  }
}

// Dipakai halaman/komponen yang mau nampilin domain aktif saat ini (opsional/debug)
export async function getActiveDomain(): Promise<string> {
  return resolveWorkingDomain();
}

export interface AnimeCard {
  title: string;
  linkId: string;
  image: string;
  rating?: string;
  status?: string;
  episode?: string;
  genre?: string[];
  type?: string;
}

function extractLinkId(href: string | undefined): string {
  if (!href) return "";
  const clean = href.replace(/\/$/, "");
  const parts = clean.split("/");
  return parts[parts.length - 1];
}

// ---------- HOME ----------
export async function getHome(): Promise<{
  ongoing: AnimeCard[];
  completed: AnimeCard[];
}> {
  const $ = await getHtml("/");

  const ongoing: AnimeCard[] = [];
  const completed: AnimeCard[] = [];

  $(".post-show ul li, .widget-post ul li, .listupd .bs, .bixbox .bs")
    .each((_, el) => {
      const $el = $(el);
      const anchor = $el.find("a").first();
      const href = anchor.attr("href");
      const title =
        $el.find(".tt, h2, h3, .title").first().text().trim() ||
        anchor.attr("title")?.trim() ||
        "";
      const image =
        $el.find("img").first().attr("data-src") ||
        $el.find("img").first().attr("src") ||
        "";
      const episode = $el.find(".epx, .episode").first().text().trim();
      const status = $el.find(".sb, .status").first().text().trim();

      if (title && href) {
        const card: AnimeCard = {
          title,
          linkId: extractLinkId(href),
          image,
          episode: episode || undefined,
          status: status || undefined,
        };
        if (/complete|tamat/i.test(status)) completed.push(card);
        else ongoing.push(card);
      }
    });

  // Fallback generic selector kalau markup berubah total
  if (ongoing.length === 0 && completed.length === 0) {
    $("article, .animepost").each((_, el) => {
      const $el = $(el);
      const anchor = $el.find("a").first();
      const href = anchor.attr("href");
      const title = $el.find(".tt, h2, h3").first().text().trim();
      const image =
        $el.find("img").first().attr("data-src") ||
        $el.find("img").first().attr("src") ||
        "";
      if (title && href) {
        ongoing.push({ title, linkId: extractLinkId(href), image });
      }
    });
  }

  return { ongoing, completed };
}

// ---------- SEARCH ----------
export async function searchAnime(
  query: string,
  page = 1
): Promise<AnimeCard[]> {
  const $ = await getHtml(
    `/page/${page}/?s=${encodeURIComponent(query)}`
  );
  const results: AnimeCard[] = [];

  $(".listupd .bs, .animepost, article").each((_, el) => {
    const $el = $(el);
    const anchor = $el.find("a").first();
    const href = anchor.attr("href");
    const title =
      $el.find(".tt, h2, h3").first().text().trim() ||
      anchor.attr("title")?.trim() ||
      "";
    const image =
      $el.find("img").first().attr("data-src") ||
      $el.find("img").first().attr("src") ||
      "";
    const status = $el.find(".sb, .status").first().text().trim();
    const type = $el.find(".typez, .type").first().text().trim();

    if (title && href) {
      results.push({
        title,
        linkId: extractLinkId(href),
        image,
        status: status || undefined,
        type: type || undefined,
      });
    }
  });

  return results;
}

// ---------- ANIME DETAIL ----------
export interface AnimeDetail {
  title: string;
  image: string;
  synopsis: string;
  status: string;
  rating: string;
  genre: string[];
  episodes: { title: string; link: string }[];
  info: Record<string, string>;
}

export async function getAnimeDetail(id: string): Promise<AnimeDetail> {
  const $ = await getHtml(`/anime/${id}/`);

  const title = $(".infox h1, .entry-title, h1").first().text().trim();
  const image =
    $(".thumb img, .infoanime img").first().attr("data-src") ||
    $(".thumb img, .infoanime img").first().attr("src") ||
    "";
  const synopsis = $(".entry-content p, .desc p, .sinopc")
    .map((_, el) => $(el).text().trim())
    .get()
    .join("\n\n");
  const rating = $(".rating strong, .rtg").first().text().trim();

  const genre: string[] = [];
  $(".genre-info a, .genxx a").each((_, el) => {
    genre.push($(el).text().trim());
  });

  const info: Record<string, string> = {};
  $(".infozin .info-content .spe span, .spe span").each((_, el) => {
    const text = $(el).text().trim();
    const [key, ...rest] = text.split(":");
    if (rest.length) info[key.trim()] = rest.join(":").trim();
  });

  const status = info["Status"] || "";

  const episodes: { title: string; link: string }[] = [];
  $(".episodelist ul li, .eplister ul li, .lstepsiode li").each((_, el) => {
    const $el = $(el);
    const a = $el.find("a").first();
    const href = a.attr("href") || "";
    const epTitle =
      $el.find(".epl-title, .lchx").first().text().trim() ||
      a.text().trim();
    if (href) {
      episodes.push({ title: epTitle, link: extractLinkId(href) });
    }
  });

  return { title, image, synopsis, status, rating, genre, episodes, info };
}

// ---------- EPISODE / WATCH ----------
export interface EpisodeDetail {
  title: string;
  streamUrl: string;
  mirrors: { name: string; url: string }[];
  downloadLinks: { quality: string; links: { name: string; url: string }[] }[];
  animeId: string;
  prevEpisode?: string;
  nextEpisode?: string;
}

export async function getEpisode(link: string): Promise<EpisodeDetail> {
  const $ = await getHtml(`/${link}/`);

  const title = $(".entry-title, h1").first().text().trim();

  const streamUrl =
    $("#player iframe, .player-embed iframe, .responsive-embed-stream iframe")
      .first()
      .attr("src") || "";

  const mirrors: { name: string; url: string }[] = [];
  $(".mirrorstream option, #mirrorstream option").each((_, el) => {
    const $el = $(el);
    const name = $el.text().trim();
    const dataContent = $el.attr("value") || "";
    if (name && dataContent) mirrors.push({ name, url: dataContent });
  });

  const downloadLinks: {
    quality: string;
    links: { name: string; url: string }[];
  }[] = [];
  $(".download-eps ul, .downloadxx ul, .dlbod ul").each((_, ul) => {
    const $ul = $(ul);
    const quality =
      $ul.prev("p, strong").text().trim() || $ul.attr("data-quality") || "";
    const links: { name: string; url: string }[] = [];
    $ul.find("li a").each((_, a) => {
      const $a = $(a);
      links.push({ name: $a.text().trim(), url: $a.attr("href") || "" });
    });
    if (links.length) downloadLinks.push({ quality, links });
  });

  const animeId = extractLinkId(
    $(".broth a, .nvs a, .infox a").first().attr("href")
  );

  const prevEpisode = extractLinkId($(".prevps a, .flir a.prev").attr("href"));
  const nextEpisode = extractLinkId($(".nextps a, .flir a.next").attr("href"));

  return {
    title,
    streamUrl,
    mirrors,
    downloadLinks,
    animeId,
    prevEpisode: prevEpisode || undefined,
    nextEpisode: nextEpisode || undefined,
  };
}

// ---------- GENRE LIST ----------
export async function getGenreList(): Promise<
  { name: string; id: string }[]
> {
  const $ = await getHtml("/anime/");
  const genres: { name: string; id: string }[] = [];
  $(".genrelist a, .genxx a, a[href*='/genre/']").each((_, el) => {
    const $el = $(el);
    const href = $el.attr("href") || "";
    const name = $el.text().trim();
    if (name && href.includes("/genre/")) {
      genres.push({ name, id: extractLinkId(href) });
    }
  });
  // dedupe
  const seen = new Set<string>();
  return genres.filter((g) => {
    if (seen.has(g.id)) return false;
    seen.add(g.id);
    return true;
  });
}

// ---------- ANIME BY GENRE ----------
export async function getByGenre(
  id: string,
  page = 1
): Promise<AnimeCard[]> {
  const $ = await getHtml(`/genre/${id}/page/${page}/`);
  const results: AnimeCard[] = [];

  $(".listupd .bs, .animepost, article").each((_, el) => {
    const $el = $(el);
    const anchor = $el.find("a").first();
    const href = anchor.attr("href");
    const title =
      $el.find(".tt, h2, h3").first().text().trim() ||
      anchor.attr("title")?.trim() ||
      "";
    const image =
      $el.find("img").first().attr("data-src") ||
      $el.find("img").first().attr("src") ||
      "";
    if (title && href) {
      results.push({ title, linkId: extractLinkId(href), image });
    }
  });

  return results;
}

// ---------- JADWAL RILIS (SCHEDULE) ----------
export interface ScheduleDay {
  day: string;
  animes: AnimeCard[];
}

export async function getSchedule(): Promise<ScheduleDay[]> {
  const $ = await getHtml("/jadwal-rilis/");
  const schedule: ScheduleDay[] = [];

  $(".schedule-day, .kglist321, .jadwal-hari").each((_, dayEl) => {
    const $day = $(dayEl);
    const day =
      $day.find(".day-title, h2, h3").first().text().trim() ||
      $day.attr("data-day") ||
      "";
    const animes: AnimeCard[] = [];

    $day.find("li, .bs").each((_, el) => {
      const $el = $(el);
      const anchor = $el.find("a").first();
      const href = anchor.attr("href");
      const title =
        $el.find(".jdlx, .tt, h2, h3").first().text().trim() ||
        anchor.text().trim();
      const image =
        $el.find("img").first().attr("data-src") ||
        $el.find("img").first().attr("src") ||
        "";
      if (title && href) {
        animes.push({ title, linkId: extractLinkId(href), image });
      }
    });

    if (day && animes.length) schedule.push({ day, animes });
  });

  return schedule;
}
