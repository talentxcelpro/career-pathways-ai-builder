/**
 * api/seo/indexnow.ts
 * GET /api/seo/indexnow
 * POST /api/seo/indexnow
 *
 * Real-time SEO Push-Indexing Pipeline for TalentXcel (talentxcel.in)
 * Broadcasts high-intent URLs to:
 * 1. IndexNow Gateways (api.indexnow.org, Bing, Yandex, Seznam)
 * 2. Google Sitemap Ping (sitemap.xml, sitemap_index.xml, sitemap-root.xml)
 *
 * Runtime: Node.js (Vercel Serverless Function)
 */

import https from 'https';
import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
};

// IndexNow Key & Verification Details
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'e8f4a1b2c3d54e6f9a0b1c2d3e4f5a6b';
const DEFAULT_HOST = 'talentxcel.in';
const BASE_ORIGIN = `https://${DEFAULT_HOST}`;

// Supabase configuration for fetching live active job listings
const SUPABASE_URL = process.env.TX_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.TALENTXCEL_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

// Target Search Engine Endpoints
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
  'https://search.seznam.cz/indexnow',
];

const GOOGLE_PING_TARGETS = [
  `https://www.google.com/ping?sitemap=${encodeURIComponent(`${BASE_ORIGIN}/sitemap.xml`)}`,
  `https://www.google.com/ping?sitemap=${encodeURIComponent(`${BASE_ORIGIN}/sitemap_index.xml`)}`,
  `https://www.google.com/ping?sitemap=${encodeURIComponent(`${BASE_ORIGIN}/sitemap-root.xml`)}`,
];

// Curated high-intent priority routes for TalentXcel
const HIGH_INTENT_STATIC_ROUTES = [
  // Core Entrypoints
  '/',
  '/jobs',
  '/colleges',
  '/learning',
  '/resume',
  '/resume/build',
  '/resume/ats-check',
  '/resume/cover-letter',
  '/resume/interview-prep',
  '/career-insights',
  '/hire',
  '/network',
  '/passport',
  '/rankings',
  '/services',
  '/companies',
  '/about',
  '/contact',
  '/faq',
  '/terms',
  '/privacypolicy',
  // Global & Regional Corridors
  '/colleges/global-programs',
  '/colleges/scholarships',
  '/colleges/career-pathway',
  '/uae',
  '/uk',
  '/usa',
  '/europe',
  '/world',
  // Canonical In-Demand Roles
  '/careers/software-engineer',
  '/careers/full-stack-developer',
  '/careers/frontend-developer',
  '/careers/backend-developer',
  '/careers/react-developer',
  '/careers/node-js-developer',
  '/careers/python-developer',
  '/careers/java-developer',
  '/careers/ai-engineer',
  '/careers/machine-learning-engineer',
  '/careers/data-scientist',
  '/careers/data-engineer',
  '/careers/data-analyst',
  '/careers/devops-engineer',
  '/careers/cloud-architect',
  '/careers/aws-solutions-architect',
  '/careers/cybersecurity-analyst',
  '/careers/product-manager',
  '/careers/ui-ux-designer',
  '/careers/blockchain-developer',
  '/careers/qa-automation-engineer',
  '/careers/scrum-master',
  '/careers/solutions-architect',
  '/careers/digital-marketing-specialist',
  '/careers/growth-marketer',
  '/careers/financial-analyst',
  '/careers/talent-acquisition-specialist',
  '/careers/technical-recruiter',
  '/careers/project-manager',
  '/careers/operations-manager',
  // Regional Employment Hubs
  '/locations/bangalore',
  '/locations/hyderabad',
  '/locations/pune',
  '/locations/mumbai',
  '/locations/delhi-ncr',
  '/locations/chennai',
  '/locations/noida',
  '/locations/gurgaon',
  '/locations/kolkata',
  '/locations/ahmedabad',
  '/locations/chandigarh',
  '/locations/jaipur',
  '/locations/dubai',
  '/locations/london',
  '/locations/singapore',
  // High-Intent Upskilling Courses
  '/courses/full-stack-web-development',
  '/courses/artificial-intelligence-machine-learning',
  '/courses/data-science-analytics',
  '/courses/cloud-computing-devops',
  '/courses/cybersecurity-ethical-hacking',
  '/courses/product-management-certification',
  '/courses/ui-ux-design-specialization',
  '/courses/blockchain-development',
  '/courses/digital-marketing-mastery',
  '/courses/data-engineering-specialization',
];

interface IndexNowResult {
  status: number;
  statusText: string;
  ok: boolean;
  response?: any;
}

interface GooglePingResult {
  status: number;
  ok: boolean;
}

/**
 * Dispatch URL list to a single IndexNow endpoint
 */
