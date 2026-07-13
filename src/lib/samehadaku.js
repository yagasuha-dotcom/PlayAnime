import axios from "axios";
import * as cheerio from "cheerio";

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

let activeDomain = null;
let lastCheck = 0;
const CHECK_INTERVAL = 5 * 60 * 1000;

// Kata kunci judi/iklan yang sering nyusup lewat widget/banner di situs streaming ilegal.
// Kalau title atau link mengandung ini, dibuang — bukan anime asli.
const BLOCKLIST_KEYWORDS = [
  "slot", "togel", "casino", "kasino", "judi", "bet ", "bandar",
  "maxwin", "gacor", "rtp ", "jackpot", "poker", "sabung",
  "cashrules", "edatoto", "toto", "wd ", "deposit", "situs resmi",
  "akses cepat", "anti rungkad", "auto jp",
];

function isJunkEntry(title, link) {
  const text = `${title} ${link}`.toLowerCase();
  return BLOCKLIST_KEYWORDS.some((kw) => text.includes(kw));
}

// Anime asli di Samehadaku selalu punya URL /anime/ di link detail, atau
// slug episode yang biasanya diakhiri pola -episode-N-subtitle-indonesia.
// Iklan/redirect biasanya link keluar ke domain lain sama sekali.
function isValidAnimeLink(link, baseDomain) {
  if (!link) return false;
  try {
    const url = new URL(link, baseDomain);
    const host = url.hostname;
    const currentHost = new URL(baseDomain).hostname;
    // link harus tetap di domain samehadaku yang sama, bukan redirect keluar
    if (host !== currentHost) return false;
    return true;
  } catch (e) {
    return false;
  }
}

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
      const res = await axios.get(url, { headers: HEADERS, timeout: 10000 });
      if (res.status === 200 && res.data) {
        activeDomain = domain;
        lastCheck = Date.now();
        return { html: res.data, domain };
      }
    } catch (err) {
      lastError = err;
      continue;
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
  const { html, domain } = await fetchHtml("/");
  const $ = cheerio.load(html);

  const newEps = [];
  const seen = new Set();

  $(".post-show ul li, .listupd .bs, .widget_senction .post-show li").each((i, el) => {
    const $el = $(el);
    const title = cleanText($el.find(".ttl, h2, .tt").first().text());
    const link = $el.find("a").first().attr("href");
    const image = $el.find("img").first().attr("src") || $el.find("img").first().attr("data-src");
    const episode = cleanText($el.find(".epx, .ep").first().text());

    if (!title || !link) return;
    if (isJunkEntry(title, link)) return; // buang iklan/judi
    if (!isValidAnimeLink(link, domain)) return; // buang link redirect keluar
    if (seen.has(link)) return;
    seen.add(link);

    newEps.push({ title, slug: extractSlug(link), link, image, episode });
  });

  if (newEps.length === 0) {
    $("article, .bsx").each((i, el) => {
      const $el = $(el);
      const title = cleanText($el.find("h2, .ttl, .title").first().text());
      const link = $el.find("a").first().attr("href");
      const image = $el.find("img").first().attr("src") || $el.find("img").first().attr("data-src");

      if (!title || !link) return;
      if (isJunkEntry(title, link)) return;
      if (!isValidAnimeLink(link, domain)) return;
      if (seen.has(link)) return;
      seen.add(link);

      newEps.push({ title, slug: extractSlug(link), link, image, episode: "" });
    });
  }

  return { newEpisodes: newEps.slice(0, 40) };
}

// ---------- SEARCH ----------
export async function searchAnime(query, page = 1) {
  const { html, domain } = await fetchHtml(`/page/${page}/?s=${encodeURIComponent(query)}`);
  const $ = cheerio.load(html);
  const results = [];
  const seen = new Set();

  $("article, .bsx, .animposx").each((i, el) => {
    const $el = $(el);
    const title = cleanText($el.find("h2, .ttl, .tt").first().text());
    const link = $el.find("a").first().attr("href");
    const image = $el.find("img").first().attr("src") || $el.find("img").first().attr("data-src");
    const status = cleanText($el.find(".status, .sb").first().text());
    const type = cleanText($el.find(".typez, .type").first().text());

    if (!title || !link) return;
    if (isJunkEntry(title, link)) return;
    if (!isValidAnimeLink(link, domain)) return;
    if (seen.has(link)) return;
    seen.add(link);

    results.push({ title, slug: extractSlug(link), link, image, status, type });
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
  const seenEp = new Set();
  $(".lstepsiode.listeps ul li, .episodelist ul li").each((i, el) => {
    const $el = $(el);
    const epTitle =
      cleanText($el.find(".lchx, .eps-title").first().text()) ||
      cleanText($el.find("a").first().text());
    const link = $el.find("a").first().attr("href");
    const date = cleanText($el.find(".date, .zeebr").first().text());

    if (!link) return;
    if (isJunkEntry(epTitle, link)) return;
    if (seenEp.has(link)) return;
    seenEp.add(link);

    episodeList.push({ title: epTitle || extractSlug(link), slug: extractSlug(link), link, date });
  });

  return {
    title,
    slug,
    image,
    synopsis,
    info,
    genres,
    episodeList: episodeList.reverse(),
  };
}

// ---------- EPISODE (STREAM) ----------
export async function getEpisode(slug) {
  const { html } = await fetchHtml(`/${slug}/`);
  const $ = cheerio.load(html);

  const title = cleanText($(".entry-title, h1.entry-title").first().text());

  const defaultIframe =
    $("#pembed iframe").attr("src") ||
    $(".player-embed iframe").attr("src") ||
    $("iframe").first().attr("src") ||
    null;

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

  const downloads = [];
  $(".download-eps ul li, .downloadeps ul li").each((i, el) => {
    const $el = $(el);
    const resolution = cleanText($el.find("strong").first().text());
    const links = [];
    $el.find("a").each((j, a) => {
      const href = $(a).attr("href");
      const providerName = cleanText($(a).text());
      if (href && !isJunkEntry(providerName, href)) {
        links.push({ provider: providerName, url: href });
      }
    });
    if (resolution && links.length > 0) downloads.push({ resolution, links });
  });

  const prevEp = $(".naveps a[title*='Previous'], .flir a.prev").attr("href");
  const nextEp = $(".naveps a[title*='Next'], .flir a.next").attr("href");
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
      if (title && !isJunkEntry(title, link)) {
        items.push({ title, slug: link ? extractSlug(link) : "", time });
      }
    });
    if (day) schedule[day] = items;
  });

  return schedule;
}

// ---------- GENRE LIST ----------
export async function getByGenre(genreSlug, page = 1) {
  const { html, domain } = await fetchHtml(`/genre/${genreSlug}/page/${page}/`);
  const $ = cheerio.load(html);
  const results = [];
  const seen = new Set();

  $("article, .bsx, .animposx").each((i, el) => {
    const $el = $(el);
    const title = cleanText($el.find("h2, .ttl").first().text());
    const link = $el.find("a").first().attr("href");
    const image = $el.find("img").first().attr("src") || $el.find("img").first().attr("data-src");

    if (!title || !link) return;
    if (isJunkEntry(title, link)) return;
    if (!isValidAnimeLink(link, domain)) return;
    if (seen.has(link)) return;
    seen.add(link);

    results.push({ title, slug: extractSlug(link), link, image });
  });

  return { genre: genreSlug, page, results };
}

export function getCurrentDomain() {
  return activeDomain || DOMAINS[0];
}

export { DOMAINS };
