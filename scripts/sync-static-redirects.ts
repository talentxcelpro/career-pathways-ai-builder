import { writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.TX_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const SUPABASE_KEY = process.env.TX_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

export async function syncStaticRedirects(): Promise<number> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const rows: Array<{ from_slug: string; to_slug: string }> = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('job_slug_redirects')
      .select('from_slug, to_slug')
      .order('from_slug', { ascending: true })
      .range(page * pageSize, page * pageSize + pageSize - 1);

    if (error) {
      throw new Error(`Failed to fetch job_slug_redirects from Supabase: ${error.message}`);
    }
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < pageSize) break;
    page++;
  }

  if (rows.length === 0) {
    throw new Error('job_slug_redirects returned 0 rows — refusing to overwrite static redirect map.');
  }

  const entries = rows
    .filter((r) => r.from_slug && r.to_slug)
    .map((r) => `  '${r.from_slug.replace(/'/g, "\\'")}': '${r.to_slug.replace(/'/g, "\\'")}',`)
    .join('\n');

  const moduleContent = `// Auto-generated from public.job_slug_redirects at build time by scripts/sync-static-redirects.ts
// Do not edit manually; CI gate verifies this matches public.job_slug_redirects.

export const STATIC_JOB_SLUG_REDIRECTS: Readonly<Record<string, string>> = {
${entries}
};
`;
  writeFileSync(resolve('src/lib/seo/staticJobSlugRedirects.ts'), moduleContent, 'utf8');

  const mwPath = resolve('middleware.ts');
  const mw = readFileSync(mwPath, 'utf8');
  const marker = 'const STATIC_JOB_SLUG_REDIRECTS: Readonly<Record<string, string>> = {';
  const idx = mw.indexOf(marker);
  if (idx === -1) {
    throw new Error('Could not find STATIC_JOB_SLUG_REDIRECTS block in middleware.ts');
  }
  const updatedMw = mw.slice(0, idx) + `${marker}\n${entries}\n};\n`;
  writeFileSync(mwPath, updatedMw, 'utf8');

  console.log(`✓ Synced ${rows.length} job_slug_redirects into src/lib/seo/staticJobSlugRedirects.ts and middleware.ts`);
  return rows.length;
}

if (process.argv[1] && process.argv[1].includes('sync-static-redirects')) {
  syncStaticRedirects().catch((err) => {
    console.error('❌ sync-static-redirects failed:', err);
    process.exit(1);
  });
}
