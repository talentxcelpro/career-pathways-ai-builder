// api/notify-search-engines.ts
// Event-Driven Instant Re-indexing Webhook & Edge Purge
// 1. Evaluates isIndexReady completeness threshold
// 2. Purges Cloudflare Edge Cache for https://talentxcel.in/u/:username
// 3. Dispatches URL_UPDATED to Google Indexing API
// 4. Pings IndexNow Mesh (api.indexnow.org) for Bing, Yahoo, and Web AI Crawlers

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as https from 'https';

export const config = {
  runtime: 'nodejs',
};

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'e8f4a1b2c3d54e6f9a0b1c2d3e4f5a6b';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
const SUPABASE_REST_URL = (process.env.SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co').replace(/\/$/, '') + '/rest/v1';

function getGoogleServiceAccount(): any | null {
  if (process.env.GSC_SERVICE_ACCOUNT) {
    try {
      return JSON.parse(process.env.GSC_SERVICE_ACCOUNT);
    } catch {
      // ignore
    }
  }
  const candidateFiles = [
    path.resolve(process.cwd(), 'gsc-service-account.json'),
    path.resolve(process.cwd(), 'gcp-key.json'),
    path.resolve(process.cwd(), 'talentxcel-indexing.json'),
  ];
  for (const file of candidateFiles) {
    if (fs.existsSync(file)) {
      try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
      } catch {
        // continue
      }
    }
  }
  return null;
}

async function getGoogleAccessToken(sa: any): Promise<string | null> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const claimSet = {
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    };
    const b64 = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64url');
    const unsigned = b64(header) + '.' + b64(claimSet);
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(unsigned);
    const signature = signer.sign(sa.private_key, 'base64url');
    const jwt = unsigned + '.' + signature;

    const postData = 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + jwt;
    return new Promise((resolve) => {
      const req = https.request('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
        },
      }, (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(d);
            resolve(parsed.access_token || null);
          } catch {
            resolve(null);
          }
        });
      });
      req.on('error', () => resolve(null));
      req.write(postData);
      req.end();
    });
  } catch {
    return null;
  }
}

async function publishGoogleIndexing(url: string, token: string): Promise<boolean> {
  return new Promise((resolve) => {
    const payload = JSON.stringify({ url, type: 'URL_UPDATED' });
    const req = https.request('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        resolve(res.statusCode === 200);
      });
    });
    req.on('error', () => resolve(false));
    req.write(payload);
    req.end();
  });
}

async function pingIndexNow(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      host: 'talentxcel.in',
      key: INDEXNOW_KEY,
      keyLocation: `https://talentxcel.in/${INDEXNOW_KEY}.txt`,
      urlList: [url],
    });
    const req = https.request('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        resolve(res.statusCode === 200 || res.statusCode === 202);
      });
    });
    req.on('error', () => resolve(false));
    req.write(payload);
    req.end();
  });
}

