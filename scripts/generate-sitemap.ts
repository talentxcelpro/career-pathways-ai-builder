// Generates public/sitemap.xml from the single source of truth in src/config/seo.ts.
// Runs before `vite dev` and `vite build` via the predev/prebuild npm scripts.

import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { INDEXABLE_ROUTES, PRODUCTION_ORIGIN, isNoindexPath } from '../src/config/seo';

const routes = INDEXABLE_ROUTES.filter((route) => !isNoindexPath(route.path));

const urls = routes.map((route) => {
  const loc = `${PRODUCTION_ORIGIN}${route.path === '/' ? '/' : route.path.replace(/\/+$/, '')}`;
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    route.changefreq ? `    <changefreq>${route.changefreq}</changefreq>` : null,
    route.priority ? `    <priority>${route.priority}</priority>` : null,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
});

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls,
  '</urlset>',
  '',
].join('\n');

writeFileSync(resolve('public/sitemap.xml'), xml);
console.log(`sitemap.xml written (${routes.length} URLs)`);
