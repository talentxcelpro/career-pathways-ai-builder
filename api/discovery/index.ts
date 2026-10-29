/**
 * api/discovery/index.ts
 * Consolidated Discovery API Router for Vercel Serverless Functions
 * Dispatches to _data, _save-gsc, and _trigger-sync based on query param or path
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import dataHandler from './_data';
import saveGscHandler from './_save-gsc';
import triggerSyncHandler from './_trigger-sync';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Extract action from query param or URL path (e.g. /api/discovery/data or /api/discovery?action=data)
  const urlPath = req.url?.split('?')[0] || '';
  const pathParts = urlPath.split('/').filter(Boolean);
  const actionFromPath = pathParts[pathParts.length - 1];
  const action = (req.query.action as string) || (actionFromPath !== 'discovery' ? actionFromPath : '');

  if (action === 'data') {
    return dataHandler(req, res);
  }
  if (action === 'save-gsc') {
    return saveGscHandler(req, res);
  }
  if (action === 'trigger-sync') {
    return triggerSyncHandler(req, res);
  }

  return res.status(404).json({ error: `Unknown discovery action: ${action}` });
}
