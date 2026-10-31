// ============================================================================
// PORTFOLIO DATA & CONFIGURATION FILE (config.js)
// You can edit this file directly in Notepad/VS Code, OR use the built-in 
// "Admin Studio" on your website (Click the Gear Icon in the bottom-left 
// or press Shift + A) to edit everything visually and click "Export config.js"!
// ============================================================================

window.PORTFOLIO_CONFIG = {
  profile: {
    brandName: "BASOORI GRAPHICS",
    designerName: "Binayak Tripathy",
    tagline: "High-CTR YouTube Thumbnail Specialist & Visual Director",
    heroTitle: "Turning Impressions Into <span class='gradient-text'>Unstoppable Clicks</span>",
    heroSubtitle: "Psychology-driven thumbnail compositions, dramatic lighting, and high-retention visual storytelling engineered for top creators.",
    availabilityText: "Available for Commissions & Retainers",
    discordUsername: "binayak.design", // Your Discord Username (copied when clients click Discord)
    discordInviteUrl: "https://discord.com/users/", // Optional: Direct Discord profile or server invite link
    instagramHandle: "@binayak.design", // Your Instagram handle
    instagramUrl: "https://instagram.com/binayak.design", // Your full Instagram profile URL
    primaryContact: "discord", // Choose "discord" or "instagram" for main CTA buttons
    contactEmail: "contact@binayakdesign.com",
    youtubeUrl: "https://youtube.com/",
    accentColor: "#ff3366",
    secondaryColor: "#7000ff",
    adminPin: "2026" // Change this PIN to secure your visual Admin Studio
  },

  stats: [
    {
      id: "stat-1",
      label: "Total Views Generated",
      value: 145.8,
      suffix: "M+",
      prefix: "",
      decimals: 1,
      subtext: "Across 350+ viral uploads",
      icon: "eye"
    },
    {
      id: "stat-2",
      label: "Average CTR Boost",
      value: 14.6,
      suffix: "%",
      prefix: "+",
      decimals: 1,
      subtext: "Baseline avg jumped from 4.8% to 13.9%",
      icon: "trending-up"
    },
    {
      id: "stat-3",
      label: "Thumbnails Delivered",
      value: 620,
      suffix: "+",
      prefix: "",
      decimals: 0,
      subtext: "99.4% on-time 24hr turnaround",
      icon: "layers"
    },
    {
      id: "stat-4",
      label: "Creator Revenue Impact",
      value: 3.8,
      suffix: "Cr+",
      prefix: "₹",
      decimals: 1,
      subtext: "Estimated client AdSense & sponsor lift",
      icon: "award"
    }
  ],

  categories: ["All", "Gaming & Esports", "Documentary & Lore", "Tech & Finance", "Vlogs & Challenges", "3D / Manipulation"],

  portfolio: [
    {
      id: "work-1",
      title: "The Dark Truth of Ancient Empires (40M+ Views)",
      creator: "Mythos Chronicles",
      category: "Documentary & Lore",
      ctr: "16.4%",
      viewsGenerated: "4.2M Views",
      duration: "14:28",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1280&q=85",
      beforeImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1280&q=60",
      featured: true,
      breakdown: "Applied high-contrast rim lighting, golden ratio focal guides, and desaturated environmental depth to isolate the main subject's emotional expression."
    },
    {
      id: "work-2",
      title: "I Survived 100 Hours in an Impossible Tournament",
      creator: "ApexArena India",
      category: "Gaming & Esports",
      ctr: "15.1%",
      viewsGenerated: "2.8M Views",
      duration: "22:15",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1280&q=85",
      beforeImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1280&q=60",
      featured: true,
      breakdown: "Engineered complementary cyan/magenta color grading with aggressive motion blur and a 3-word curiosity hook."
    },
    {
      id: "work-3",
      title: "Why The 2026 AI Crash Changes Everything",
      creator: "NextGen Decoded",
      category: "Tech & Finance",
      ctr: "13.8%",
      viewsGenerated: "1.9M Views",
      duration: "18:04",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1280&q=85",
      beforeImage: "",
      featured: false,
      breakdown: "Minimalist 3-element composition focusing on facial micro-expression and a single glowing chart trajectory."
    },
    {
      id: "work-4",
      title: "We Built a Secret Underground Studio in 7 Days!",
      creator: "Rohan & Crew",
      category: "Vlogs & Challenges",
      ctr: "17.2%",
      viewsGenerated: "6.5M Views",
      duration: "19:50",
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1280&q=85",
      beforeImage: "",
      featured: true,
      breakdown: "Wide-angle perspective distortion with warm subterranean glow against cool surface shadows to trigger instant scale curiosity."
    },
    {
      id: "work-5",
      title: "Inside India's ₹10,000 Crore Semiconductor Bet",
      creator: "FinPulse India",
      category: "Tech & Finance",
      ctr: "12.9%",
      viewsGenerated: "1.1M Views",
      duration: "16:12",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1280&q=85",
      beforeImage: "",
      featured: false,
      breakdown: "Macro silicon wafer textures composited with crisp saffron/emerald rim highlights for mobile feed dominance."
    },
    {
      id: "work-6",
      title: "Awakening the Forbidden Boss — Cinematic Breakdown",
      creator: "KuroKami Gaming",
      category: "3D / Manipulation",
      ctr: "15.9%",
      viewsGenerated: "3.4M Views",
      duration: "11:45",
      image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1280&q=85",
      beforeImage: "",
      featured: true,
      breakdown: "Custom Photoshop Camera Raw color grade, hand-painted volumetric embers, and atmospheric depth maps."
    }
  ],

  plans: [
    {
      id: "plan-single",
      name: "Single Viral Starter",
      tagline: "Perfect for testing A/B performance on your next big upload",
      priceINR: "799",
      billingCycle: "per thumbnail",
      popular: false,
      badge: "FAST 24H DELIVERY",
      features: [
        "1 High-CTR Custom Thumbnail (1920x1080)",
        "Click-Psychology & Composition Blueprint",
        "Custom Color Grading & Rim Lighting",
        "2 Free Revisions Included",
        "Optimized under 2MB PNG + WebP",
        "24-Hour Express Turnaround"
      ],
      ctaText: "Order Single Thumbnail"
    },
    {
      id: "plan-creator",
      name: "Creator Growth Pack",
      tagline: "Built for weekly creators aiming to dominate browse features",
      priceINR: "3,499",
      billingCycle: "for 5 thumbnails (Save ₹500)",
      popular: true,
      badge: "MOST POPULAR",
      features: [
        "5 High-CTR Custom Thumbnails",
        "2 A/B Test Variations for Your Main Video",
        "Title + Thumbnail Synergy Consultation",
        "Unlimited Minor Tweaks & Revisions",
        "Editable Layered PSD Source Files Included",
        "Priority 12-to-18 Hour Turnaround"
      ],
      ctaText: "Claim Creator Pack"
    },
    {
      id: "plan-retainer",
      name: "Channel Dominator Retainer",
      tagline: "Complete visual direction & monthly CTR management for serious channels",
      priceINR: "9,999",
      billingCycle: "per month (15 Thumbnails)",
      popular: false,
      badge: "BEST ROI FOR CHANNELS",
      features: [
        "15 Custom Viral Thumbnails Every Month",
        "Dedicated Channel Brand Identity Kit",
        "Full A/B Testing & CTR Analytics Audit",
        "Direct Discord & Instagram DM Priority Access",
        "All PSD Source Files & Custom Assets",
        "Same-Day Rush Delivery Support"
      ],
      ctaText: "Book Monthly Retainer"
    }
  ],

  reviews: [
    {
      id: "rev-1",
      name: "Aarav Mehta",
      role: "Tech Creator (680K Subs)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
      rating: 5,
      verified: true,
      date: "Oct 2026",
      ctrProof: "CTR jumped from 5.2% → 14.8%",
      comment: "Our channel was stuck at a 5% CTR plateau for months. The very first thumbnail Binayak designed hit 14.8% CTR within 3 hours and pushed our video to 1.4M views. Worth every single rupee!"
    },
    {
      id: "rev-2",
      name: "Vikramaditya Sen",
      role: "Documentary Filmmaker (1.2M Subs)",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
      rating: 5,
      verified: true,
      date: "Sep 2026",
      ctrProof: "Generated 3.2M+ Views in 10 Days",
      comment: "He doesn't just slap text on an image—he understands storytelling, eye-tracking paths, and color contrast on mobile screens. My documentary series saw a 240% view increase."
    },
    {
      id: "rev-3",
      name: "Sneha Kapoor",
      role: "Finance & Startup Educator (310K Subs)",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80",
      rating: 5,
      verified: true,
      date: "Oct 2026",
      ctrProof: "13.6% Browse Feature CTR",
      comment: "Super fast turnaround and zero ego during revisions. The Monthly Retainer plan completely took the stress off my production team."
    },
    {
      id: "rev-4",
      name: "Rishi Gaming YT",
      role: "Community Submission",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80",
      rating: 5,
      verified: false,
      date: "Oct 2026",
      ctrProof: "Ordered Single Starter Plan",
      comment: "Ordered one gaming thumbnail just to test the waters and the lighting quality blew my mind. Definitely upgrading to the 5-pack next week!"
    }
  ]
};
