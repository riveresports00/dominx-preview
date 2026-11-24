-- Dominx Esports CMS schema (Supabase SQL Editor)
create table if not exists public.tournaments (
 id uuid primary key default gen_random_uuid(),
 title text not null, game text, status text not null default 'upcoming' check(status in ('upcoming','live','closed','completed','postponed')),
 event_date date, slots text, prize_pool text, poster_url text, registration_url text, description text, published boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.results (id uuid primary key default gen_random_uuid(), event_name text, title text, team_name text, result text, placement text, score text, created_at timestamptz not null default now());
create table if not exists public.achievements (id uuid primary key default gen_random_uuid(), title text not null, description text, date text, created_at timestamptz not null default now());
alter table public.tournaments enable row level security; alter table public.results enable row level security; alter table public.achievements enable row level security;
drop policy if exists "Public can view published tournaments" on public.tournaments; create policy "Public can view published tournaments" on public.tournaments for select using (published=true);
drop policy if exists "Admins manage tournaments" on public.tournaments; create policy "Admins manage tournaments" on public.tournaments for all to authenticated using (true) with check (true);
drop policy if exists "Public can read results" on public.results; create policy "Public can read results" on public.results for select using (true);
drop policy if exists "Admins manage results" on public.results; create policy "Admins manage results" on public.results for all to authenticated using (true) with check (true);
drop policy if exists "Public can read achievements" on public.achievements; create policy "Public can read achievements" on public.achievements for select using (true);
drop policy if exists "Admins manage achievements" on public.achievements; create policy "Admins manage achievements" on public.achievements for all to authenticated using (true) with check (true);
-- IMPORTANT: After creating the admin user, restrict admin policies by checking an admin role/claim before production use. Do not treat all authenticated users as admins.
