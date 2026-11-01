import { createClient } from '@supabase/supabase-js';
import { SiteData, ReviewItem } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const STORAGE_KEY = 'basoori_graphics_v3_state';
const SESSION_TOKEN_KEY = 'basoori_admin_jwt';

export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export type ThumbnailResolution = 'maxresdefault' | 'sddefault' | 'hqdefault' | 'mqdefault';

/**
 * Extracts 11-character YouTube Video ID from watch?v=, youtu.be/, shorts/, embed/, or raw ID.
 */
export function extractYouTubeVideoId(input: string): string | null {
  const trimmed = (input || '').trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const u = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.split('/').filter(Boolean)[0];
      return id && id.length === 11 ? id : null;
    }
    if (u.searchParams.has('v')) {
      const id = u.searchParams.get('v');
      return id && id.length === 11 ? id : null;
    }
    const segs = u.pathname.split('/').filter(Boolean);
    const idx = segs.findIndex((s) => s === 'shorts' || s === 'embed' || s === 'v');
    if (idx !== -1 && segs[idx + 1]?.length === 11) return segs[idx + 1];
  } catch {
    const m = trimmed.match(/(?:v=|\/shorts\/|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
  }
  return null;
}

export function getYouTubeThumbnailUrl(
  videoId: string,
  res: ThumbnailResolution = 'maxresdefault'
): string {
  return `https://i.ytimg.com/vi/${videoId}/${res}.jpg`;
}

export async function fetchYouTubeChannelLogo(channelInput: string): Promise<{
  success: boolean;
  title?: string;
  avatarUrl?: string;
  subscriberCount?: string;
  message?: string;
}> {
  const clean = (channelInput || '').trim();
  if (!clean) {
    return { success: false, message: 'Enter a YouTube channel URL or @handle first.' };
  }

  try {
    const res = await fetch(
      `/.netlify/functions/api?action=youtube-channel&query=${encodeURIComponent(clean)}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.avatarUrl) {
        return {
          success: true,
          title: data.title,
          avatarUrl: data.avatarUrl,
          subscriberCount: data.subscriberCount,
          message: 'Fetched live channel logo via YouTube Data API v3.'
        };
      }
    }
  } catch {
    // Graceful fallback when YOUTUBE_API_KEY is not set
  }

  const handleMatch = clean.match(/@([a-zA-Z0-9_.-]+)/);
  const seed = handleMatch
    ? handleMatch[1]
    : clean.replace(/^https?:\/\/(www\.)?youtube\.com\/(channel\/|c\/|user\/)?/i, '').slice(0, 18) ||
      'Creator';

  return {
    success: true,
    title: seed,
    avatarUrl: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(seed)}&backgroundColor=10b981,a855f7`,
    message:
      'Generated deterministic channel avatar fallback (Set YOUTUBE_API_KEY in Netlify for live YouTube API v3 lookup).'
  };
}

export async function loginAdminStudio(password: string): Promise<{
  authenticated: boolean;
  error?: string;
}> {
  try {
    const res = await fetch('/.netlify/functions/api?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        sessionStorage.setItem(SESSION_TOKEN_KEY, data.token);
        return { authenticated: true };
      }
    } else if (res.status === 401) {
      return { authenticated: false, error: 'Invalid Admin Password.' };
    }
  } catch {
    // Local dev fallback
  }

  const expected = localStorage.getItem('basoori_admin_pass_override') || 'basoori2026';
  if (password === expected) {
    sessionStorage.setItem(SESSION_TOKEN_KEY, `local_dev_jwt_${Date.now()}`);
    return { authenticated: true };
  }
  return { authenticated: false, error: 'Incorrect password (default: basoori2026)' };
}

export function logoutAdminStudio(): void {
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
}

export function isAdminAuthenticated(): boolean {
  return Boolean(sessionStorage.getItem(SESSION_TOKEN_KEY));
}

export async function loadSiteData(fallback: SiteData): Promise<SiteData> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('basoori_site_state')
        .select('payload')
        .eq('id', 'primary')
        .single();
      if (!error && data?.payload) {
        const merged = { ...fallback, ...(data.payload as SiteData) };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch {
      // Fallback to localStorage
    }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...fallback, ...JSON.parse(raw) };
    }
  } catch {
    // Ignore parse errors
  }

  return fallback;
}

export async function saveSiteData(state: SiteData): Promise<void> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const token = sessionStorage.getItem(SESSION_TOKEN_KEY);

  try {
    await fetch('/.netlify/functions/api?action=save-state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ state })
    });
  } catch {
    // Fallback direct Supabase upsert if configured
  }

  if (supabase) {
    try {
      await supabase
        .from('basoori_site_state')
        .upsert({ id: 'primary', payload: state, updated_at: new Date().toISOString() });
    } catch {
      // Ignore
    }
  }
}

export async function submitPublicCommunityReview(
  input: Pick<ReviewItem, 'name' | 'role' | 'avatarUrl' | 'channelUrl' | 'rating' | 'comment'>
): Promise<ReviewItem> {
  const newReview: ReviewItem = {
    ...input,
    id: `rev_${Date.now()}`,
    verified: false, // Public reviews NEVER get verified badge automatically
    featured: false,
    hidden: false,
    source: 'community',
    createdAt: new Date().toISOString().split('T')[0]
  };

  try {
    const form = new URLSearchParams();
    form.append('form-name', 'basoori-community-reviews');
    form.append('name', newReview.name);
    form.append('role', newReview.role);
    form.append('channelUrl', newReview.channelUrl || '');
    form.append('rating', String(newReview.rating));
    form.append('comment', newReview.comment);

    await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString()
    });
  } catch {
    // Ignore when running outside Netlify
  }

  return newReview;
}

export function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Only image files are allowed.'));
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      reject(new Error('Image must be smaller than 6MB.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });
}
