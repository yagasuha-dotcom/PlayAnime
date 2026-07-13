import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

// Kasta bukan role teknis, ini tier sosial/ekonomi di dalam app
export const kastaEnum = pgEnum("kasta", ["admin", "donatur", "rakyat"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // sama dengan Supabase auth.users.id
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  avatarUrl: text("avatar_url"),
  kasta: kastaEnum("kasta").notNull().default("rakyat"),
  level: integer("level").notNull().default(1),
  exp: integer("exp").notNull().default(0),
  keyBalance: integer("key_balance").notNull().default(0),
  premiumUntil: timestamp("premium_until"), // null = bukan donatur / expired
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Key didapat dari nonton iklan (monetisasi). 1 iklan selesai = +2 key.
export const keyTransactions = pgTable("key_transactions", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  amount: integer("amount").notNull(), // + dari iklan, - dari pemakaian buka episode
  reason: text("reason").notNull(), // 'ad_reward' | 'unlock_episode' | 'admin_grant'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Episode yang sudah dibuka pakai key (supaya ga kepake dobel tiap nonton ulang)
export const unlockedEpisodes = pgTable("unlocked_episodes", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  episodeSlug: text("episode_slug").notNull(),
  unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
});

export const watchHistory = pgTable("watch_history", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  animeSlug: text("anime_slug").notNull(),
  animeTitle: text("anime_title").notNull(),
  animeImage: text("anime_image"),
  episodeSlug: text("episode_slug").notNull(),
  episodeTitle: text("episode_title").notNull(),
  progressSeconds: integer("progress_seconds").notNull().default(0),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  animeSlug: text("anime_slug").notNull(),
  animeTitle: text("anime_title").notNull(),
  animeImage: text("anime_image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const premiumOrders = pgTable("premium_orders", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  packageMonths: integer("package_months").notNull(), // 1, 3, 6, 12
  priceIdr: integer("price_idr").notNull(),
  status: text("status").notNull().default("pending"), // pending | paid | expired | cancelled
  paymentMethod: text("payment_method"), // qris | gopay dll
  createdAt: timestamp("created_at").notNull().defaultNow(),
  paidAt: timestamp("paid_at"),
});