async function purgeCloudflareCache(url: string): Promise<boolean> {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!zoneId || !token) {
    return false;
  }

  try {
    const payload = JSON.stringify({ files: [url] });
    return new Promise((resolve) => {
      const req = https.request(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      }, (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          resolve(res.statusCode === 200);
        });
      });
      req.on('error', () => resolve(false));
      req.write(payload);
      req.end();
    });
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use POST or GET.' });
  }

  const usernameParam = (req.body?.username || req.query?.username || '').toString().trim().replace(/^@/, '');
  const userIdParam = (req.body?.userId || req.query?.userId || '').toString().trim();

  if (!usernameParam && !userIdParam) {
    return res.status(400).json({ error: 'Missing username or userId in request body/query.' });
  }

  try {
    // 1. Fetch profile from Supabase
    let filter = '';
    if (userIdParam) {
      filter = `id=eq.${encodeURIComponent(userIdParam)}`;
    } else {
      filter = `username=ilike.${encodeURIComponent(usernameParam)}`;
    }

    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    };

    const profileRes = await fetch(`${SUPABASE_REST_URL}/public_profiles?select=id,username,full_name,skills,headline,about,title,experience_years,current_company&${filter}&limit=1`, { headers });
    if (!profileRes.ok) {
      return res.status(502).json({ error: 'Failed to query Supabase public_profiles view' });
    }

    const profiles = await profileRes.json();
    if (!Array.isArray(profiles) || profiles.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profile = profiles[0];
    const username = profile.username || usernameParam;
    const profileUrl = `https://talentxcel.in/u/${encodeURIComponent(username)}`;

    // 2. Fetch secondary signals (ats_public_scans, peer_endorsements, career_skills)
    let atsScore: number | null = null;
    let endorsementsCount = 0;
    let fallbackSkills: string[] = [];

    const [atsRes, endRes, skillsRes] = await Promise.allSettled([
      fetch(`${SUPABASE_REST_URL}/ats_public_scans?select=id,ats_score&user_id=eq.${encodeURIComponent(profile.id)}&order=created_at.desc&limit=1`, { headers }),
      fetch(`${SUPABASE_REST_URL}/peer_endorsements?select=id&target_user_id=eq.${encodeURIComponent(profile.id)}&limit=10`, { headers }),
      fetch(`${SUPABASE_REST_URL}/career_skills?select=skill_name&user_id=eq.${encodeURIComponent(profile.id)}&limit=15`, { headers }),
    ]);

    if (atsRes.status === 'fulfilled' && atsRes.value.ok) {
      const data = await atsRes.value.json();
      if (Array.isArray(data) && data.length > 0 && typeof data[0].ats_score === 'number') {
        atsScore = data[0].ats_score;
      }
    }

    if (endRes.status === 'fulfilled' && endRes.value.ok) {
      const data = await endRes.value.json();
      if (Array.isArray(data)) endorsementsCount = data.length;
    }

    if (skillsRes.status === 'fulfilled' && skillsRes.value.ok) {
      const data = await skillsRes.value.json();
      if (Array.isArray(data)) {
        fallbackSkills = data.map((item: any) => item.skill_name).filter(Boolean);
      }
    }

    // 3. Evaluate Thin-Page Protection Gate (isIndexReady)
    const rawSkills = Array.isArray(profile.skills) && profile.skills.length > 0
      ? profile.skills
      : fallbackSkills;
    const skills = Array.from(new Set(rawSkills.filter((s: any) => typeof s === 'string' && s.trim().length > 0)));

    const headlineOrBio = (profile.headline || profile.about || profile.title || '').trim();
    const hasEnoughSkills = skills.length >= 3;
    const hasBioLength = headlineOrBio.length >= 40;
    const hasAtsScore = atsScore !== null && atsScore > 0;
    const hasWorkOrEdu = (profile.experience_years !== null && Number(profile.experience_years) > 0) ||
                         Boolean(profile.current_company && profile.current_company.trim().length > 0);
    const hasEndorsement = endorsementsCount >= 1;

    const hasRichContent = hasBioLength || hasAtsScore || hasWorkOrEdu || hasEndorsement;
    const isIndexReady = hasEnoughSkills && hasRichContent;

    if (!isIndexReady) {
      return res.status(200).json({
        success: true,
        isIndexReady: false,
        message: 'Profile saved successfully. Profile completeness is currently below indexing threshold (thin profile protection active; served as noindex, follow).',
        url: profileUrl,
        metrics: {
          skillsCount: skills.length,
          headlineBioLength: headlineOrBio.length,
          hasAtsScore,
          hasWorkOrEdu,
          endorsementsCount,
        },
      });
    }

    // 4. Trigger Instant Indexing Broadcast & Cache Purge
    const results: Record<string, any> = {
      isIndexReady: true,
      url: profileUrl,
    };

    // A. Purge Cloudflare Edge Cache
    results.cloudflarePurged = await purgeCloudflareCache(profileUrl);

    // B. Google Indexing API Broadcast
    const sa = getGoogleServiceAccount();
    if (sa) {
      const gToken = await getGoogleAccessToken(sa);
      if (gToken) {
        results.googleIndexed = await publishGoogleIndexing(profileUrl, gToken);
      } else {
        results.googleIndexed = false;
        results.googleError = 'Failed to generate Google OAuth2 token';
      }
    } else {
      results.googleIndexed = false;
      results.googleError = 'Service account credentials not configured in environment';
    }

    // C. IndexNow Mesh Dispatch
    results.indexNowNotified = await pingIndexNow(profileUrl);

    return res.status(200).json({
      success: true,
      ...results,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}
