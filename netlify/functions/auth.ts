// netlify/functions/auth.ts
// Server-side Admin Authentication Endpoint for BASOORI GRAPHICS
import crypto from 'crypto';

export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  try {
    const { password } = JSON.parse(event.body || '{}');
    const masterPassword = process.env.ADMIN_MASTER_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET || 'default-change-me-in-production';

    if (!masterPassword) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server ADMIN_MASTER_PASSWORD environment variable is not configured.' })
      };
    }

    if (password !== masterPassword) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid Admin Studio credentials.' }) };
    }

    const exp = Date.now() + 1000 * 60 * 60 * 8; // 8-hour session expiration
    const payload = Buffer.from(JSON.stringify({ role: 'admin', exp })).toString('base64url');
    const signature = crypto.createHmac('sha256', jwtSecret).update(payload).digest('base64url');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: `${payload}.${signature}`, expiresAt: exp })
    };
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Malformed request' }) };
  }
};
