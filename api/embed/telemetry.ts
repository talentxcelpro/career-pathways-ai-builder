// api/embed/telemetry.ts
// TalentXcel Embed & Distribution Engine â€” Serverless Telemetry Ingestion Endpoint

import type { VercelRequest, VercelResponse } from '@vercel/node';

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

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // Fallback
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

    if (!assetId) {
      return res.status(400).json({ error: 'Missing required field: assetId' });
    }

    // Sanitize publisher domain (strip protocols, ports, and paths)
    const sanitizedPublisher = String(publisherDomain)
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .split('/')[0]
      .split(':')[0]
      .replace(/^www\./, '')
      .slice(0, 100);

    // Telemetry log record for edge / analytics aggregation
    const eventRecord = {
      asset_id: String(assetId).slice(0, 80),
      category: String(assetCategory).slice(0, 40),
      event_type: String(eventType).slice(0, 30),
      publisher_domain: sanitizedPublisher || 'direct',
      theme: theme ? String(theme).slice(0, 20) : undefined,
      layout: layout ? String(layout).slice(0, 20) : undefined,
      received_at: new Date().toISOString()
    };

    // In serverless environment, log for telemetry stream ingestion
    console.log('[EMBED_TELEMETRY]', JSON.stringify(eventRecord));

    return res.status(200).json({
      success: true,
      tracked: eventRecord
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Telemetry processing failed',
      message: error?.message || 'Internal error'
    });
  }
}
