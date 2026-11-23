// api/embed/telemetry.ts
// TalentXcel Embed & Distribution Engine — Serverless Telemetry Ingestion Endpoint
// Enhanced with Rate Limiting, Origin Sanitization, Bot Guardrails, and Deduplication

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Rate Limiting & Deduplication In-Memory Stores (Edge / Node process memory)
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const recentEventsCache = new Map<string, number>(); // fingerprint -> timestamp

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute per IP
const DEDUPLICATION_WINDOW_MS = 5 * 1000; // 5 seconds identical event deduplication

// Lazy Supabase service client
let supabaseClient: any = null;
function getSupabase() {
  if (!supabaseClient) {
    const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    if (url && key) {
      supabaseClient = createClient(url, key);
    }
  }
  return supabaseClient;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // 1. Client IP & Rate Limiting Check
  const clientIp = (
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown_ip'
  ).toString().split(',')[0].trim();

  const now = Date.now();
  const clientRate = rateLimitMap.get(clientIp);

  if (clientRate) {
    if (now < clientRate.resetAt) {
      clientRate.count++;
      if (clientRate.count > MAX_REQUESTS_PER_WINDOW) {
        res.setHeader('Retry-After', '60');
        return res.status(429).json({
          error: 'Too many requests. Telemetry rate limit exceeded.',
          retryAfterSeconds: Math.ceil((clientRate.resetAt - now) / 1000)
        });
      }
    } else {
      rateLimitMap.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    }
  } else {
    rateLimitMap.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  }

  // Clean old rate limit entries periodically
  if (rateLimitMap.size > 2000) {
    for (const [ip, entry] of rateLimitMap.entries()) {
      if (now >= entry.resetAt) rateLimitMap.delete(ip);
    }
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: 'Malformed JSON payload.' });
      }
    }

    const {
      assetId,
      assetCategory = 'general',
      eventType = 'impression',
      publisherDomain = 'direct',
      theme,
      layout
    } = body || {};

    // 2. Payload Validation
    if (!assetId || typeof assetId !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid required field: assetId' });
    }

    const allowedEventTypes = ['impression', 'render', 'attribution_click', 'cta_click'];
    const sanitizedEventType = allowedEventTypes.includes(eventType) ? eventType : 'impression';

    // 3. Publisher Domain Sanitization (Zero PII, no URLs or querystrings stored)
    const sanitizedPublisher = String(publisherDomain)
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .split('/')[0]
      .split(':')[0]
      .replace(/^www\./, '')
      .replace(/[^a-z0-9.-]/g, '')
      .slice(0, 100);

    // 4. Event Deduplication
    const dedupeFingerprint = `${clientIp}:${sanitizedPublisher}:${assetId}:${sanitizedEventType}`;
    const lastEventTime = recentEventsCache.get(dedupeFingerprint);

    if (lastEventTime && now - lastEventTime < DEDUPLICATION_WINDOW_MS) {
      // Rapid identical repeat: acknowledge without inflating counts
      return res.status(200).json({
        success: true,
        deduplicated: true,
        message: 'Duplicate event received within cooldown window.'
      });
    }

    recentEventsCache.set(dedupeFingerprint, now);

    // Clean old deduplication entries periodically
    if (recentEventsCache.size > 2000) {
      for (const [fp, ts] of recentEventsCache.entries()) {
        if (now - ts > DEDUPLICATION_WINDOW_MS) recentEventsCache.delete(fp);
      }
    }

    // 5. Build Validated Telemetry Record (Strictly Zero PII)
    const eventRecord = {
      asset_id: String(assetId).slice(0, 80),
      category: String(assetCategory).slice(0, 40),
      event_type: sanitizedEventType,
      publisher_domain: sanitizedPublisher || 'direct',
      theme: theme ? String(theme).slice(0, 20) : undefined,
      layout: layout ? String(layout).slice(0, 20) : undefined,
      received_at: new Date().toISOString()
    };

    // Edge logging for telemetry analytics aggregation
    console.log('[EMBED_TELEMETRY]', JSON.stringify(eventRecord));

    // 6. Asynchronous Database Persistence (if Supabase configured)
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('embed_telemetry_events').insert({
          asset_id: eventRecord.asset_id,
          publisher_domain: eventRecord.publisher_domain,
          event_type: eventRecord.event_type,
          theme: eventRecord.theme,
          layout: eventRecord.layout,
          created_at: eventRecord.received_at
        });
      } catch (dbErr: any) {
        console.warn('[EMBED_TELEMETRY_DB_WARN]', dbErr?.message);
      }
    }

    return res.status(200).json({
      success: true,
      deduplicated: false,
      tracked: eventRecord
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Telemetry processing failed',
      message: error?.message || 'Internal error'
    });
  }
}
