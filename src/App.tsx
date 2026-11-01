import React, { useState, useEffect, useMemo } from 'react';
import { DEFAULT_SITE_DATA } from './data/defaultData';
import { SiteData, PortfolioItem, PricingPlan, ClientItem, ReviewItem, StatItem } from './types';
import {
  loadSiteData,
  saveSiteData,
  extractYouTubeVideoId,
  getYouTubeThumbnailUrl,
  ThumbnailResolution,
  fetchYouTubeChannelLogo,
  loginAdminStudio,
  logoutAdminStudio,
  isAdminAuthenticated,
  submitPublicCommunityReview,
  readImageFileAsDataUrl
} from './services/api';

export default function App() {
  const [data, setData] = useState<SiteData>(DEFAULT_SITE_DATA);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null);
  const [orderPlan, setOrderPlan] = useState<PricingPlan | null>(null);
  const [briefText, setBriefText] = useState<string>('');
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  // Secret Admin Studio Authentication & 11-Tab State
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [adminOpen, setAdminOpen] = useState<boolean>(false);
  const [adminPassInput, setAdminPassInput] = useState<string>('');
  const [adminTab, setAdminTab] = useState<string>('overview');

  // Admin Tab 2: Portfolio Builder
  const [pTitle, setPTitle] = useState('');
  const [pClient, setPClient] = useState('');
  const [pCategory, setPCategory] = useState('Minecraft');
  const [pInputUrl, setPInputUrl] = useState('');
  const [pYtRes, setPYtRes] = useState<ThumbnailResolution>('maxresdefault');
  const [pCtr, setPCtr] = useState('14.2%');
  const [pViews, setPViews] = useState('1.2M Views');
  const [pDesc, setPDesc] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  // Admin Tab 3: Owner Verified Review Builder
  const [adminRevName, setAdminRevName] = useState('');
  const [adminRevRole, setAdminRevRole] = useState('');
  const [adminRevYt, setAdminRevYt] = useState('');
  const [adminRevAvatar, setAdminRevAvatar] = useState('');
  const [adminRevRating, setAdminRevRating] = useState(5);
  const [adminRevComment, setAdminRevComment] = useState('');

  // Admin Tab 4: Client Builder
  const [cName, setCName] = useState('');
  const [cChannelUrl, setCChannelUrl] = useState('');
  const [cLogoUrl, setCLogoUrl] = useState('');
  const [cSubs, setCSubs] = useState('');
  const [cDesc, setCDesc] = useState('');

  // Admin Tab 5: Pricing Plan Builder
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState('₹1,499');
  const [planPeriod, setPlanPeriod] = useState('per project');
  const [planBadge, setPlanBadge] = useState('CUSTOM OFFER');
  const [planDesc, setPlanDesc] = useState('');
  const [planFeaturesText, setPlanFeaturesText] = useState('1 Premium Thumbnail\nCustom 3D Lighting\n2 Revisions');

  // Admin Tab 6: Stat Builder
  const [statLabel, setStatLabel] = useState('');
  const [statValue, setStatValue] = useState('');
  const [statDesc, setStatDesc] = useState('');

  // Public Visitor Review Modal State
  const [pubName, setPubName] = useState('');
  const [pubRole, setPubRole] = useState('');
  const [pubYt, setPubYt] = useState('');
  const [pubAvatar, setPubAvatar] = useState('');
  const [pubRating, setPubRating] = useState(5);
  const [pubComment, setPubComment] = useState('');
  const [lastReviewTime, setLastReviewTime] = useState<number>(0);

  useEffect(() => {
    loadSiteData(DEFAULT_SITE_DATA).then((loaded) => {
      setData(loaded);
      document.title = loaded.siteTitle || 'BASOORI GRAPHICS';
    });
  }, []);

  // Secret Entry: Keyboard Shortcut (Ctrl + Shift + B) or Hash Route (#admin-studio)
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === (data.secretRouteSlug || '#admin-studio')) {
        if (isAdminAuthenticated()) setAdminOpen(true);
        else setLoginModalOpen(true);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);

    const onKeyDown = (e: KeyboardEvent) => {
      const targetKey = (data.secretShortcutKey || 'b').toLowerCase();
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === targetKey) {
        e.preventDefault();
        if (isAdminAuthenticated()) setAdminOpen(true);
        else setLoginModalOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('hashchange', checkHash);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [data.secretShortcutKey, data.secretRouteSlug]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3800);
  };

  const commitData = async (next: SiteData, msg = 'Changes saved to persistent database.') => {
    setData(next);
    document.title = next.siteTitle || next.brandName;
    await saveSiteData(next);
    showToast(msg);
  };

  const detectedYtId = useMemo(() => extractYouTubeVideoId(pInputUrl), [pInputUrl]);
  const previewPortfolioImg = useMemo(() => {
    if (detectedYtId) return getYouTubeThumbnailUrl(detectedYtId, pYtRes);
    return pInputUrl.trim();
  }, [detectedYtId, pYtRes, pInputUrl]);

  const filteredPortfolio = useMemo(() => {
    return data.portfolio.filter((item) => {
      const catOk = selectedCategory === 'All' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const searchOk =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.client.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return catOk && searchOk;
    });
  }, [data.portfolio, selectedCategory, searchQuery]);

  const openOrderHub = (plan: PricingPlan) => {
    setOrderPlan(plan);
    setBriefText(
      `Hello ${data.brandName}!\nI'm interested in the ${plan.name} (${plan.price}).\n\nProject details:\n- Channel name: \n- Channel URL: \n- Thumbnail niche: \n- Preferred style: \n- Reference images: \n- Deadline: \n- Additional requirements: \n\nPlease let me know the next steps.`
    );
  };

  const handlePublicReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Date.now() - lastReviewTime < 25000) {
      showToast('Rate limit active: Please wait 25 seconds before posting another review.');
      return;
    }
    const cleanName = pubName.replace(/[<>]/g, '').trim();
    const cleanComment = pubComment.replace(/[<>]/g, '').trim();
    if (!cleanName || !cleanComment) {
      showToast('Please fill in your name and written feedback.');
      return;
    }
    const created = await submitPublicCommunityReview({
      name: cleanName,
      role: pubRole.replace(/[<>]/g, '').trim() || 'Community Creator',
      avatarUrl:
        pubAvatar.trim() ||
        `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(cleanName)}`,
      channelUrl: pubYt.trim(),
      rating: pubRating,
      comment: cleanComment
    });
    const next = { ...data, reviews: [created, ...data.reviews] };
    await commitData(next, 'Submitted! Published as an Unverified Community Post.');
    setLastReviewTime(Date.now());
    setReviewModalOpen(false);
    setPubName('');
    setPubRole('');
    setPubYt('');
    setPubAvatar('');
    setPubComment('');
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 mc-border bg-[#0d111d] border-emerald-500 px-4 py-3 rounded-lg text-xs font-mono text-emerald-300 shadow-2xl">
          ✔ {toast}
        </div>
      )}

      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#07080c]/90 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <a href="#" className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-sm flex items-center justify-center font-extrabold text-black mc-button"
              style={{ backgroundColor: data.primaryColor }}
            >
              B
            </div>
            <div>
              <span className="font-extrabold tracking-wider text-sm md:text-base block leading-none">
                {data.brandName}
              </span>
              <span className="text-[10px] font-mono text-emerald-400">HIGH-CTR CREATIVE STUDIO</span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-xs font-mono uppercase tracking-wider text-slate-300">
            {data.sectionsVisible.about && <a href="#about" className="hover:text-emerald-400">About</a>}
            {data.sectionsVisible.portfolio && <a href="#portfolio" className="hover:text-emerald-400">Portfolio</a>}
            {data.sectionsVisible.stats && <a href="#stats" className="hover:text-emerald-400">Stats</a>}
            {data.sectionsVisible.clients && <a href="#clients" className="hover:text-emerald-400">Creators</a>}
            {data.sectionsVisible.reviews && <a href="#reviews" className="hover:text-emerald-400">Reviews</a>}
            {data.sectionsVisible.pricing && <a href="#pricing" className="hover:text-emerald-400">Pricing (₹)</a>}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#pricing"
              className="px-4 py-2 rounded text-xs font-extrabold text-black mc-button"
              style={{ backgroundColor: data.primaryColor }}
            >
              ORDER A THUMBNAIL
            </a>
          </div>
        </div>
      </header>

      {/* A. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 pt-12 pb-20 md:py-24 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            {data.availabilityText}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.12]">
            {data.heroHeadline}
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
            {data.heroSubtitle}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="#portfolio"
              className="px-6 py-3.5 rounded font-extrabold text-xs sm:text-sm text-black mc-button"
              style={{ backgroundColor: data.primaryColor }}
            >
              EXPLORE MY WORK
            </a>
            <a
              href="#pricing"
              className="px-6 py-3.5 rounded font-extrabold text-xs sm:text-sm text-white mc-button"
              style={{ backgroundColor: data.secondaryColor }}
            >
              ORDER A THUMBNAIL
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-3 text-xs font-mono text-slate-400">
            <span>🎮 Discord: <strong className="text-white">{data.discordUsername}</strong></span>
            <span>📸 Instagram: <strong className="text-white">{data.instagramUsername}</strong></span>
          </div>
        </div>

        <div className="lg:col-span-5">
          {data.portfolio[0] && (
            <div
              onClick={() => setLightboxItem(data.portfolio[0])}
              className="mc-border bg-[#0d111d] p-3.5 rounded-xl cursor-pointer group"
            >
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                <img
                  src={data.portfolio[0].imageUrl}
                  alt={data.portfolio[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 bg-black/85 border border-emerald-500/60 px-2.5 py-1 rounded text-[11px] font-mono text-emerald-300">
                  FEATURED SHOWCASE
                </div>
                {data.portfolio[0].ctr && (
                  <div className="absolute bottom-3 right-3 bg-emerald-500 text-black font-mono font-extrabold text-xs px-2.5 py-1 rounded">
                    CTR {data.portfolio[0].ctr}
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{data.portfolio[0].title}</div>
                  <div className="text-slate-400 font-mono">{data.portfolio[0].client} • {data.portfolio[0].views}</div>
                </div>
                <span className="text-emerald-400 font-mono">Inspect ↗</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* B. ABOUT / INTRODUCTION SECTION */}
      {data.sectionsVisible.about && (
        <section id="about" className="max-w-7xl mx-auto px-4 py-16 border-t border-slate-900">
          <div className="mc-border bg-[#0d111d] p-6 sm:p-10 rounded-xl grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4 flex flex-col items-center text-center space-y-3">
              <img
                src={data.avatarUrl}
                alt={data.designerName}
                className="w-28 h-28 rounded-xl border-2 border-emerald-500 bg-slate-900 object-cover"
              />
              <h2 className="font-extrabold text-lg">{data.designerName}</h2>
              <span className="px-3 py-1 rounded bg-purple-500/15 border border-purple-500/40 text-purple-300 font-mono text-xs">
                {data.experienceYears}
              </span>
            </div>
            <div className="md:col-span-8 space-y-4">
              <div className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                ABOUT THE CREATIVE STUDIO
              </div>
              <h3 className="text-2xl font-extrabold">
                Engineered Like a Minecraft Masterpiece. Built for YouTube Growth.
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">{data.bio}</p>
              <div className="pt-2">
                <div className="text-xs font-mono text-slate-400 mb-2">CORE ARSENAL & SPECIALIZATIONS:</div>
                <div className="flex flex-wrap gap-2">
                  {[...data.skills, ...data.specializations].map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded bg-[#07080c] border border-slate-800 text-xs font-mono text-slate-200"
                    >
                      ◆ {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* C. PORTFOLIO / FEATURED CREATIONS */}
      {data.sectionsVisible.portfolio && (
        <section id="portfolio" className="max-w-7xl mx-auto px-4 py-16 border-t border-slate-900">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1">
                INVENTORY OF VIRAL PACKAGING
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold">FEATURED PORTFOLIO CREATIONS</h2>
            </div>
            <input
              type="search"
              placeholder="Search projects, clients, or niche..."
              value={searchQuery}
              onChange={(e) => {
                if (e.target.value.trim() === '/admin') {
                  setSearchQuery('');
                  if (isAdminAuthenticated()) setAdminOpen(true);
                  else setLoginModalOpen(true);
                  return;
                }
                setSearchQuery(e.target.value);
              }}
              className="bg-[#0d111d] border border-slate-700 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-white w-full md:w-72"
            />
          </div>

          {/* Dynamic Category Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {data.categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded text-xs font-mono transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-black font-extrabold'
                    : 'bg-[#0d111d] text-slate-300 border border-slate-800 hover:border-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Portfolio Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPortfolio.map((item) => (
              <div
                key={item.id}
                onClick={() => setLightboxItem(item)}
                className="mc-border bg-[#0d111d] rounded-xl overflow-hidden cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video bg-black overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (item.youtubeId && target.src.includes('maxresdefault')) {
                          target.src = getYouTubeThumbnailUrl(item.youtubeId, 'hqdefault');
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-black/80 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono text-slate-200">
                      {item.category}
                    </span>
                    {item.ctr && (
                      <span className="absolute top-2.5 right-2.5 bg-emerald-500 text-black font-mono font-extrabold text-xs px-2 py-0.5 rounded">
                        CTR {item.ctr}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-xs font-mono text-purple-400 mb-1">
                      {item.client} {item.views ? `• ${item.views}` : ''}
                    </div>
                    <h3 className="font-bold text-base leading-snug mb-1.5">{item.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                  </div>
                </div>
                <div className="px-4 pb-3 pt-1 flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-slate-800/60">
                  <span>{item.publishedAt}</span>
                  <span className="text-emerald-400">Full View ↗</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* D. PERFORMANCE & ACHIEVEMENT STATISTICS */}
      {data.sectionsVisible.stats && (
        <section id="stats" className="max-w-7xl mx-auto px-4 py-16 border-t border-slate-900">
          <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1">
            ADVANCEMENTS UNLOCKED
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-8">
            PERFORMANCE & ACHIEVEMENT STATISTICS
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.stats
              .filter((s) => s.visible)
              .map((stat) => (
                <div key={stat.id} className="mc-border bg-[#0d111d] p-5 rounded-xl">
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">
                    {stat.value}
                  </div>
                  <div className="font-bold text-base mt-1.5">{stat.label}</div>
                  <div className="text-xs text-slate-400 mt-1">{stat.description}</div>
                </div>
              ))}
          </div>
          {data.showDisclaimer && (
            <p className="text-xs font-mono text-slate-500 mt-4">
              * Statistics represent owner-reported creator campaign metrics and documented client analytics.
            </p>
          )}
        </section>
      )}

      {/* E. CLIENTS & CREATOR COLLABORATIONS */}
      {data.sectionsVisible.clients && (
        <section id="clients" className="max-w-7xl mx-auto px-4 py-16 border-t border-slate-900">
          <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1">
            TRUSTED BY TOP CHANNELS
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-8">
            CREATOR COLLABORATIONS & ROSTER
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.clients.map((client) => (
              <div key={client.id} className="mc-border bg-[#0d111d] p-5 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3.5 mb-3">
                    <img
                      src={client.logoUrl}
                      alt={client.name}
                      className="w-12 h-12 rounded-full border border-emerald-500 bg-slate-900 object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-base">{client.name}</h3>
                      <div className="text-xs font-mono text-emerald-400">{client.subscribers}</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">{client.description}</p>
                  {client.testimonial && (
                    <blockquote className="text-xs italic text-slate-400 border-l-2 border-purple-500 pl-3 mb-3">
                      "{client.testimonial}"
                    </blockquote>
                  )}
                </div>
                {client.channelUrl && (
                  <a
                    href={client.channelUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-purple-400 hover:underline inline-block mt-2"
                  >
                    Visit YouTube Channel ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* F. DUAL REVIEW SYSTEM (PUBLIC VISITOR + OWNER VERIFIED) */}
      {data.sectionsVisible.reviews && (
        <section id="reviews" className="max-w-7xl mx-auto px-4 py-16 border-t border-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1">
                VERIFIED CLIENT BADGES & COMMUNITY FEEDBACK
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold">CLIENT REVIEWS & TESTIMONIALS</h2>
            </div>
            <button
              onClick={() => setReviewModalOpen(true)}
              className="px-5 py-2.5 rounded font-extrabold text-xs text-white mc-button"
              style={{ backgroundColor: data.secondaryColor }}
            >
              ✍️ POST A REVIEW
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {data.reviews
              .filter((r) => !r.hidden)
              .map((rev) => (
                <div
                  key={rev.id}
                  className="mc-border bg-[#0d111d] p-5 rounded-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.avatarUrl}
                          alt={rev.name}
                          className="w-10 h-10 rounded-full bg-slate-800 object-cover"
                        />
                        <div>
                          <div className="font-bold text-sm">{rev.name}</div>
                          <div className="text-xs text-slate-400">{rev.role}</div>
                        </div>
                      </div>
                      {rev.verified ? (
                        <span className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-mono text-[11px] font-bold">
                          ✔ VERIFIED CLIENT
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[11px]">
                          UNVERIFIED COMMUNITY POST
                        </span>
                      )}
                    </div>
                    <div className="text-amber-400 text-sm mb-2">
                      {'★'.repeat(Math.max(1, Math.min(5, rev.rating)))}
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">{rev.comment}</p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Published {rev.createdAt}</span>
                    {rev.channelUrl && (
                      <a
                        href={rev.channelUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-400 hover:underline"
                      >
                        Channel ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* 3. THUMBNAIL DESIGNING PLANS & PRICING (INR ₹) */}
      {data.sectionsVisible.pricing && (
        <section id="pricing" className="max-w-7xl mx-auto px-4 py-16 border-t border-slate-900">
          <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1">
            TRANSPARENT INR (₹) CREATOR PACKAGES
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">
            THUMBNAIL DESIGNING PLANS & PRICING
          </h2>
          <p className="text-slate-400 text-sm mb-8">
            Click Order Now, Discord DM, or Instagram DM on any package to launch the pre-filled Project Brief Hub.
          </p>

          <div className="grid lg:grid-cols-3 gap-6">
            {data.pricing
              .filter((p) => p.enabled)
              .map((plan) => (
                <div
                  key={plan.id}
                  className={`mc-border bg-[#0d111d] p-6 rounded-xl flex flex-col justify-between ${
                    plan.popular ? 'border-emerald-500 ring-1 ring-emerald-500/40' : ''
                  }`}
                >
                  <div>
                    {plan.badge && (
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 border border-purple-500 text-purple-300 mb-3">
                        {plan.badge}
                      </span>
                    )}
                    <h3 className="text-lg font-extrabold">{plan.name}</h3>
                    <div className="my-3">
                      <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                        {plan.price}
                      </span>
                      <span className="text-xs text-slate-400 ml-1.5">{plan.billingPeriod}</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">{plan.description}</p>
                    <ul className="space-y-2 text-xs text-slate-200 mb-6">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">✔</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => openOrderHub(plan)}
                      className="w-full py-2.5 rounded font-extrabold text-xs text-black mc-button"
                      style={{ backgroundColor: data.primaryColor }}
                    >
                      {plan.ctaLabel || 'ORDER NOW'}
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openOrderHub(plan)}
                        className="py-2 rounded bg-[#5865F2] text-white font-bold text-xs mc-button"
                      >
                        🎮 Discord DM
                      </button>
                      <button
                        onClick={() => openOrderHub(plan)}
                        className="py-2 rounded bg-pink-600 text-white font-bold text-xs mc-button"
                      >
                        📸 Instagram DM
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Footer (Zero Public Admin Links — Secret Triple-Click Obsidian Cube Only) */}
      <footer className="mt-auto border-t border-slate-900 py-10 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <button
              aria-label="Obsidian Block"
              onClick={(e) => {
                if (e.detail === 3) {
                  if (isAdminAuthenticated()) setAdminOpen(true);
                  else setLoginModalOpen(true);
                }
              }}
              className="w-3.5 h-3.5 bg-slate-800 border border-slate-700 rounded-sm cursor-default"
            />
            <span>{data.footerText}</span>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <a href={data.discordInviteUrl} target="_blank" rel="noreferrer" className="hover:text-emerald-400">
              Discord ({data.discordUsername})
            </a>
            <a href={data.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-emerald-400">
              Instagram ({data.instagramUsername})
            </a>
          </div>
        </div>
      </footer>

      {/* 4. INTERACTIVE DISCORD & INSTAGRAM ORDER HUB MODAL */}
      {orderPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="mc-border bg-[#0d111d] max-w-lg w-full p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase">
                  INTERACTIVE CLIENT ACQUISITION HUB
                </span>
                <h3 className="font-extrabold text-lg">
                  Order: {orderPlan.name} ({orderPlan.price})
                </h3>
              </div>
              <button onClick={() => setOrderPlan(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Fill in your channel details below, click <strong>Copy Project Brief</strong>, and open Discord or Instagram DM to paste your brief directly.
            </p>
            <textarea
              rows={9}
              value={briefText}
              onChange={(e) => setBriefText(e.target.value)}
              className="w-full bg-[#07080c] border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-100"
            />
            <div className="grid sm:grid-cols-3 gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(briefText);
                  showToast('Project brief copied to clipboard!');
                }}
                className="py-2.5 bg-emerald-500 text-black font-extrabold text-xs rounded mc-button"
              >
                📋 COPY BRIEF
              </button>
              <a
                href={data.discordInviteUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => navigator.clipboard.writeText(briefText)}
                className="py-2.5 bg-[#5865F2] text-white font-bold text-xs rounded text-center mc-button"
              >
                🎮 Discord ({data.discordUsername})
              </a>
              <a
                href={data.instagramUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => navigator.clipboard.writeText(briefText)}
                className="py-2.5 bg-pink-600 text-white font-bold text-xs rounded text-center mc-button"
              >
                📸 Instagram DM
              </a>
            </div>
          </div>
        </div>
      )}

      {/* PUBLIC VISITOR REVIEW SUBMISSION MODAL */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handlePublicReviewSubmit}
            className="mc-border bg-[#0d111d] max-w-md w-full p-6 rounded-xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base">✍️ POST A PUBLIC REVIEW</h3>
              <button type="button" onClick={() => setReviewModalOpen(false)} className="text-slate-400">
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Public submissions appear immediately as <strong>UNVERIFIED COMMUNITY POSTS</strong>. Only the studio owner can grant the Verified Client badge.
            </p>
            <input
              required
              placeholder="Your Name *"
              value={pubName}
              onChange={(e) => setPubName(e.target.value)}
              className="w-full bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
            />
            <input
              placeholder="Channel Name / Role (e.g. Gaming Creator)"
              value={pubRole}
              onChange={(e) => setPubRole(e.target.value)}
              className="w-full bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
            />
            <div className="flex gap-2">
              <input
                placeholder="YouTube Channel URL or @handle (optional)"
                value={pubYt}
                onChange={(e) => setPubYt(e.target.value)}
                className="flex-1 bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
              />
              <button
                type="button"
                onClick={async () => {
                  const res = await fetchYouTubeChannelLogo(pubYt);
                  if (res.avatarUrl) {
                    setPubAvatar(res.avatarUrl);
                    showToast(res.message || 'Channel avatar loaded!');
                  }
                }}
                className="px-3 py-2 bg-purple-600 text-white font-bold text-xs rounded"
              >
                Fetch Logo
              </button>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400">Star Rating:</span>
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setPubRating(num)}
                  className={`text-lg ${num <= pubRating ? 'text-amber-400' : 'text-slate-600'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              required
              rows={4}
              placeholder="Write your feedback..."
              value={pubComment}
              onChange={(e) => setPubComment(e.target.value)}
              className="w-full bg-[#07080c] border border-slate-700 rounded p-3 text-xs"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-500 text-black font-extrabold text-xs rounded mc-button"
            >
              SUBMIT COMMUNITY REVIEW
            </button>
          </form>
        </div>
      )}

      {/* FULL-SCREEN PORTFOLIO LIGHTBOX */}
      {lightboxItem && (
        <div
          onClick={() => setLightboxItem(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="mc-border bg-[#0d111d] max-w-4xl w-full p-4 rounded-xl space-y-3"
          >
            <img
              src={lightboxItem.imageUrl}
              alt={lightboxItem.title}
              className="w-full aspect-video object-cover rounded-lg"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-lg">{lightboxItem.title}</h3>
                <p className="text-xs text-slate-400">
                  {lightboxItem.client} • {lightboxItem.category} • {lightboxItem.description}
                </p>
              </div>
              <button
                onClick={() => setLightboxItem(null)}
                className="px-4 py-1.5 bg-slate-800 rounded text-xs font-mono"
              >
                Close ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECRET ADMIN LOGIN GATE */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="mc-border bg-[#0d111d] max-w-sm w-full p-6 rounded-xl space-y-4">
            <div className="text-xs font-mono text-emerald-400">SECRET VISUAL ADMIN STUDIO</div>
            <h3 className="font-extrabold text-lg">Owner Authentication Required</h3>
            <input
              type="password"
              placeholder="Enter Admin Studio Password"
              value={adminPassInput}
              onChange={(e) => setAdminPassInput(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                  const res = await loginAdminStudio(adminPassInput);
                  if (res.authenticated) {
                    setLoginModalOpen(false);
                    setAdminOpen(true);
                    setAdminPassInput('');
                  } else {
                    showToast(res.error || 'Authentication failed');
                  }
                }
              }}
              className="w-full bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  const res = await loginAdminStudio(adminPassInput);
                  if (res.authenticated) {
                    setLoginModalOpen(false);
                    setAdminOpen(true);
                    setAdminPassInput('');
                  } else {
                    showToast(res.error || 'Authentication failed');
                  }
                }}
                className="flex-1 py-2 bg-emerald-500 text-black font-extrabold text-xs rounded mc-button"
              >
                Unlock Admin Studio
              </button>
              <button
                onClick={() => setLoginModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-xs rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5 & 6. SECRET 11-TAB VISUAL ADMIN STUDIO */}
      {adminOpen && (
        <div className="fixed inset-0 z-50 bg-[#07080c] overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="mc-border bg-[#0d111d] p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-mono text-emerald-400">
                  AUTHENTICATED SESSION ACTIVE • PERSISTENT DATABASE CONNECTED
                </div>
                <h2 className="text-xl font-extrabold">BASOORI GRAPHICS — VISUAL ADMIN STUDIO</h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setAdminOpen(false)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs font-mono"
                >
                  View Public Site
                </button>
                <button
                  onClick={() => {
                    logoutAdminStudio();
                    setAdminOpen(false);
                    showToast('Logged out of Admin Studio.');
                  }}
                  className="px-3.5 py-2 bg-red-600 text-white rounded text-xs font-bold"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* 11 Admin Studio Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'overview', label: '1. Overview' },
                { id: 'portfolio', label: '2. Portfolio Manager' },
                { id: 'reviews', label: '3. Reviews & Verified Badges' },
                { id: 'clients', label: '4. Clients & Creators' },
                { id: 'pricing', label: '5. Pricing & Plans' },
                { id: 'stats', label: '6. Statistics' },
                { id: 'appearance', label: '7. Appearance' },
                { id: 'contacts', label: '8. Social & Contact' },
                { id: 'content', label: '9. Content & SEO' },
                { id: 'backup', label: '10. Backup & Restore' },
                { id: 'settings', label: '11. General Settings' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setAdminTab(t.id)}
                  className={`px-3 py-2 rounded text-xs font-mono ${
                    adminTab === t.id
                      ? 'bg-emerald-500 text-black font-extrabold'
                      : 'bg-[#0d111d] text-slate-300 border border-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB 1: OVERVIEW */}
            {adminTab === 'overview' && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="mc-border bg-[#0d111d] p-5 rounded-xl">
                  <div className="text-xs font-mono text-slate-400">TOTAL PORTFOLIO PROJECTS</div>
                  <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                    {data.portfolio.length}
                  </div>
                </div>
                <div className="mc-border bg-[#0d111d] p-5 rounded-xl">
                  <div className="text-xs font-mono text-slate-400">VERIFIED CLIENT REVIEWS</div>
                  <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                    {data.reviews.filter((r) => r.verified).length}
                  </div>
                </div>
                <div className="mc-border bg-[#0d111d] p-5 rounded-xl">
                  <div className="text-xs font-mono text-slate-400">COMMUNITY REVIEWS</div>
                  <div className="text-3xl font-extrabold text-purple-400 mt-1">
                    {data.reviews.filter((r) => !r.verified).length}
                  </div>
                </div>
                <div className="mc-border bg-[#0d111d] p-5 rounded-xl">
                  <div className="text-xs font-mono text-slate-400">ACTIVE PRICING PLANS</div>
                  <div className="text-3xl font-extrabold text-amber-400 mt-1">
                    {data.pricing.filter((p) => p.enabled).length}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PORTFOLIO MANAGER (Upload + Imgur URL + YouTube Auto-Extractor) */}
            {adminTab === 'portfolio' && (
              <div className="space-y-6">
                <div className="mc-border bg-[#0d111d] p-6 rounded-xl space-y-4">
                  <h3 className="font-extrabold text-base">
                    Add Portfolio Project (Direct Upload, Image URL, or YouTube Video URL)
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      placeholder="Project Title *"
                      value={pTitle}
                      onChange={(e) => setPTitle(e.target.value)}
                      className="bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                    />
                    <input
                      placeholder="Client / Channel Name *"
                      value={pClient}
                      onChange={(e) => setPClient(e.target.value)}
                      className="bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                    />
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                    >
                      {data.categories
                        .filter((c) => c !== 'All')
                        .map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                    </select>
                    <input
                      placeholder="Paste YouTube URL (watch?v=, youtu.be, shorts) or Imgur/Direct URL"
                      value={pInputUrl}
                      onChange={(e) => setPInputUrl(e.target.value)}
                      className="bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                    />
                    <input
                      placeholder="CTR Stat (e.g. 14.8%)"
                      value={pCtr}
                      onChange={(e) => setPCtr(e.target.value)}
                      className="bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                    />
                    <input
                      placeholder="Views Stat (e.g. 2.1M Views)"
                      value={pViews}
                      onChange={(e) => setPViews(e.target.value)}
                      className="bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                    />
                  </div>

                  {/* Direct File Upload Option */}
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <label className="px-3 py-2 bg-slate-800 rounded cursor-pointer font-mono">
                      📁 Or Upload Image File Directly
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const dataUrl = await readImageFileAsDataUrl(file);
                            setPInputUrl(dataUrl);
                            showToast('Image loaded & ready to publish.');
                          } catch (err: any) {
                            showToast(err.message);
                          }
                        }}
                      />
                    </label>

                    {detectedYtId && (
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-mono">
                          YouTube ID Detected: {detectedYtId}
                        </span>
                        <select
                          value={pYtRes}
                          onChange={(e) => setPYtRes(e.target.value as ThumbnailResolution)}
                          className="bg-[#07080c] border border-slate-700 rounded px-2 py-1 text-xs"
                        >
                          <option value="maxresdefault">HD (maxresdefault)</option>
                          <option value="sddefault">SD (sddefault)</option>
                          <option value="hqdefault">HQ Fallback (hqdefault)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {previewPortfolioImg && (
                    <div className="max-w-xs">
                      <div className="text-[11px] font-mono text-slate-400 mb-1">LIVE THUMBNAIL PREVIEW:</div>
                      <img
                        src={previewPortfolioImg}
                        alt="Preview"
                        className="w-full aspect-video object-cover rounded border border-emerald-500"
                      />
                    </div>
                  )}

                  <textarea
                    rows={2}
                    placeholder="Project description..."
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    className="w-full bg-[#07080c] border border-slate-700 rounded p-2.5 text-xs"
                  />

                  <button
                    onClick={() => {
                      if (!pTitle.trim() || !previewPortfolioImg) {
                        showToast('Please provide a title and valid image/YouTube URL.');
                        return;
                      }
                      const created: PortfolioItem = {
                        id: `p_${Date.now()}`,
                        title: pTitle.trim(),
                        client: pClient.trim() || 'Creator',
                        category: pCategory,
                        imageUrl: previewPortfolioImg,
                        youtubeUrl: detectedYtId ? pInputUrl : undefined,
                        youtubeId: detectedYtId || undefined,
                        ctr: pCtr.trim(),
                        views: pViews.trim(),
                        publishedAt: new Date().toISOString().split('T')[0],
                        description: pDesc.trim() || 'Custom high-CTR thumbnail composition.',
                        featured: true
                      };
                      commitData(
                        { ...data, portfolio: [created, ...data.portfolio] },
                        'Portfolio project published!'
                      );
                      setPTitle('');
                      setPClient('');
                      setPInputUrl('');
                      setPDesc('');
                    }}
                    className="px-5 py-2.5 bg-emerald-500 text-black font-extrabold text-xs rounded mc-button"
                  >
                    + PUBLISH PORTFOLIO ITEM
                  </button>
                </div>

                {/* Manage Categories */}
                <div className="mc-border bg-[#0d111d] p-4 rounded-xl flex flex-wrap items-center gap-2">
                  <input
                    placeholder="New Category Name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="bg-[#07080c] border border-slate-700 rounded px-3 py-1.5 text-xs"
                  />
                  <button
                    onClick={() => {
                      const c = newCategoryName.trim();
                      if (!c || data.categories.includes(c)) return;
                      commitData(
                        { ...data, categories: [...data.categories, c] },
                        `Added category: ${c}`
                      );
                      setNewCategoryName('');
                    }}
                    className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded"
                  >
                    + Add Category
                  </button>
                </div>

                {/* Existing Projects List */}
                <div className="space-y-2">
                  {data.portfolio.map((item) => (
                    <div
                      key={item.id}
                      className="mc-border bg-[#0d111d] p-3 rounded-lg flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-20 aspect-video object-cover rounded"
                        />
                        <div>
                          <div className="font-bold text-sm">{item.title}</div>
                          <div className="text-xs font-mono text-slate-400">
                            {item.client} • {item.category} • CTR {item.ctr}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          commitData(
                            {
                              ...data,
                              portfolio: data.portfolio.filter((x) => x.id !== item.id)
                            },
                            'Deleted portfolio item.'
                          )
                        }
                        className="px-3 py-1 bg-red-600/20 border border-red-500 text-red-300 text-xs rounded"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: REVIEWS & VERIFIED BADGES */}
            {adminTab === 'reviews' && (
              <div className="space-y-6">
                <div className="mc-border bg-[#0d111d] p-5 rounded-xl space-y-3">
                  <h3 className="font-extrabold text-base">Add Owner-Verified Client Review</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      placeholder="Client Name *"
                      value={adminRevName}
                      onChange={(e) => setAdminRevName(e.target.value)}
                      className="bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                    />
                    <input
                      placeholder="Channel / Role *"
                      value={adminRevRole}
                      onChange={(e) => setAdminRevRole(e.target.value)}
                      className="bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                    />
                    <div className="flex gap-2">
                      <input
                        placeholder="YouTube Channel @handle or URL"
                        value={adminRevYt}
                        onChange={(e) => setAdminRevYt(e.target.value)}
                        className="flex-1 bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const r = await fetchYouTubeChannelLogo(adminRevYt);
                          if (r.avatarUrl) {
                            setAdminRevAvatar(r.avatarUrl);
                            showToast('Fetched channel logo!');
                          }
                        }}
                        className="px-3 py-2 bg-purple-600 text-white text-xs font-bold rounded"
                      >
                        Fetch Logo
                      </button>
                    </div>
                    <input
                      placeholder="Or direct Avatar Image URL"
                      value={adminRevAvatar}
                      onChange={(e) => setAdminRevAvatar(e.target.value)}
                      className="bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                    />
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Client testimonial text *"
                    value={adminRevComment}
                    onChange={(e) => setAdminRevComment(e.target.value)}
                    className="w-full bg-[#07080c] border border-slate-700 rounded p-2.5 text-xs"
                  />
                  <button
                    onClick={() => {
                      if (!adminRevName.trim() || !adminRevComment.trim()) return;
                      const created: ReviewItem = {
                        id: `rev_${Date.now()}`,
                        name: adminRevName.trim(),
                        role: adminRevRole.trim() || 'Verified Creator',
                        avatarUrl:
                          adminRevAvatar.trim() ||
                          `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(
                            adminRevName
                          )}`,
                        channelUrl: adminRevYt.trim(),
                        rating: adminRevRating,
                        comment: adminRevComment.trim(),
                        verified: true,
                        featured: true,
                        hidden: false,
                        source: 'owner',
                        createdAt: new Date().toISOString().split('T')[0]
                      };
                      commitData(
                        { ...data, reviews: [created, ...data.reviews] },
                        'Added Verified Client Testimonial!'
                      );
                      setAdminRevName('');
                      setAdminRevRole('');
                      setAdminRevComment('');
                    }}
                    className="px-4 py-2 bg-emerald-500 text-black font-extrabold text-xs rounded mc-button"
                  >
                    + ADD VERIFIED CLIENT REVIEW
                  </button>
                </div>

                <div className="space-y-2">
                  {data.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="mc-border bg-[#0d111d] p-4 rounded-lg flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-sm">
                          {rev.name} <span className="text-slate-400 text-xs">({rev.role})</span>
                        </div>
                        <div className="text-xs text-slate-300 mt-0.5">{rev.comment}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const updated = data.reviews.map((x) =>
                              x.id === rev.id ? { ...x, verified: !x.verified } : x
                            );
                            commitData({ ...data, reviews: updated }, 'Updated Verified Client badge.');
                          }}
                          className={`px-3 py-1.5 rounded text-xs font-mono ${
                            rev.verified
                              ? 'bg-emerald-500 text-black font-bold'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {rev.verified ? '✔ VERIFIED CLIENT' : 'Grant Verified Badge'}
                        </button>
                        <button
                          onClick={() => {
                            const updated = data.reviews.filter((x) => x.id !== rev.id);
                            commitData({ ...data, reviews: updated }, 'Deleted review.');
                          }}
                          className="px-3 py-1.5 bg-red-600/20 border border-red-500 text-red-300 text-xs rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: CLIENTS & CREATORS */}
            {adminTab === 'clients' && (
              <div className="space-y-6">
                <div className="mc-border bg-[#0d111d] p-5 rounded-xl space-y-3">
                  <h3 className="font-extrabold text-base">Add Creator Collaboration</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      placeholder="Creator / Channel Name *"
                      value={cName}
                      onChange={(e) => setCName(e.target.value)}
                      className="bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                    />
                    <div className="flex gap-2">
                      <input
                        placeholder="YouTube Channel URL or @handle"
                        value={cChannelUrl}
                        onChange={(e) => setCChannelUrl(e.target.value)}
                        className="flex-1 bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const r = await fetchYouTubeChannelLogo(cChannelUrl);
                          if (r.avatarUrl) setCLogoUrl(r.avatarUrl);
                          if (r.title && !cName) setCName(r.title);
                          if (r.subscriberCount && !cSubs) setCSubs(r.subscriberCount);
                          showToast(r.message || 'Fetched channel info!');
                        }}
                        className="px-3 py-2 bg-purple-600 text-white text-xs font-bold rounded"
                      >
                        Fetch Channel Logo
                      </button>
                    </div>
                    <input
                      placeholder="Logo Image URL"
                      value={cLogoUrl}
                      onChange={(e) => setCLogoUrl(e.target.value)}
                      className="bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                    />
                    <input
                      placeholder="Subscribers (e.g. 1.2M Subscribers)"
                      value={cSubs}
                      onChange={(e) => setCSubs(e.target.value)}
                      className="bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                    />
                  </div>
                  <input
                    placeholder="Collaboration Description"
                    value={cDesc}
                    onChange={(e) => setCDesc(e.target.value)}
                    className="w-full bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                  />
                  <button
                    onClick={() => {
                      if (!cName.trim()) return;
                      const created: ClientItem = {
                        id: `c_${Date.now()}`,
                        name: cName.trim(),
                        logoUrl:
                          cLogoUrl.trim() ||
                          `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(cName)}`,
                        channelUrl: cChannelUrl.trim(),
                        subscribers: cSubs.trim() || 'Verified Creator',
                        description: cDesc.trim(),
                        featured: true
                      };
                      commitData({ ...data, clients: [created, ...data.clients] }, 'Added creator!');
                      setCName('');
                      setCChannelUrl('');
                      setCLogoUrl('');
                      setCSubs('');
                      setCDesc('');
                    }}
                    className="px-4 py-2 bg-emerald-500 text-black font-extrabold text-xs rounded mc-button"
                  >
                    + SAVE CREATOR
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: PRICING & PLANS MANAGER */}
            {adminTab === 'pricing' && (
              <div className="space-y-6">
                <div className="mc-border bg-[#0d111d] p-5 rounded-xl space-y-3">
                  <h3 className="font-extrabold text-base">Add Custom Pricing Plan (INR ₹)</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      placeholder="Plan Name"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      className="bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                    />
                    <input
                      placeholder="Price (e.g. ₹1,999)"
                      value={planPrice}
                      onChange={(e) => setPlanPrice(e.target.value)}
                      className="bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                    />
                    <input
                      placeholder="Billing Period"
                      value={planPeriod}
                      onChange={(e) => setPlanPeriod(e.target.value)}
                      className="bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                    />
                    <input
                      placeholder="Badge Text"
                      value={planBadge}
                      onChange={(e) => setPlanBadge(e.target.value)}
                      className="bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                    />
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Features (one per line)"
                    value={planFeaturesText}
                    onChange={(e) => setPlanFeaturesText(e.target.value)}
                    className="w-full bg-[#07080c] border border-slate-700 rounded p-2.5 text-xs"
                  />
                  <button
                    onClick={() => {
                      if (!planName.trim()) return;
                      const created: PricingPlan = {
                        id: `plan_${Date.now()}`,
                        name: planName.trim(),
                        price: planPrice.trim(),
                        billingPeriod: planPeriod.trim(),
                        badge: planBadge.trim(),
                        description: planDesc.trim() || 'Custom thumbnail package.',
                        features: planFeaturesText
                          .split('\n')
                          .map((s) => s.trim())
                          .filter(Boolean),
                        popular: false,
                        enabled: true,
                        ctaLabel: 'ORDER NOW'
                      };
                      commitData({ ...data, pricing: [...data.pricing, created] }, 'Added pricing plan!');
                      setPlanName('');
                    }}
                    className="px-4 py-2 bg-emerald-500 text-black font-extrabold text-xs rounded mc-button"
                  >
                    + ADD PRICING PLAN
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {data.pricing.map((p) => (
                    <div key={p.id} className="mc-border bg-[#0d111d] p-4 rounded-xl space-y-2">
                      <input
                        value={p.name}
                        onChange={(e) => {
                          const updated = data.pricing.map((x) =>
                            x.id === p.id ? { ...x, name: e.target.value } : x
                          );
                          setData({ ...data, pricing: updated });
                        }}
                        className="w-full bg-[#07080c] border border-slate-700 rounded px-2 py-1 text-xs font-bold"
                      />
                      <input
                        value={p.price}
                        onChange={(e) => {
                          const updated = data.pricing.map((x) =>
                            x.id === p.id ? { ...x, price: e.target.value } : x
                          );
                          setData({ ...data, pricing: updated });
                        }}
                        className="w-full bg-[#07080c] border border-slate-700 rounded px-2 py-1 text-xs text-emerald-400 font-mono"
                      />
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => commitData(data, `Saved ${p.name}`)}
                          className="flex-1 py-1.5 bg-emerald-500 text-black font-bold text-xs rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() =>
                            commitData(
                              { ...data, pricing: data.pricing.filter((x) => x.id !== p.id) },
                              'Deleted plan'
                            )
                          }
                          className="px-3 py-1.5 bg-red-600/20 border border-red-500 text-red-300 text-xs rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: STATISTICS MANAGER */}
            {adminTab === 'stats' && (
              <div className="space-y-4">
                <div className="mc-border bg-[#0d111d] p-5 rounded-xl grid sm:grid-cols-3 gap-3">
                  <input
                    placeholder="Stat Label (e.g. Avg CTR)"
                    value={statLabel}
                    onChange={(e) => setStatLabel(e.target.value)}
                    className="bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                  />
                  <input
                    placeholder="Value (e.g. 14.2%)"
                    value={statValue}
                    onChange={(e) => setStatValue(e.target.value)}
                    className="bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                  />
                  <button
                    onClick={() => {
                      if (!statLabel.trim() || !statValue.trim()) return;
                      const created: StatItem = {
                        id: `s_${Date.now()}`,
                        label: statLabel.trim(),
                        value: statValue.trim(),
                        description: statDesc.trim() || 'Owner-reported studio metric',
                        visible: true,
                        animated: true
                      };
                      commitData({ ...data, stats: [...data.stats, created] }, 'Added statistic!');
                      setStatLabel('');
                      setStatValue('');
                    }}
                    className="bg-emerald-500 text-black font-extrabold text-xs rounded py-2"
                  >
                    + Add Statistic
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {data.stats.map((st) => (
                    <div key={st.id} className="mc-border bg-[#0d111d] p-4 rounded-xl flex items-center justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <input
                          value={st.value}
                          onChange={(e) => {
                            const updated = data.stats.map((x) =>
                              x.id === st.id ? { ...x, value: e.target.value } : x
                            );
                            setData({ ...data, stats: updated });
                          }}
                          className="bg-[#07080c] border border-slate-700 rounded px-2 py-1 text-sm font-mono text-emerald-400 w-full"
                        />
                        <input
                          value={st.label}
                          onChange={(e) => {
                            const updated = data.stats.map((x) =>
                              x.id === st.id ? { ...x, label: e.target.value } : x
                            );
                            setData({ ...data, stats: updated });
                          }}
                          className="bg-[#07080c] border border-slate-700 rounded px-2 py-1 text-xs w-full"
                        />
                      </div>
                      <button
                        onClick={() => commitData(data, 'Saved statistics!')}
                        className="px-3 py-2 bg-emerald-500 text-black font-bold text-xs rounded"
                      >
                        Save
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: APPEARANCE MANAGER */}
            {adminTab === 'appearance' && (
              <div className="mc-border bg-[#0d111d] p-6 rounded-xl space-y-4">
                <h3 className="font-extrabold text-base">Brand Colors & Section Visibility</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">
                      Primary Accent Color (Emerald Default)
                    </label>
                    <input
                      type="color"
                      value={data.primaryColor}
                      onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                      className="w-24 h-10 bg-transparent cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">
                      Secondary Accent Color (Enchanted Purple Default)
                    </label>
                    <input
                      type="color"
                      value={data.secondaryColor}
                      onChange={(e) => setData({ ...data, secondaryColor: e.target.value })}
                      className="w-24 h-10 bg-transparent cursor-pointer"
                    />
                  </div>
                </div>
                <button
                  onClick={() => commitData(data, 'Saved appearance settings!')}
                  className="px-5 py-2.5 bg-emerald-500 text-black font-extrabold text-xs rounded mc-button"
                >
                  Save Appearance Changes
                </button>
              </div>
            )}

            {/* TAB 8: SOCIAL & CONTACT SETTINGS */}
            {adminTab === 'contacts' && (
              <div className="mc-border bg-[#0d111d] p-6 rounded-xl space-y-3">
                <h3 className="font-extrabold text-base">Discord & Instagram Order Hub Destinations</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    placeholder="Discord Username"
                    value={data.discordUsername}
                    onChange={(e) => setData({ ...data, discordUsername: e.target.value })}
                    className="bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                  />
                  <input
                    placeholder="Discord Invite / Profile URL"
                    value={data.discordInviteUrl}
                    onChange={(e) => setData({ ...data, discordInviteUrl: e.target.value })}
                    className="bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                  />
                  <input
                    placeholder="Instagram Handle"
                    value={data.instagramUsername}
                    onChange={(e) => setData({ ...data, instagramUsername: e.target.value })}
                    className="bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                  />
                  <input
                    placeholder="Instagram URL"
                    value={data.instagramUrl}
                    onChange={(e) => setData({ ...data, instagramUrl: e.target.value })}
                    className="bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                  />
                </div>
                <button
                  onClick={() => commitData(data, 'Updated Discord & Instagram Order Hub links!')}
                  className="px-5 py-2 bg-emerald-500 text-black font-extrabold text-xs rounded mc-button"
                >
                  Save Contact Links
                </button>
              </div>
            )}

            {/* TAB 9: CONTENT & SEO */}
            {adminTab === 'content' && (
              <div className="mc-border bg-[#0d111d] p-6 rounded-xl space-y-3">
                <h3 className="font-extrabold text-base">Hero Headlines, Bio & SEO Title</h3>
                <input
                  placeholder="SEO Site Title"
                  value={data.siteTitle}
                  onChange={(e) => setData({ ...data, siteTitle: e.target.value })}
                  className="w-full bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                />
                <input
                  placeholder="Hero Headline"
                  value={data.heroHeadline}
                  onChange={(e) => setData({ ...data, heroHeadline: e.target.value })}
                  className="w-full bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs"
                />
                <textarea
                  rows={2}
                  placeholder="Hero Subtitle"
                  value={data.heroSubtitle}
                  onChange={(e) => setData({ ...data, heroSubtitle: e.target.value })}
                  className="w-full bg-[#07080c] border border-slate-700 rounded p-2.5 text-xs"
                />
                <textarea
                  rows={3}
                  placeholder="About Designer Bio"
                  value={data.bio}
                  onChange={(e) => setData({ ...data, bio: e.target.value })}
                  className="w-full bg-[#07080c] border border-slate-700 rounded p-2.5 text-xs"
                />
                <button
                  onClick={() => commitData(data, 'Saved Content & SEO settings!')}
                  className="px-5 py-2 bg-emerald-500 text-black font-extrabold text-xs rounded mc-button"
                >
                  Save Content & SEO
                </button>
              </div>
            )}

            {/* TAB 10: BACKUP & RESTORE */}
            {adminTab === 'backup' && (
              <div className="mc-border bg-[#0d111d] p-6 rounded-xl space-y-4">
                <h3 className="font-extrabold text-base">Export & Restore Full Website JSON State</h3>
                <p className="text-xs text-slate-400">
                  Warning: Restoring a backup replaces current portfolio items, reviews, and pricing with the uploaded JSON snapshot.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(data, null, 2)], {
                        type: 'application/json'
                      });
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(blob);
                      a.download = `basoori-graphics-backup-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                    }}
                    className="px-4 py-2.5 bg-emerald-500 text-black font-extrabold text-xs rounded mc-button"
                  >
                    ⬇ Download Complete JSON Backup
                  </button>
                  <label className="px-4 py-2.5 bg-purple-600 text-white font-bold text-xs rounded cursor-pointer">
                    ⬆ Restore From JSON File
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          try {
                            const parsed = JSON.parse(String(reader.result));
                            if (window.confirm('Overwrite current studio data with this backup?')) {
                              commitData({ ...DEFAULT_SITE_DATA, ...parsed }, 'Backup restored!');
                            }
                          } catch {
                            showToast('Invalid JSON backup file.');
                          }
                        };
                        reader.readAsText(file);
                      }}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 11: GENERAL SETTINGS */}
            {adminTab === 'settings' && (
              <div className="mc-border bg-[#0d111d] p-6 rounded-xl space-y-3">
                <h3 className="font-extrabold text-base">Secret Entry Shortcut & Passcode</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">
                      Secret Keyboard Key (Used with Ctrl + Shift + Key)
                    </label>
                    <input
                      maxLength={1}
                      value={data.secretShortcutKey}
                      onChange={(e) => setData({ ...data, secretShortcutKey: e.target.value })}
                      className="bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">
                      Secret Hash Route Slug
                    </label>
                    <input
                      value={data.secretRouteSlug}
                      onChange={(e) => setData({ ...data, secretRouteSlug: e.target.value })}
                      className="bg-[#07080c] border border-slate-700 rounded px-3 py-2 text-xs w-full"
                    />
                  </div>
                </div>
                <button
                  onClick={() => commitData(data, 'Saved General Security Settings!')}
                  className="px-5 py-2 bg-emerald-500 text-black font-extrabold text-xs rounded mc-button"
                >
                  Save Security Settings
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
