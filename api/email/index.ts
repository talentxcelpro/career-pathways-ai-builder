/**
 * api/email/index.ts
 * Consolidated Email API Router for Vercel Serverless Functions
 * Dispatches to _send, _process-queue, _ses-webhook, and _unsubscribe based on query param or path
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import sendHandler from './_send';
import processQueueHandler from './_process-queue';
import sesWebhookHandler from './_ses-webhook';
import unsubscribeHandler from './_unsubscribe';

export { renderTemplate, escapeHtml } from './_send';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Extract action from query param or URL path (e.g. /api/email/send or /api/email?action=send)
  const urlPath = req.url?.split('?')[0] || '';
  const pathParts = urlPath.split('/').filter(Boolean);
  const actionFromPath = pathParts[pathParts.length - 1];
  const action = (req.query.action as string) || (actionFromPath !== 'email' ? actionFromPath : '');

  if (action === 'send') {
    return sendHandler(req, res);
  }
  if (action === 'process-queue') {
    return processQueueHandler(req, res);
  }
  if (action === 'ses-webhook') {
    return sesWebhookHandler(req, res);
  }
  if (action === 'unsubscribe') {
    return unsubscribeHandler(req, res);
  }

  return res.status(404).json({ error: `Unknown email action: ${action}` });
}
