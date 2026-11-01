================================================================================
BASOORI GRAPHICS — COMPLETE DEPLOYMENT, ADMIN & DEVELOPER GUIDE (v3.6.0)
================================================================================

PART A: HOSTING FOR FREE ON GITHUB + NETLIFY + SUPABASE
--------------------------------------------------------------------------------
1. UNZIPPING & UPLOADING TO GITHUB:
   - Unzip BASOORI-GRAPHICS-WEBSITE.zip into a folder on your PC.
   - IMPORTANT: Make sure the root of your GitHub repository contains:
     * package.json
     * vite.config.ts
     * tailwind.config.js
     * postcss.config.js
     * tsconfig.json
     * netlify.toml
     * index.html
     * src/main.tsx
     * src/App.tsx
     * src/index.css
     * src/types.ts
     * src/data/defaultData.ts
     * src/services/api.ts
     * netlify/functions/api.ts
     * supabase/schema.sql
   - Tip: If you drag-and-drop into GitHub's web uploader, drag the entire folder
     structure at once so `src/App.tsx` stays inside `src/`.

2. CONNECTING GITHUB TO NETLIFY:
   - Log into https://app.netlify.com -> "Add new site" -> "Import an existing project".
   - Select your GitHub repository.
   - Netlify reads `netlify.toml` automatically:
     * Build command: npm run build
     * Publish directory: dist
     * Functions directory: netlify/functions
   - Click "Deploy site".

3. SETTING UP FREE SUPABASE PERSISTENCE:
   - Create a free project at https://supabase.com
   - Open "SQL Editor" -> Paste the contents of `supabase/schema.sql` -> Click "Run".
   - In Netlify -> Site Configuration -> Environment Variables, add:
     * VITE_SUPABASE_URL
     * VITE_SUPABASE_ANON_KEY
     * SUPABASE_SERVICE_ROLE_KEY
     * ADMIN_STUDIO_PASSWORD (default: basoori2026)
     * JWT_SECRET (any random string)
     * YOUTUBE_API_KEY (optional, for live YouTube Data API v3 channel logo fetching)

PART B: HOW TO OPEN THE SECRET VISUAL ADMIN STUDIO
--------------------------------------------------------------------------------
- Keyboard Shortcut: Press Ctrl + Shift + B anywhere on the website.
- Search Bar Trigger: Type `/admin` into the Portfolio Search bar.
- URL Hash Trigger: Navigate to `https://your-site.netlify.app/#admin-studio`
- Footer Trigger: Triple-click the small obsidian cube in the bottom-left footer.
- Default Password: basoori2026


VITE_SUPABASE_URL=https://qgvrizxyxtkkjkkdocnp.supabase.co/rest/v1/
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFndnJpenh5eHRra2pra2RvY25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1MzY0OTIsImV4cCI6MjEwOTExMjQ5Mn0.KFc1kyjIM_S5mnHOqiyYAwgxkWTyWnjzm2vh1eftvxs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFndnJpenh5eHRra2pra2RvY25wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzUzNjQ5MiwiZXhwIjoyMTA5MTEyNDkyfQ.v1AzFHw9JageYMHRY5BpKCx1-cbwG9pocSpfQRjL-bk

ADMIN_STUDIO_PASSWORD=Androgamer1@
JWT_SECRET=bdjairiajgkoeiqwjdnioperiopijimk
YOUTUBE_API_KEY=AIzaSyDiQbr5wGYlFyKJGU_hOusMQ71sjPgDveU
