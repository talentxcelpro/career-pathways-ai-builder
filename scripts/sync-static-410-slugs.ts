import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

interface TakedownSnapshot {
  generatedAt: string;
  templateSlugs: string[];
  deadRedirectSlugs: string[];
}

export function syncStatic410Slugs(): { total: number; templateCount: number; redirectCount: number } {
  const snapshotPath = resolve('scripts/data/takedown-410-snapshot.json');
  const snapshot: TakedownSnapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));

  const allSlugs = Array.from(
    new Set([
      ...(snapshot.templateSlugs || []),
      ...(snapshot.deadRedirectSlugs || []),
    ])
  )
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .sort();

  const entries = allSlugs
    .map((s) => `  '${s.replace(/'/g, "\\'")}',`)
    .join('\n');

  const tsContent = `// Auto-generated at build time from scripts/data/takedown-410-snapshot.json by scripts/sync-static-410-slugs.ts
// Contains ${snapshot.templateSlugs.length} template slugs + ${snapshot.deadRedirectSlugs.length} dead-target redirect slugs = ${allSlugs.length} unique 410 slugs.

export const SNAPSHOT_410_JOB_SLUGS: ReadonlySet<string> = new Set([
${entries}
]);
`;
  writeFileSync(resolve('src/lib/seo/dead410SnapshotSlugs.ts'), tsContent, 'utf8');

  const mwPath = resolve('middleware.ts');
  const mw = readFileSync(mwPath, 'utf8');
  const startMarker = 'const SNAPSHOT_410_JOB_SLUGS: ReadonlySet<string> = new Set([';
  const endMarker = '// END_SNAPSHOT_410_JOB_SLUGS';
  const startIdx = mw.indexOf(startMarker);
  const endIdx = mw.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) {
    throw new Error('Could not find SNAPSHOT_410_JOB_SLUGS markers in middleware.ts');
  }

  const block = `${startMarker}\n${entries}\n]);\n${endMarker}`;
  const updatedMw = mw.slice(0, startIdx) + block + mw.slice(endIdx + endMarker.length);
  writeFileSync(mwPath, updatedMw, 'utf8');

  console.log(
    `✓ Synced ${allSlugs.length} 410 slugs (${snapshot.templateSlugs.length} template + ${snapshot.deadRedirectSlugs.length} dead redirects) into src/lib/seo/dead410SnapshotSlugs.ts and middleware.ts`
  );
  return {
    total: allSlugs.length,
    templateCount: snapshot.templateSlugs.length,
    redirectCount: snapshot.deadRedirectSlugs.length,
  };
}

if (process.argv[1] && process.argv[1].includes('sync-static-410-slugs')) {
  syncStatic410Slugs();
}
