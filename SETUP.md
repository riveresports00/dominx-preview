# DOMINX ESPORTS CMS — Setup

## Included
- Existing Dominx site with its original logo and banner
- Separate roster and competitive pages
- Competitive hub reads tournaments/results/achievements from Supabase when configured
- Admin login and tournament create/edit/delete/publish controls
- Each event automatically shows a REGISTER NOW button using that event's registration_url
- Status controls: upcoming/live/closed/completed/postponed

## Backend setup required for persistent CMS
1. Create a Supabase project at https://supabase.com/ (the website ZIP does not create an online backend).
2. Open the project SQL Editor and execute `schema.sql`.
3. In Supabase Authentication, create your admin user and enable email/password sign-in.
4. Copy the Project URL and anon/public key from Project Settings > API. Paste them in `config.js`. Never place a service-role key in website files.
5. Restrict CMS writes with the included `admin_users` allowlist: copy the admin account UUID from Authentication > Users, then add that UUID into `public.admin_users` in the SQL editor. The included policies only allow allowlisted UUIDs to create/update/delete. Do not invite accounts as admins unless you trust them.
6. Deploy the static site to your host. Admin URL is `/admin.html`.

## Tournament form
Fields: title, game, status, event date, slots, prize pool, poster image URL, registration URL, description, published checkbox. The registration URL is stored per tournament. Public event cards create a Register Now link automatically when status is Upcoming/Live and a URL exists. Completed events show View Results; closed/postponed are non-registerable.

## Admin security
- Do not publish the Supabase service-role/secret key in `config.js`.
- The included SQL uses an `admin_users` allowlist table. Only user IDs added to this table can write CMS records. Keep this list limited to trusted admins.
- For local static preview, public data uses an empty fallback; the admin panel will not allow fake local-only login or write actions.

## Preview
Run from this folder: `python -m http.server 8080` then open `http://localhost:8080`.
