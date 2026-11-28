-- DOMINX ESPORTS CMS schema. Run in Supabase SQL Editor.
-- Admin writes are restricted to auth users explicitly allowlisted in admin_users.
create table if not exists public.admin_users (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
create table if not exists public.tournaments (
 id uuid primary key default gen_random_uuid(),
 title text not null, game text, status text not null default 'upcoming' check(status in ('upcoming','live','closed','completed','postponed')),
 event_date date, slots text, prize_pool text, poster_url text, registration_url text, description text,
 published boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.results (
 id uuid primary key default gen_random_uuid(), event_name text, title text, team_name text, result text, placement text, score text, created_at timestamptz not null default now()
);
create table if not exists public.achievements (
 id uuid primary key default gen_random_uuid(), title text not null, description text, date text, created_at timestamptz not null default now()
);

-- Enable row level security on every CMS table.
alter table public.admin_users enable row level security;
alter table public.tournaments enable row level security;
alter table public.results enable row level security;
alter table public.achievements enable row level security;

-- Public can read only published tournaments and all public results/achievements.
drop policy if exists "Public can view published tournaments" on public.tournaments;
create policy "Public can view published tournaments" on public.tournaments for select to anon, authenticated using (published = true);
drop policy if exists "Admins manage tournaments" on public.tournaments;
create policy "Admins manage tournaments" on public.tournaments for all to authenticated using (exists (select 1 from public.admin_users au where au.user_id = auth.uid())) with check (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));
drop policy if exists "Public can read results" on public.results;
create policy "Public can read results" on public.results for select to anon, authenticated using (true);
drop policy if exists "Admins manage results" on public.results;
create policy "Admins manage results" on public.results for all to authenticated using (exists (select 1 from public.admin_users au where au.user_id = auth.uid())) with check (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));
drop policy if exists "Public can read achievements" on public.achievements;
create policy "Public can read achievements" on public.achievements for select to anon, authenticated using (true);
drop policy if exists "Admins manage achievements" on public.achievements;
create policy "Admins manage achievements" on public.achievements for all to authenticated using (exists (select 1 from public.admin_users au where au.user_id = auth.uid())) with check (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));
-- Allow an authenticated admin to read only their own allowlist row. Admin rows are inserted manually by the project owner in SQL Editor.
drop policy if exists "Admin reads own allowlist row" on public.admin_users;
create policy "Admin reads own allowlist row" on public.admin_users for select to authenticated using (user_id = auth.uid());

-- Community/social content CMS additions (safe to re-run).
create table if not exists public.social_links (
 platform text primary key check (platform in ('instagram','discord','youtube','x','whatsapp','facebook')),
 label text not null,
 url text not null check (url ~ '^https://'),
 sort_order integer not null default 0,
 updated_at timestamptz not null default now()
);

insert into public.social_links(platform,label,url,sort_order) values
 ('instagram','Instagram','https://www.instagram.com/dominxesports?gwpx=MWFsZDBsaW04ZXlydA==',1),
 ('discord','Discord','https://discord.gg/NEqSQrr5x5',2),
 ('youtube','YouTube','https://youtube.com/@dominxesports?si=aPK1MutWSFm22Rn5',3),
 ('x','X / Twitter','https://x.com/dominxesports',4),
 ('whatsapp','WhatsApp','https://chat.whatsapp.com/JereRFXh8crC94L0CJzsNz?s=cl&p=a&iam=2',5),
 ('facebook','Facebook','https://www.facebook.com/share/19jZRSStkp/',6)
 on conflict(platform) do nothing;
