-- Dominx CMS image support migration (additive / safe to re-run)
alter table public.shared_posts add column if not exists image_url text;
alter table public.news_feature add column if not exists image_url text;
alter table public.results add column if not exists image_url text;
alter table public.achievements add column if not exists image_url text;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('cms-images','cms-images',true,5242880,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp','image/gif'];
drop policy if exists "Public read cms images" on storage.objects;
create policy "Public read cms images" on storage.objects for select to anon, authenticated using (bucket_id='cms-images');
drop policy if exists "Admins upload cms images" on storage.objects;
create policy "Admins upload cms images" on storage.objects for insert to authenticated with check (bucket_id='cms-images' and exists(select 1 from public.admin_users au where au.user_id=auth.uid()));
drop policy if exists "Admins update cms images" on storage.objects;
create policy "Admins update cms images" on storage.objects for update to authenticated using (bucket_id='cms-images' and exists(select 1 from public.admin_users au where au.user_id=auth.uid())) with check (bucket_id='cms-images' and exists(select 1 from public.admin_users au where au.user_id=auth.uid()));
drop policy if exists "Admins delete cms images" on storage.objects;
create policy "Admins delete cms images" on storage.objects for delete to authenticated using (bucket_id='cms-images' and exists(select 1 from public.admin_users au where au.user_id=auth.uid()));
