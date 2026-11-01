// ============================================================================
// BINAYAK.CRAFT — MINECRAFT EDITION APPLICATION ENGINE (app.js v5)
// ============================================================================

(function () {
  var STORAGE_KEY = "binayak_craft_v5_state";

  function getBaseConfig() {
    if (window.PORTFOLIO_CONFIG) {
      return JSON.parse(JSON.stringify(window.PORTFOLIO_CONFIG));
    }
    return {
      profile: {},
      stats: [],
      categories: ["All"],
      portfolio: [],
      plans: [],
      reviews: []
    };
  }

  function loadState() {
    var fallback = getBaseConfig();
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.profile && Array.isArray(parsed.portfolio)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Local storage fallback:", e);
    }
    return fallback;
  }

  var state = loadState();
  var selectedCategory = "All";
  var ytFeedView = false;
  var adminUnlocked = false;
  var activeAdminTab = "portfolio";

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Could not save state:", e);
    }
  }

  function cleanHtml(val) {
    if (val === null || val === undefined) return "";
    return String(val)
      .split("&").join("&amp;")
      .split("<").join("&lt;")
      .split(">").join("&gt;")
      .split('"').join("&quot;")
      .split("'").join("&#39;");
  }

  function showToast(text) {
    var el = document.getElementById("toast-banner");
    if (!el) return;
    el.textContent = text;
    el.classList.add("visible");
    if (window._toastTimer) clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(function () {
      el.classList.remove("visible");
    }, 3200);
  }

  function copyText(text, toastMessage) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast(toastMessage);
      }).catch(function () {
        fallbackCopyText(text, toastMessage);
      });
    } else {
      fallbackCopyText(text, toastMessage);
    }
  }

  function fallbackCopyText(text, toastMessage) {
    var area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand("copy");
    } catch (err) {}
    document.body.removeChild(area);
    showToast(toastMessage);
  }

  function applyTheme() {
    var root = document.documentElement;
    var p = state.profile || {};
    if (p.primaryColor) root.style.setProperty("--mc-green", p.primaryColor);
    if (p.secondaryColor) root.style.setProperty("--mc-gold", p.secondaryColor);
  }

  function renderHeroAndProfile() {
    var p = state.profile || {};
    var brandEl = document.getElementById("brand-name-text");
    if (brandEl) brandEl.textContent = p.brandName || "BINAYAK.CRAFT";

    var statusEl = document.getElementById("hero-status-text");
    if (statusEl) statusEl.textContent = p.availabilityText || "Server Status: ONLINE";

    var titleEl = document.getElementById("hero-heading");
    if (titleEl) titleEl.innerHTML = p.heroTitle || "Crafting <span class='mc-gold-text'>God-Tier Clicks</span>";

    var leadEl = document.getElementById("hero-lead");
    if (leadEl) leadEl.textContent = p.heroSubtitle || "";

    var footBrand = document.getElementById("footer-brand-line");
    if (footBrand) footBrand.textContent = (p.brandName || "BINAYAK.CRAFT") + " — " + (p.designerName || "Binayak Tripathy");

    var dcHeroBtn = document.getElementById("hero-discord-text");
    if (dcHeroBtn) dcHeroBtn.textContent = "🎮 Discord: " + (p.discordUsername || "binayak.design");

    var igHeroBtn = document.getElementById("hero-insta-link");
    if (igHeroBtn) {
      igHeroBtn.href = p.instagramUrl || "https://instagram.com";
      igHeroBtn.textContent = "📸 Instagram (" + (p.instagramHandle || "@binayak.design") + ")";
    }

    var igNavBtn = document.getElementById("nav-insta-link");
    if (igNavBtn) {
      igNavBtn.href = p.instagramUrl || "https://instagram.com";
    }

    var spotlight = null;
    for (var i = 0; i < state.portfolio.length; i++) {
      if (state.portfolio[i].featured) {
        spotlight = state.portfolio[i];
        break;
      }
    }
    if (!spotlight && state.portfolio.length > 0) {
      spotlight = state.portfolio[0];
    }

    if (spotlight) {
      var sImg = document.getElementById("spotlight-img");
      var sCtr = document.getElementById("spotlight-ctr");
      var sTitle = document.getElementById("spotlight-title");
      var sMeta = document.getElementById("spotlight-meta");
      var sFrame = document.getElementById("spotlight-frame");
      if (sImg) sImg.src = spotlight.image;
      if (sCtr) sCtr.textContent = "🔥 " + spotlight.ctr;
      if (sTitle) sTitle.textContent = spotlight.title;
      if (sMeta) sMeta.textContent = spotlight.creator + " • " + spotlight.views;
      if (sFrame) sFrame.setAttribute("data-inspect-id", spotlight.id);
    }
  }

  function renderStats() {
    var box = document.getElementById("stats-bento");
    if (!box) return;
    var out = "";
    for (var i = 0; i < state.stats.length; i++) {
      var s = state.stats[i];
      out +=
        '<div class="stat-tile">' +
          '<span class="stat-tag">' + cleanHtml(s.tag || "XP LEVEL 99") + '</span>' +
          '<div class="stat-number">' + cleanHtml(s.value) + '</div>' +
          '<div class="stat-title">' + cleanHtml(s.label) + '</div>' +
          '<div class="stat-desc">' + cleanHtml(s.detail) + '</div>' +
        '</div>';
    }
    box.innerHTML = out;
  }

  function renderCategories() {
    var wrap = document.getElementById("category-list");
    if (!wrap) return;
    var cats = Array.isArray(state.categories) && state.categories.length ? state.categories : ["All"];
    var out = "";
    for (var i = 0; i < cats.length; i++) {
      var c = cats[i];
      var cls = c === selectedCategory ? "cat-btn active" : "cat-btn";
      out += '<button type="button" class="' + cls + '" data-filter-cat="' + cleanHtml(c) + '">' + cleanHtml(c) + '</button>';
    }
    wrap.innerHTML = out;
  }

  function renderPortfolio() {
    var grid = document.getElementById("work-grid");
    if (!grid) return;

    grid.className = ytFeedView ? "work-grid yt-sim" : "work-grid";

    var list = [];
    for (var i = 0; i < state.portfolio.length; i++) {
      var item = state.portfolio[i];
      if (selectedCategory === "All" || item.category === selectedCategory) {
        list.push(item);
      }
    }

    if (list.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:56px;color:var(--text-silver);background:var(--bg-stone-panel);border:4px solid var(--border-pixel);">No thumbnails in this chest yet. Click "⚒️ Crafting Table (Admin)" to add new work!</div>';
      return;
    }

    var out = "";
    for (var j = 0; j < list.length; j++) {
      var w = list[j];
      out +=
        '<article class="work-card">' +
          '<div class="work-thumb" data-inspect-id="' + cleanHtml(w.id) + '">' +
            '<img src="' + cleanHtml(w.image) + '" alt="' + cleanHtml(w.title) + '" loading="lazy" />' +
            '<div class="work-overlays">' +
              '<span class="badge-ctr">⚡ ' + cleanHtml(w.ctr) + '</span>' +
              '<span class="badge-views">' + cleanHtml(w.views) + '</span>' +
            '</div>' +
            '<span class="spotlight-time">' + cleanHtml(w.duration || "14:20") + '</span>' +
          '</div>' +
          '<div class="work-content">' +
            '<div class="work-niche">' + cleanHtml(w.category) + '</div>' +
            '<h3 class="work-title">' + cleanHtml(w.title) + '</h3>' +
            '<p class="work-notes">' + cleanHtml(w.notes || "") + '</p>' +
            '<div class="work-meta-foot">' +
              '<span>👤 ' + cleanHtml(w.creator) + '</span>' +
              '<span style="color:var(--mc-gold);font-family:var(--font-pixel);font-size:0.72rem;cursor:pointer;" data-inspect-id="' + cleanHtml(w.id) + '">Inspect HD ↗</span>' +
            '</div>' +
          '</div>' +
        '</article>';
    }
    grid.innerHTML = out;
  }

  function renderPlans() {
    var grid = document.getElementById("plans-grid");
    if (!grid) return;
    var out = "";
    for (var i = 0; i < state.plans.length; i++) {
      var p = state.plans[i];
      var cardCls = p.popular ? "plan-box featured" : "plan-box";
      var btnCls = p.popular ? "btn btn-primary" : "btn btn-ghost";

      var perks = "";
      var feats = Array.isArray(p.features) ? p.features : [];
      for (var f = 0; f < feats.length; f++) {
        perks += '<li><span class="perk-check">✔</span> <span>' + cleanHtml(feats[f]) + '</span></li>';
      }

      out +=
        '<div class="' + cardCls + '">' +
          (p.badge ? '<span class="plan-ribbon">' + cleanHtml(p.badge) + '</span>' : '') +
          '<h3 class="plan-title">' + cleanHtml(p.name) + '</h3>' +
          '<p class="plan-sub">' + cleanHtml(p.subtitle) + '</p>' +
          '<div class="plan-price-row">' +
            '<span class="plan-rupee">₹</span>' +
            '<span class="plan-amount">' + cleanHtml(p.priceINR) + '</span>' +
          '</div>' +
          '<div class="plan-billing">' + cleanHtml(p.cycle) + '</div>' +
          '<ul class="plan-perk-list">' + perks + '</ul>' +
          '<button type="button" class="' + btnCls + '" style="width:100%;margin-bottom:14px;" data-plan-order="' + i + '">' +
            '⚒️ ' + cleanHtml(p.buttonText || "Craft Package") +
          '</button>' +
          '<div style="display:flex;justify-content:center;gap:16px;font-size:0.84rem;color:var(--text-silver);">' +
            '<span style="cursor:pointer;" data-plan-order="' + i + '">🎮 Discord DM</span>' +
            '<span>•</span>' +
            '<span style="cursor:pointer;" data-plan-order="' + i + '">📸 Instagram DM</span>' +
          '</div>' +
        '</div>';
    }
    grid.innerHTML = out;
  }

  function renderReviews() {
    var grid = document.getElementById("reviews-grid");
    var sub = document.getElementById("reviews-count-line");
    if (!grid) return;

    var verifiedCount = 0;
    for (var i = 0; i < state.reviews.length; i++) {
      if (state.reviews[i].verified) verifiedCount++;
    }
    if (sub) {
      sub.textContent = state.reviews.length + " Creator Reviews (" + verifiedCount + " Owner-Verified Clients)";
    }

    var out = "";
    for (var j = 0; j < state.reviews.length; j++) {
      var r = state.reviews[j];
      var count = Math.min(5, Math.max(1, Number(r.rating) || 5));
      var stars = "★★★★★".slice(0, count) + "☆☆☆☆☆".slice(0, 5 - count);
      var autoAva = "https://ui-avatars.com/api/?name=" + encodeURIComponent(r.name || "Creator") + "&background=52a535&color=fff&bold=true";
      var ava = r.avatar && r.avatar.trim() !== "" ? r.avatar : autoAva;

      var badge = r.verified
        ? '<span class="badge-verified">✔ Verified Client</span>'
        : '<span class="badge-community">Community Post</span>';

      out +=
        '<div class="review-tile">' +
          '<div class="review-top">' +
            '<div class="review-user">' +
              '<img class="review-photo" src="' + cleanHtml(ava) + '" alt="' + cleanHtml(r.name) + '" />' +
              '<div>' +
                '<div class="review-name-line">' +
                  '<span class="review-name">' + cleanHtml(r.name) + '</span>' +
                  badge +
                '</div>' +
                '<div class="review-role-line">' + cleanHtml(r.role || "Creator") + ' • ' + cleanHtml(r.date || "Recent") + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="review-stars">' + stars + '</div>' +
          '</div>' +
          (r.resultTag ? '<div class="review-proof">📈 ' + cleanHtml(r.resultTag) + '</div>' : '') +
          '<p class="review-body">"' + cleanHtml(r.comment) + '"</p>' +
        '</div>';
    }
    grid.innerHTML = out;
  }

  function openOrderModal(planIndex) {
    var p = state.profile || {};
    var modal = document.getElementById("order-modal");
    if (!modal) return;

    var msg = "Hey " + (p.designerName || "Binayak") + "! I saw your Minecraft-themed thumbnail portfolio and want to commission custom high-CTR thumbnails.";
    if (planIndex !== null && planIndex !== undefined && state.plans[planIndex]) {
      var pl = state.plans[planIndex];
      msg = "Hey " + (p.designerName || "Binayak") + "! I want to order the '" + pl.name + "' package (₹" + pl.priceINR + " " + pl.cycle + "). Here is my channel link and video idea:";
    }

    var box = document.getElementById("order-brief-box");
    if (box) box.value = msg;

    var dcText = document.getElementById("modal-discord-id");
    if (dcText) dcText.textContent = p.discordUsername || "binayak.design";

    var igText = document.getElementById("modal-insta-id");
    if (igText) igText.textContent = p.instagramHandle || "@binayak.design";

    modal.classList.add("active");
  }

  function openInspectModal(workId) {
    var item = null;
    for (var i = 0; i < state.portfolio.length; i++) {
      if (state.portfolio[i].id === workId) {
        item = state.portfolio[i];
        break;
      }
    }
    if (!item) return;

    document.getElementById("inspect-img").src = item.image;
    document.getElementById("inspect-title").textContent = item.title;
    document.getElementById("inspect-meta").textContent = item.creator + " • " + item.category + " • " + item.ctr + " • " + item.views;
    document.getElementById("inspect-notes").textContent = item.notes || "";
    document.getElementById("inspect-modal").classList.add("active");
  }

  function initLabAndCalculator() {
    var compSlider = document.getElementById("compare-slider");
    var compClip = document.getElementById("compare-clip");
    if (compSlider && compClip) {
      compSlider.addEventListener("input", function (e) {
        compClip.style.width = e.target.value + "%";
      });
    }

    var impInput = document.getElementById("sim-impressions");
    var oldCtrInput = document.getElementById("sim-old-ctr");
    var newCtrInput = document.getElementById("sim-new-ctr");

    function recalc() {
      if (!impInput || !oldCtrInput || !newCtrInput) return;
      var imp = Number(impInput.value);
      var oldC = Number(oldCtrInput.value);
      var newC = Number(newCtrInput.value);

      document.getElementById("sim-imp-label").textContent = imp.toLocaleString("en-IN");
      document.getElementById("sim-old-label").textContent = oldC.toFixed(1) + "%";
      document.getElementById("sim-new-label").textContent = newC.toFixed(1) + "%";

      var baseViews = Math.round(imp * (oldC / 100));
      var newViews = Math.round(imp * (newC / 100));
      var gainedViews = Math.max(0, newViews - baseViews);
      var estINR = Math.round((gainedViews / 1000) * 120);

      document.getElementById("sim-views-out").textContent = "+" + gainedViews.toLocaleString("en-IN");
      document.getElementById("sim-rev-out").textContent = "₹" + estINR.toLocaleString("en-IN");
    }

    if (impInput) impInput.addEventListener("input", recalc);
    if (oldCtrInput) oldCtrInput.addEventListener("input", recalc);
    if (newCtrInput) newCtrInput.addEventListener("input", recalc);
    recalc();
  }

  function initPublicReviewModal() {
    var openBtn = document.getElementById("open-review-modal-btn");
    var modal = document.getElementById("review-modal");
    var closeBtn = document.getElementById("close-review-modal-btn");
    var form = document.getElementById("public-review-form");
    var fileInput = document.getElementById("rev-file-input");
    var uploadedBase64 = "";

    if (openBtn && modal) {
      openBtn.addEventListener("click", function () {
        modal.classList.add("active");
      });
    }
    if (closeBtn && modal) {
      closeBtn.addEventListener("click", function () {
        modal.classList.remove("active");
      });
    }

    if (fileInput) {
      fileInput.addEventListener("change", function (e) {
        var f = e.target.files && e.target.files[0];
        if (!f) return;
        var reader = new FileReader();
        reader.onload = function (ev) {
          uploadedBase64 = ev.target.result;
        };
        reader.readAsDataURL(f);
      });
    }

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = document.getElementById("rev-name-in").value.trim();
        var role = document.getElementById("rev-role-in").value.trim() || "YouTube Creator";
        var urlIn = document.getElementById("rev-url-in").value.trim();
        var stars = Number(document.getElementById("rev-stars-in").value) || 5;
        var proof = document.getElementById("rev-proof-in").value.trim();
        var text = document.getElementById("rev-text-in").value.trim();

        if (!name || !text) return;

        var finalPhoto = uploadedBase64 || urlIn || ("https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=52a535&color=fff&bold=true");

        state.reviews.unshift({
          id: "rev-" + Date.now(),
          name: name,
          role: role,
          avatar: finalPhoto,
          rating: stars,
          verified: false,
          date: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
          resultTag: proof || "Community Submission",
          comment: text
        });

        saveState();
        renderReviews();
        form.reset();
        uploadedBase64 = "";
        modal.classList.remove("active");
        showToast("✅ Review posted to the live community wall!");
      });
    }
  }

  // ============================================================================
  // OWNER CRAFTING TABLE (ADMIN STUDIO)
  // ============================================================================
  function renderAdminPanel() {
    var body = document.getElementById("admin-panel-body");
    var nav = document.getElementById("admin-tabs-nav");
    if (!body) return;

    if (!adminUnlocked) {
      if (nav) nav.style.display = "none";
      body.innerHTML =
        '<div style="max-width:460px;margin:24px auto;padding:32px;background:#141722;border:4px solid var(--border-pixel);text-align:center;">' +
          '<h4 style="font-family:var(--font-pixel);font-size:1.05rem;color:var(--mc-gold);margin-bottom:12px;">🔒 Unlock Crafting Table (Admin)</h4>' +
          '<p style="font-size:0.92rem;color:var(--text-silver);margin-bottom:20px;">Enter your Owner PIN to add thumbnails, grant Verified Client badges, or edit INR plans. (Default PIN: <strong>2026</strong>)</p>' +
          '<form id="admin-pin-unlock-form" style="display:flex;gap:12px;">' +
            '<input type="password" id="admin-pin-field" class="input-box" placeholder="Enter PIN (2026)" required />' +
            '<button type="submit" class="btn btn-primary">Unlock</button>' +
          '</form>' +
        '</div>';

      var pf = document.getElementById("admin-pin-unlock-form");
      if (pf) {
        pf.addEventListener("submit", function (e) {
          e.preventDefault();
          var entered = document.getElementById("admin-pin-field").value.trim();
          var correct = String((state.profile && state.profile.adminPin) || "2026");
          if (entered === correct) {
            adminUnlocked = true;
            if (nav) nav.style.display = "flex";
            renderAdminPanel();
            showToast("🔓 Crafting Table Unlocked!");
          } else {
            showToast("❌ Wrong PIN! Default PIN is 2026.");
          }
        });
      }
      return;
    }

    if (nav) nav.style.display = "flex";

    if (activeAdminTab === "portfolio") {
      var rows = "";
      for (var i = 0; i < state.portfolio.length; i++) {
        var w = state.portfolio[i];
        rows +=
          '<div class="admin-item-row">' +
            '<div style="display:flex;align-items:center;gap:14px;">' +
              '<img src="' + cleanHtml(w.image) + '" style="width:76px;height:44px;object-fit:cover;border:2px solid var(--border-pixel);" />' +
              '<div>' +
                '<div style="font-weight:700;font-size:0.95rem;color:var(--text-light);">' + cleanHtml(w.title) + '</div>' +
                '<div style="font-size:0.82rem;color:var(--text-silver);">' + cleanHtml(w.category) + ' • ' + cleanHtml(w.ctr) + ' • ' + cleanHtml(w.views) + '</div>' +
              '</div>' +
            '</div>' +
            '<button type="button" class="btn btn-ghost btn-sm" style="background:var(--mc-redstone);" data-remove-work="' + i + '">Delete</button>' +
          '</div>';
      }

      body.innerHTML =
        '<h4 style="font-family:var(--font-pixel);font-size:0.92rem;color:var(--mc-gold);margin-bottom:14px;">+ Craft New Thumbnail Slot</h4>' +
        '<form id="admin-work-form" style="background:#141722;padding:22px;margin-bottom:28px;border:3px solid var(--border-pixel);">' +
          '<div class="grid-2">' +
            '<div class="field-group"><label>Video / Project Title *</label><input type="text" id="nw-title" class="input-box" placeholder="e.g. I Survived 100 Days in Hardcore" required /></div>' +
            '<div class="field-group"><label>Creator / Client Name *</label><input type="text" id="nw-creator" class="input-box" placeholder="e.g. Gaming / Tech Creator" required /></div>' +
          '</div>' +
          '<div class="grid-2">' +
            '<div class="field-group"><label>Category *</label><input type="text" id="nw-cat" class="input-box" value="Gaming & SMP" required /></div>' +
            '<div class="field-group"><label>Image URL or Local Path (e.g. images/thumb1.jpg) *</label><input type="text" id="nw-img" class="input-box" placeholder="https://... or images/thumb1.jpg" required /></div>' +
          '</div>' +
          '<div class="grid-2">' +
            '<div class="field-group"><label>CTR Result (e.g. 16.2% CTR)</label><input type="text" id="nw-ctr" class="input-box" value="15.8% CTR" /></div>' +
            '<div class="field-group"><label>Views Generated (e.g. 2.5M Views)</label><input type="text" id="nw-views" class="input-box" value="2.1M Views" /></div>' +
          '</div>' +
          '<div class="field-group"><label>Composition & Lighting Notes</label><input type="text" id="nw-notes" class="input-box" placeholder="Short breakdown of visual hook & color grading..." /></div>' +
          '<button type="submit" class="btn btn-primary btn-sm">+ Add Thumbnail to Inventory</button>' +
        '</form>' +
        '<h4 style="font-family:var(--font-pixel);font-size:0.92rem;color:var(--text-light);margin-bottom:14px;">Existing Inventory (' + state.portfolio.length + ')</h4>' +
        '<div>' + rows + '</div>';

      document.getElementById("admin-work-form").addEventListener("submit", function (e) {
        e.preventDefault();
        var c = document.getElementById("nw-cat").value.trim() || "General";
        if (state.categories.indexOf(c) === -1) {
          state.categories.push(c);
        }
        state.portfolio.unshift({
          id: "work-" + Date.now(),
          title: document.getElementById("nw-title").value.trim(),
          creator: document.getElementById("nw-creator").value.trim(),
          category: c,
          image: document.getElementById("nw-img").value.trim(),
          ctr: document.getElementById("nw-ctr").value.trim() || "15.0% CTR",
          views: document.getElementById("nw-views").value.trim() || "1M+ Views",
          duration: "14:50",
          featured: true,
          notes: document.getElementById("nw-notes").value.trim()
        });
        saveState();
        renderCategories();
        renderPortfolio();
        renderAdminPanel();
        showToast("✅ Added new thumbnail to inventory!");
      });
    } else if (activeAdminTab === "reviews") {
      var revRows = "";
      for (var r = 0; r < state.reviews.length; r++) {
        var rv = state.reviews[r];
        revRows +=
          '<div class="admin-item-row">' +
            '<div>' +
              '<div style="font-weight:700;font-size:0.95rem;color:var(--text-light);">' +
                cleanHtml(rv.name) + ' ' +
                (rv.verified
                  ? '<span style="color:var(--mc-diamond);font-size:0.8rem;">[✔ Verified Client ON]</span>'
                  : '<span style="color:var(--text-silver);font-size:0.8rem;">[Unverified Community Post]</span>') +
              '</div>' +
              '<div style="font-size:0.85rem;color:var(--text-silver);">' + cleanHtml(rv.comment.slice(0, 80)) + '...</div>' +
            '</div>' +
            '<div style="display:flex;gap:10px;">' +
              '<button type="button" class="btn btn-ghost btn-sm" data-flip-verify="' + r + '">' +
                (rv.verified ? "Remove Badge" : "✔ Grant Verified Badge") +
              '</button>' +
              '<button type="button" class="btn btn-ghost btn-sm" style="background:var(--mc-redstone);" data-remove-review="' + r + '">Delete</button>' +
            '</div>' +
          '</div>';
      }

      body.innerHTML =
        '<h4 style="font-family:var(--font-pixel);font-size:0.92rem;color:var(--mc-gold);margin-bottom:14px;">+ Add Client Review From Your Side (Verified Badge ✔)</h4>' +
        '<form id="admin-rev-form" style="background:#141722;padding:22px;margin-bottom:28px;border:3px solid var(--border-pixel);">' +
          '<div class="grid-2">' +
            '<div class="field-group"><label>Client Name *</label><input type="text" id="nr-name" class="input-box" placeholder="e.g. Kabir Sharma" required /></div>' +
            '<div class="field-group"><label>Channel & Subscriber Count *</label><input type="text" id="nr-role" class="input-box" placeholder="e.g. Gaming Creator (900K Subs)" required /></div>' +
          '</div>' +
          '<div class="grid-2">' +
            '<div class="field-group"><label>Client Photo URL (Leave blank for auto-avatar)</label><input type="text" id="nr-photo" class="input-box" placeholder="https://..." /></div>' +
            '<div class="field-group"><label>CTR / Views Result Tag</label><input type="text" id="nr-proof" class="input-box" placeholder="e.g. CTR jumped 5% → 15.6%" /></div>' +
          '</div>' +
          '<div class="grid-2">' +
            '<div class="field-group"><label>Rating (1-5)</label><input type="number" id="nr-stars" class="input-box" min="1" max="5" value="5" /></div>' +
            '<div class="field-group"><label>Verified Badge</label><select id="nr-verified" class="input-box"><option value="true" selected>✔ Verified Client Badge ON</option><option value="false">Unverified Community Post</option></select></div>' +
          '</div>' +
          '<div class="field-group"><label>Review Text *</label><textarea id="nr-comment" class="input-box" rows="2" required></textarea></div>' +
          '<button type="submit" class="btn btn-primary btn-sm">+ Publish Review</button>' +
        '</form>' +
        '<h4 style="font-family:var(--font-pixel);font-size:0.92rem;color:var(--text-light);margin-bottom:14px;">Manage All Reviews (' + state.reviews.length + ')</h4>' +
        '<div>' + revRows + '</div>';

      document.getElementById("admin-rev-form").addEventListener("submit", function (e) {
        e.preventDefault();
        state.reviews.unshift({
          id: "rev-" + Date.now(),
          name: document.getElementById("nr-name").value.trim(),
          role: document.getElementById("nr-role").value.trim(),
          avatar: document.getElementById("nr-photo").value.trim(),
          resultTag: document.getElementById("nr-proof").value.trim() || "Verified Client",
          rating: Number(document.getElementById("nr-stars").value) || 5,
          verified: document.getElementById("nr-verified").value === "true",
          date: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
          comment: document.getElementById("nr-comment").value.trim()
        });
        saveState();
        renderReviews();
        renderAdminPanel();
        showToast("✅ Published new client review!");
      });
    } else if (activeAdminTab === "stats") {
      var stHtml = "";
      for (var s = 0; s < state.stats.length; s++) {
        var st = state.stats[s];
        stHtml +=
          '<div style="background:#141722;padding:18px;margin-bottom:14px;border:3px solid var(--border-pixel);">' +
            '<div class="grid-2">' +
              '<div class="field-group"><label>Stat Title #' + (s + 1) + '</label><input type="text" class="input-box js-st-label" data-idx="' + s + '" value="' + cleanHtml(st.label) + '" /></div>' +
              '<div class="field-group"><label>Big Number (e.g. 145.8M+ or +14.6%)</label><input type="text" class="input-box js-st-val" data-idx="' + s + '" value="' + cleanHtml(st.value) + '" /></div>' +
            '</div>' +
            '<div class="field-group"><label>Sub-detail Text</label><input type="text" class="input-box js-st-detail" data-idx="' + s + '" value="' + cleanHtml(st.detail) + '" /></div>' +
          '</div>';
      }

      body.innerHTML =
        '<h4 style="font-family:var(--font-pixel);font-size:0.92rem;color:var(--mc-gold);margin-bottom:14px;">Update XP, CTR & Views Stats</h4>' +
        stHtml +
        '<button type="button" id="save-stats-action" class="btn btn-primary btn-sm">Save Stats</button>';

      document.getElementById("save-stats-action").addEventListener("click", function () {
        var lEls = body.querySelectorAll(".js-st-label");
        var vEls = body.querySelectorAll(".js-st-val");
        var dEls = body.querySelectorAll(".js-st-detail");
        for (var i = 0; i < lEls.length; i++) {
          var idx = Number(lEls[i].getAttribute("data-idx"));
          state.stats[idx].label = lEls[i].value.trim();
          state.stats[idx].value = vEls[i].value.trim();
          state.stats[idx].detail = dEls[i].value.trim();
        }
        saveState();
        renderStats();
        showToast("✅ Stats updated live!");
      });
    } else if (activeAdminTab === "plans") {
      var plHtml = "";
      for (var pIdx = 0; pIdx < state.plans.length; pIdx++) {
        var pl = state.plans[pIdx];
        plHtml +=
          '<div style="background:#141722;padding:18px;margin-bottom:14px;border:3px solid var(--border-pixel);">' +
            '<div class="grid-2">' +
              '<div class="field-group"><label>Plan Name</label><input type="text" class="input-box js-pl-name" data-idx="' + pIdx + '" value="' + cleanHtml(pl.name) + '" /></div>' +
              '<div class="field-group"><label>Price in INR (₹)</label><input type="text" class="input-box js-pl-price" data-idx="' + pIdx + '" value="' + cleanHtml(pl.priceINR) + '" /></div>' +
            '</div>' +
            '<div class="grid-2">' +
              '<div class="field-group"><label>Billing Subtitle</label><input type="text" class="input-box js-pl-cycle" data-idx="' + pIdx + '" value="' + cleanHtml(pl.cycle) + '" /></div>' +
              '<div class="field-group"><label>Ribbon Badge</label><input type="text" class="input-box js-pl-badge" data-idx="' + pIdx + '" value="' + cleanHtml(pl.badge || "") + '" /></div>' +
            '</div>' +
            '<div class="field-group"><label>Features (One per line)</label><textarea class="input-box js-pl-feats" data-idx="' + pIdx + '" rows="4">' + cleanHtml((pl.features || []).join("\n")) + '</textarea></div>' +
          '</div>';
      }

      body.innerHTML =
        '<h4 style="font-family:var(--font-pixel);font-size:0.92rem;color:var(--mc-gold);margin-bottom:14px;">Edit Thumbnail Designing Plans (₹ INR)</h4>' +
        plHtml +
        '<button type="button" id="save-plans-action" class="btn btn-primary btn-sm">Save INR Plans</button>';

      document.getElementById("save-plans-action").addEventListener("click", function () {
        var nEls = body.querySelectorAll(".js-pl-name");
        var pEls = body.querySelectorAll(".js-pl-price");
        var cEls = body.querySelectorAll(".js-pl-cycle");
        var bEls = body.querySelectorAll(".js-pl-badge");
        var fEls = body.querySelectorAll(".js-pl-feats");
        for (var i = 0; i < nEls.length; i++) {
          var idx = Number(nEls[i].getAttribute("data-idx"));
          state.plans[idx].name = nEls[i].value.trim();
          state.plans[idx].priceINR = pEls[i].value.trim();
          state.plans[idx].cycle = cEls[i].value.trim();
          state.plans[idx].badge = bEls[i].value.trim();
          state.plans[idx].features = fEls[i].value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
        }
        saveState();
        renderPlans();
        showToast("✅ INR Pricing Plans updated!");
      });
    } else if (activeAdminTab === "brand") {
      var pr = state.profile || {};
      body.innerHTML =
        '<h4 style="font-family:var(--font-pixel);font-size:0.92rem;color:var(--mc-gold);margin-bottom:14px;">Discord, Instagram & Server Brand Settings</h4>' +
        '<div class="grid-2">' +
          '<div class="field-group"><label>Brand Name</label><input type="text" id="ed-brand" class="input-box" value="' + cleanHtml(pr.brandName || "") + '" /></div>' +
          '<div class="field-group"><label>Your Name</label><input type="text" id="ed-name" class="input-box" value="' + cleanHtml(pr.designerName || "") + '" /></div>' +
        '</div>' +
        '<div class="grid-2">' +
          '<div class="field-group"><label>🎮 Discord Username (Copied on click)</label><input type="text" id="ed-dc-user" class="input-box" value="' + cleanHtml(pr.discordUsername || "") + '" /></div>' +
          '<div class="field-group"><label>🎮 Discord Server / Profile Link</label><input type="text" id="ed-dc-url" class="input-box" value="' + cleanHtml(pr.discordUrl || "") + '" /></div>' +
        '</div>' +
        '<div class="grid-2">' +
          '<div class="field-group"><label>📸 Instagram Handle (@)</label><input type="text" id="ed-ig-handle" class="input-box" value="' + cleanHtml(pr.instagramHandle || "") + '" /></div>' +
          '<div class="field-group"><label>📸 Instagram Profile URL</label><input type="text" id="ed-ig-url" class="input-box" value="' + cleanHtml(pr.instagramUrl || "") + '" /></div>' +
        '</div>' +
        '<div class="grid-2">' +
          '<div class="field-group"><label>Primary Block Color (Hex)</label><input type="color" id="ed-c1" class="input-box" style="height:46px;" value="' + cleanHtml(pr.primaryColor || "#52a535") + '" /></div>' +
          '<div class="field-group"><label>Gold / Highlight Color (Hex)</label><input type="color" id="ed-c2" class="input-box" style="height:46px;" value="' + cleanHtml(pr.secondaryColor || "#ffaa00") + '" /></div>' +
        '</div>' +
        '<div class="field-group"><label>Server Status Text</label><input type="text" id="ed-avail" class="input-box" value="' + cleanHtml(pr.availabilityText || "") + '" /></div>' +
        '<div class="field-group"><label>Hero Subtitle</label><textarea id="ed-sub" class="input-box" rows="2">' + cleanHtml(pr.heroSubtitle || "") + '</textarea></div>' +
        '<button type="button" id="save-brand-action" class="btn btn-primary btn-sm">Save Brand Settings</button>';

      document.getElementById("save-brand-action").addEventListener("click", function () {
        state.profile.brandName = document.getElementById("ed-brand").value.trim();
        state.profile.designerName = document.getElementById("ed-name").value.trim();
        state.profile.discordUsername = document.getElementById("ed-dc-user").value.trim();
        state.profile.discordUrl = document.getElementById("ed-dc-url").value.trim();
        state.profile.instagramHandle = document.getElementById("ed-ig-handle").value.trim();
        state.profile.instagramUrl = document.getElementById("ed-ig-url").value.trim();
        state.profile.primaryColor = document.getElementById("ed-c1").value;
        state.profile.secondaryColor = document.getElementById("ed-c2").value;
        state.profile.availabilityText = document.getElementById("ed-avail").value.trim();
        state.profile.heroSubtitle = document.getElementById("ed-sub").value.trim();
        saveState();
        applyTheme();
        renderHeroAndProfile();
        showToast("✅ Brand, Discord & Instagram updated!");
      });
    }
  }

  function setupDelegatedClicks() {
    document.addEventListener("click", function (e) {
      var t = e.target;

      var catEl = t.closest("[data-filter-cat]");
      if (catEl) {
        selectedCategory = catEl.getAttribute("data-filter-cat");
        renderCategories();
        renderPortfolio();
        return;
      }

      var inspectEl = t.closest("[data-inspect-id]");
      if (inspectEl) {
        openInspectModal(inspectEl.getAttribute("data-inspect-id"));
        return;
      }

      var orderEl = t.closest("[data-plan-order]");
      if (orderEl) {
        var idx = Number(orderEl.getAttribute("data-plan-order"));
        openOrderModal(idx);
        return;
      }

      var delWork = t.closest("[data-remove-work]");
      if (delWork) {
        var wIdx = Number(delWork.getAttribute("data-remove-work"));
        state.portfolio.splice(wIdx, 1);
        saveState();
        renderPortfolio();
        renderAdminPanel();
        showToast("🗑 Removed thumbnail.");
        return;
      }

      var flipVer = t.closest("[data-flip-verify]");
      if (flipVer) {
        var rIdx = Number(flipVer.getAttribute("data-flip-verify"));
        state.reviews[rIdx].verified = !state.reviews[rIdx].verified;
        saveState();
        renderReviews();
        renderAdminPanel();
        showToast(state.reviews[rIdx].verified ? "✔ Verified Client badge granted!" : "Verified badge removed.");
        return;
      }

      var delRev = t.closest("[data-remove-review]");
      if (delRev) {
        var dIdx = Number(delRev.getAttribute("data-remove-review"));
        state.reviews.splice(dIdx, 1);
        saveState();
        renderReviews();
        renderAdminPanel();
        showToast("🗑 Review deleted.");
        return;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyTheme();
    renderHeroAndProfile();
    renderStats();
    renderCategories();
    renderPortfolio();
    renderPlans();
    renderReviews();
    initLabAndCalculator();
    initPublicReviewModal();
    setupDelegatedClicks();

    var dcBtns = document.querySelectorAll(".js-discord-copy");
    for (var i = 0; i < dcBtns.length; i++) {
      dcBtns[i].addEventListener("click", function () {
        var id = (state.profile && state.profile.discordUsername) || "binayak.design";
        copyText(id, "🎮 Copied Discord Username: " + id);
      });
    }

    var orderTriggers = document.querySelectorAll(".js-open-order-modal");
    for (var j = 0; j < orderTriggers.length; j++) {
      orderTriggers[j].addEventListener("click", function () {
        openOrderModal(null);
      });
    }

    var modalCopyIdBtn = document.getElementById("modal-copy-discord-id-btn");
    if (modalCopyIdBtn) {
      modalCopyIdBtn.addEventListener("click", function () {
        var id = (state.profile && state.profile.discordUsername) || "binayak.design";
        copyText(id, "🎮 Discord ID '" + id + "' copied!");
      });
    }

    var modalCopyDiscordBriefBtn = document.getElementById("modal-discord-brief-btn");
    if (modalCopyDiscordBriefBtn) {
      modalCopyDiscordBriefBtn.addEventListener("click", function () {
        var msg = document.getElementById("order-brief-box").value;
        copyText(msg, "📋 Brief copied! Paste it into Discord.");
        var url = (state.profile && state.profile.discordUrl) || "https://discord.com";
        window.open(url, "_blank", "noopener");
      });
    }

    var modalCopyInstaBriefBtn = document.getElementById("modal-insta-brief-btn");
    if (modalCopyInstaBriefBtn) {
      modalCopyInstaBriefBtn.addEventListener("click", function () {
        var msg = document.getElementById("order-brief-box").value;
        copyText(msg, "📸 Brief copied! Opening Instagram...");
        var url = (state.profile && state.profile.instagramUrl) || "https://instagram.com";
        window.open(url, "_blank", "noopener");
      });
    }

    var btnGrid = document.getElementById("switch-grid-btn");
    var btnSim = document.getElementById("switch-sim-btn");
    if (btnGrid && btnSim) {
      btnGrid.addEventListener("click", function () {
        ytFeedView = false;
        btnGrid.classList.add("active");
        btnSim.classList.remove("active");
        renderPortfolio();
      });
      btnSim.addEventListener("click", function () {
        ytFeedView = true;
        btnSim.classList.add("active");
        btnGrid.classList.remove("active");
        renderPortfolio();
      });
    }

    var adminBtn = document.getElementById("open-admin-btn");
    var adminModal = document.getElementById("admin-modal");
    var closeAdminBtn = document.getElementById("close-admin-modal-btn");
    if (adminBtn && adminModal) {
      adminBtn.addEventListener("click", function () {
        renderAdminPanel();
        adminModal.classList.add("active");
      });
    }
    if (closeAdminBtn && adminModal) {
      closeAdminBtn.addEventListener("click", function () {
        adminModal.classList.remove("active");
      });
    }

    var adminTabs = document.querySelectorAll(".admin-tab");
    for (var t = 0; t < adminTabs.length; t++) {
      adminTabs[t].addEventListener("click", function () {
        for (var k = 0; k < adminTabs.length; k++) adminTabs[k].classList.remove("active");
        this.classList.add("active");
        activeAdminTab = this.getAttribute("data-admin-tab");
        renderAdminPanel();
      });
    }

    var dlBtn = document.getElementById("download-config-btn");
    if (dlBtn) {
      dlBtn.addEventListener("click", function () {
        var code =
          "// ============================================================================\n" +
          "// BINAYAK.CRAFT — CENTRAL DATA & CONFIGURATION FILE (config.js v5)\n" +
          "// Exported via Owner Crafting Table (Admin Studio)\n" +
          "// ============================================================================\n\n" +
          "window.PORTFOLIO_CONFIG = " + JSON.stringify(state, null, 2) + ";\n";
        var blob = new Blob([code], { type: "application/javascript;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.href = url;
        link.download = "config.js";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast("💾 Downloaded updated config.js!");
      });
    }

    var rstBtn = document.getElementById("reset-config-btn");
    if (rstBtn) {
      rstBtn.addEventListener("click", function () {
        localStorage.removeItem(STORAGE_KEY);
        state = getBaseConfig();
        applyTheme();
        renderHeroAndProfile();
        renderStats();
        renderCategories();
        renderPortfolio();
        renderPlans();
        renderReviews();
        renderAdminPanel();
        showToast("🔄 Reset to default config.js!");
      });
    }

    var closeOrder = document.getElementById("close-order-modal-btn");
    var orderModal = document.getElementById("order-modal");
    if (closeOrder && orderModal) {
      closeOrder.addEventListener("click", function () { orderModal.classList.remove("active"); });
    }

    var closeInspect = document.getElementById("close-inspect-modal-btn");
    var inspectModal = document.getElementById("inspect-modal");
    if (closeInspect && inspectModal) {
      closeInspect.addEventListener("click", function () { inspectModal.classList.remove("active"); });
    }

    var overlays = document.querySelectorAll(".modal-overlay");
    for (var o = 0; o < overlays.length; o++) {
      overlays[o].addEventListener("click", function (ev) {
        if (ev.target === this) this.classList.remove("active");
      });
    }
  });
})();
