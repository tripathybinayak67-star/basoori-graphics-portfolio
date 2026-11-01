================================================================================
BASOORI GRAPHICS — CLOUDFLARE PAGES DEPLOYMENT & ADMIN GUIDE (v3.6.1)
================================================================================

This package is migrated from Netlify to Cloudflare Pages. The React/Vite design
and content structure are retained. Netlify Functions have been replaced with a
Cloudflare Pages Function at /api. Supabase remains the persistent database.

FEATURES RETAINED
--------------------------------------------------------------------------------
- React + Vite portfolio frontend and existing design/content.
- Supabase portfolio-state loading and persistence.
- Admin Studio login with a 12-hour signed session token.
- Admin state saves through a server-side Cloudflare Function.
- Public community review submission and persistence in Supabase.
- YouTube Data API channel lookup (when its key is configured).
- GitHub-connected automatic deployments and a permanent *.pages.dev URL.

IMPORTANT SECURITY NOTICE
--------------------------------------------------------------------------------
The credentials previously pasted into chat must be treated as compromised.
Before production use, rotate/revoke the Supabase service-role key, YouTube API
key, admin password and JWT secret. Do not paste private keys into source files,
GitHub, VITE_ variables, or this README.

A VITE_ variable is bundled into browser JavaScript and is public. Only the
Supabase anon/publishable key belongs in VITE_SUPABASE_ANON_KEY. The
SUPABASE_SERVICE_ROLE_KEY, ADMIN_STUDIO_PASSWORD, JWT_SECRET and YOUTUBE_API_KEY
must be configured as Cloudflare server-side secrets.

PART A — PREPARE THE SUPABASE DATABASE
--------------------------------------------------------------------------------
1. Open your Supabase project: https://supabase.com/dashboard
2. Open SQL Editor -> New query.
3. Paste the complete contents of supabase/schema.sql and run it.
4. This creates basoori_site_state and permits public SELECT only. Writes are
   performed by the Cloudflare Function with the service-role key. This is
   intentional; do not add public INSERT/UPDATE policies to this table.
5. Copy the project URL. It should look like:
   https://YOUR_PROJECT_REF.supabase.co
   Do not append /rest/v1/; the app normalizes it if you accidentally do.
6. Copy the anon/publishable key for the Vite frontend.
7. Create a NEW service-role/secret key after rotating the exposed old one.

PART B — PUSH THE MIGRATED PROJECT TO GITHUB
--------------------------------------------------------------------------------
1. Extract BASOORI-GRAPHICS-CLOUDFLARE.zip.
2. Upload the CONTENTS of the extracted folder to the root of your existing
   GitHub repository, replacing the old Netlify version. Keep the folder tree.
3. Confirm the repository root contains:
   - package.json
   - vite.config.ts
   - index.html
   - src/
   - functions/api.ts
   - public/_routes.json
   - supabase/schema.sql
4. The old netlify.toml and netlify/ directory are no longer required.
5. Commit and push to your production branch (usually main).

PART C — CREATE THE FREE CLOUDFLARE PAGES SITE
--------------------------------------------------------------------------------
1. Sign in at https://dash.cloudflare.com/ and open Workers & Pages.
2. Select Create application -> Pages -> Connect to Git.
3. Authorize GitHub and select your BASOORI GRAPHICS repository.
4. Use these build settings:

   Project name:          basoori-graphics
   Production branch:     main (or your actual default branch)
   Framework preset:      React (Vite), if offered
   Root directory:        / (repository root; leave blank if default)
   Build command:         npm run build
   Build output directory: dist

5. Add the build-time variables before the first build (see Part D).
6. Click Save and Deploy.
7. Your permanent site URL will be:
   https://basoori-graphics.pages.dev
   If that project name is already taken, Cloudflare will require another
   available project name and the URL will use that name instead.

PART D — CONFIGURE ENVIRONMENT VARIABLES AND SECRETS
--------------------------------------------------------------------------------
Cloudflare dashboard -> Workers & Pages -> basoori-graphics -> Settings.
Configure BOTH Production and Preview environments if you use preview builds.

BUILD-TIME VARIABLES
Set these under Settings -> Builds & deployments -> Environment variables
(or the build environment variables section shown for your Pages project):

   VITE_SUPABASE_URL       https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_ANON_KEY  YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY

These two values are included in the public frontend build. The anon key is
intended for browser use and must be protected by Supabase RLS policies.

