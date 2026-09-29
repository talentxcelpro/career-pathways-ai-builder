/**
 * api/email/process-queue.ts
 * POST / GET /api/email/process-queue
 *
 * Serverless worker to process the prioritized email queue.
 * Dispatches pending emails strictly respecting the configured rate limiter (8 emails/sec)
 * and exponential retry backoff.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { emailService } from '../../src/services/email/emailService';

export const config = { maxDuration: 60 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const startTime = Date.now();
  const batchSize = req.query?.batchSize ? parseInt(req.query.batchSize as string, 10) : 25;

  try {
    const result = await emailService.processQueue(Math.min(batchSize, 50));
    const durationMs = Date.now() - startTime;

    return res.status(200).json({
      success: true,
      processed: result.processed,
      sent: result.sent,
      failed: result.failed,
      durationMs,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('❌ Queue processing worker error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
      durationMs: Date.now() - startTime
    });
  }
}
