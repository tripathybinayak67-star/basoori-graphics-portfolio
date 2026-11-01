================================================================================
BASOORI GRAPHICS — FULL-STACK MINECRAFT CREATIVE PORTFOLIO & ADMIN STUDIO
Complete Beginner-Friendly Deployment, Administration, Developer & Security Guide
================================================================================

Welcome to the official production package for BASOORI GRAPHICS!
This archive contains the complete React + TypeScript + Vite + Tailwind CSS source
code, Netlify Serverless Functions, Supabase PostgreSQL schema, and your latest
customized portfolio data.

--------------------------------------------------------------------------------
PART A: HOSTING YOUR WEBSITE FOR FREE (STEP-BY-STEP FOR BEGINNERS)
--------------------------------------------------------------------------------
IMPORTANT HONESTY NOTE ON FREE TIERS:
GitHub, Netlify, and Supabase all offer generous free starter tiers suitable for
launching and running a portfolio website at ₹0/month. However, no cloud provider
offers "unlimited" free resources forever—Netlify's free tier includes 100GB
bandwidth/month and 300 build minutes/month, and Supabase's free tier includes
500MB database space and 1GB file storage (and pauses after 7 days of total
inactivity unless pinged). If your agency scales to millions of monthly visitors,
paid upgrades may apply in the future.

STEP 1: CREATE A GITHUB ACCOUNT
1. Visit https://github.com and click "Sign up".
2. Enter your email, create a strong password, and verify your account.

STEP 2: UPLOAD THIS PROJECT TO GITHUB
1. Extract "BASOORI-GRAPHICS-WEBSITE.zip" to a folder on your computer.
2. On GitHub, click the "+" icon in the top-right corner and select "New repository".
3. Name it "basoori-graphics-portfolio", set it to "Private" (recommended), and
   click "Create repository".
4. Click "uploading an existing file" on the setup screen, drag and drop all extracted
   project files/folders into the browser window, and click "Commit changes".
   (Alternatively, run: git init && git add . && git commit -m "Initial commit" && git push)

STEP 3: CREATE A NETLIFY ACCOUNT & CONNECT GITHUB
1. Visit https://www.netlify.com and click "Sign up" -> "Sign up with GitHub".
2. Authorize Netlify to access your GitHub account.

STEP 4: DEPLOY THE WEBSITE ON NETLIFY
1. Inside Netlify Dashboard, click "Add new site" -> "Import an existing project".
2. Choose "GitHub" and select your "basoori-graphics-portfolio" repository.
3. Netlify will automatically read "netlify.toml":
   - Build command: npm run build
   - Publish directory: dist
   - Functions directory: netlify/functions
4. Click "Deploy basoori-graphics-portfolio". Within ~60 seconds your site is live!

STEP 5: SET UP SUPABASE (PERSISTENT CLOUD DATABASE & STORAGE)
1. Go to https://supabase.com and sign up with GitHub.
2. Click "New Project", name it "basoori-graphics-db", and save your Database Password.
3. Once created, open the "SQL Editor" tab on the left sidebar.
4. Open the file "supabase/schema.sql" from this ZIP, copy all SQL code, paste it
   into the Supabase SQL Editor, and click "Run".
5. Go to "Storage" in Supabase -> click "New bucket" -> name it "portfolio-media"
   and toggle "Public bucket" ON so visitors can view your uploaded thumbnails.

STEP 6: CONFIGURE ENVIRONMENT VARIABLES IN NETLIFY
1. In Supabase, go to "Project Settings" -> "API" to copy your:
   - Project URL (VITE_SUPABASE_URL)
   - anon public key (VITE_SUPABASE_ANON_KEY)
   - service_role secret key (SUPABASE_SERVICE_ROLE_KEY — NEVER put this in frontend!)
2. In Netlify, go to "Site configuration" -> "Environment variables" -> "Add a variable":
   - VITE_SUPABASE_URL = your_supabase_project_url
   - VITE_SUPABASE_ANON_KEY = your_supabase_anon_public_key
   - SUPABASE_SERVICE_ROLE_KEY = your_supabase_service_role_secret
   - ADMIN_MASTER_PASSWORD = choose_a_strong_secret_password
   - JWT_SECRET = any_long_random_64_character_secret_string
   - YOUTUBE_DATA_API_KEY = optional_google_cloud_youtube_v3_api_key
3. Trigger a redeploy in Netlify ("Deploys" -> "Trigger deploy").

