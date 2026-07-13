import axios from "axios";
import * as cheerio from "cheerio";

// Domain-domain Samehadaku yang pernah/masih aktif.
// ISP di Indonesia rajin blokir, jadi domainnya gonta-ganti terus.
// Urutan = prioritas coba duluan. Kalau satu mati/diblokir, otomatis lanjut ke berikutnya.
const DOMAINS = [
  "https://samehadaku.li",
  "https://samehadaku.care",
  "https://samehadaku.email",
  "https://samehadaku.vip",
  "https://samehadaku.day",
  "https://samehadaku.now",
  "https://samehadaku.aei",
];

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

// Cache domain yang lagi kepake biar ga selalu coba dari awal tiap request
let activeDomain = null;
let lastCheck = 0;
const CHECK_INTERVAL = 5 * 60 * 1000; // re-check tiap 5 menit

async function fetchHtml(path, { retryDomains = DOMAINS } = {}) {
  const now = Date.now();
  const domainsToTry =
    activeDomain && now - lastCheck < CHECK_INTERVAL
      ? [activeDomain, ...retryDomains.filter((d) => d !== activeDomain)]
      : retryDomains;

  let lastError = null;

  for (const domain of domainsToTry) {
    try {
      const url = `${domain}${path}`;
      const res = await axios.get(url, {
        headers: HEADERS,
        timeout: 10000,
      });
      if (res.status === 200 && res.data) {
        activeDomain = domain;
        lastCheck = Date.now();
        return { html: res.data, domain };
      }
    } catch (err) {
      lastError = err;
      continue; // coba domain berikutnya
    }
  }

  throw new Error(
    `Semua domain Samehadaku gagal diakses. Error terakhir: ${lastError?.message}`
  );
}

function cleanText(t) {
  return (t || "").replace(/\s+/g, " ").trim();
}

function extractSlug(url) {
  if (!url) return "";
  const parts = url.replace(/\/$/, "").split("/");
  return parts[parts.length - 1];
}

// ---------- HOME ----------
export async function getHome() {
  const { html } = await fetchHtml("/");
  const $ = cheerio.load(html);

  const newEps = [];
  $(".post-show ul li, .listupd .bs, .widget_senction .post-show li").each((i, el) => {
    const $el = $(el);
    const title = cleanText($el.find(".ttl, h2, .tt").first().text());
    const link = $el.find("a").first().attr("href");
    const image = $el.find("img").first().attr("src") || $el.find("img").first().attr("data-src");
    const episode = cleanText($el.find(".epx, .ep").first().text());
    if (title && link) {
      newEps.push({
        title,
        slug: extractSlug(link),
        link,
        image,
        episode,
      });
    }
  });

  // Fallback selector generik kalau tema berubah
  if (newEps.length === 0) {
    $("article, .bsx").each((i, el) => {
      const $el = $(el);
      const title = cleanText($el.find("h2, .ttl, .title").first().text());
      const link = $el.find("a").first().attr("href");
      const image = $el.find("img").first().attr("src") || $el.find("img").first().attr("data-src");
      if (title && link) {
        newEps.push({ title, slug: extractSlug(link), link, image, episode: "" });
      }
    });
  }

  return { newEpisodes: newEps.slice(0, 40) };
}

// ---------- SEARCH ----------
export async function searchAnime(query, page = 1) {
  const { html } = await fetchHtml(
    `/page/${page}/?s=${encodeURIComponent(query)}`
  );
  const $ = cheerio.load(html);
  const results = [];

  $("article, .bsx, .animposx").each((i, el) => {
    const $el = $(el);
    const title = cleanText($el.find("h2, .ttl, .tt").first().text());
    const link = $el.find("a").first().attr("href");
    const image = $el.find("img").first().attr("src") || $el.find("img").first().attr("data-src");
    const status = cleanText($el.find(".status, .sb").first().text());
    const type = cleanText($el.find(".typez, .type").first().text());
    if (title && link) {
      results.push({
        title,
        slug: extractSlug(link),
        link,
        image,
        status,
        type,
      });
    }
  });

  return { query, page, results };
}

