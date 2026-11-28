# DOMINX ESPORTS CMS setup

This package retains the existing public website pages and extends the Admin panel for the supported CMS areas. No Supabase keys are included.

## Before setup
1. Create a Supabase project.
2. Supabase SQL Editor: run the entire `schema.sql` once. This creates/updates the tournament, results, achievements, social links, shared posts and review-message tables, RLS policies, Review RPC functions, and the Management profiles table plus public photo bucket/policies. If you already ran an earlier schema version, run this updated schema as a migration in SQL Editor; named policies are recreated and new CMS tables/functions are added. Existing Review messages stored only in localStorage are not migrated.
3. In Authentication > Users, create the owner/admin account and enable email/password login.
4. Copy Project URL and anon/public key into `config.js`. Never put a service-role/secret key into the website.
5. Add your admin UUID from Auth > Users into the allowlist with: `insert into public.admin_users (user_id) values ('YOUR-UUID') on conflict do nothing;`
6. Host the static files. Open `/admin.html` and sign in. Management photo uploads use the `management-photos` Storage bucket created by `schema.sql`.

## Admin sections
- Tournaments: add/edit/delete, event date, game, status, slots, prize, poster URL, registration URL, description and publish visibility.
- Results: add/edit/delete result rows.
- Achievements: add/edit/delete milestones.
- Social Links: edit six official links (Instagram, Discord, YouTube, X, WhatsApp, Facebook). Homepage icon destinations and Social page channel list read these values.
- Share Updates / Links: create, edit, delete and publish update cards with title, description, and optional external HTTPS link. Published posts appear on the Social page.
- Review Inbox: read submitted visitor questions, reply, and delete messages.
- Roster: edit the four existing lineup slots (name, role, bio and optional HTTPS profile link).
- Homepage News: edit featured headline, description and optional HTTPS link. Visitors see replies only through their per-device conversation token. Review submissions are online when configured; without Supabase they remain device-local.
- Management: add/edit/delete members, upload a profile image (JPG/PNG/WEBP/GIF, max 5 MB), free-text role, optional Instagram URL and email, display order, and show/hide profiles. Public profiles appear on `management.html`; Instagram and mail icons open their respective links. The homepage Community section has a 7th Management tile.

## Security
- Admin table writes use allowlisted user UUIDs.
- Public users can read published tournaments, results, achievements, social links and published share posts.
- Review messages are not publicly selectable. Public submissions and token-scoped reply retrieval use RPC functions. Replies and message reads in Admin require an allowlisted authenticated user.
- Keep the allowlist limited to trusted accounts. Do not share admin passwords.

## Limitations
- The package's public social-link updater requires Supabase configuration; otherwise the original hard-coded links remain as a fallback.
- Social-page content cards use fallback placeholders if no published updates are available or Supabase is unconfigured.
- Online Review depends on running the SQL and adding the admin UUID. Local-only conversations cannot be migrated automatically.
- Browser visual/click testing with a real Supabase project is still required before launch.

## Local preview
Run `python -m http.server 8080` in the site directory, then visit `http://localhost:8080`.
