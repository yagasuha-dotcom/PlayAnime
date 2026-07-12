-- ============================================================
-- PLAYANIME — SUPABASE SCHEMA
-- Jalankan ini di Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- ---------- ENUM ----------
create type user_role as enum ('admin', 'donatur', 'rakyat_konoha');

-- ---------- PROFILES ----------
-- 1 baris per user, dibuat otomatis saat register (via trigger di bawah)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_url text,
  role user_role not null default 'rakyat_konoha',
  keys integer not null default 3,          -- saldo key nonton
  exp integer not null default 0,
  level integer not null default 1,
  donatur_until timestamptz,                -- kapan status donatur habis (null = bukan donatur)
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Semua orang bisa lihat profile publik"
  on profiles for select using (true);

create policy "User cuma bisa update profile sendiri"
  on profiles for update using (auth.uid() = id);

-- Auto-buat profile begitu user register di Supabase Auth
create function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---------- KEY TRANSACTIONS (log biar ga bisa dicurangi client-side) ----------
create table key_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  amount integer not null,              -- + dari nonton iklan, - dari nonton episode
  reason text not null,                 -- 'ad_reward' | 'watch_episode' | 'admin_grant' | 'donatur_bonus'
  episode_ref text,                     -- link episode kalau reason = watch_episode
  created_at timestamptz not null default now()
);

alter table key_transactions enable row level security;

create policy "User cuma bisa lihat transaksi sendiri"
  on key_transactions for select using (auth.uid() = user_id);

-- ---------- EXP TRANSACTIONS ----------
create table exp_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  amount integer not null,
  episode_ref text,
  created_at timestamptz not null default now()
);

alter table exp_transactions enable row level security;

create policy "User cuma bisa lihat exp log sendiri"
  on exp_transactions for select using (auth.uid() = user_id);

-- ---------- PUBLIC CHAT ----------
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  message text not null check (char_length(message) between 1 and 500),
  created_at timestamptz not null default now()
);

alter table chat_messages enable row level security;

create policy "Semua orang bisa baca chat"
  on chat_messages for select using (true);

create policy "User login bisa kirim chat"
  on chat_messages for insert with check (auth.uid() = user_id);

create policy "Admin bisa hapus pesan siapa aja, user bisa hapus punya sendiri"
  on chat_messages for delete using (
    auth.uid() = user_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ---------- RPC: KLAIM KEY DARI NONTON IKLAN ----------
-- Dipanggil setelah iklan reward selesai ditonton (verifikasi di server,
-- bukan cuma trust client, biar ga gampang dicurangi)
create function claim_ad_key(reward_amount integer default 1)
returns integer as $$
declare
  new_balance integer;
begin
  update profiles
    set keys = keys + reward_amount
    where id = auth.uid()
    returning keys into new_balance;

  insert into key_transactions (user_id, amount, reason)
    values (auth.uid(), reward_amount, 'ad_reward');

  return new_balance;
end;
$$ language plpgsql security definer;

-- ---------- RPC: PAKAI KEY BUAT NONTON EPISODE ----------
-- Return: -1 kalau key ga cukup, kalau berhasil return sisa key.
-- Donatur skip potong key (unlimited nonton selama masih aktif).
create function spend_key_for_episode(ep_ref text)
returns integer as $$
declare
  current_keys integer;
  current_role user_role;
  donatur_active boolean;
  new_balance integer;
  exp_gain integer;
begin
  select keys, role, (donatur_until is not null and donatur_until > now())
    into current_keys, current_role, donatur_active
    from profiles where id = auth.uid();

  if donatur_active or current_role = 'admin' then
    -- unlimited nonton, ga potong key, tetap dapet exp
    exp_gain := (floor(random() * 20) + 10)::integer; -- random 10-29 exp
    update profiles set exp = exp + exp_gain where id = auth.uid();
    insert into exp_transactions (user_id, amount, episode_ref) values (auth.uid(), exp_gain, ep_ref);
    perform recalc_level(auth.uid());
    return current_keys; -- key tidak berubah
  end if;

  if current_keys < 1 then
    return -1; -- key tidak cukup
  end if;

  update profiles set keys = keys - 1 where id = auth.uid() returning keys into new_balance;
  insert into key_transactions (user_id, amount, reason, episode_ref)
    values (auth.uid(), -1, 'watch_episode', ep_ref);

  exp_gain := (floor(random() * 20) + 10)::integer; -- random 10-29 exp per episode
  update profiles set exp = exp + exp_gain where id = auth.uid();
  insert into exp_transactions (user_id, amount, episode_ref) values (auth.uid(), exp_gain, ep_ref);
  perform recalc_level(auth.uid());

  return new_balance;
end;
$$ language plpgsql security definer;

-- ---------- LEVEL FORMULA ----------
-- Level naik tiap kelipatan (level * 100) exp kumulatif sederhana:
-- level 1->2 butuh 100 exp, 2->3 butuh 200 exp lagi, dst (segitiga)
create function recalc_level(uid uuid)
returns void as $$
declare
  total_exp integer;
  calc_level integer;
begin
  select exp into total_exp from profiles where id = uid;
  -- rumus: level = akar dari (exp/50), dibulatkan turun, minimal 1
  calc_level := greatest(1, floor(sqrt(total_exp::float / 50))::integer + 1);
  update profiles set level = calc_level where id = uid;
end;
$$ language plpgsql security definer;

-- ---------- RPC: ADMIN — UBAH ROLE USER ----------
create function admin_set_role(target_user uuid, new_role user_role, donatur_days integer default null)
returns void as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Cuma admin yang bisa ubah role.';
  end if;

  update profiles
    set role = new_role,
        donatur_until = case
          when new_role = 'donatur' and donatur_days is not null
            then now() + (donatur_days || ' days')::interval
          when new_role = 'donatur' then donatur_until
          else null
        end
    where id = target_user;
end;
$$ language plpgsql security definer;

-- ---------- RPC: ADMIN — KASIH KEY MANUAL ----------
create function admin_grant_keys(target_user uuid, amount integer)
returns void as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Cuma admin yang bisa kasih key.';
  end if;

  update profiles set keys = keys + amount where id = target_user;
  insert into key_transactions (user_id, amount, reason) values (target_user, amount, 'admin_grant');
end;
$$ language plpgsql security definer;

-- ---------- CATATAN: buat admin pertama kali ----------
-- Ga ada UI buat promote admin pertama (demi keamanan). Jalankan manual
-- di SQL Editor setelah register akun kamu sendiri:
--
-- update profiles set role = 'admin' where username = 'username_kamu';
create index idx_chat_created_at on chat_messages (created_at desc);
create index idx_key_tx_user on key_transactions (user_id, created_at desc);
create index idx_exp_tx_user on exp_transactions (user_id, created_at desc);

-- ---------- REALTIME ----------
-- Aktifkan realtime buat tabel chat (biar bisa subscribe live)
alter publication supabase_realtime add table chat_messages;
