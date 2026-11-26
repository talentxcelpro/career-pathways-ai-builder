// scripts/search-intelligence/fetch-esco-catalog.ts
// Compliant resumable paginated downloader for European Commission ESCO public API (occupations + skills).

import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve(process.cwd(), 'seo-intelligence-engine/datasets/esco');

interface EscoPage {
  total: number;
  _embedded?: {
    results?: Array<{
      uri: string;
      title: string;
      code?: string;
      preferredLabel?: Record<string, string>;
      broaderIscoGroup?: string[];
      broaderOccupation?: string[];
      isInScheme?: string[];
    }>;
  };
}

async function fetchEscoType(type: 'occupation' | 'skill', pageSize = 500) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `esco_${type}s.json`);
  const allItems: Array<{
    uri: string;
    title: string;
    code: string | null;
    altLabels: string[];
    broader: string[];
  }> = [];

  let pageIndex = 0;
  let total = Infinity;

  while (allItems.length < total) {
    const url = `https://ec.europa.eu/esco/api/search?language=en&type=${type}&limit=${pageSize}&offset=${pageIndex}&full=false`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      throw new Error(`ESCO API error HTTP ${res.status} at page ${pageIndex}`);
    }
    const json = (await res.json()) as EscoPage;
    total = json.total || 0;
    const rows = json._embedded?.results || [];
    if (rows.length === 0) break;

    for (const r of rows) {
      const enUs = r.preferredLabel?.['en-us'];
      const en = r.preferredLabel?.['en'];
      const altLabels: string[] = [];
      if (enUs && enUs.toLowerCase() !== r.title.toLowerCase()) altLabels.push(enUs);
      if (en && en.toLowerCase() !== r.title.toLowerCase()) altLabels.push(en);
      allItems.push({
        uri: r.uri,
        title: r.title,
        code: r.code || null,
        altLabels: Array.from(new Set(altLabels)),
        broader: [...(r.broaderIscoGroup || []), ...(r.broaderOccupation || [])],
      });
    }

    pageIndex += 1;
    console.log(`[ESCO ${type}] Fetched ${allItems.length} / ${total} (page ${pageIndex})`);
    await new Promise((r) => setTimeout(r, 120));
  }

  fs.writeFileSync(outPath, JSON.stringify({ fetchedAt: new Date().toISOString(), source: 'European Commission ESCO API', total: allItems.length, items: allItems }, null, 2));
  return { type, count: allItems.length, outPath };
}

async function main() {
  const occ = await fetchEscoType('occupation', 500);
  const skl = await fetchEscoType('skill', 500);
  console.log('ESCO download complete:', occ, skl);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
