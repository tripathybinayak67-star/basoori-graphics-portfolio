export interface PortfolioItem {
  id: string;
  title: string;
  client: string;
  category: string;
  imageUrl: string;
  youtubeUrl?: string;
  youtubeId?: string;
  ctr?: string;
  views?: string;
  publishedAt: string;
  description: string;
  featured: boolean;
}

export interface ReviewItem {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  channelUrl?: string;
  rating: number;
  comment: string;
  verified: boolean;
  featured: boolean;
  hidden: boolean;
  source: 'owner' | 'community';
  createdAt: string;
}

export interface ClientItem {
  id: string;
  name: string;
  logoUrl: string;
  channelUrl: string;
  subscribers: string;
  description: string;
  collaborationUrl?: string;
  testimonial?: string;
  featured: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  billingPeriod: string;
  badge?: string;
  description: string;
  features: string[];
  popular: boolean;
  enabled: boolean;
  ctaLabel: string;
}

export interface StatItem {
  id: string;
  label: string;
  value: string;
  description: string;
  visible: boolean;
  animated: boolean;
}

export interface SiteData {
  siteTitle: string;
  brandName: string;
  heroHeadline: string;
  heroSubtitle: string;
  availabilityText: string;
  available: boolean;
  designerName: string;
  avatarUrl: string;
  bio: string;
  experienceYears: string;
  skills: string[];
  specializations: string[];
  discordUsername: string;
  discordInviteUrl: string;
  instagramUsername: string;
  instagramUrl: string;
  youtubeUrl: string;
  email: string;
  primaryColor: string;
  secondaryColor: string;
  particlesEnabled: boolean;
  soundEnabled: boolean;
  showDisclaimer: boolean;
  secretShortcutKey: string;
  secretRouteSlug: string;
  footerText: string;
  sectionsVisible: {
    about: boolean;
    portfolio: boolean;
    stats: boolean;
    clients: boolean;
    reviews: boolean;
    pricing: boolean;
  };
  categories: string[];
  portfolio: PortfolioItem[];
  stats: StatItem[];
  clients: ClientItem[];
  reviews: ReviewItem[];
  pricing: PricingPlan[];
}
