// ============================================================================
// MAIN APPLICATION LOGIC & INTERACTIVE ADMIN STUDIO (app.js)
// Handles rendering, live filtering, YouTube feed preview, CTR calculator,
// Discord & Instagram Order Hub, public review submissions (with Netlify Forms
// + LocalStorage support), and the Owner Admin Studio.
// ============================================================================

(function () {
  const STORAGE_KEY = "binayak_portfolio_custom_state_v2";
  const PUBLIC_REVIEWS_KEY = "binayak_public_submitted_reviews_v2";

  function loadState() {
    const baseConfig = JSON.parse(JSON.stringify(window.PORTFOLIO_CONFIG));
    try {
      const savedCustom = localStorage.getItem(STORAGE_KEY);
      if (savedCustom) {
        return JSON.parse(savedCustom);
      }
      const savedPublicReviews = localStorage.getItem(PUBLIC_REVIEWS_KEY);
      if (savedPublicReviews) {
        const extraReviews = JSON.parse(savedPublicReviews);
        baseConfig.reviews = [...extraReviews, ...baseConfig.reviews];
      }
    } catch (e) {
      console.warn("Storage read fallback:", e);
    }
    return baseConfig;
  }

  let state = loadState();
  let activeCategory = "All";
  let isYouTubeFeedMode = false;
  let adminUnlocked = false;
  let currentAdminTab = "portfolio";

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
  }

  // Toast helper
  window.showToast = function (message) {
    const toast = document.getElementById("live-toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3400);
  };

  // Copy text helper
  function copyTextToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        window.showToast(successMsg);
      }).catch(() => {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    window.showToast(successMsg);
  }

  // Open Contact / Order Modal (with pre-filled plan message for Discord or Instagram DM!)
  window.openContactHub = function (planName, planPriceINR, billingCycle) {
    const p = state.profile;
    const modal = document.getElementById("contact-hub-modal");
    if (!modal) return;

    const customBrief = planName
      ? `Hey ${p.designerName}! I want to order the "${planName}" package (₹${planPriceINR} ${billingCycle}). Here is my channel link & video concept:`
      : `Hey ${p.designerName}! I checked out your thumbnail portfolio and want to commission high-CTR thumbnails for my channel.`;

    document.getElementById("contact-brief-textarea").value = customBrief;
    document.getElementById("hub-discord-handle").textContent = p.discordUsername || "binayak.design";
    document.getElementById("hub-insta-handle").textContent = p.instagramHandle || "@binayak.design";

    const igLink = document.getElementById("hub-insta-open-btn");
    if (igLink) {
      igLink.href = p.instagramUrl || "https://instagram.com/";
    }

    const dcLink = document.getElementById("hub-discord-open-btn");
    if (dcLink) {
      if (p.discordInviteUrl && p.discordInviteUrl.startsWith("http")) {
        dcLink.href = p.discordInviteUrl;
        dcLink.style.display = "inline-flex";
      } else {
        dcLink.style.display = "none";
      }
    }

    modal.classList.add("open");
  };

  // Direct action buttons for Discord & Instagram
  window.copyDiscordAndAlert = function () {
    const p = state.profile;
    const handle = p.discordUsername || "binayak.design";
    copyTextToClipboard(
      handle,
      `🎮 Discord username "${handle}" copied! Paste it in Discord -> Add Friend.`
    );
  };

  window.copyBriefAndOpenInstagram = function () {
    const p = state.profile;
    const briefEl = document.getElementById("contact-brief-textarea");
    const brief = briefEl ? briefEl.value : `Hey ${p.designerName}! I want to order a thumbnail.`;
    copyTextToClipboard(
      brief,
      `📸 Order message copied! Paste it into ${p.instagramHandle}'s Instagram DM.`
    );
    window.open(p.instagramUrl || "https://instagram.com/", "_blank", "noopener");
  };

  window.copyBriefAndDiscord = function () {
    const p = state.profile;
    const briefEl = document.getElementById("contact-brief-textarea");
    const brief = briefEl ? briefEl.value : "";
    const handle = p.discordUsername || "binayak.design";
    copyTextToClipboard(
      handle,
      `🎮 Copied Discord ID "${handle}"! Add friend on Discord & paste your brief.`
    );
    if (p.discordInviteUrl && p.discordInviteUrl.startsWith("http")) {
      window.open(p.discordInviteUrl, "_blank", "noopener");
    }
  };

  // Apply custom theme colors from profile
  function applyTheme() {
    const root = document.documentElement;
    if (state.profile.accentColor) {
      root.style.setProperty("--accent-primary", state.profile.accentColor);
    }
    if (state.profile.secondaryColor) {
      root.style.setProperty("--accent-secondary", state.profile.secondaryColor);
    }
  }

  // Render Header & Hero
  function renderProfileAndHero() {
    const p = state.profile;
    document.getElementById("nav-brand-text").textContent = p.brandName;
    document.getElementById("hero-availability").textContent = p.availabilityText;
    document.getElementById("hero-title").innerHTML = p.heroTitle;
    document.getElementById("hero-subtitle").textContent = p.heroSubtitle;
    document.getElementById("footer-brand").textContent = p.brandName + " — " + p.designerName;

    // Update Hero & Navbar Discord / Instagram buttons
    const heroDiscordLabel = document.getElementById("hero-discord-label");
    if (heroDiscordLabel) {
      heroDiscordLabel.textContent = `🎮 Discord: ${p.discordUsername || "binayak.design"}`;
    }
    const heroInstaBtn = document.getElementById("hero-insta-btn");
    if (heroInstaBtn) {
      heroInstaBtn.href = p.instagramUrl || "https://instagram.com/";
      heroInstaBtn.textContent = `📸 Instagram (${p.instagramHandle || "@binayak.design"})`;
    }
    const navInstaBtn = document.getElementById("nav-insta-btn");
    if (navInstaBtn) {
      navInstaBtn.href = p.instagramUrl || "https://instagram.com/";
    }

    // Hero featured showcase card
    const featuredWork = state.portfolio.find((w) => w.featured) || state.portfolio[0];
    if (featuredWork) {
      document.getElementById("hero-showcase-img").src = featuredWork.image;
      document.getElementById("hero-showcase-ctr").textContent = `🔥 ${featuredWork.ctr} CTR`;
      document.getElementById("hero-showcase-title").textContent = featuredWork.title;
      document.getElementById("hero-showcase-meta").textContent = `${featuredWork.creator} • ${featuredWork.viewsGenerated}`;
    }
  }

  // Render Stats (CTR & Views Generated)
  function renderStats() {
    const grid = document.getElementById("stats-grid");
    if (!grid) return;

    const icons = {
      eye: "👁️",
      "trending-up": "📈",
      layers: "🎨",
      award: "🏆"
    };

    grid.innerHTML = state.stats
      .map(
        (st) => `
      <div class="stat-card">
        <div class="stat-icon-wrap">${icons[st.icon] || "⚡"}</div>
        <div class="stat-value">
          ${st.prefix || ""}${st.value}${st.suffix || ""}
        </div>
        <div class="stat-label">${st.label}</div>
        <div class="stat-subtext">${st.subtext}</div>
      </div>
    `
      )
      .join("");
  }

  // Render Portfolio Categories & Grid
  function renderCategories() {
    const container = document.getElementById("category-pills");
    if (!container) return;

    const cats = state.categories || ["All"];
    container.innerHTML = cats
      .map(
        (cat) => `
      <button class="filter-pill ${cat === activeCategory ? "active" : ""}" data-cat="${cat}">
        ${cat}
      </button>
    `
      )
      .join("");

    container.querySelectorAll(".filter-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCategory = btn.getAttribute("data-cat");
        renderCategories();
        renderPortfolio();
      });
    });
  }

  function renderPortfolio() {
    const grid = document.getElementById("portfolio-grid");
    if (!grid) return;

    grid.className = `portfolio-grid ${isYouTubeFeedMode ? "yt-feed-mode" : ""}`;

    const filtered =
      activeCategory === "All"
        ? state.portfolio
        : state.portfolio.filter((item) => item.category === activeCategory);

    if (filtered.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 48px; color: var(--text-secondary);">No thumbnails in "${activeCategory}" yet. Click "+ Add Work" in Admin Studio to add one!</div>`;
      return;
    }

    grid.innerHTML = filtered
      .map(
        (item) => `
      <article class="portfolio-card" data-id="${item.id}">
        <div class="thumb-box" onclick="window.openLightbox('${item.id}')">
          <img src="${item.image}" alt="${item.title}" loading="lazy" />
          <div class="thumb-badges-top">
            <span class="ctr-pill">⚡ ${item.ctr} CTR</span>
            <span class="views-pill">${item.viewsGenerated}</span>
          </div>
          <span class="yt-duration-badge">${item.duration || "12:40"}</span>
        </div>
        <div class="card-body">
          <div class="card-category">${item.category}</div>
          <h3 class="card-title">${item.title}</h3>
          <p class="card-breakdown">${item.breakdown || ""}</p>
          <div class="card-footer">
            <span>👤 ${item.creator}</span>
            <span style="color: var(--accent-primary); font-weight:700; cursor:pointer;" onclick="window.openLightbox('${item.id}')">Inspect HD →</span>
          </div>
        </div>
      </article>
    `
      )
      .join("");
  }

  // Render Pricing Plans in INR (Now wired directly to Discord & Instagram Order Modal!)
  function renderPlans() {
    const grid = document.getElementById("pricing-grid");
    if (!grid) return;

    grid.innerHTML = state.plans
      .map((plan) => {
        const safeName = plan.name.replace(/'/g, "\'");
        const safePrice = plan.priceINR.replace(/'/g, "\'");
        const safeCycle = plan.billingCycle.replace(/'/g, "\'");

        return `
        <div class="plan-card ${plan.popular ? "popular" : ""}">
          ${plan.badge ? `<span class="plan-badge">${plan.badge}</span>` : ""}
          <h3 class="plan-name">${plan.name}</h3>
          <p class="plan-tagline">${plan.tagline}</p>
          <div class="plan-price-wrap">
            <span class="plan-currency">₹</span>
            <span class="plan-price">${plan.priceINR}</span>
          </div>
          <div class="plan-cycle">${plan.billingCycle}</div>
          <ul class="plan-features">
            ${plan.features
              .map(
                (f) => `
              <li><span class="check-icon">✔</span> <span>${f}</span></li>
            `
              )
              .join("")}
          </ul>
          <button onclick="window.openContactHub('${safeName}', '${safePrice}', '${safeCycle}')" class="btn ${
          plan.popular ? "btn-primary" : "btn-secondary"
        }" style="width:100%; margin-bottom:10px;">
            ⚡ ${plan.ctaText || "Order via Discord / IG"}
          </button>
          <div style="display:flex; justify-content:center; gap:14px; font-size:0.78rem; color:var(--text-muted);">
            <span style="cursor:pointer;" onclick="window.openContactHub('${safeName}', '${safePrice}', '${safeCycle}')">🎮 Discord DM</span>
            <span>•</span>
            <span style="cursor:pointer;" onclick="window.openContactHub('${safeName}', '${safePrice}', '${safeCycle}')">📸 Instagram DM</span>
          </div>
        </div>
      `;
      })
      .join("");
  }

  // Render Reviews (Verified badge only if verified === true)
  function renderReviews() {
    const grid = document.getElementById("reviews-grid");
    const countEl = document.getElementById("reviews-count-text");
    if (!grid) return;

    if (countEl) {
      const verifiedCount = state.reviews.filter((r) => r.verified).length;
      countEl.textContent = `${state.reviews.length} Total Reviews (${verifiedCount} Owner-Verified Clients)`;
    }

    grid.innerHTML = state.reviews
      .map((rev) => {
        const stars = "★".repeat(Number(rev.rating) || 5) + "☆".repeat(5 - (Number(rev.rating) || 5));
        const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          rev.name
        )}&background=ff3366&color=fff&bold=true`;

        const badgeHTML = rev.verified
          ? `<span class="verified-badge" title="Verified Client Review approved by ${state.profile.designerName}">
               <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z"/></svg>
               Verified Client
             </span>`
          : `<span class="unverified-badge" title="Submitted via Public Review Form (Not verified by owner yet)">
               Community Post
             </span>`;

        return `
        <div class="review-card">
          <div class="review-header">
            <div class="reviewer-profile">
              <img class="reviewer-avatar" src="${rev.avatar || avatarFallback}" alt="${rev.name}" onerror="this.src='${avatarFallback}'" />
              <div>
                <div class="reviewer-name-row">
                  <span class="reviewer-name">${rev.name}</span>
                  ${badgeHTML}
                </div>
                <div class="reviewer-role">${rev.role || "Creator"} • ${rev.date || "Recent"}</div>
              </div>
            </div>
            <div class="stars-gold" title="${rev.rating} out of 5 stars">${stars}</div>
          </div>
          ${rev.ctrProof ? `<div class="review-ctr-highlight">📈 ${rev.ctrProof}</div>` : ""}
          <p class="review-comment">"${rev.comment}"</p>
        </div>
      `;
      })
      .join("");
  }

  // Interactive CTR & Revenue Calculator
  function setupInteractiveLab() {
    const baInput = document.getElementById("ba-slider-input");
    const baClip = document.getElementById("ba-before-clip");
    if (baInput && baClip) {
      baInput.addEventListener("input", (e) => {
        baClip.style.width = `${e.target.value}%`;
      });
    }

    const impSlider = document.getElementById("calc-impressions");
    const oldCtrSlider = document.getElementById("calc-old-ctr");
    const newCtrSlider = document.getElementById("calc-new-ctr");

    function updateCalc() {
      if (!impSlider) return;
      const impressions = Number(impSlider.value);
      const oldCtr = Number(oldCtrSlider.value);
      const newCtr = Number(newCtrSlider.value);

      document.getElementById("calc-imp-val").textContent = impressions.toLocaleString("en-IN");
      document.getElementById("calc-old-val").textContent = oldCtr.toFixed(1) + "%";
      document.getElementById("calc-new-val").textContent = newCtr.toFixed(1) + "%";

      const oldViews = Math.round(impressions * (oldCtr / 100));
      const newViews = Math.round(impressions * (newCtr / 100));
      const extraViews = Math.max(0, newViews - oldViews);
      const extraRevenueINR = Math.round((extraViews / 1000) * 120);

      document.getElementById("calc-extra-views").textContent =
        "+" + extraViews.toLocaleString("en-IN");
      document.getElementById("calc-extra-rev").textContent =
        "₹" + extraRevenueINR.toLocaleString("en-IN");
    }

    [impSlider, oldCtrSlider, newCtrSlider].forEach((el) => {
      if (el) el.addEventListener("input", updateCalc);
    });
    updateCalc();
  }

  // Lightbox Modal for HD Thumbnail Inspection
  window.openLightbox = function (id) {
    const item = state.portfolio.find((w) => w.id === id);
    if (!item) return;

    document.getElementById("lightbox-img").src = item.image;
    document.getElementById("lightbox-title").textContent = item.title;
    document.getElementById("lightbox-meta").textContent = `${item.creator} • ${item.category} • ${item.ctr} CTR • ${item.viewsGenerated}`;
    document.getElementById("lightbox-breakdown").textContent = item.breakdown || "";
    document.getElementById("lightbox-modal").classList.add("open");
  };

  // Public Review Submission
  function setupPublicReviewForm() {
    const openBtn = document.getElementById("open-public-review-btn");
    const modal = document.getElementById("public-review-modal");
    const closeBtn = document.getElementById("close-public-review-modal");
    const form = document.getElementById("public-review-form");
    const photoInput = document.getElementById("pub-rev-photo-file");
    let uploadedPhotoDataUrl = "";

    if (openBtn && modal) {
      openBtn.addEventListener("click", () => modal.classList.add("open"));
    }
    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => modal.classList.remove("open"));
    }

    if (photoInput) {
      photoInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (evt) {
          uploadedPhotoDataUrl = evt.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("pub-rev-name").value.trim();
        const role = document.getElementById("pub-rev-role").value.trim() || "YouTube Creator";
        const photoUrlInput = document.getElementById("pub-rev-photo-url").value.trim();
        const rating = Number(document.getElementById("pub-rev-rating").value) || 5;
        const ctrProof = document.getElementById("pub-rev-ctr").value.trim();
        const comment = document.getElementById("pub-rev-comment").value.trim();

        if (!name || !comment) return;

        const finalAvatar =
          uploadedPhotoDataUrl ||
          photoUrlInput ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7000ff&color=fff&bold=true`;

        const newReview = {
          id: "rev-" + Date.now(),
          name,
          role,
          avatar: finalAvatar,
          rating,
          verified: false,
          date: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
          ctrProof: ctrProof || "Community Feedback",
          comment
        };

        state.reviews.unshift(newReview);
        saveState();
        renderReviews();

        try {
          const formData = new FormData(form);
          fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString()
          }).catch(() => {});
        } catch (err) {}

        form.reset();
        uploadedPhotoDataUrl = "";
        modal.classList.remove("open");
        window.showToast("✅ Your review has been posted to the live community feed!");
      });
    }
  }

  // OWNER ADMIN STUDIO
  function setupAdminStudio() {
    const fab = document.getElementById("admin-studio-fab");
    const modal = document.getElementById("admin-studio-modal");
    const closeBtn = document.getElementById("close-admin-modal");

    function openAdmin() {
      if (!adminUnlocked) {
        const pin = prompt(
          `Enter Owner Admin Studio PIN (Default PIN is ${state.profile.adminPin || "2026"}):`
        );
        if (pin !== String(state.profile.adminPin || "2026")) {
          if (pin !== null) alert("Incorrect PIN! Check config.js for your adminPin.");
          return;
        }
        adminUnlocked = true;
      }
      renderAdminStudioContent();
      modal.classList.add("open");
    }

    if (fab) fab.addEventListener("click", openAdmin);
    if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.remove("open"));

    window.addEventListener("keydown", (e) => {
      if (e.shiftKey && e.key.toLowerCase() === "a" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        openAdmin();
      }
    });

    document.querySelectorAll(".admin-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".admin-tab-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentAdminTab = btn.getAttribute("data-tab");
        renderAdminStudioContent();
      });
    });

    const exportBtn = document.getElementById("admin-export-config-btn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const fileContent =
          "// ============================================================================\n" +
          "// PORTFOLIO DATA & CONFIGURATION FILE (config.js)\n" +
          "// Generated via Visual Admin Studio\n" +
          "// Replace your existing config.js with this file and drag-and-drop to Netlify!\n" +
          "// ============================================================================\n\n" +
          "window.PORTFOLIO_CONFIG = " +
          JSON.stringify(state, null, 2) +
          ";\n";

        const blob = new Blob([fileContent], { type: "application/javascript;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "config.js";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }

    const resetBtn = document.getElementById("admin-reset-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (confirm("Reset browser preview back to the original config.js file defaults?")) {
          localStorage.removeItem(STORAGE_KEY);
          location.reload();
        }
      });
    }
  }

  function renderAdminStudioContent() {
    const container = document.getElementById("admin-tab-body");
    if (!container) return;

    if (currentAdminTab === "portfolio") {
      container.innerHTML = `
        <h4 style="margin-bottom:12px;">Add New Thumbnail / Graphic to Portfolio</h4>
        <form id="admin-add-work-form" style="background:rgba(255,255,255,0.03); padding:18px; border-radius:12px; margin-bottom:24px; border:1px solid var(--border-subtle);">
          <div class="form-row-2">
            <div class="form-group">
              <label>Video / Project Title *</label>
              <input type="text" id="aw-title" class="form-control" placeholder="e.g. How I Built a 10M Sub Empire" required />
            </div>
            <div class="form-group">
              <label>Client / Creator Name *</label>
              <input type="text" id="aw-creator" class="form-control" placeholder="e.g. Gaming / Tech Creator" required />
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label>Category *</label>
              <input type="text" id="aw-category" class="form-control" placeholder="e.g. Gaming & Esports" value="Gaming & Esports" required />
            </div>
            <div class="form-group">
              <label>Thumbnail Image URL (or path like images/thumb1.jpg) *</label>
              <input type="text" id="aw-image" class="form-control" placeholder="https://... or images/my-thumb.jpg" required />
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label>CTR Achieved (e.g. 16.2%)</label>
              <input type="text" id="aw-ctr" class="form-control" placeholder="15.8%" value="15.4%" />
            </div>
            <div class="form-group">
              <label>Views Generated (e.g. 3.1M Views)</label>
              <input type="text" id="aw-views" class="form-control" placeholder="2.4M Views" value="1.8M Views" />
            </div>
          </div>
          <div class="form-group">
            <label>Design & Psychology Breakdown</label>
            <input type="text" id="aw-breakdown" class="form-control" placeholder="Brief note on lighting, composition, or CTR hook..." />
          </div>
          <button type="submit" class="btn btn-primary btn-sm">+ Add Thumbnail to Portfolio</button>
        </form>

        <h4 style="margin-bottom:12px;">Existing Portfolio Items (${state.portfolio.length})</h4>
        <div>
          ${state.portfolio
            .map(
              (item, idx) => `
            <div class="admin-list-item">
              <div style="display:flex; align-items:center; gap:12px;">
                <img src="${item.image}" style="width:72px; height:40px; object-fit:cover; border-radius:6px;" />
                <div>
                  <div style="font-weight:700; font-size:0.92rem;">${item.title}</div>
                  <div style="font-size:0.78rem; color:var(--text-secondary);">${item.category} • ${item.ctr} CTR • ${item.viewsGenerated}</div>
                </div>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="window.adminDeleteWork(${idx})" style="color:#ff5c7c;">Delete</button>
            </div>
          `
            )
            .join("")}
        </div>
      `;

      document.getElementById("admin-add-work-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const cat = document.getElementById("aw-category").value.trim();
        if (cat && !state.categories.includes(cat)) {
          state.categories.push(cat);
        }
        state.portfolio.unshift({
          id: "work-" + Date.now(),
          title: document.getElementById("aw-title").value.trim(),
          creator: document.getElementById("aw-creator").value.trim(),
          category: cat,
          image: document.getElementById("aw-image").value.trim(),
          ctr: document.getElementById("aw-ctr").value.trim() || "14.5%",
          viewsGenerated: document.getElementById("aw-views").value.trim() || "1M+ Views",
          duration: "15:20",
          featured: true,
          breakdown: document.getElementById("aw-breakdown").value.trim()
        });
        saveState();
        renderCategories();
        renderPortfolio();
        renderAdminStudioContent();
        window.showToast("🖼 New thumbnail added to portfolio!");
      });
    } else if (currentAdminTab === "reviews") {
      container.innerHTML = `
        <h4 style="margin-bottom:12px;">Add Owner-Verified Client Review (Includes Verified Badge ✔)</h4>
        <form id="admin-add-review-form" style="background:rgba(255,255,255,0.03); padding:18px; border-radius:12px; margin-bottom:24px; border:1px solid var(--border-subtle);">
          <div class="form-row-2">
            <div class="form-group">
              <label>Client Name *</label>
              <input type="text" id="ar-name" class="form-control" placeholder="e.g. Kabir Sharma" required />
            </div>
            <div class="form-group">
              <label>Channel / Role & Subscribers *</label>
              <input type="text" id="ar-role" class="form-control" placeholder="e.g. Gaming Creator (950K Subs)" required />
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label>Client Photo URL (Leave blank for auto-avatar)</label>
              <input type="text" id="ar-avatar" class="form-control" placeholder="https://... or images/client1.jpg" />
            </div>
            <div class="form-group">
              <label>CTR / Views Proof Highlight</label>
              <input type="text" id="ar-proof" class="form-control" placeholder="e.g. CTR jumped from 6% to 15.9%" />
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label>Star Rating (1-5)</label>
              <input type="number" id="ar-rating" class="form-control" min="1" max="5" value="5" />
            </div>
            <div class="form-group">
              <label>Give Verified Client Badge?</label>
              <select id="ar-verified" class="form-control">
                <option value="true" selected>✅ Yes — Show Official Verified Badge</option>
                <option value="false">⚪ No — Show as Unverified Community Post</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Review Text *</label>
            <textarea id="ar-comment" class="form-control" rows="2" placeholder="Client testimonial..." required></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-sm">+ Publish Client Review</button>
        </form>

        <h4 style="margin-bottom:12px;">Manage Reviews & Toggle Verified Badges (${state.reviews.length})</h4>
        <div>
          ${state.reviews
            .map(
              (r, idx) => `
            <div class="admin-list-item">
              <div style="display:flex; align-items:center; gap:12px;">
                <img src="${r.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(r.name)}" style="width:42px; height:42px; border-radius:50%; object-fit:cover;" />
                <div>
                  <div style="font-weight:700; font-size:0.92rem;">
                    ${r.name} 
                    ${
                      r.verified
                        ? `<span style="color:#38b6ff; font-size:0.75rem;">[✔ Verified Badge ON]</span>`
                        : `<span style="color:var(--text-muted); font-size:0.75rem;">[Unverified Public Post]</span>`
                    }
                  </div>
                  <div style="font-size:0.8rem; color:var(--text-secondary);">${r.comment.slice(0, 85)}...</div>
                </div>
              </div>
              <div style="display:flex; gap:8px;">
                <button class="btn btn-secondary btn-sm" onclick="window.adminToggleVerify(${idx})">
                  ${r.verified ? "Remove Badge" : "✔ Verify"}
                </button>
                <button class="btn btn-secondary btn-sm" onclick="window.adminDeleteReview(${idx})" style="color:#ff5c7c;">Delete</button>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `;

      document.getElementById("admin-add-review-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("ar-name").value.trim();
        state.reviews.unshift({
          id: "rev-" + Date.now(),
          name,
          role: document.getElementById("ar-role").value.trim(),
          avatar:
            document.getElementById("ar-avatar").value.trim() ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ff3366&color=fff&bold=true`,
          ctrProof: document.getElementById("ar-proof").value.trim() || "Verified Order",
          rating: Number(document.getElementById("ar-rating").value) || 5,
          verified: document.getElementById("ar-verified").value === "true",
          date: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
          comment: document.getElementById("ar-comment").value.trim()
        });
        saveState();
        renderReviews();
        renderAdminStudioContent();
        window.showToast("⭐ Review added to wall!");
      });
    } else if (currentAdminTab === "stats") {
      container.innerHTML = `
        <h4 style="margin-bottom:12px;">Customize CTR & Views Generated Counters</h4>
        <div id="admin-stats-editor">
          ${state.stats
            .map(
              (st, idx) => `
            <div style="background:rgba(255,255,255,0.03); padding:14px; border-radius:12px; margin-bottom:12px; border:1px solid var(--border-subtle);">
              <div class="form-row-2">
                <div class="form-group">
                  <label>Stat Label #${idx + 1}</label>
                  <input type="text" class="form-control st-label" data-idx="${idx}" value="${st.label}" />
                </div>
                <div class="form-group">
                  <label>Numeric Value (e.g. 145.8)</label>
                  <input type="number" step="0.1" class="form-control st-val" data-idx="${idx}" value="${st.value}" />
                </div>
              </div>
              <div class="form-row-2">
                <div class="form-group">
                  <label>Prefix / Suffix (e.g. + and % or M+)</label>
                  <div style="display:flex; gap:8px;">
                    <input type="text" class="form-control st-prefix" data-idx="${idx}" value="${st.prefix || ""}" placeholder="Prefix" />
                    <input type="text" class="form-control st-suffix" data-idx="${idx}" value="${st.suffix || ""}" placeholder="Suffix" />
                  </div>
                </div>
                <div class="form-group">
                  <label>Subtext Proof</label>
                  <input type="text" class="form-control st-sub" data-idx="${idx}" value="${st.subtext}" />
                </div>
              </div>
            </div>
          `
            )
            .join("")}
          <button id="save-stats-btn" class="btn btn-primary btn-sm">Save Stats Changes</button>
        </div>
      `;

      document.getElementById("save-stats-btn").addEventListener("click", () => {
        document.querySelectorAll(".st-label").forEach((el) => {
          state.stats[Number(el.getAttribute("data-idx"))].label = el.value;
        });
        document.querySelectorAll(".st-val").forEach((el) => {
          state.stats[Number(el.getAttribute("data-idx"))].value = Number(el.value);
        });
        document.querySelectorAll(".st-prefix").forEach((el) => {
          state.stats[Number(el.getAttribute("data-idx"))].prefix = el.value;
        });
        document.querySelectorAll(".st-suffix").forEach((el) => {
          state.stats[Number(el.getAttribute("data-idx"))].suffix = el.value;
        });
        document.querySelectorAll(".st-sub").forEach((el) => {
          state.stats[Number(el.getAttribute("data-idx"))].subtext = el.value;
        });
        saveState();
        renderStats();
        window.showToast("📈 Stats updated live!");
      });
    } else if (currentAdminTab === "plans") {
      container.innerHTML = `
        <h4 style="margin-bottom:12px;">Customize Thumbnail Designing Plans (in ₹ INR)</h4>
        ${state.plans
          .map(
            (p, idx) => `
          <div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:12px; margin-bottom:14px; border:1px solid var(--border-subtle);">
            <div class="form-row-2">
              <div class="form-group">
                <label>Plan Name</label>
                <input type="text" class="form-control pl-name" data-idx="${idx}" value="${p.name}" />
              </div>
              <div class="form-group">
                <label>Price in INR (₹)</label>
                <input type="text" class="form-control pl-price" data-idx="${idx}" value="${p.priceINR}" />
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>Billing Subtitle</label>
                <input type="text" class="form-control pl-cycle" data-idx="${idx}" value="${p.billingCycle}" />
              </div>
              <div class="form-group">
                <label>Top Badge</label>
                <input type="text" class="form-control pl-badge" data-idx="${idx}" value="${p.badge || ""}" />
              </div>
            </div>
            <div class="form-group">
              <label>Features (One feature per line)</label>
              <textarea class="form-control pl-features" data-idx="${idx}" rows="4">${p.features.join("
")}</textarea>
            </div>
          </div>
        `
          )
          .join("")}
        <button id="save-plans-btn" class="btn btn-primary btn-sm">Save INR Pricing Plans</button>
      `;

      document.getElementById("save-plans-btn").addEventListener("click", () => {
        document.querySelectorAll(".pl-name").forEach((el) => {
          state.plans[Number(el.getAttribute("data-idx"))].name = el.value;
        });
        document.querySelectorAll(".pl-price").forEach((el) => {
          state.plans[Number(el.getAttribute("data-idx"))].priceINR = el.value;
        });
        document.querySelectorAll(".pl-cycle").forEach((el) => {
          state.plans[Number(el.getAttribute("data-idx"))].billingCycle = el.value;
        });
        document.querySelectorAll(".pl-badge").forEach((el) => {
          state.plans[Number(el.getAttribute("data-idx"))].badge = el.value;
        });
        document.querySelectorAll(".pl-features").forEach((el) => {
          state.plans[Number(el.getAttribute("data-idx"))].features = el.value
            .split("
")
            .map((s) => s.trim())
            .filter(Boolean);
        });
        saveState();
        renderPlans();
        window.showToast("₹ INR Pricing Plans updated live!");
      });
    } else if (currentAdminTab === "brand") {
      const p = state.profile;
      container.innerHTML = `
        <h4 style="margin-bottom:12px;">Brand Identity, Discord & Instagram Contact Settings</h4>
        <div class="form-row-2">
          <div class="form-group">
            <label>Navbar Brand Name</label>
            <input type="text" id="br-brand" class="form-control" value="${p.brandName}" />
          </div>
          <div class="form-group">
            <label>Your Name</label>
            <input type="text" id="br-name" class="form-control" value="${p.designerName}" />
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>🎮 Your Discord Username (Copied when clients click Discord)</label>
            <input type="text" id="br-discord-user" class="form-control" value="${p.discordUsername || "binayak.design"}" placeholder="e.g. binayak.design" />
          </div>
          <div class="form-group">
            <label>🎮 Discord Server Invite or Profile URL (Optional)</label>
            <input type="text" id="br-discord-url" class="form-control" value="${p.discordInviteUrl || ""}" placeholder="https://discord.gg/yourserver" />
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>📸 Your Instagram Handle</label>
            <input type="text" id="br-insta-handle" class="form-control" value="${p.instagramHandle || "@binayak.design"}" placeholder="@binayak.design" />
          </div>
          <div class="form-group">
            <label>📸 Your Instagram Full Link</label>
            <input type="text" id="br-insta-url" class="form-control" value="${p.instagramUrl || "https://instagram.com/"}" placeholder="https://instagram.com/yourusername" />
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>Primary Accent Color (Hex)</label>
            <input type="color" id="br-color1" class="form-control" style="height:44px;" value="${p.accentColor || "#ff3366"}" />
          </div>
          <div class="form-group">
            <label>Secondary Glow Color (Hex)</label>
            <input type="color" id="br-color2" class="form-control" style="height:44px;" value="${p.secondaryColor || "#7000ff"}" />
          </div>
        </div>
        <div class="form-group">
          <label>Availability Status Pill</label>
          <input type="text" id="br-avail" class="form-control" value="${p.availabilityText}" />
        </div>
        <div class="form-group">
          <label>Hero Headline (HTML allowed for gradient span)</label>
          <input type="text" id="br-hero-title" class="form-control" value="${p.heroTitle.replace(/"/g, "&quot;")}" />
        </div>
        <div class="form-group">
          <label>Hero Subtitle</label>
          <textarea id="br-hero-sub" class="form-control" rows="2">${p.heroSubtitle}</textarea>
        </div>
        <button id="save-brand-btn" class="btn btn-primary btn-sm">Save Discord, Instagram & Brand Settings</button>
      `;

      document.getElementById("save-brand-btn").addEventListener("click", () => {
        state.profile.brandName = document.getElementById("br-brand").value.trim();
        state.profile.designerName = document.getElementById("br-name").value.trim();
        state.profile.discordUsername = document.getElementById("br-discord-user").value.trim();
        state.profile.discordInviteUrl = document.getElementById("br-discord-url").value.trim();
        state.profile.instagramHandle = document.getElementById("br-insta-handle").value.trim();
        state.profile.instagramUrl = document.getElementById("br-insta-url").value.trim();
        state.profile.availabilityText = document.getElementById("br-avail").value.trim();
        state.profile.accentColor = document.getElementById("br-color1").value;
        state.profile.secondaryColor = document.getElementById("br-color2").value;
        state.profile.heroTitle = document.getElementById("br-hero-title").value;
        state.profile.heroSubtitle = document.getElementById("br-hero-sub").value;

        saveState();
        applyTheme();
        renderProfileAndHero();
        renderPlans();
        window.showToast("🎨 Discord, Instagram & Brand settings updated!");
      });
    }
  }

  window.adminDeleteWork = function (idx) {
    if (!confirm("Remove this thumbnail from your portfolio?")) return;
    state.portfolio.splice(idx, 1);
    saveState();
    renderPortfolio();
    renderAdminStudioContent();
  };

  window.adminToggleVerify = function (idx) {
    state.reviews[idx].verified = !state.reviews[idx].verified;
    saveState();
    renderReviews();
    renderAdminStudioContent();
  };

  window.adminDeleteReview = function (idx) {
    if (!confirm("Delete this review?")) return;
    state.reviews.splice(idx, 1);
    saveState();
    renderReviews();
    renderAdminStudioContent();
  };

  function setupViewModeToggle() {
    const gridBtn = document.getElementById("mode-detailed-btn");
    const ytBtn = document.getElementById("mode-yt-btn");
    if (!gridBtn || !ytBtn) return;

    gridBtn.addEventListener("click", () => {
      isYouTubeFeedMode = false;
      gridBtn.classList.add("active");
      ytBtn.classList.remove("active");
      renderPortfolio();
    });

    ytBtn.addEventListener("click", () => {
      isYouTubeFeedMode = true;
      ytBtn.classList.add("active");
      gridBtn.classList.remove("active");
      renderPortfolio();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    renderProfileAndHero();
    renderStats();
    renderCategories();
    renderPortfolio();
    renderPlans();
    renderReviews();
    setupInteractiveLab();
    setupPublicReviewForm();
    setupAdminStudio();
    setupViewModeToggle();

    // Lightbox close
    const lbClose = document.getElementById("close-lightbox-modal");
    const lbModal = document.getElementById("lightbox-modal");
    if (lbClose && lbModal) {
      lbClose.addEventListener("click", () => lbModal.classList.remove("open"));
      lbModal.addEventListener("click", (e) => {
        if (e.target === lbModal) lbModal.classList.remove("open");
      });
    }

    // Contact Hub close
    const chClose = document.getElementById("close-contact-hub-modal");
    const chModal = document.getElementById("contact-hub-modal");
    if (chClose && chModal) {
      chClose.addEventListener("click", () => chModal.classList.remove("open"));
      chModal.addEventListener("click", (e) => {
        if (e.target === chModal) chModal.classList.remove("open");
      });
    }
  });
})();
