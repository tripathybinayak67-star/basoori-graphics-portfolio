import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  ADMIN_STUDIO_PASSWORD?: string;
  JWT_SECRET?: string;
  YOUTUBE_API_KEY?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: jsonHeaders });
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4);
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return base64UrlEncode(new Uint8Array(signature));
}

async function signToken(secret: string): Promise<string> {
  const payload = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ role: 'admin', exp: Date.now() + 12 * 60 * 60 * 1000 })));
  return `${payload}.${await hmac(payload, secret)}`;
}

async function verifyToken(authHeader: string | null, secret: string): Promise<boolean> {
  if (!authHeader?.startsWith('Bearer ')) return false;
  const [payload, signature] = authHeader.slice(7).split('.');
  if (!payload || !signature) return false;
  const expected = await hmac(payload, secret);
  if (signature.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < signature.length; i++) mismatch |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  if (mismatch !== 0) return false;
  try {
    const data = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));
    return data.role === 'admin' && Number(data.exp) > Date.now();
  } catch {
    return false;
  }
}

function getSupabase(env: Env) {
  const rawUrl = env.SUPABASE_URL || '';
  const url = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
  const key = env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function cleanText(value: unknown, max: number): string {
  return typeof value === 'string' ? value.replace(/[<>]/g, '').trim().slice(0, max) : '';
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: jsonHeaders });
  const url = new URL(request.url);
  const action = url.searchParams.get('action') || '';
  const jwtSecret = env.JWT_SECRET || '';

  if (action === 'login' && request.method === 'POST') {
    if (!env.ADMIN_STUDIO_PASSWORD || !jwtSecret) {
      return json({ error: 'Admin authentication is not configured. Add ADMIN_STUDIO_PASSWORD and JWT_SECRET in Cloudflare Pages secrets.' }, 503);
    }
    try {
      const body = await request.json() as { password?: string };
      if (typeof body.password === 'string' && body.password === env.ADMIN_STUDIO_PASSWORD) {
        return json({ token: await signToken(jwtSecret), expiresIn: '12h' });
      }
      return json({ error: 'Invalid Admin Password' }, 401);
    } catch {
      return json({ error: 'Invalid request body' }, 400);
    }
  }

  if (action === 'youtube-channel' && request.method === 'GET') {
    const query = (url.searchParams.get('query') || '').trim().slice(0, 200);
    if (!query) return json({ error: 'A channel URL, handle or ID is required.' }, 400);
    if (!env.YOUTUBE_API_KEY) return json({ error: 'YOUTUBE_API_KEY not configured' }, 503);
    try {
      const handleMatch = query.match(/@([a-zA-Z0-9_.-]+)/);
      const idMatch = query.match(/UC[a-zA-Z0-9_-]{22}/);
      let endpoint: URL;
      if (handleMatch) {
        endpoint = new URL('https://www.googleapis.com/youtube/v3/channels');
        endpoint.searchParams.set('part', 'snippet,statistics');
        endpoint.searchParams.set('forHandle', handleMatch[1]);
      } else if (idMatch) {
        endpoint = new URL('https://www.googleapis.com/youtube/v3/channels');
        endpoint.searchParams.set('part', 'snippet,statistics');
        endpoint.searchParams.set('id', idMatch[0]);
      } else {
        endpoint = new URL('https://www.googleapis.com/youtube/v3/search');
        endpoint.searchParams.set('part', 'snippet');
        endpoint.searchParams.set('type', 'channel');
        endpoint.searchParams.set('maxResults', '1');
        endpoint.searchParams.set('q', query);
      }
      endpoint.searchParams.set('key', env.YOUTUBE_API_KEY);
      const ytRes = await fetch(endpoint);
      const ytData = await ytRes.json() as any;
      if (!ytRes.ok) return json({ error: ytData.error?.message || 'YouTube API request failed.' }, 502);
      const item = ytData.items?.[0];
      if (!item) return json({ error: 'Channel not found' }, 404);
      let avatarUrl = item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url;
      let title = item.snippet?.title;
      let subscriberCount: string | undefined;
      if (item.statistics?.subscriberCount) subscriberCount = `${(Number(item.statistics.subscriberCount) / 1000).toFixed(1)}K+ Subscribers`;
      // Search results return a channelId rather than channel statistics. Resolve it for a richer response.
      const channelId = item.id?.channelId || item.id;
      if (!subscriberCount && channelId) {
        const details = new URL('https://www.googleapis.com/youtube/v3/channels');
        details.searchParams.set('part', 'snippet,statistics');
        details.searchParams.set('id', channelId);
        details.searchParams.set('key', env.YOUTUBE_API_KEY);
        const detailRes = await fetch(details);
        const detailData = await detailRes.json() as any;
        const channel = detailData.items?.[0];
        if (channel) {
          title = channel.snippet?.title || title;
          avatarUrl = channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.medium?.url || channel.snippet?.thumbnails?.default?.url || avatarUrl;
          if (channel.statistics?.subscriberCount) subscriberCount = `${(Number(channel.statistics.subscriberCount) / 1000).toFixed(1)}K+ Subscribers`;
        }
      }
      return json({ title, avatarUrl, subscriberCount });
    } catch {
      return json({ error: 'Could not contact YouTube Data API.' }, 502);
    }
  }

  if (action === 'save-state' && request.method === 'POST') {
    if (!jwtSecret || !(await verifyToken(request.headers.get('Authorization'), jwtSecret))) return json({ error: 'Unauthorized. Please sign in again.' }, 401);
    const supabase = getSupabase(env);
    if (!supabase) return json({ error: 'Supabase server credentials are not configured.' }, 503);
    try {
      const body = await request.json() as { state?: unknown };
      if (!body.state || typeof body.state !== 'object' || Array.isArray(body.state)) return json({ error: 'Invalid site state.' }, 400);
      const { error } = await supabase.from('basoori_site_state').upsert({ id: 'primary', payload: body.state, updated_at: new Date().toISOString() });
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, mode: 'supabase' });
    } catch {
      return json({ error: 'Could not save site data.' }, 500);
    }
  }

  if (action === 'submit-review' && request.method === 'POST') {
    const supabase = getSupabase(env);
    if (!supabase) return json({ error: 'Review storage is not configured. Please try again later.' }, 503);
    try {
      const input = await request.json() as Record<string, unknown>;
      const name = cleanText(input.name, 60);
      const comment = cleanText(input.comment, 1200);
      const role = cleanText(input.role, 80) || 'Community Creator';
      const avatarUrl = cleanText(input.avatarUrl, 500);
      const channelUrl = cleanText(input.channelUrl, 300);
      const rating = Math.max(1, Math.min(5, Math.round(Number(input.rating) || 5)));
      if (!name || !comment) return json({ error: 'Name and feedback are required.' }, 400);
      const review = {
        id: `rev_${crypto.randomUUID()}`,
        name, role, avatarUrl, channelUrl, rating, comment,
        verified: false, featured: false, hidden: false,
        source: 'community', createdAt: new Date().toISOString().split('T')[0]
      };
      const { data: row, error: readError } = await supabase.from('basoori_site_state').select('payload').eq('id', 'primary').maybeSingle();
      if (readError) return json({ error: readError.message }, 500);
      const payload = row?.payload && typeof row.payload === 'object' ? row.payload as Record<string, any> : {};
      const reviews = Array.isArray(payload.reviews) ? payload.reviews : [];
      const nextPayload = { ...payload, reviews: [review, ...reviews].slice(0, 500) };
      const { error: writeError } = await supabase.from('basoori_site_state').upsert({ id: 'primary', payload: nextPayload, updated_at: new Date().toISOString() });
      if (writeError) return json({ error: writeError.message }, 500);
      return json({ review }, 201);
    } catch {
      return json({ error: 'Could not submit your review.' }, 500);
    }
  }

  return json({ status: 'BASOORI GRAPHICS API ready' });
}
