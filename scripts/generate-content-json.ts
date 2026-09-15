/**
 * TalentXcel — Per-Page Content JSON Generator
 *
 * This script runs at build time and writes one JSON file per content item
 * into public/content/<slug>.json
 *
 * The browser fetches ONLY the specific page it needs — dramatically reducing
 * the amount of JavaScript that must be downloaded per page view.
 *
 * Run: npx ts-node scripts/generate-content-json.ts
 * Or via package.json scripts: "generate:content" hook
 *
 * Output: public/content/<slug>.json for each ContentItem
 * Each file is ~1–5 KB vs the full registry at 3–8 MB.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { CONTENT_DATA } from './contentRegistryData';

function generateContentJson() {
  const contentDir = resolve('public', 'content');
  if (!existsSync(contentDir)) {
    mkdirSync(contentDir, { recursive: true });
  }

  let written = 0;
  let skipped = 0;

  CONTENT_DATA.forEach((item) => {
    if (!item.indexable) {
      skipped++;
      return;
    }

    const filePath = resolve(contentDir, `${item.slug}.json`);
    const json = JSON.stringify(item, null, 0); // no pretty-print for production size
    writeFileSync(filePath, json, 'utf8');
    written++;
  });

  console.log(`✅ Content JSON generation complete`);
  console.log(`   Written: ${written} files → public/content/<slug>.json`);
  console.log(`   Skipped (noindex): ${skipped}`);
  console.log(`   Total registry size: ${CONTENT_DATA.length} items`);
}

generateContentJson();
