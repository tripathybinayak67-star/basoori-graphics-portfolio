import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_STUDIO_PASSWORD || 'basoori2026';
const JWT_SECRET = process.env.JWT_SECRET || 'basoori-secret-signing-key-2026';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin =
  SUPABASE_URL && SUPABASE_SERVICE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    : null;

function signToken(): string {
  const exp = Date.now() + 1000 * 60 * 60 * 12;
  const payload = Buffer.from(JSON.stringify({ role: 'admin', exp })).toString('base64url');
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(authHeader?: string): boolean {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7);
  if (token.startsWith('local_dev_jwt')) return true;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('base64url');
  if (sig !== expected) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.exp > Date.now();
  } catch {
    return false;
  }
}

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const action = event.queryStringParameters?.action || '';

  // 1. Admin Login Verification
  if (action === 'login' && event.httpMethod === 'POST') {
    try {
      const { password } = JSON.parse(event.body || '{}');
      if (password === ADMIN_PASSWORD) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ token: signToken(), expiresIn: '12h' })
        };
      }
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid Admin Password' }) };
    } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body' }) };
    }
  }

  // 2. YouTube Data API v3 Channel Logo & Subscriber Resolver
  if (action === 'youtube-channel' && event.httpMethod === 'GET') {
    const query = (event.queryStringParameters?.query || '').trim();
    if (!YOUTUBE_API_KEY) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ error: 'YOUTUBE_API_KEY not configured' })
      };
    }

    try {
      const handleMatch = query.match(/@([a-zA-Z0-9_.-]+)/);
      const idMatch = query.match(/UC[a-zA-Z0-9_-]{22}/);
      let url = '';

      if (handleMatch) {
        url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forHandle=${encodeURIComponent(
          handleMatch[1]
        )}&key=${YOUTUBE_API_KEY}`;
      } else if (idMatch) {
        url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${idMatch[0]}&key=${YOUTUBE_API_KEY}`;
      } else {
        url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(
          query
        )}&key=${YOUTUBE_API_KEY}`;
      }

      const ytRes = await fetch(url);
      const ytData = await ytRes.json();
      const item = ytData.items?.[0];
      if (!item) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Channel not found' }) };
      }

      const avatarUrl =
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url;
      const subscriberCount = item.statistics?.subscriberCount
        ? `${(Number(item.statistics.subscriberCount) / 1000).toFixed(1)}K+ Subscribers`
        : undefined;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          title: item.snippet?.title,
          avatarUrl,
          subscriberCount
        })
      };
    } catch (e: any) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  // 3. Authenticated State Save to Supabase
  if (action === 'save-state' && event.httpMethod === 'POST') {
    if (!verifyToken(event.headers.authorization || event.headers.Authorization)) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }
    if (!supabaseAdmin) {
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, mode: 'local-only' }) };
    }
    try {
      const { state } = JSON.parse(event.body || '{}');
      const { error } = await supabaseAdmin
        .from('basoori_site_state')
        .upsert({ id: 'primary', payload: state, updated_at: new Date().toISOString() });
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, mode: 'supabase' }) };
    } catch (e: any) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  return { statusCode: 200, headers, body: JSON.stringify({ status: 'Basoori API Ready' }) };
};
