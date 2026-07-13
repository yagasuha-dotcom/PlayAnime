import { db, schema } from "./db";
import { eq, and } from "drizzle-orm";

const FREE_KEY_COST_PER_EPISODE = 1; // Rakyat butuh 1 key buat unlock 1 episode baru
const KEY_PER_AD = 2; // 1 iklan selesai = +2 key

export function isPremiumActive(user) {
  if (!user) return false;
  if (user.kasta === "admin" || user.kasta === "donatur") {
    // donatur tetap dicek expiry premiumUntil
    if (user.kasta === "admin") return true;
    return user.premiumUntil && new Date(user.premiumUntil) > new Date();
  }
  return false;
}

// Cek apakah user boleh nonton episode ini tanpa gesek key
export async function canWatchFree(user) {
  if (!user) return false; // guest wajib login minimal
  if (user.kasta === "admin") return true;
  if (isPremiumActive(user)) return true; // donatur aktif = bebas iklan & key
  return false; // rakyat wajib pakai key
}

export async function hasUnlockedEpisode(userId, episodeSlug) {
  const rows = await db
    .select()
    .from(schema.unlockedEpisodes)
    .where(
      and(
        eq(schema.unlockedEpisodes.userId, userId),
        eq(schema.unlockedEpisodes.episodeSlug, episodeSlug)
      )
    )
    .limit(1);
  return rows.length > 0;
}

// Potong key rakyat untuk unlock 1 episode. Return { ok, reason, keyBalance }
export async function unlockEpisodeWithKey(userId, episodeSlug) {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!user) return { ok: false, reason: "user_not_found" };

  const already = await hasUnlockedEpisode(userId, episodeSlug);
  if (already) return { ok: true, reason: "already_unlocked", keyBalance: user.keyBalance };

  if (user.keyBalance < FREE_KEY_COST_PER_EPISODE) {
    return { ok: false, reason: "insufficient_key", keyBalance: user.keyBalance };
  }

  const newBalance = user.keyBalance - FREE_KEY_COST_PER_EPISODE;

  await db
    .update(schema.users)
    .set({ keyBalance: newBalance })
    .where(eq(schema.users.id, userId));

  await db.insert(schema.keyTransactions).values({
    userId,
    amount: -FREE_KEY_COST_PER_EPISODE,
    reason: "unlock_episode",
  });

  await db.insert(schema.unlockedEpisodes).values({
    userId,
    episodeSlug,
  });

  return { ok: true, reason: "unlocked", keyBalance: newBalance };
}

// Dipanggil dari callback rewarded-ad setelah iklan selesai ditonton penuh
export async function grantKeyFromAd(userId) {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!user) return { ok: false, reason: "user_not_found" };

  const newBalance = user.keyBalance + KEY_PER_AD;

  await db
    .update(schema.users)
    .set({ keyBalance: newBalance })
    .where(eq(schema.users.id, userId));

  await db.insert(schema.keyTransactions).values({
    userId,
    amount: KEY_PER_AD,
    reason: "ad_reward",
  });

  return { ok: true, keyBalance: newBalance, gained: KEY_PER_AD };
}

export const PREMIUM_PACKAGES = [
  { months: 1, days: 30, priceIdr: 8000, bonusGem: 0, label: "1 Bulan" },
  { months: 3, days: 90, priceIdr: 21000, bonusGem: 0, label: "3 Bulan", savePercent: 12 },
  { months: 6, days: 180, priceIdr: 38000, bonusGem: 0, label: "6 Bulan", savePercent: 21, best: true },
  { months: 12, days: 360, priceIdr: 69000, bonusGem: 0, label: "12 Bulan", savePercent: 28 },
];

export async function activatePremium(userId, months) {
  const pkg = PREMIUM_PACKAGES.find((p) => p.months === months);
  if (!pkg) throw new Error("Paket premium tidak valid");

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  const now = new Date();
  const base =
    user?.premiumUntil && new Date(user.premiumUntil) > now
      ? new Date(user.premiumUntil)
      : now;

  const newUntil = new Date(base.getTime() + pkg.days * 24 * 60 * 60 * 1000);

  await db
    .update(schema.users)
    .set({ kasta: "donatur", premiumUntil: newUntil })
    .where(eq(schema.users.id, userId));

  return { premiumUntil: newUntil };
}
