-- Jalankan ini di Supabase SQL Editor (Project > SQL Editor > New query)

create type kasta as enum ('admin', 'donatur', 'rakyat');

create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  email text not null unique,
  avatar_url text,
  kasta kasta not null default 'rakyat',
  level integer not null default 1,
  exp integer not null default 0,
  key_balance integer not null default 0,
  premium_until timestamp,
  created_at timestamp not null default now()
);

create table if not exists key_transactions (
  id serial primary key,
  user_id uuid not null references users(id) on delete cascade,
  amount integer not null,
  reason text not null,
  created_at timestamp not null default now()
);

create table if not exists unlocked_episodes (
  id serial primary key,
  user_id uuid not null references users(id) on delete cascade,
  episode_slug text not null,
  unlocked_at timestamp not null default now(),
  unique (user_id, episode_slug)
);

create table if not exists watch_history (
  id serial primary key,
  user_id uuid not null references users(id) on delete cascade,
  anime_slug text not null,
  anime_title text not null,
  anime_image text,
  episode_slug text not null,
  episode_title text not null,
  progress_seconds integer not null default 0,
  duration_seconds integer not null default 0,
  updated_at timestamp not null default now(),
  unique (user_id, episode_slug)
);

create table if not exists subscriptions (
  id serial primary key,
  user_id uuid not null references users(id) on delete cascade,
  anime_slug text not null,
  anime_title text not null,
  anime_image text,
  created_at timestamp not null default now(),
  unique (user_id, anime_slug)
);

create table if not exists premium_orders (
  id serial primary key,
  user_id uuid not null references users(id) on delete cascade,
  package_months integer not null,
  price_idr integer not null,
  status text not null default 'pending',
  payment_method text,
  created_at timestamp not null default now(),
  paid_at timestamp
);

-- Row Level Security: user hanya bisa baca/tulis data miliknya sendiri.
-- Semua write sensitif (kasta, key) tetap lewat API route pakai service logic,
-- jadi policy di bawah cukup permisif untuk baca data sendiri.

alter table users enable row level security;
alter table key_transactions enable row level security;
alter table unlocked_episodes enable row level security;
alter table watch_history enable row level security;
alter table subscriptions enable row level security;
alter table premium_orders enable row level security;

create policy "user can read own row" on users for select using (auth.uid() = id);
create policy "user can update own basic info" on users for update using (auth.uid() = id);

create policy "user can read own history" on watch_history for select using (auth.uid() = user_id);
create policy "user can write own history" on watch_history for insert with check (auth.uid() = user_id);
create policy "user can update own history" on watch_history for update using (auth.uid() = user_id);

create policy "user can read own subs" on subscriptions for select using (auth.uid() = user_id);
create policy "user can write own subs" on subscriptions for insert with check (auth.uid() = user_id);
create policy "user can delete own subs" on subscriptions for delete using (auth.uid() = user_id);

create policy "user can read own unlocks" on unlocked_episodes for select using (auth.uid() = user_id);

create policy "user can read own key tx" on key_transactions for select using (auth.uid() = user_id);

create policy "user can read own orders" on premium_orders for select using (auth.uid() = user_id);

-- Bikin akun pertamamu jadi admin manual, ganti EMAIL_KAMU:
-- update users set kasta = 'admin' where email = 'EMAIL_KAMU@gmail.com';