STEP 7: CONNECTING A CUSTOM DOMAIN LATER (OPTIONAL)
1. If you buy a domain (e.g., basoorigraphics.com from Namecheap, GoDaddy, or Hostinger),
   open Netlify -> "Domain management" -> "Add a domain".
2. Copy the Netlify DNS nameservers shown and paste them into your domain registrar's
   Nameservers setting. Netlify automatically provisions a free HTTPS SSL certificate.

--------------------------------------------------------------------------------
PART B: UPDATING YOUR WEBSITE USING THE VISUAL ADMIN STUDIO
--------------------------------------------------------------------------------
1. OPENING ADMIN STUDIO:
   - Press "Ctrl + Shift + B" anywhere on your website, OR
   - Type "/admin" into the portfolio search bar, OR
   - Triple-click the subtle obsidian cube icon in the footer.
   - Enter your Admin Password to unlock the 11-tab Visual Admin Studio.

2. ADDING PORTFOLIO PROJECTS (3 METHODS):
   - Open Tab 2 ("Portfolio Manager").
   - Method 1: Upload an image directly from your device.
   - Method 2: Paste a direct image or Imgur link.
   - Method 3: Paste ANY YouTube video URL (watch?v=, youtu.be/, /shorts/, or 11-char ID).
     The studio automatically extracts the video ID, lets you choose resolution
     (MaxRes 1080p, SD, HQ), previews the thumbnail, and saves it.

3. FETCHING YOUTUBE CHANNEL LOGOS FOR CLIENTS & REVIEWS:
   - In Tab 3 (Reviews) or Tab 4 (Clients), paste a YouTube channel URL or @handle
     and click "Fetch Channel Logo". If YOUTUBE_DATA_API_KEY is configured, the serverless
     function queries the official YouTube Data API v3; otherwise it resolves via public
     avatar gateways or lets you upload/paste a manual logo.

4. VERIFYING COMMUNITY REVIEWS:
   - Public visitors can submit reviews via the "POST A REVIEW" button.
   - All public submissions are labeled "UNVERIFIED COMMUNITY POST".
   - Inside Tab 3 ("Reviews & Verified Badges"), click the "Verify Client" toggle
     on any review to grant the gleaming emerald "✔ VERIFIED CLIENT" badge.

5. EDITING PRICING (₹), COLORS, STATS & CONTACT LINKS:
   - Tab 5: Edit ₹ prices, plan names, features, and popular badges.
   - Tab 6: Edit your achievement counters and toggle the disclaimer.
   - Tab 7: Customize primary/secondary accent colors, border styles, and section visibility.
   - Tab 8: Update your Discord username/invite and Instagram DM links.
   - All changes saved to Supabase / Admin Studio take effect immediately without
     needing to edit code or redeploy!

6. BACKUP & RESTORE:
   - Open Tab 10 ("Backup & Restore") to download a complete ".json" snapshot of your
     entire website anytime, or restore from a previous backup file.

--------------------------------------------------------------------------------
PART C: DEVELOPER CUSTOMIZATION & PROJECT ARCHITECTURE
--------------------------------------------------------------------------------
FOLDER STRUCTURE:
├── index.html                  # SEO meta tags, Google Fonts, root mount
├── package.json                # Dependencies & build scripts
├── vite.config.ts              # Vite bundler config
├── tailwind.config.js          # Minecraft color tokens & animations
├── netlify.toml                # SPA redirects & Serverless Functions routing
├── .env.example                # Environment variable template (no real secrets)
├── supabase/
│   └── schema.sql              # Complete PostgreSQL tables & RLS policies
├── netlify/
│   └── functions/
│       ├── auth.ts             # Server-side password verification & JWT issuer
│       ├── api.ts              # Authenticated admin writes & public review handler
│       └── youtube-channel.ts  # Official YouTube Data API v3 logo resolver
└── src/
    ├── main.tsx                # Application bootstrap
    ├── App.tsx                 # Main application & Visual Admin Studio
    └── data/defaultState.json  # Your exported state snapshot

--------------------------------------------------------------------------------
PART D: SECURITY BEST PRACTICES
--------------------------------------------------------------------------------
1. NEVER place SUPABASE_SERVICE_ROLE_KEY or ADMIN_MASTER_PASSWORD inside frontend
   code or variables starting with VITE_. Keep them strictly in Netlify Environment
   Variables so only "netlify/functions/*" can read them.
2. Row Level Security (RLS) is enabled in "supabase/schema.sql" so anonymous public
   visitors can only READ portfolio data and INSERT unverified community reviews
   (with verified forced to false).
3. Export a JSON backup in Tab 10 before running bulk imports or restores.
================================================================================