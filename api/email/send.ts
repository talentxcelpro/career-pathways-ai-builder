/**
 * api/email/send.ts
 * POST /api/email/send
 *
 * Centralized API Gateway for dispatching or enqueueing emails.
 * All client-side requests go through this endpoint, keeping AWS SES credentials
 * 100% server-side and secure.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { emailService } from '../../src/services/email/emailService';
import type { EmailJobPayload } from '../../src/services/email/emailTypes';

export const config = { runtime: 'nodejs' };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const rawBody = req.body;
    const payload: EmailJobPayload = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;

    if (!payload?.to || !payload?.template) {
      return res.status(400).json({ error: 'Missing required fields: to, template' });
    }

    const result = await emailService.send(payload);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (err: any) {
    console.error('❌ Email dispatch endpoint error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
