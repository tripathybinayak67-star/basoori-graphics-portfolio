================================================================================
   BINAYAK.DESIGN — HIGH-CTR THUMBNAIL & GRAPHICS PORTFOLIO WEBSITE (v2)
   Complete Guide: Free Netlify Hosting, Adding Content & Full Customization
================================================================================

WHAT IS INSIDE THIS ZIP PACKAGE?
--------------------------------------------------------------------------------
1. index.html  --> Main website structure, interactive CTR Lab, Discord &
                   Instagram Order Hub Modal, and Review Modals.
2. styles.css  --> Modern dark-glass styling, Discord/Instagram gradients,
                   animations, and responsive grid.
3. config.js   --> YOUR CENTRAL DATA FILE! (Contains your profile, Discord ID,
                   Instagram handle/link, CTR/Views stats, portfolio thumbnails,
                   INR plans, & reviews).
4. app.js      --> Interactive engine, YouTube Feed Simulator, Public Review
                   system, Discord/IG clipboard helper, and your built-in
                   "Owner Visual Admin Studio".
5. readme.txt  --> This step-by-step hosting & customization manual.


================================================================================
PART 1: HOW TO HOST THIS WEBSITE FOR FREE ON NETLIFY (TAKES 60 SECONDS!)
================================================================================

OPTION A: Instant Drag-and-Drop (Easiest — No coding or Git required)
--------------------------------------------------------------------------------
1. Extract (Unzip) this folder onto your PC so you have the folder containing
   `index.html`, `styles.css`, `config.js`, `app.js`, and `readme.txt`.
2. Go to https://app.netlify.com/ and sign up / log in for free.
3. In your Netlify dashboard, click on "Sites" in the left sidebar.
4. Drag and drop your extracted folder directly into the dashed box that says
   "Drag and drop your site output folder here" (or use https://app.netlify.com/drop).
5. Within 5 seconds, your website will be LIVE with a free HTTPS link!
6. To change your website link name:
   - Click "Site configuration" -> "Change site name"
   - Type something like `binayak-designs` -> Your URL becomes:
     `https://binayak-designs.netlify.app`


OPTION B: Auto-Updating via GitHub (Best if you update very frequently)
--------------------------------------------------------------------------------
1. Create a free account at https://github.com/ and create a new repository.
2. Upload these files to your GitHub repository.
3. In Netlify, click "Add new site" -> "Import an existing project" -> "GitHub".
4. Select your repository and click "Deploy".
5. Now, whenever you edit `config.js` on GitHub or upload a new thumbnail image,
   Netlify will automatically update your live site in 10 seconds!


================================================================================
PART 2: HOW TO SET YOUR DISCORD & INSTAGRAM + CUSTOMIZE EVERYTHING
================================================================================

We built TWO ways for you to update your Discord & Instagram links, add
thumbnails, add verified reviews, update your CTR/Views stats, or change your
INR pricing plans:

METHOD 1: Using the Built-In "Owner Visual Admin Studio" (NO CODING!)
--------------------------------------------------------------------------------
1. Open your website in your browser.
2. Click the floating button in the bottom-left corner:
   [ ⚙️ Customize / Admin Studio ] (or press Shift + A on your keyboard).
3. Enter your Admin PIN.
   - Default PIN is: 2026
   - (You can change this PIN inside `config.js` under `adminPin`).
4. Inside the Visual Admin Studio, you have 5 tabs:
   - [🖼 Portfolio Works]: Add new thumbnails (paste an image link or local file
     path, set the CTR %, Views Generated, Category, and breakdown) or delete old ones.
   - [⭐ Reviews & Verified Badges]:
     * Add reviews from your side with "✅ Yes — Show Official Verified Badge"
       selected so they display the blue "Verified Client ✔" badge!
     * Or click "✔ Verify" next to any public user review to grant them a
       Verified Client badge!
   - [📈 CTR & Views Stats]: Update your Total Views Generated, Average CTR Boost,
     Thumbnails Delivered, and Creator Revenue Impact numbers.
   - [₹ INR Pricing Plans]: Edit your plan names, ₹ INR prices, badges, and
     bullet-point features.
   - [🎨 Discord, IG & Brand]:
     * Set your Discord Username (e.g. `binayak.design`) and optional Discord
       Server Invite / Profile URL.
     * Set your Instagram Handle (e.g. `@binayak.design`) and full Instagram URL.
     * Pick new Neon Accent Colors with a visual color picker!
5. MAKING YOUR CHANGES PERMANENT FOR ALL VISITORS:
   - Click the button at the top of the Admin Studio:
     [ 💾 Download Updated config.js ]
   - Replace the old `config.js` file in your computer's website folder with
     this newly downloaded `config.js`.
   - Drag and drop your folder into Netlify -> "Deploys" tab to update your
     live site for the whole world!


METHOD 2: Editing `config.js` Directly in Notepad / VS Code
--------------------------------------------------------------------------------
1. Right-click `config.js` and open it with Notepad or VS Code.
2. At the top under `profile`, edit:
   - `discordUsername`: Your Discord username (copied with 1 click when clients
     click the Discord button).
   - `discordInviteUrl`: Your Discord server invite or `https://discord.com/users/YOUR_ID`.
   - `instagramHandle`: Your `@handle`.
   - `instagramUrl`: Your `https://instagram.com/yourhandle` link.


================================================================================
PART 3: HOW THE DISCORD & INSTAGRAM ORDER HUB WORKS FOR CLIENTS
================================================================================
- In the Navbar & Hero section, visitors have dedicated **🎮 Discord** and
  **📸 Instagram** buttons.
- Clicking any **₹ INR Plan** opens the interactive **Order via Discord or
  Instagram Modal**, which pre-fills a custom project brief for that exact plan
  (e.g., *"Hey Binayak! I want to order the Creator Growth Pack (₹3,499)..."*).
- With one click, the client copies the brief + your Discord ID or opens your
  Instagram DM with the brief already copied to their clipboard!
================================================================================
