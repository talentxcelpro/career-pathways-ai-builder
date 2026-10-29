/**
 * api/udx/index.ts
 * Consolidated UDX & Agent Resolution API Router for Vercel Serverless Functions
 * Dispatches to _action, _benchmark, _outcome, _overview, _resolve, and _health
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import actionHandler from './_action';
import benchmarkHandler from './_benchmark';
import outcomeHandler from './_outcome';
import overviewHandler from './_overview';
import resolveHandler from './_resolve';
import healthHandler from './_health';

export const config = { runtime: 'nodejs' };

async function bridgeWebHandler(
  webHandler: (req: Request) => Promise<Response>,
  req: VercelRequest,
  res: VercelResponse
) {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const url = `${protocol}://${host}${req.url}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }

  const rawBody =
    req.method !== 'GET' && req.method !== 'HEAD'
      ? typeof req.body === 'string'
        ? req.body
        : JSON.stringify(req.body)
      : undefined;

  const webReq = new Request(url, {
    method: req.method,
    headers,
    body: rawBody,
  });

  const webRes = await webHandler(webReq);
  res.status(webRes.status);
  webRes.headers.forEach((v, k) => res.setHeader(k, v));
  const data = await webRes.text();
  return res.send(data);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Extract action from query param or URL path (e.g. /api/udx/resolve or /api/udx?action=resolve)
  const urlPath = req.url?.split('?')[0] || '';
  const pathParts = urlPath.split('/').filter(Boolean);
  const actionFromPath = pathParts[pathParts.length - 1];
  const action = (req.query.action as string) || (actionFromPath !== 'udx' ? actionFromPath : '');

  if (action === 'action') {
    return bridgeWebHandler(actionHandler, req, res);
  }
  if (action === 'benchmark') {
    return bridgeWebHandler(benchmarkHandler, req, res);
  }
  if (action === 'outcome') {
    return bridgeWebHandler(outcomeHandler, req, res);
  }
  if (action === 'resolve') {
    return bridgeWebHandler(resolveHandler, req, res);
  }
  if (action === 'overview') {
    return overviewHandler(req, res);
  }
  if (action === 'health') {
    return healthHandler(req, res);
  }

  return res.status(404).json({ error: `Unknown UDX action: ${action}` });
}