create table if not exists public.shared_posts (
 id uuid primary key default gen_random_uuid(),
 title text not null,
 body text,
 url text check (url is null or url ~ '^https://'),
 published boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.review_messages (
 id uuid primary key default gen_random_uuid(),
 access_token uuid not null unique,
 name text,
 message text not null check (length(message) between 1 and 600),
 reply text,
 created_at timestamptz not null default now()
);
alter table public.social_links enable row level security;
alter table public.shared_posts enable row level security;
alter table public.review_messages enable row level security;
drop policy if exists "Public read social links" on public.social_links;
create policy "Public read social links" on public.social_links for select to anon, authenticated using (true);
drop policy if exists "Admins manage social links" on public.social_links;
create policy "Admins manage social links" on public.social_links for all to authenticated using (exists(select 1 from public.admin_users au where au.user_id=auth.uid())) with check (exists(select 1 from public.admin_users au where au.user_id=auth.uid()));
drop policy if exists "Public read published shared posts" on public.shared_posts;
create policy "Public read published shared posts" on public.shared_posts for select to anon, authenticated using (published=true);
drop policy if exists "Admins manage shared posts" on public.shared_posts;
create policy "Admins manage shared posts" on public.shared_posts for all to authenticated using (exists(select 1 from public.admin_users au where au.user_id=auth.uid())) with check (exists(select 1 from public.admin_users au where au.user_id=auth.uid()));
drop policy if exists "Admins read review messages" on public.review_messages;
create policy "Admins read review messages" on public.review_messages for select to authenticated using (exists(select 1 from public.admin_users au where au.user_id=auth.uid()));
drop policy if exists "Admins reply to review messages" on public.review_messages;
create policy "Admins reply to review messages" on public.review_messages for update to authenticated using (exists(select 1 from public.admin_users au where au.user_id=auth.uid())) with check (exists(select 1 from public.admin_users au where au.user_id=auth.uid()));

-- Visitors submit messages without a direct SELECT policy. Replies are fetched by a private per-device token via RPC.
create or replace function public.submit_review(p_token uuid,p_name text,p_message text)
returns void language plpgsql security definer set search_path=public as $$
begin
 if p_message is null or length(trim(p_message))=0 or length(p_message)>600 then raise exception 'Message length is invalid'; end if;
 insert into public.review_messages(access_token,name,message) values(p_token,left(trim(coalesce(p_name,'Guest')),40),trim(p_message));
end; $$;
revoke all on function public.submit_review(uuid,text,text) from public;
grant execute on function public.submit_review(uuid,text,text) to anon, authenticated;
create or replace function public.get_review_reply(p_token uuid)
returns table(reply text) language sql security definer set search_path=public as $$
 select rm.reply from public.review_messages rm where rm.access_token=p_token limit 1;
$$;
revoke all on function public.get_review_reply(uuid) from public;
grant execute on function public.get_review_reply(uuid) to anon, authenticated;

-- Roster and homepage news CMS.
create table if not exists public.roster_players (
 id uuid primary key default gen_random_uuid(),
 slot integer not null unique check(slot between 1 and 4),
 player_name text not null,
 role text,
 bio text,
 profile_url text check(profile_url is null or profile_url ~ '^https://'),
 updated_at timestamptz not null default now()
);
create table if not exists public.news_feature (
 id integer primary key check(id=1),
 title text not null,
 body text,
 url text check(url is null or url ~ '^https://'),
 updated_at timestamptz not null default now()
);
alter table public.roster_players enable row level security;
alter table public.news_feature enable row level security;
drop policy if exists "Public read roster" on public.roster_players;
create policy "Public read roster" on public.roster_players for select to anon, authenticated using (true);
drop policy if exists "Admins manage roster" on public.roster_players;
create policy "Admins manage roster" on public.roster_players for all to authenticated using (exists(select 1 from public.admin_users au where au.user_id=auth.uid())) with check (exists(select 1 from public.admin_users au where au.user_id=auth.uid()));
drop policy if exists "Public read homepage news" on public.news_feature;
create policy "Public read homepage news" on public.news_feature for select to anon, authenticated using (true);
drop policy if exists "Admins manage homepage news" on public.news_feature;
create policy "Admins manage homepage news" on public.news_feature for all to authenticated using (exists(select 1 from public.admin_users au where au.user_id=auth.uid())) with check (exists(select 1 from public.admin_users au where au.user_id=auth.uid()));
insert into public.roster_players(slot,player_name,role,bio) values
 (1,'PLAYER ONE','TEAM MEMBER','Player role and profile details will be added when the official roster is announced.'),
 (2,'PLAYER TWO','TEAM MEMBER','Player role and profile details will be added when the official roster is announced.'),
 (3,'PLAYER THREE','TEAM MEMBER','Player role and profile details will be added when the official roster is announced.'),
 (4,'PLAYER FOUR','TEAM MEMBER','Player role and profile details will be added when the official roster is announced.')
 on conflict(slot) do nothing;
insert into public.news_feature(id,title,body,url) values(1,'WHAT’S HAPPENING.','News, announcements and team updates.',null) on conflict(id) do nothing;

-- Allow allowlisted admins to delete Review inbox records.
drop policy if exists "Admins delete review messages" on public.review_messages;
create policy "Admins delete review messages" on public.review_messages for delete to authenticated using (exists(select 1 from public.admin_users au where au.user_id=auth.uid()));

-- Explicit API-role privileges; RLS policies remain the authorization gate.
grant select on public.tournaments, public.results, public.achievements, public.social_links, public.shared_posts, public.roster_players, public.news_feature to anon, authenticated;
grant select, insert, update, delete on public.tournaments, public.results, public.achievements, public.social_links, public.shared_posts, public.roster_players, public.news_feature to authenticated;
grant select, update, delete on public.review_messages to authenticated;
grant select on public.admin_users to authenticated;


-- Management CMS: profiles on the public Management page, editable by allowlisted admins.
create table if not exists public.management_members (
 id uuid primary key default gen_random_uuid(),
 name text not null check (length(trim(name)) between 1 and 80),
 role text not null check (length(trim(role)) between 1 and 80),
 photo_url text check (photo_url is null or photo_url ~ '^https://'),
 instagram_url text check (instagram_url is null or instagram_url ~ '^https://(www\.)?instagram\.com/'),
 email text check (email is null or email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 sort_order integer not null default 0,
 published boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.management_members enable row level security;
drop policy if exists "Public read visible management members" on public.management_members;
create policy "Public read visible management members" on public.management_members for select to anon, authenticated using (published=true);
drop policy if exists "Admins manage management members" on public.management_members;
create policy "Admins manage management members" on public.management_members for all to authenticated using (exists(select 1 from public.admin_users au where au.user_id=auth.uid())) with check (exists(select 1 from public.admin_users au where au.user_id=auth.uid()));
grant select on public.management_members to anon, authenticated;
grant select, insert, update, delete on public.management_members to authenticated;

-- Public profile-photo bucket; writes/deletes restricted to allowlisted Admin accounts.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('management-photos','management-photos',true,5242880,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp','image/gif'];
drop policy if exists "Public view management photos" on storage.objects;
create policy "Public view management photos" on storage.objects for select to anon, authenticated using (bucket_id='management-photos');
drop policy if exists "Admins upload management photos" on storage.objects;
create policy "Admins upload management photos" on storage.objects for insert to authenticated with check (bucket_id='management-photos' and exists(select 1 from public.admin_users au where au.user_id=auth.uid()));
drop policy if exists "Admins update management photos" on storage.objects;
create policy "Admins update management photos" on storage.objects for update to authenticated using (bucket_id='management-photos' and exists(select 1 from public.admin_users au where au.user_id=auth.uid())) with check (bucket_id='management-photos' and exists(select 1 from public.admin_users au where au.user_id=auth.uid()));
drop policy if exists "Admins delete management photos" on storage.objects;
create policy "Admins delete management photos" on storage.objects for delete to authenticated using (bucket_id='management-photos' and exists(select 1 from public.admin_users au where au.user_id=auth.uid()));