// ---------- ANIME DETAIL ----------
export async function getAnimeDetail(slug) {
  const { html } = await fetchHtml(`/anime/${slug}/`);
  const $ = cheerio.load(html);

  const title = cleanText($(".entry-title, h1.entry-title").first().text());
  const image = $(".thumb img, .infoanime img").first().attr("src");
  const synopsis = cleanText($(".entry-content.entry-content-single p, .desc p").text());

  const info = {};
  $(".infox .spe span, .info-content .spe span").each((i, el) => {
    const $el = $(el);
    const label = cleanText($el.find("b").text()).replace(":", "");
    const value = cleanText($el.clone().children("b").remove().end().text());
    if (label) info[label.toLowerCase()] = value;
  });

  const genres = [];
  $(".genre-info a, .genxx a").each((i, el) => {
    genres.push(cleanText($(el).text()));
  });

  const episodeList = [];
  $(".lstepsiode.listeps ul li, .episodelist ul li").each((i, el) => {
    const $el = $(el);
    const epTitle = cleanText($el.find(".lchx, .eps-title").first().text()) ||
      cleanText($el.find("a").first().text());
    const link = $el.find("a").first().attr("href");
    const date = cleanText($el.find(".date, .zeebr").first().text());
    if (link) {
      episodeList.push({
        title: epTitle || extractSlug(link),
        slug: extractSlug(link),
        link,
        date,
      });
    }
  });

  return {
    title,
    slug,
    image,
    synopsis,
    info,
    genres,
    episodeList: episodeList.reverse(), // urut episode 1 -> terbaru
  };
}

// ---------- EPISODE (STREAM) ----------
export async function getEpisode(slug) {
  const { html } = await fetchHtml(`/${slug}/`);
  const $ = cheerio.load(html);

  const title = cleanText($(".entry-title, h1.entry-title").first().text());

  // Default iframe player (mirror pertama)
  const defaultIframe =
    $("#pembed iframe").attr("src") ||
    $(".player-embed iframe").attr("src") ||
    $("iframe").first().attr("src") ||
    null;

  // Daftar mirror/server lain (biasanya via dropdown <select> berisi base64 iframe)
  const mirrors = [];
  $("#server select option, .mirrorstream select option").each((i, el) => {
    const $el = $(el);
    const label = cleanText($el.text());
    const dataContent = $el.attr("data-content") || $el.val();
    if (label && dataContent) {
      let decoded = null;
      try {
        decoded = Buffer.from(dataContent, "base64").toString("utf-8");
      } catch (e) {
        decoded = null;
      }
      mirrors.push({ label, raw: dataContent, iframe: decoded });
    }
  });

  // Link download per resolusi
  const downloads = [];
  $(".download-eps ul li, .downloadeps ul li").each((i, el) => {
    const $el = $(el);
    const resolution = cleanText($el.find("strong").first().text());
    const links = [];
    $el.find("a").each((j, a) => {
      links.push({
        provider: cleanText($(a).text()),
        url: $(a).attr("href"),
      });
    });
    if (resolution) downloads.push({ resolution, links });
  });

  // Navigasi episode sebelumnya/selanjutnya
  const prevEp = $(".naveps a[title*='Previous'], .flir a.prev").attr("href");
  const nextEp = $(".naveps a[title*='Next'], .flir a.next").attr("href");

  // Info anime induk
  const animeLink = $(".infox a, .lightbtn a").first().attr("href");

  return {
    title,
    slug,
    defaultIframe,
    mirrors,
    downloads,
    prevEpisode: prevEp ? extractSlug(prevEp) : null,
    nextEpisode: nextEp ? extractSlug(nextEp) : null,
    animeSlug: animeLink ? extractSlug(animeLink) : null,
  };
}

// ---------- JADWAL TAYANG ----------
export async function getSchedule() {
  const { html } = await fetchHtml("/jadwal-rilis/");
  const $ = cheerio.load(html);

  const schedule = {};
  $(".kglist321, .schedule-day").each((i, el) => {
    const $el = $(el);
    const day = cleanText($el.find("h3, .h3").first().text());
    const items = [];
    $el.find("ul li, .schedule-item").each((j, li) => {
      const $li = $(li);
      const title = cleanText($li.find("a").first().text());
      const link = $li.find("a").first().attr("href");
      const time = cleanText($li.find(".jam, .time").first().text());
      if (title) {
        items.push({ title, slug: link ? extractSlug(link) : "", time });
      }
    });
    if (day) schedule[day] = items;
  });

  return schedule;
}

// ---------- GENRE LIST ----------
export async function getByGenre(genreSlug, page = 1) {
  const { html } = await fetchHtml(`/genre/${genreSlug}/page/${page}/`);
  const $ = cheerio.load(html);
  const results = [];

  $("article, .bsx, .animposx").each((i, el) => {
    const $el = $(el);
    const title = cleanText($el.find("h2, .ttl").first().text());
    const link = $el.find("a").first().attr("href");
    const image = $el.find("img").first().attr("src") || $el.find("img").first().attr("data-src");
    if (title && link) {
      results.push({ title, slug: extractSlug(link), link, image });
    }
  });

  return { genre: genreSlug, page, results };
}

export function getCurrentDomain() {
  return activeDomain || DOMAINS[0];
}

export { DOMAINS };
