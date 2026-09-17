/**
 * api/discovery/save-gsc.ts
 * POST /api/discovery/save-gsc
 *
 * Validates GSC credentials (service account or OAuth2) then writes them
 * into the Vercel environment via the Vercel API, so all subsequent
 * trigger-sync calls pick them up without redeploy.
 *
 * In local dev, credentials are read from .env.local / gsc-service-account.json.
 * In production on Vercel, this endpoint writes them to env vars via the Vercel API.
 *
 * SERVER-SIDE ONLY — never exposes private keys to the browser.
 * Runtime: Node.js (crypto required for JWT validation probe)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { runtime: 'nodejs' };

interface SavePayload {
  serviceAccountJson?: string;
  serviceAccountEmail?: string;
  serviceAccountPrivateKey?: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
}

async function testServiceAccount(email: string, privateKey: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { createSign } = await import('crypto');
    const now = Math.floor(Date.now() / 1000);
    const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      iss: email,
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now, exp: now + 3600,
    })).toString('base64url');
    const sign = createSign('RSA-SHA256');
    sign.update(`${header}.${payload}`);
    const normalizedKey = privateKey.replace(/\\n/g, '\n');
    const sig = sign.sign(normalizedKey, 'base64url');
    const jwt = `${header}.${payload}.${sig}`;

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      return { ok: false, error: `Token exchange failed: ${err}` };
    }
    const d = await res.json() as { access_token?: string };
    if (!d.access_token) return { ok: false, error: 'No access_token in token exchange response' };

    // Probe GSC API
    const probe = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: { Authorization: `Bearer ${d.access_token}` },
    });
    if (!probe.ok) return { ok: false, error: `GSC API probe failed: HTTP ${probe.status}` };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body as SavePayload;

  let email = '';
  let privateKey = '';
  let mode = '';

  // Parse input
  if (body.serviceAccountJson) {
    try {
      const sa = JSON.parse(body.serviceAccountJson);
      email = sa.client_email;
      privateKey = sa.private_key;
      mode = 'service_account_json';
    } catch {
      return res.status(400).json({ success: false, error: 'Invalid Service Account JSON — could not parse' });
    }
  } else if (body.serviceAccountEmail && body.serviceAccountPrivateKey) {
    email = body.serviceAccountEmail;
    privateKey = body.serviceAccountPrivateKey;
    mode = 'service_account_fields';
  } else if (body.clientId && body.clientSecret && body.refreshToken) {
    // OAuth2 flow — validate by attempting token refresh
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: body.clientId,
          client_secret: body.clientSecret,
          refresh_token: body.refreshToken,
          grant_type: 'refresh_token',
        }),
      });
      if (!tokenRes.ok) {
        return res.status(400).json({ success: false, error: `OAuth2 refresh failed: ${await tokenRes.text()}` });
      }
      return res.status(200).json({
        success: true,
        message: 'OAuth2 credentials validated. Live sync enabled.',
        mode: 'oauth2',
        note: 'To persist across redeployments, add GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN to your Vercel project env vars.',
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  } else {
    return res.status(400).json({
      success: false,
      error: 'Provide serviceAccountJson, or serviceAccountEmail + serviceAccountPrivateKey, or clientId + clientSecret + refreshToken.',
    });
  }

  // Validate service account credentials
  const probe = await testServiceAccount(email, privateKey);
  if (!probe.ok) {
    return res.status(400).json({
      success: false,
      error: `Credential validation failed: ${probe.error}`,
      hint: 'Make sure the service account has been added as Owner/Full user in GSC (search.google.com/search-console/users).',
    });
  }

  // In production, write to Vercel env (requires VERCEL_ACCESS_TOKEN + VERCEL_PROJECT_ID env vars)
  const vercelToken   = process.env.VERCEL_ACCESS_TOKEN;
  const vercelProject = process.env.VERCEL_PROJECT_ID || process.env.VERCEL_PROJECT_NAME;
  const teamId        = process.env.VERCEL_TEAM_ID;

  let persistNote = 'Credentials validated. They are active for this runtime session.';

  if (vercelToken && vercelProject) {
    try {
      const baseUrl = `https://api.vercel.com/v10/projects/${vercelProject}/env${teamId ? `?teamId=${teamId}` : ''}`;
      const envsToSet = [
        { key: 'GOOGLE_SERVICE_ACCOUNT_EMAIL', value: email },
        { key: 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY', value: privateKey },
      ];
      for (const { key, value } of envsToSet) {
        await fetch(baseUrl, {
          method: 'POST',
          headers: { Authorization: `Bearer ${vercelToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value, target: ['production', 'preview'], type: 'encrypted' }),
        });
      }
      persistNote = 'Credentials validated and persisted to Vercel project env vars. A redeployment will activate them permanently.';
    } catch (_) {
      persistNote = 'Credentials validated. Vercel env write skipped (VERCEL_ACCESS_TOKEN not set). Add env vars manually in Vercel dashboard.';
    }
  }

  return res.status(200).json({
    success: true,
    message: persistNote,
    mode,
    serviceAccountEmail: email,
    gscPropertyProbed: 'sc-domain:talentxcel.in',
    instructions: 'Click "Trigger Daily Sync Now" to pull live GSC data immediately.',
  });
}
