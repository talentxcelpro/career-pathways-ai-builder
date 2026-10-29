/**
 * api/claim/index.ts
 * Consolidated Claim API Router for Vercel Serverless Functions
 * Dispatches to _verify, _confirm, and _opt-out based on query param or path
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import verifyHandler from './_verify';
import confirmHandler from './_confirm';
import optOutHandler from './_opt-out';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Extract action from query param or URL path (e.g. /api/claim/verify or /api/claim?action=verify)
  const urlPath = req.url?.split('?')[0] || '';
  const pathParts = urlPath.split('/').filter(Boolean);
  const actionFromPath = pathParts[pathParts.length - 1];
  const action = (req.query.action as string) || (actionFromPath !== 'claim' ? actionFromPath : '');

  if (action === 'verify') {
    return verifyHandler(req, res);
  }
  if (action === 'confirm') {
    return confirmHandler(req, res);
  }
  if (action === 'opt-out') {
    return optOutHandler(req, res);
  }

  return res.status(404).json({ error: `Unknown claim action: ${action}` });
}