function submitToIndexNowEndpoint(endpoint: string, host: string, key: string, urls: string[]): Promise<IndexNowResult> {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      host,
      key,
      keyLocation: `https://${host}/${key}.txt`,
      urlList: urls,
    });

    const parsedUrl = new URL(endpoint);
    const options: https.RequestOptions = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
        'User-Agent': 'TalentXcel-IndexNow-Bot/1.0',
      },
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let parsedResponse: any = body;
        try {
          if (body) parsedResponse = JSON.parse(body);
        } catch {
          // keep as string
        }
        resolve({
          status: res.statusCode || 500,
          statusText: res.statusMessage || (res.statusCode === 200 ? 'OK' : res.statusCode === 202 ? 'Accepted' : 'Unknown'),
          ok: !!(res.statusCode && res.statusCode >= 200 && res.statusCode < 300),
          response: parsedResponse || undefined,
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 408, statusText: 'Request Timeout', ok: false });
    });

    req.on('error', (err) => {
      resolve({ status: 500, statusText: err.message || 'Network Error', ok: false });
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Ping Google sitemap notification endpoint
 */
function pingGoogleEndpoint(url: string): Promise<GooglePingResult> {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 8000 }, (res) => {
      res.resume(); // consume stream
      resolve({
        status: res.statusCode || 500,
        ok: !!(res.statusCode && res.statusCode >= 200 && res.statusCode < 300),
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 408, ok: false });
    });

    req.on('error', () => {
      resolve({ status: 500, ok: false });
    });
  });
}

/**
 * Collect dynamic high-intent URLs (static corridors + live active jobs from Supabase)
 */
async function assembleHighIntentUrls(host: string, targetCount = 90): Promise<string[]> {
  const origin = `https://${host}`;
  const compiledUrls = new Set<string>();

  // 1. Add static high-intent routes
  for (const path of HIGH_INTENT_STATIC_ROUTES) {
    compiledUrls.add(path === '/' ? `${origin}/` : `${origin}${path}`);
  }

  // 2. Fetch live open jobs from Supabase to complete target set
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });

    const neededJobs = Math.max(10, targetCount - compiledUrls.size);
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('id, seo_slug, is_active, job_status')
      .eq('is_active', true)
      .eq('job_status', 'open')
      .limit(neededJobs);

    if (!error && Array.isArray(jobs)) {
      for (const job of jobs) {
        const slug = job.seo_slug || job.id;
        if (slug) {
          compiledUrls.add(`${origin}/jobs/${slug}`);
        }
      }
    }
  } catch {
    // If Supabase fetch fails, rely on static set
  }

  return Array.from(compiledUrls).slice(0, targetCount);
}

/**
 * Serverless HTTP Handler for /api/seo/indexnow
 */
export default async function handler(req: any, res: any) {
  // CORS & Cache Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed. Use GET or POST.`,
    });
  }

  try {
    const query = req.query || {};
    let body = req.body || {};
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const host = (body.host || query.host || DEFAULT_HOST).toLowerCase().trim();
    const limit = Math.min(Math.max(parseInt(body.limit || query.limit || '90', 10), 1), 10000);

    // Determine URLs to submit
    let candidateUrls: string[] = [];

    if (Array.isArray(body.urls) && body.urls.length > 0) {
      candidateUrls = body.urls;
    } else if (typeof body.urls === 'string' && body.urls.trim()) {
      candidateUrls = body.urls.split(',').map((u: string) => u.trim());
    } else if (typeof query.urls === 'string' && query.urls.trim()) {
      candidateUrls = query.urls.split(',').map((u: string) => u.trim());
    } else if (typeof query.url === 'string' && query.url.trim()) {
      candidateUrls = [query.url.trim()];
    } else {
      candidateUrls = await assembleHighIntentUrls(host, limit);
    }

    // Filter, validate, and deduplicate URLs for this host
    const sanitizedUrls = Array.from(
      new Set(
        candidateUrls
          .filter((u): u is string => typeof u === 'string' && u.startsWith('http'))
          .map((u) => u.trim())
          .filter((u) => {
            try {
              const parsed = new URL(u);
              return parsed.hostname.endsWith(DEFAULT_HOST) || parsed.hostname === host;
            } catch {
              return false;
            }
          })
      )
    ).slice(0, limit);

    if (sanitizedUrls.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid URLs provided or generated for submission.',
      });
    }

    // 1. Submit in parallel to all IndexNow endpoints
    const indexNowPromises = INDEXNOW_ENDPOINTS.map(async (endpoint) => {
      const result = await submitToIndexNowEndpoint(endpoint, host, INDEXNOW_KEY, sanitizedUrls);
      return [endpoint, result] as const;
    });

    // 2. Submit in parallel to Google Ping endpoints
    const googlePingPromises = GOOGLE_PING_TARGETS.map(async (pingUrl) => {
      const result = await pingGoogleEndpoint(pingUrl);
      return [pingUrl, result] as const;
    });

    const [indexNowEntries, googlePingEntries] = await Promise.all([
      Promise.all(indexNowPromises),
      Promise.all(googlePingPromises),
    ]);

    const indexNowResults: Record<string, IndexNowResult> = Object.fromEntries(indexNowEntries);
    const googlePing: Record<string, GooglePingResult> = Object.fromEntries(googlePingEntries);

    // Check if at least one IndexNow gateway accepted the batch
    const hasAnySuccess = Object.values(indexNowResults).some((r) => r.ok);

    return res.status(200).json({
      success: hasAnySuccess,
      message: `Pushed ${sanitizedUrls.length} high-intent URLs to search engines via IndexNow & Google Ping.`,
      submittedUrlsCount: sanitizedUrls.length,
      host,
      keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
      indexNowResults,
      googlePing,
      submittedUrls: sanitizedUrls,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error during IndexNow dispatch',
    });
  }
}
