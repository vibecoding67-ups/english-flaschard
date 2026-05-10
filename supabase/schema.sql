-- ============================================================
-- English Flashcard — Supabase Schema
-- Jalankan file ini di Supabase Dashboard → SQL Editor
-- ============================================================

-- Tabel flashcards
create table if not exists public.flashcards (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  word        text not null,
  meaning     text not null,
  example     text not null,
  status      text not null default 'review' check (status in ('mastered', 'review')),
  created_at  timestamptz not null default now()
);

-- Tabel streaks
create table if not exists public.streaks (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null unique references auth.users(id) on delete cascade,
  current_streak   integer not null default 0,
  last_study_date  date,
  updated_at       timestamptz not null default now()
);

-- Row Level Security (RLS) — setiap user hanya bisa akses data miliknya sendiri
alter table public.flashcards enable row level security;
alter table public.streaks enable row level security;

-- Policy flashcards
create policy "Users can view own flashcards"
  on public.flashcards for select
  using (auth.uid() = user_id);

create policy "Users can insert own flashcards"
  on public.flashcards for insert
  with check (auth.uid() = user_id);

create policy "Users can update own flashcards"
  on public.flashcards for update
  using (auth.uid() = user_id);

create policy "Users can delete own flashcards"
  on public.flashcards for delete
  using (auth.uid() = user_id);

-- Policy streaks
create policy "Users can view own streak"
  on public.streaks for select
  using (auth.uid() = user_id);

create policy "Users can insert own streak"
  on public.streaks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own streak"
  on public.streaks for update
  using (auth.uid() = user_id);

-- Index untuk performa
create index if not exists flashcards_user_id_idx on public.flashcards(user_id);
create index if not exists streaks_user_id_idx on public.streaks(user_id);