RUNTIME FUNCTION VARIABLES / SECRETS
Set these under Settings -> Variables and Secrets for the Pages project:

   SUPABASE_URL             https://YOUR_PROJECT_REF.supabase.co
   SUPABASE_SERVICE_ROLE_KEY  [ENCRYPTED SECRET]
   ADMIN_STUDIO_PASSWORD     [ENCRYPTED SECRET: choose a new strong password]
   JWT_SECRET                [ENCRYPTED SECRET: random 32+ byte value]
   YOUTUBE_API_KEY           [ENCRYPTED SECRET: optional]

Mark SUPABASE_SERVICE_ROLE_KEY, ADMIN_STUDIO_PASSWORD, JWT_SECRET and
YOUTUBE_API_KEY as encrypted Secrets. SUPABASE_URL is not a password and can be
stored as a normal runtime variable. Do not add private keys with a VITE_ prefix.

After adding/changing VITE_ build variables, trigger a new deployment because
they are read during the Vite build. Runtime Function secrets are read by the
server function at request time; save them before testing the endpoints.

PART E — VERIFY THE DEPLOYMENT
--------------------------------------------------------------------------------
1. Open https://basoori-graphics.pages.dev (or your actual pages.dev URL).
2. Check the homepage, portfolio cards, images, animations and navigation.
3. Open the Admin Studio using the existing secret shortcut/hash configured by
   the site. The default hash trigger is #admin-studio unless changed in data.
4. Log in using the NEW ADMIN_STUDIO_PASSWORD configured in Cloudflare.
5. Change a harmless item and save. Refresh the page and confirm the change
   persists. This tests JWT auth, the Pages Function and Supabase service role.
6. Submit a test community review. Confirm it appears and remains after refresh.
7. Test YouTube channel lookup. It requires a valid YouTube Data API key; without
   it, the frontend intentionally falls back to a generated avatar.

PART F — UPDATING THE SITE LATER
--------------------------------------------------------------------------------
1. Edit files or content in your GitHub repository.
2. Commit and push to the configured production branch.
3. Cloudflare Pages automatically builds and publishes the update.
4. Other branches create preview deployments (depending on branch controls).

LOCAL DEVELOPMENT
--------------------------------------------------------------------------------
Frontend only:
   npm install
   npm run dev

Build check:
   npm run build

To test Pages Functions locally, use Wrangler Pages dev after building:
   npx wrangler pages dev dist

Create a local .dev.vars file in the repository root for local Functions secrets.
Never commit .dev.vars. Example keys (use your own local test values):
   SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=YOUR_LOCAL_TEST_SERVICE_ROLE_KEY
   ADMIN_STUDIO_PASSWORD=YOUR_LOCAL_TEST_PASSWORD
   JWT_SECRET=YOUR_LOCAL_RANDOM_SECRET
   YOUTUBE_API_KEY=YOUR_OPTIONAL_TEST_KEY

TROUBLESHOOTING
--------------------------------------------------------------------------------
- Admin login says authentication is not configured:
  Check ADMIN_STUDIO_PASSWORD and JWT_SECRET under Pages runtime Variables and
  Secrets, and make sure they are configured for Production.
- Admin login works but saves fail:
  Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY; then confirm the SQL schema
  has been applied to the same Supabase project.
- Portfolio loads defaults instead of saved data:
  Check VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY and the public SELECT policy.
  Rebuild after changing VITE_ values.
- Community review fails:
  Check the Pages Function and Supabase runtime credentials. Public review
  submissions are validated and written server-side; no Netlify Forms are used.
- YouTube lookup falls back to an avatar:
  Add a valid YOUTUBE_API_KEY runtime secret and verify YouTube Data API v3 is
  enabled in Google Cloud.
- A Pages Function daily request limit is reached:
  Static asset routes are excluded from Function invocation by public/_routes.json.
  Only /api requests invoke the Function. Cloudflare Free Pages Functions use
  the Workers Free request allowance, so keep API traffic within the free quota.

CLOUDFLARE DOCUMENTATION
--------------------------------------------------------------------------------
Pages Git deployment: https://developers.cloudflare.com/pages/get-started/git-integration/
Pages Functions routing: https://developers.cloudflare.com/pages/functions/routing/
Pages Functions secrets: https://developers.cloudflare.com/pages/functions/bindings/
Pages limits: https://developers.cloudflare.com/pages/platform/limits/

================================================================================
END OF GUIDE
================================================================================
