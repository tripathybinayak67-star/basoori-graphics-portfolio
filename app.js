// ============================================================================
// BINAYAK.DESIGN — CLEAN, ZERO-BUG APPLICATION ENGINE (app.js v3)
// ============================================================================

(function () {
  var STORAGE_KEY = "binayak_portfolio_state_v3";

  function getDefaultConfig() {
    if (window.PORTFOLIO_CONFIG) {
      return JSON.parse(JSON.stringify(window.PORTFOLIO_CONFIG));
    }
    return { profile: {}, stats: [], categories: ["All"], portfolio: [], plans: [], reviews: [] };
  }

  function loadState() {
    var base = getDefaultConfig();
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        var parsed = JSON.parse(saved);
        if (parsed && parsed.profile && Array.isArray(parsed.portfolio)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Using default config.js state:", err);
    }
    return base;
  }

  var state = loadState();
  var activeCategory = "All";
  var isYouTubeFeedMode = false;
  var adminUnlocked = false;
  var currentAdminTab = "portfolio";

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn("Could not save to localStorage:", err);
    }
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function showToast(msg) {
    var toast = document.getElementById("live-toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    if (window._toastTimeout) clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(function () {
      toast.classList.remove("show");
    }, 3200);
  }

  function copyToClipboard(text, message) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast(message);
      }).catch(function () {
        fallbackCopy(text, message);
      });
    } else {
      fallbackCopy(text, message);
    }
  }

  function fallbackCopy(text, message) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch (e) {}
    document.body.removeChild(ta);
    showToast(message);
  }

  function applyThemeColors() {
    var root = document.documentElement;
    if (state.profile && state.profile.accentColor) {
      root.style.setProperty("--accent-primary", state.profile.accentColor);
    }
    if (state.profile && state.profile.secondaryColor) {
      root.style.setProperty("--accent-secondary", state.profile.secondaryColor);
    }
  }

  function renderProfileAndHero() {
    var p = state.profile || {};
    var brandEl = document.getElementById("nav-brand-text");
    if (brandEl) brandEl.textContent = p.brandName || "BINAYAK.DESIGN";

    var availEl = document.getElementById("hero-availability");
    if (availEl) availEl.textContent = p.availabilityText || "Available for Commissions";

    var titleEl = document.getElementById("hero-title");
    if (titleEl) titleEl.innerHTML = p.heroTitle || "Turning Impressions Into <span class='gradient-text'>Unstoppable Clicks</span>";

    var subEl = document.getElementById("hero-subtitle");
    if (subEl) subEl.textContent = p.heroSubtitle || "";

    var footEl = document.getElementById("footer-brand");
    if (footEl) footEl.textContent = (p.brandName || "BINAYAK.DESIGN") + " — " + (p.designerName || "Binayak Tripathy");

    var heroDiscordLabel = document.getElementById("hero-discord-label");
    if (heroDiscordLabel) {
      heroDiscordLabel.textContent = "🎮 Discord: " + (p.discordUsername || "binayak.design");
    }

    var heroInstaBtn = document.getElementById("hero-insta-btn");
    if (heroInstaBtn) {
      heroInstaBtn.href = p.instagramUrl || "https://instagram.com";
      heroInstaBtn.textContent = "📸 Instagram (" + (p.instagramHandle || "@binayak.design") + ")";
    }

    var navInstaBtn = document.getElementById("nav-insta-btn");
    if (navInstaBtn) {
      navInstaBtn.href = p.instagramUrl || "https://instagram.com";
    }

    var featured = null;
    for (var i = 0; i < state.portfolio.length; i++) {
      if (state.portfolio[i].featured) {
        featured = state.portfolio[i];
        break;
      }
    }
    if (!featured && state.portfolio.length > 0) {
      featured = state.portfolio[0];
    }

    if (featured) {
      var imgEl = document.getElementById("hero-showcase-img");
      var ctrEl = document.getElementById("hero-showcase-ctr");
      var tEl = document.getElementById("hero-showcase-title");
      var mEl = document.getElementById("hero-showcase-meta");
      if (imgEl) imgEl.src = featured.image;
      if (ctrEl) ctrEl.textContent = "🔥 " + featured.ctr + " CTR";
      if (tEl) tEl.textContent = featured.title;
      if (mEl) mEl.textContent = featured.creator + " • " + featured.viewsGenerated;
    }
  }

  function renderStats() {
    var grid = document.getElementById("stats-grid");
    if (!grid) return;
    var html = "";
    for (var i = 0; i < state.stats.length; i++) {
      var st = state.stats[i];
      html +=
        '<div class="stat-card">' +
          '<div class="stat-icon-wrap">' + escapeHtml(st.icon || "⚡") + '</div>' +
          '<div class="stat-value">' + escapeHtml(st.value) + '</div>' +
          '<div class="stat-label">' + escapeHtml(st.label) + '</div>' +
          '<div class="stat-subtext">' + escapeHtml(st.subtext) + '</div>' +
        '</div>';
    }
    grid.innerHTML = html;
  }

  function renderCategories() {
    var container = document.getElementById("category-pills");
    if (!container) return;
    var cats = state.categories && state.categories.length ? state.categories : ["All"];
    var html = "";
    for (var i = 0; i < cats.length; i++) {
      var c = cats[i];
      var activeClass = c === activeCategory ? "filter-pill active" : "filter-pill";
      html += '<button type="button" class="' + activeClass + '" data-cat="' + escapeHtml(c) + '">' + escapeHtml(c) + '</button>';
    }
    container.innerHTML = html;
  }

  function renderPortfolio() {
    var grid = document.getElementById("portfolio-grid");
    if (!grid) return;

    grid.className = isYouTubeFeedMode ? "portfolio-grid yt-feed-mode" : "portfolio-grid";

    var items = [];
    for (var i = 0; i < state.portfolio.length; i++) {
      var it = state.portfolio[i];
      if (activeCategory === "All" || it.category === activeCategory) {
        items.push(it);
      }
    }

    if (items.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-sub);">No thumbnails in this category yet. Click "⚙️ Customize / Admin Studio" to add work!</div>';
      return;
    }

    var html = "";
    for (var j = 0; j < items.length; j++) {
      var item = items[j];
      html +=
        '<article class="portfolio-card">' +
          '<div class="thumb-box" data-lightbox-id="' + escapeHtml(item.id) + '">' +
            '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" />' +
            '<div class="thumb-badges-top">' +
              '<span class="ctr-pill">⚡ ' + escapeHtml(item.ctr) + ' CTR</span>' +
              '<span class="views-pill">' + escapeHtml(item.viewsGenerated) + '</span>' +
            '</div>' +
            '<span class="yt-duration-badge">' + escapeHtml(item.duration || "14:20") + '</span>' +
          '</div>' +
          '<div class="card-body">' +
            '<div class="card-category">' + escapeHtml(item.category) + '</div>' +
            '<h3 class="card-title">' + escapeHtml(item.title) + '</h3>' +
            '<p class="card-breakdown">' + escapeHtml(item.breakdown || "") + '</p>' +
            '<div class="card-footer">' +
              '<span>👤 ' + escapeHtml(item.creator) + '</span>' +
              '<span style="color:var(--accent-primary);font-weight:700;cursor:pointer;" data-lightbox-id="' + escapeHtml(item.id) + '">Inspect HD →</span>' +
            '</div>' +
          '</div>' +
        '</article>';
    }
    grid.innerHTML = html;
  }

  function renderPlans() {
    var grid = document.getElementById("pricing-grid");
    if (!grid) return;
    var html = "";
    for (var i = 0; i < state.plans.length; i++) {
      var plan = state.plans[i];
      var popClass = plan.popular ? "plan-card popular" : "plan-card";
      var btnClass = plan.popular ? "btn btn-primary" : "btn btn-secondary";

      var featuresHtml = "";
      var feats = Array.isArray(plan.features) ? plan.features : [];
      for (var f = 0; f < feats.length; f++) {
        featuresHtml += '<li><span class="check-icon">✔</span> <span>' + escapeHtml(feats[f]) + '</span></li>';
      }

      html +=
        '<div class="' + popClass + '">' +
          (plan.badge ? '<span class="plan-badge">' + escapeHtml(plan.badge) + '</span>' : '') +
          '<h3 class="plan-name">' + escapeHtml(plan.name) + '</h3>' +
          '<p class="plan-tagline">' + escapeHtml(plan.tagline) + '</p>' +
          '<div class="plan-price-wrap">' +
            '<span class="plan-currency">₹</span>' +
            '<span class="plan-price">' + escapeHtml(plan.priceINR) + '</span>' +
          '</div>' +
          '<div class="plan-cycle">' + escapeHtml(plan.billingCycle) + '</div>' +
          '<ul class="plan-features">' + featuresHtml + '</ul>' +
          '<button type="button" class="' + btnClass + '" style="width:100%;margin-bottom:10px;" data-order-plan-idx="' + i + '">' +
            '⚡ ' + escapeHtml(plan.ctaText || "Order Plan") +
          '</button>' +
          '<div style="display:flex;justify-content:center;gap:12px;font-size:0.78rem;color:var(--text-muted);">' +
            '<span style="cursor:pointer;" data-order-plan-idx="' + i + '">🎮 Discord DM</span>' +
            '<span>•</span>' +
            '<span style="cursor:pointer;" data-order-plan-idx="' + i + '">📸 Instagram DM</span>' +
          '</div>' +
        '</div>';
    }
    grid.innerHTML = html;
  }

  function renderReviews() {
    var grid = document.getElementById("reviews-grid");
    var countEl = document.getElementById("reviews-count-text");
    if (!grid) return;

    var verifiedTotal = 0;
    for (var k = 0; k < state.reviews.length; k++) {
      if (state.reviews[k].verified) verifiedTotal++;
    }

    if (countEl) {
      countEl.textContent = state.reviews.length + " Total Reviews (" + verifiedTotal + " Owner-Verified Clients)";
    }

    var html = "";
    for (var i = 0; i < state.reviews.length; i++) {
      var rev = state.reviews[i];
      var rNum = Math.min(5, Math.max(1, Number(rev.rating) || 5));
      var stars = "★★★★★".slice(0, rNum) + "☆☆☆☆☆".slice(0, 5 - rNum);
      var fallbackAvatar = "https://ui-avatars.com/api/?name=" + encodeURIComponent(rev.name || "User") + "&background=ff2a5f&color=fff&bold=true";
      var avatarSrc = rev.avatar && rev.avatar.trim() !== "" ? rev.avatar : fallbackAvatar;

      var badgeHtml = rev.verified
        ? '<span class="verified-badge">✔ Verified Client</span>'
        : '<span class="unverified-badge">Community Post</span>';

      html +=
        '<div class="review-card">' +
          '<div class="review-header">' +
            '<div class="reviewer-profile">' +
              '<img class="reviewer-avatar" src="' + escapeHtml(avatarSrc) + '" alt="' + escapeHtml(rev.name) + '" />' +
              '<div>' +
                '<div class="reviewer-name-row">' +
                  '<span class="reviewer-name">' + escapeHtml(rev.name) + '</span>' +
                  badgeHtml +
                '</div>' +
                '<div class="reviewer-role">' + escapeHtml(rev.role || "Creator") + ' • ' + escapeHtml(rev.date || "Recent") + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="stars-gold">' + stars + '</div>' +
          '</div>' +
          (rev.ctrProof ? '<div class="review-ctr-highlight">📈 ' + escapeHtml(rev.ctrProof) + '</div>' : '') +
          '<p class="review-comment">"' + escapeHtml(rev.comment) + '"</p>' +
        '</div>';
    }
    grid.innerHTML = html;
  }

  function openContactHub(planIdx) {
    var p = state.profile || {};
    var modal = document.getElementById("contact-hub-modal");
    if (!modal) return;

    var briefText = "Hey " + (p.designerName || "Binayak") + "! I checked out your portfolio and want to commission custom high-CTR thumbnails.";
    if (planIdx !== null && planIdx !== undefined && state.plans[planIdx]) {
      var pl = state.plans[planIdx];
      briefText = "Hey " + (p.designerName || "Binayak") + "! I want to order the "" + pl.name + "" plan (₹" + pl.priceINR + " " + pl.billingCycle + "). Here is my channel link & video topic:";
    }

    var briefEl = document.getElementById("contact-brief-textarea");
    if (briefEl) briefEl.value = briefText;

    var dcHandleEl = document.getElementById("hub-discord-handle");
    if (dcHandleEl) dcHandleEl.textContent = p.discordUsername || "binayak.design";

    var igHandleEl = document.getElementById("hub-insta-handle");
    if (igHandleEl) igHandleEl.textContent = p.instagramHandle || "@binayak.design";

    modal.classList.add("open");
  }

  function openLightbox(workId) {
    var found = null;
    for (var i = 0; i < state.portfolio.length; i++) {
      if (state.portfolio[i].id === workId) {
        found = state.portfolio[i];
        break;
      }
    }
    if (!found) return;
    document.getElementById("lightbox-img").src = found.image;
    document.getElementById("lightbox-title").textContent = found.title;
    document.getElementById("lightbox-meta").textContent = found.creator + " • " + found.category + " • " + found.ctr + " CTR • " + found.viewsGenerated;
    document.getElementById("lightbox-breakdown").textContent = found.breakdown || "";
    document.getElementById("lightbox-modal").classList.add("open");
  }

  function setupInteractiveLab() {
    var baInput = document.getElementById("ba-slider-input");
    var baClip = document.getElementById("ba-before-clip");
    if (baInput && baClip) {
      baInput.addEventListener("input", function (e) {
        baClip.style.width = e.target.value + "%";
      });
    }

    var impSlider = document.getElementById("calc-impressions");
    var oldCtrSlider = document.getElementById("calc-old-ctr");
    var newCtrSlider = document.getElementById("calc-new-ctr");

    function updateCalc() {
      if (!impSlider || !oldCtrSlider || !newCtrSlider) return;
      var impressions = Number(impSlider.value);
      var oldCtr = Number(oldCtrSlider.value);
      var newCtr = Number(newCtrSlider.value);

      document.getElementById("calc-imp-val").textContent = impressions.toLocaleString("en-IN");
      document.getElementById("calc-old-val").textContent = oldCtr.toFixed(1) + "%";
      document.getElementById("calc-new-val").textContent = newCtr.toFixed(1) + "%";

      var oldViews = Math.round(impressions * (oldCtr / 100));
      var newViews = Math.round(impressions * (newCtr / 100));
      var extraViews = Math.max(0, newViews - oldViews);
      var extraRevenueINR = Math.round((extraViews / 1000) * 120);

      document.getElementById("calc-extra-views").textContent = "+" + extraViews.toLocaleString("en-IN");
      document.getElementById("calc-extra-rev").textContent = "₹" + extraRevenueINR.toLocaleString("en-IN");
    }

    if (impSlider) impSlider.addEventListener("input", updateCalc);
    if (oldCtrSlider) oldCtrSlider.addEventListener("input", updateCalc);
    if (newCtrSlider) newCtrSlider.addEventListener("input", updateCalc);
    updateCalc();
  }

  function setupPublicReviewForm() {
    var openBtn = document.getElementById("open-public-review-btn");
    var modal = document.getElementById("public-review-modal");
    var closeBtn = document.getElementById("close-public-review-modal");
    var form = document.getElementById("public-review-form");
    var photoInput = document.getElementById("pub-rev-photo-file");
    var uploadedPhotoDataUrl = "";

    if (openBtn && modal) {
      openBtn.addEventListener("click", function () {
        modal.classList.add("open");
      });
    }
    if (closeBtn && modal) {
      closeBtn.addEventListener("click", function () {
        modal.classList.remove("open");
      });
    }

    if (photoInput) {
      photoInput.addEventListener("change", function (e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (evt) {
          uploadedPhotoDataUrl = evt.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = document.getElementById("pub-rev-name").value.trim();
        var role = document.getElementById("pub-rev-role").value.trim() || "YouTube Creator";
        var photoUrl = document.getElementById("pub-rev-photo-url").value.trim();
        var rating = Number(document.getElementById("pub-rev-rating").value) || 5;
        var ctrProof = document.getElementById("pub-rev-ctr").value.trim();
        var comment = document.getElementById("pub-rev-comment").value.trim();

        if (!name || !comment) return;

        var avatar = uploadedPhotoDataUrl || photoUrl || ("https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=7928ca&color=fff&bold=true");

        state.reviews.unshift({
          id: "rev-" + Date.now(),
          name: name,
          role: role,
          avatar: avatar,
          rating: rating,
          verified: false,
          date: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
          ctrProof: ctrProof || "Community Feedback",
          comment: comment
        });

        saveState();
        renderReviews();

        form.reset();
        uploadedPhotoDataUrl = "";
        modal.classList.remove("open");
        showToast("✅ Review submitted! Posted as Community Submission.");
      });
    }
  }

  // ============================================================================
  // OWNER ADMIN STUDIO (Uses built-in PIN screen inside modal, never blocked!)
  // ============================================================================
  function renderAdminStudioBody() {
    var container = document.getElementById("admin-tab-body");
    var tabsBar = document.getElementById("admin-tabs-bar");
    if (!container) return;

    if (!adminUnlocked) {
      if (tabsBar) tabsBar.style.display = "none";
      container.innerHTML =
        '<div style="max-width:400px;margin:24px auto;text-align:center;padding:24px;background:rgba(255,255,255,0.03);border:1px solid var(--border-light);border-radius:14px;">' +
          '<h4 style="font-size:1.2rem;margin-bottom:8px;">🔒 Unlock Owner Admin Studio</h4>' +
          '<p style="font-size:0.85rem;color:var(--text-sub);margin-bottom:16px;">Enter your Admin PIN to add thumbnails, verify reviews, or edit INR plans. (Default PIN: <strong>2026</strong>)</p>' +
          '<form id="admin-pin-form" style="display:flex;gap:10px;">' +
            '<input type="password" id="admin-pin-input" class="form-control" placeholder="Enter PIN (2026)" required />' +
            '<button type="submit" class="btn btn-primary">Unlock</button>' +
          '</form>' +
        '</div>';

      var pinForm = document.getElementById("admin-pin-form");
      if (pinForm) {
        pinForm.addEventListener("submit", function (e) {
          e.preventDefault();
          var val = document.getElementById("admin-pin-input").value.trim();
          var expected = String((state.profile && state.profile.adminPin) || "2026");
          if (val === expected) {
            adminUnlocked = true;
            if (tabsBar) tabsBar.style.display = "flex";
            renderAdminStudioBody();
            showToast("🔓 Admin Studio Unlocked!");
          } else {
            showToast("❌ Incorrect PIN! Default PIN is 2026.");
          }
        });
      }
      return;
    }

    if (tabsBar) tabsBar.style.display = "flex";

    if (currentAdminTab === "portfolio") {
      var listHtml = "";
      for (var i = 0; i < state.portfolio.length; i++) {
        var it = state.portfolio[i];
        listHtml +=
          '<div class="admin-list-item">' +
            '<div style="display:flex;align-items:center;gap:12px;">' +
              '<img src="' + escapeHtml(it.image) + '" style="width:68px;height:38px;object-fit:cover;border-radius:6px;" />' +
              '<div>' +
                '<div style="font-weight:700;font-size:0.9rem;">' + escapeHtml(it.title) + '</div>' +
                '<div style="font-size:0.78rem;color:var(--text-sub);">' + escapeHtml(it.category) + ' • ' + escapeHtml(it.ctr) + ' CTR • ' + escapeHtml(it.viewsGenerated) + '</div>' +
              '</div>' +
            '</div>' +
            '<button type="button" class="btn btn-secondary btn-sm" style="color:#ff4d6d;" data-del-work="' + i + '">Delete</button>' +
          '</div>';
      }

      container.innerHTML =
        '<h4 style="margin-bottom:10px;">Add New Thumbnail / Graphic</h4>' +
        '<form id="admin-add-work-form" style="background:rgba(255,255,255,0.03);padding:16px;border-radius:12px;margin-bottom:20px;border:1px solid var(--border-light);">' +
          '<div class="form-row-2">' +
            '<div class="form-group"><label>Video / Project Title *</label><input type="text" id="aw-title" class="form-control" placeholder="e.g. How I Built a 10M Sub Channel" required /></div>' +
            '<div class="form-group"><label>Client / Creator Name *</label><input type="text" id="aw-creator" class="form-control" placeholder="e.g. Gaming / Tech Creator" required /></div>' +
          '</div>' +
          '<div class="form-row-2">' +
            '<div class="form-group"><label>Category *</label><input type="text" id="aw-category" class="form-control" value="Gaming & Esports" required /></div>' +
            '<div class="form-group"><label>Image URL or Local Path (e.g. images/thumb1.jpg) *</label><input type="text" id="aw-image" class="form-control" placeholder="https://... or images/thumb1.jpg" required /></div>' +
          '</div>' +
          '<div class="form-row-2">' +
            '<div class="form-group"><label>CTR Achieved</label><input type="text" id="aw-ctr" class="form-control" value="15.4%" /></div>' +
            '<div class="form-group"><label>Views Generated</label><input type="text" id="aw-views" class="form-control" value="2.1M Views" /></div>' +
          '</div>' +
          '<div class="form-group"><label>Design & Psychology Breakdown</label><input type="text" id="aw-breakdown" class="form-control" placeholder="Lighting, color grading, or focal hook notes..." /></div>' +
          '<button type="submit" class="btn btn-primary btn-sm">+ Add Thumbnail to Portfolio</button>' +
        '</form>' +
        '<h4 style="margin-bottom:10px;">Manage Existing Portfolio (' + state.portfolio.length + ')</h4>' +
        '<div>' + listHtml + '</div>';

      document.getElementById("admin-add-work-form").addEventListener("submit", function (e) {
        e.preventDefault();
        var cat = document.getElementById("aw-category").value.trim() || "General";
        if (state.categories.indexOf(cat) === -1) {
          state.categories.push(cat);
        }
        state.portfolio.unshift({
          id: "work-" + Date.now(),
          title: document.getElementById("aw-title").value.trim(),
          creator: document.getElementById("aw-creator").value.trim(),
          category: cat,
          image: document.getElementById("aw-image").value.trim(),
          ctr: document.getElementById("aw-ctr").value.trim() || "15.0%",
          viewsGenerated: document.getElementById("aw-views").value.trim() || "1M+ Views",
          duration: "15:20",
          featured: true,
          breakdown: document.getElementById("aw-breakdown").value.trim()
        });
        saveState();
        renderCategories();
        renderPortfolio();
        renderAdminStudioBody();
        showToast("✅ New thumbnail added!");
      });
    } else if (currentAdminTab === "reviews") {
      var revListHtml = "";
      for (var r = 0; r < state.reviews.length; r++) {
        var rv = state.reviews[r];
        revListHtml +=
          '<div class="admin-list-item">' +
            '<div>' +
              '<div style="font-weight:700;font-size:0.9rem;">' +
                escapeHtml(rv.name) + ' ' +
                (rv.verified
                  ? '<span style="color:#38b6ff;font-size:0.75rem;">[✔ Verified Badge ON]</span>'
                  : '<span style="color:var(--text-muted);font-size:0.75rem;">[Unverified Community Post]</span>') +
              '</div>' +
              '<div style="font-size:0.8rem;color:var(--text-sub);">' + escapeHtml(rv.comment.slice(0, 80)) + '...</div>' +
            '</div>' +
            '<div style="display:flex;gap:8px;">' +
              '<button type="button" class="btn btn-secondary btn-sm" data-toggle-verify="' + r + '">' +
                (rv.verified ? "Remove Badge" : "✔ Give Verified Badge") +
              '</button>' +
              '<button type="button" class="btn btn-secondary btn-sm" style="color:#ff4d6d;" data-del-review="' + r + '">Delete</button>' +
            '</div>' +
          '</div>';
      }

      container.innerHTML =
        '<h4 style="margin-bottom:10px;">Add Review From Your Side (With Verified Client Badge ✔)</h4>' +
        '<form id="admin-add-rev-form" style="background:rgba(255,255,255,0.03);padding:16px;border-radius:12px;margin-bottom:20px;border:1px solid var(--border-light);">' +
          '<div class="form-row-2">' +
            '<div class="form-group"><label>Client Name *</label><input type="text" id="ar-name" class="form-control" placeholder="e.g. Kabir Sharma" required /></div>' +
            '<div class="form-group"><label>Channel Niche & Subs *</label><input type="text" id="ar-role" class="form-control" placeholder="e.g. Gaming Creator (850K Subs)" required /></div>' +
          '</div>' +
          '<div class="form-row-2">' +
            '<div class="form-group"><label>Client Photo URL (Optional)</label><input type="text" id="ar-avatar" class="form-control" placeholder="https://... or leave blank" /></div>' +
            '<div class="form-group"><label>CTR / Views Result Highlight</label><input type="text" id="ar-proof" class="form-control" placeholder="e.g. CTR jumped from 5% to 15.8%" /></div>' +
          '</div>' +
          '<div class="form-row-2">' +
            '<div class="form-group"><label>Star Rating (1 to 5)</label><input type="number" id="ar-rating" class="form-control" min="1" max="5" value="5" /></div>' +
            '<div class="form-group"><label>Verified Badge Status</label><select id="ar-verified" class="form-control"><option value="true" selected>✔ Verified Client Badge ON</option><option value="false">Unverified Community Post</option></select></div>' +
          '</div>' +
          '<div class="form-group"><label>Review Comment *</label><textarea id="ar-comment" class="form-control" rows="2" required></textarea></div>' +
          '<button type="submit" class="btn btn-primary btn-sm">+ Publish Review</button>' +
        '</form>' +
        '<h4 style="margin-bottom:10px;">Manage All Reviews (' + state.reviews.length + ')</h4>' +
        '<div>' + revListHtml + '</div>';

      document.getElementById("admin-add-rev-form").addEventListener("submit", function (e) {
        e.preventDefault();
        var nm = document.getElementById("ar-name").value.trim();
        state.reviews.unshift({
          id: "rev-" + Date.now(),
          name: nm,
          role: document.getElementById("ar-role").value.trim(),
          avatar: document.getElementById("ar-avatar").value.trim(),
          ctrProof: document.getElementById("ar-proof").value.trim() || "Verified Client",
          rating: Number(document.getElementById("ar-rating").value) || 5,
          verified: document.getElementById("ar-verified").value === "true",
          date: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
          comment: document.getElementById("ar-comment").value.trim()
        });
        saveState();
        renderReviews();
        renderAdminStudioBody();
        showToast("✅ Client review published!");
      });
    } else if (currentAdminTab === "stats") {
      var statsFormHtml = "";
      for (var s = 0; s < state.stats.length; s++) {
        var st = state.stats[s];
        statsFormHtml +=
          '<div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:10px;margin-bottom:10px;border:1px solid var(--border-light);">' +
            '<div class="form-row-2">' +
              '<div class="form-group"><label>Stat Label #' + (s + 1) + '</label><input type="text" class="form-control st-label" data-idx="' + s + '" value="' + escapeHtml(st.label) + '" /></div>' +
              '<div class="form-group"><label>Display Value (e.g. 145.8M+ or +14.6%)</label><input type="text" class="form-control st-val" data-idx="' + s + '" value="' + escapeHtml(st.value) + '" /></div>' +
            '</div>' +
            '<div class="form-group"><label>Subtext Proof</label><input type="text" class="form-control st-sub" data-idx="' + s + '" value="' + escapeHtml(st.subtext) + '" /></div>' +
          '</div>';
      }

      container.innerHTML =
        '<h4 style="margin-bottom:10px;">Edit CTR & Views Generated Counters</h4>' +
        statsFormHtml +
        '<button type="button" id="save-stats-btn" class="btn btn-primary btn-sm">Save Stats</button>';

      document.getElementById("save-stats-btn").addEventListener("click", function () {
        var labels = container.querySelectorAll(".st-label");
        var vals = container.querySelectorAll(".st-val");
        var subs = container.querySelectorAll(".st-sub");
        for (var i = 0; i < labels.length; i++) {
          var idx = Number(labels[i].getAttribute("data-idx"));
          state.stats[idx].label = labels[i].value.trim();
          state.stats[idx].value = vals[i].value.trim();
          state.stats[idx].subtext = subs[i].value.trim();
        }
        saveState();
        renderStats();
        showToast("✅ CTR & Views stats updated!");
      });
    } else if (currentAdminTab === "plans") {
      var plansHtml = "";
      for (var pIdx = 0; pIdx < state.plans.length; pIdx++) {
        var pl = state.plans[pIdx];
        plansHtml +=
          '<div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:10px;margin-bottom:12px;border:1px solid var(--border-light);">' +
            '<div class="form-row-2">' +
              '<div class="form-group"><label>Plan Name</label><input type="text" class="form-control pl-name" data-idx="' + pIdx + '" value="' + escapeHtml(pl.name) + '" /></div>' +
              '<div class="form-group"><label>Price in INR (₹)</label><input type="text" class="form-control pl-price" data-idx="' + pIdx + '" value="' + escapeHtml(pl.priceINR) + '" /></div>' +
            '</div>' +
            '<div class="form-row-2">' +
              '<div class="form-group"><label>Billing Cycle</label><input type="text" class="form-control pl-cycle" data-idx="' + pIdx + '" value="' + escapeHtml(pl.billingCycle) + '" /></div>' +
              '<div class="form-group"><label>Badge Text</label><input type="text" class="form-control pl-badge" data-idx="' + pIdx + '" value="' + escapeHtml(pl.badge || "") + '" /></div>' +
            '</div>' +
            '<div class="form-group"><label>Features (One feature per line)</label><textarea class="form-control pl-features" data-idx="' + pIdx + '" rows="4">' + escapeHtml((pl.features || []).join("\n")) + '</textarea></div>' +
          '</div>';
      }

      container.innerHTML =
        '<h4 style="margin-bottom:10px;">Customize Thumbnail Designing Plans (₹ INR)</h4>' +
        plansHtml +
        '<button type="button" id="save-plans-btn" class="btn btn-primary btn-sm">Save INR Plans</button>';

      document.getElementById("save-plans-btn").addEventListener("click", function () {
        var names = container.querySelectorAll(".pl-name");
        var prices = container.querySelectorAll(".pl-price");
        var cycles = container.querySelectorAll(".pl-cycle");
        var badges = container.querySelectorAll(".pl-badge");
        var feats = container.querySelectorAll(".pl-features");
        for (var i = 0; i < names.length; i++) {
          var idx = Number(names[i].getAttribute("data-idx"));
          state.plans[idx].name = names[i].value.trim();
          state.plans[idx].priceINR = prices[i].value.trim();
          state.plans[idx].billingCycle = cycles[i].value.trim();
          state.plans[idx].badge = badges[i].value.trim();
          state.plans[idx].features = feats[i].value.split("\n").map(function (line) { return line.trim(); }).filter(Boolean);
        }
        saveState();
        renderPlans();
        showToast("✅ INR Pricing Plans updated!");
      });
    } else if (currentAdminTab === "brand") {
      var pr = state.profile || {};
      container.innerHTML =
        '<h4 style="margin-bottom:10px;">Discord, Instagram & Brand Settings</h4>' +
        '<div class="form-row-2">' +
          '<div class="form-group"><label>Brand Name</label><input type="text" id="br-brand" class="form-control" value="' + escapeHtml(pr.brandName || "") + '" /></div>' +
          '<div class="form-group"><label>Designer Name</label><input type="text" id="br-name" class="form-control" value="' + escapeHtml(pr.designerName || "") + '" /></div>' +
        '</div>' +
        '<div class="form-row-2">' +
          '<div class="form-group"><label>🎮 Discord Username (Copied on Click)</label><input type="text" id="br-dc-user" class="form-control" value="' + escapeHtml(pr.discordUsername || "") + '" /></div>' +
          '<div class="form-group"><label>🎮 Discord Server / Profile URL</label><input type="text" id="br-dc-url" class="form-control" value="' + escapeHtml(pr.discordInviteUrl || "") + '" /></div>' +
        '</div>' +
        '<div class="form-row-2">' +
          '<div class="form-group"><label>📸 Instagram Handle (@)</label><input type="text" id="br-ig-handle" class="form-control" value="' + escapeHtml(pr.instagramHandle || "") + '" /></div>' +
          '<div class="form-group"><label>📸 Instagram Full URL</label><input type="text" id="br-ig-url" class="form-control" value="' + escapeHtml(pr.instagramUrl || "") + '" /></div>' +
        '</div>' +
        '<div class="form-row-2">' +
          '<div class="form-group"><label>Primary Accent Color</label><input type="color" id="br-c1" class="form-control" style="height:42px;" value="' + escapeHtml(pr.accentColor || "#ff2a5f") + '" /></div>' +
          '<div class="form-group"><label>Secondary Accent Color</label><input type="color" id="br-c2" class="form-control" style="height:42px;" value="' + escapeHtml(pr.secondaryColor || "#7928ca") + '" /></div>' +
        '</div>' +
        '<div class="form-group"><label>Availability Banner Text</label><input type="text" id="br-avail" class="form-control" value="' + escapeHtml(pr.availabilityText || "") + '" /></div>' +
        '<div class="form-group"><label>Hero Subtitle</label><textarea id="br-sub" class="form-control" rows="2">' + escapeHtml(pr.heroSubtitle || "") + '</textarea></div>' +
        '<button type="button" id="save-brand-btn" class="btn btn-primary btn-sm">Save Brand & Contact Settings</button>';

      document.getElementById("save-brand-btn").addEventListener("click", function () {
        state.profile.brandName = document.getElementById("br-brand").value.trim();
        state.profile.designerName = document.getElementById("br-name").value.trim();
        state.profile.discordUsername = document.getElementById("br-dc-user").value.trim();
        state.profile.discordInviteUrl = document.getElementById("br-dc-url").value.trim();
        state.profile.instagramHandle = document.getElementById("br-ig-handle").value.trim();
        state.profile.instagramUrl = document.getElementById("br-ig-url").value.trim();
        state.profile.accentColor = document.getElementById("br-c1").value;
        state.profile.secondaryColor = document.getElementById("br-c2").value;
        state.profile.availabilityText = document.getElementById("br-avail").value.trim();
        state.profile.heroSubtitle = document.getElementById("br-sub").value.trim();
        saveState();
        applyThemeColors();
        renderProfileAndHero();
        showToast("✅ Brand, Discord & Instagram settings saved!");
      });
    }
  }

  // Master event delegation for the entire page (Zero inline onclick bugs!)
  function setupGlobalClicks() {
    document.addEventListener("click", function (e) {
      var target = e.target;

      // 1. Category filter pill
      var catBtn = target.closest("[data-cat]");
      if (catBtn) {
        activeCategory = catBtn.getAttribute("data-cat");
        renderCategories();
        renderPortfolio();
        return;
      }

      // 2. Lightbox trigger
      var lbTrigger = target.closest("[data-lightbox-id]");
      if (lbTrigger) {
        openLightbox(lbTrigger.getAttribute("data-lightbox-id"));
        return;
      }

      // 3. Plan Order trigger
      var planTrigger = target.closest("[data-order-plan-idx]");
      if (planTrigger) {
        var pIdx = Number(planTrigger.getAttribute("data-order-plan-idx"));
        openContactHub(pIdx);
        return;
      }

      // 4. Admin delete portfolio item
      var delWorkBtn = target.closest("[data-del-work]");
      if (delWorkBtn) {
        var wIdx = Number(delWorkBtn.getAttribute("data-del-work"));
        state.portfolio.splice(wIdx, 1);
        saveState();
        renderPortfolio();
        renderAdminStudioBody();
        showToast("🗑 Thumbnail removed.");
        return;
      }

      // 5. Admin toggle review verified badge
      var verifyBtn = target.closest("[data-toggle-verify]");
      if (verifyBtn) {
        var rIdx = Number(verifyBtn.getAttribute("data-toggle-verify"));
        state.reviews[rIdx].verified = !state.reviews[rIdx].verified;
        saveState();
        renderReviews();
        renderAdminStudioBody();
        showToast(state.reviews[rIdx].verified ? "✔ Verified Badge enabled!" : "Verified Badge removed.");
        return;
      }

      // 6. Admin delete review
      var delRevBtn = target.closest("[data-del-review]");
      if (delRevBtn) {
        var dIdx = Number(delRevBtn.getAttribute("data-del-review"));
        state.reviews.splice(dIdx, 1);
        saveState();
        renderReviews();
        renderAdminStudioBody();
        showToast("🗑 Review deleted.");
        return;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyThemeColors();
    renderProfileAndHero();
    renderStats();
    renderCategories();
    renderPortfolio();
    renderPlans();
    renderReviews();
    setupInteractiveLab();
    setupPublicReviewForm();
    setupGlobalClicks();

    // Navbar & Hero Discord copy buttons
    var dcCopyBtns = document.querySelectorAll(".js-copy-discord");
    for (var i = 0; i < dcCopyBtns.length; i++) {
      dcCopyBtns[i].addEventListener("click", function () {
        var handle = (state.profile && state.profile.discordUsername) || "binayak.design";
        copyToClipboard(handle, "🎮 Copied Discord ID: " + handle);
      });
    }

    // Footer Instagram DM button
    var openHubBtns = document.querySelectorAll(".js-open-contact-hub");
    for (var j = 0; j < openHubBtns.length; j++) {
      openHubBtns[j].addEventListener("click", function () {
        openContactHub(null);
      });
    }

    // Contact Hub Modal buttons
    var hubCopyDiscordBtn = document.getElementById("hub-copy-discord-btn");
    if (hubCopyDiscordBtn) {
      hubCopyDiscordBtn.addEventListener("click", function () {
        var handle = (state.profile && state.profile.discordUsername) || "binayak.design";
        copyToClipboard(handle, "🎮 Discord username '" + handle + "' copied! Add friend on Discord.");
      });
    }

    var hubCopyBriefDiscordBtn = document.getElementById("hub-copy-brief-discord-btn");
    if (hubCopyBriefDiscordBtn) {
      hubCopyBriefDiscordBtn.addEventListener("click", function () {
        var brief = document.getElementById("contact-brief-textarea").value;
        copyToClipboard(brief, "📋 Order brief copied! Paste it in Discord DM.");
        if (state.profile && state.profile.discordInviteUrl) {
          window.open(state.profile.discordInviteUrl, "_blank", "noopener");
        }
      });
    }

    var hubCopyIgBtn = document.getElementById("hub-copy-ig-btn");
    if (hubCopyIgBtn) {
      hubCopyIgBtn.addEventListener("click", function () {
        var brief = document.getElementById("contact-brief-textarea").value;
        copyToClipboard(brief, "📸 Order brief copied! Opening Instagram...");
        var igUrl = (state.profile && state.profile.instagramUrl) || "https://instagram.com";
        window.open(igUrl, "_blank", "noopener");
      });
    }

    // View mode buttons
    var gridBtn = document.getElementById("mode-detailed-btn");
    var ytBtn = document.getElementById("mode-yt-btn");
    if (gridBtn && ytBtn) {
      gridBtn.addEventListener("click", function () {
        isYouTubeFeedMode = false;
        gridBtn.classList.add("active");
        ytBtn.classList.remove("active");
        renderPortfolio();
      });
      ytBtn.addEventListener("click", function () {
        isYouTubeFeedMode = true;
        ytBtn.classList.add("active");
        gridBtn.classList.remove("active");
        renderPortfolio();
      });
    }

    // Admin Studio open/close & tabs
    var adminFab = document.getElementById("admin-studio-fab");
    var adminModal = document.getElementById("admin-studio-modal");
    var closeAdminBtn = document.getElementById("close-admin-modal");
    if (adminFab && adminModal) {
      adminFab.addEventListener("click", function () {
        renderAdminStudioBody();
        adminModal.classList.add("open");
      });
    }
    if (closeAdminBtn && adminModal) {
      closeAdminBtn.addEventListener("click", function () {
        adminModal.classList.remove("open");
      });
    }

    var tabBtns = document.querySelectorAll(".admin-tab-btn");
    for (var t = 0; t < tabBtns.length; t++) {
      tabBtns[t].addEventListener("click", function () {
        for (var k = 0; k < tabBtns.length; k++) tabBtns[k].classList.remove("active");
        this.classList.add("active");
        currentAdminTab = this.getAttribute("data-tab");
        renderAdminStudioBody();
      });
    }

    // Export updated config.js
    var exportBtn = document.getElementById("admin-export-config-btn");
    if (exportBtn) {
      exportBtn.addEventListener("click", function () {
        var content =
          "// ============================================================================\n" +
          "// BINAYAK.DESIGN — CENTRAL CONFIGURATION FILE (config.js)\n" +
          "// Exported from Owner Visual Admin Studio\n" +
          "// ============================================================================\n\n" +
          "window.PORTFOLIO_CONFIG = " + JSON.stringify(state, null, 2) + ";\n";
        var blob = new Blob([content], { type: "application/javascript;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "config.js";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("💾 Downloaded updated config.js!");
      });
    }

    // Reset preview button
    var resetBtn = document.getElementById("admin-reset-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        localStorage.removeItem(STORAGE_KEY);
        state = getDefaultConfig();
        applyThemeColors();
        renderProfileAndHero();
        renderStats();
        renderCategories();
        renderPortfolio();
        renderPlans();
        renderReviews();
        renderAdminStudioBody();
        showToast("🔄 Reset to default config.js!");
      });
    }

    // Close modals when clicking backdrop or close buttons
    var closeLb = document.getElementById("close-lightbox-modal");
    var lbModal = document.getElementById("lightbox-modal");
    if (closeLb && lbModal) {
      closeLb.addEventListener("click", function () { lbModal.classList.remove("open"); });
    }

    var closeCh = document.getElementById("close-contact-hub-modal");
    var chModal = document.getElementById("contact-hub-modal");
    if (closeCh && chModal) {
      closeCh.addEventListener("click", function () { chModal.classList.remove("open"); });
    }

    var allBackdrops = document.querySelectorAll(".modal-backdrop");
    for (var b = 0; b < allBackdrops.length; b++) {
      allBackdrops[b].addEventListener("click", function (e) {
        if (e.target === this) this.classList.remove("open");
      });
    }
  });
})();
