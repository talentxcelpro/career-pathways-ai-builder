/**
 * api/sitemaps.ts
 * GET /api/sitemaps?shard=1 (or /sitemaps/1.xml via vercel.json rewrite)
 *
 * Dynamic 50,000-URL Sitemap Shard Provider for TalentXcel
 * Serves shards 1 through 41 covering all 2,050,000 Programmatic URLs for Googlebot.
 * Fully Edge-cached by Cloudflare (7 days TTL).
 *
 * Runtime: Node.js (Vercel Serverless Function)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getInventorySlice, TOTAL_PAGES, DEFAULT_PAGE_SIZE } from './_lib/million-url-engine';

export const config = {
  runtime: 'nodejs',
};

const HOST = 'talentxcel.in';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }

  const query = req.query || {};
  const rawShard = query.shard || query.page || '1';
  const shardStr = Array.isArray(rawShard) ? rawShard[0] : String(rawShard);
  const cleanShard = shardStr.replace(/\.xml$/, '').trim();
  const shardNum = parseInt(cleanShard, 10);

  if (isNaN(shardNum) || shardNum < 1 || shardNum > TOTAL_PAGES) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(404).send(`Sitemap shard ${cleanShard} not found. Valid shards are 1 to ${TOTAL_PAGES}.`);
  }

  const host = (req.headers.host || HOST).toLowerCase().trim();
  const slice = getInventorySlice(shardNum, DEFAULT_PAGE_SIZE, host);
  const lastmod = new Date().toISOString().split('T')[0];

  const xmlParts: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>\n',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n',
  ];

  for (let i = 0; i < slice.urls.length; i++) {
    const url = slice.urls[i];
    xmlParts.push(
      `  <url><loc>${url}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`
    );
  }

  xmlParts.push('</urlset>\n');
  const xmlOutput = xmlParts.join('');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=604800, stale-while-revalidate=86400');
  res.setHeader('CDN-Cache-Control', 'max-age=604800');
  res.setHeader('X-Sitemap-Shard', String(shardNum));
  res.setHeader('X-Total-Urls', String(slice.urls.length));

  return res.status(200).send(xmlOutput);
}
