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
  verified: boolean; // Only owner can grant true
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

export interface AppearanceConfig {
  siteTitle: string;
  brandName: string;
  logoText: string;
  primaryColor: string;
  secondaryColor: string;
  particlesEnabled: boolean;
  soundEnabled: boolean;
  showDisclaimer: boolean;
  heroLayout: 'split' | 'centered';
  sectionsVisible: {
    about: boolean;
    portfolio: boolean;
    stats: boolean;
    clients: boolean;
    reviews: boolean;
    pricing: boolean;
  };
}

export interface ProfileContent {
  designerName: string;
  tagline: string;
  heroHeadline: string;
  heroSubtitle: string;
  availabilityText: string;
  available: boolean;
  avatarUrl: string;
  bio: string;
  experienceYears: string;
  skills: string[];
  specializations: string[];
  footerText: string;
}

export interface ContactSettings {
  discordUsername: string;
  discordInviteUrl: string;
  instagramUsername: string;
  instagramUrl: string;
  youtubeUrl: string;
  email: string;
  secretShortcutKey: string; // e.g., "B" with Ctrl+Shift
  secretRouteSlug: string;   // e.g., "#admin-vault"
}

export interface SiteData {
  appearance: AppearanceConfig;
  profile: ProfileContent;
  contacts: ContactSettings;
  categories: string[];
  portfolio: PortfolioItem[];
  stats: StatItem[];
  clients: ClientItem[];
  reviews: ReviewItem[];
  pricing: PricingPlan[];
}
