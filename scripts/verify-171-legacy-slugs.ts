// Live verification of all 171 legacy slugs with curl -L --max-redirs 3
// Usage: npx tsx scripts/verify-171-legacy-slugs.ts <BASE_ORIGIN> [BYPASS_SECRET]
import { execFileSync } from 'child_process';
import { DEAD_410_JOB_SLUGS, UNMATCHED_301_JOB_SLUGS } from '../src/lib/seo/legacySlugDisposition.js';

const KEEP_200_SLUGS = [
  'data-analyst', 'software-engineer', 'data-scientist', 'product-manager',
  'devops-engineer', 'ui-ux-designer', 'full-stack-developer', 'frontend-developer',
  'backend-developer', 'machine-learning-engineer', 'business-analyst', 'project-manager',
  'marketing-manager', 'hr-manager', 'financial-analyst', 'operations-manager',
  'content-writer', 'risk-analyst',
  'delhi', 'bangalore', 'pune', 'mumbai', 'hyderabad', 'chennai', 'noida',
  'remote', 'alerts', 'saved', 'applied',
];

const baseOrigin = (process.argv[2] || '').replace(/\/+$/, '');
const bypass = process.argv[3] || process.env.VERCEL_BYPASS_SECRET || '';
if (!baseOrigin) {
  console.error('Usage: npx tsx scripts/verify-171-legacy-slugs.ts <BASE_ORIGIN>');
  process.exit(1);
}

const all: Array<{ slug: string; expected: '200' | '301' | '410' }> = [
  ...KEEP_200_SLUGS.map((slug) => ({ slug, expected: '200' as const })),
  ...Object.keys(UNMATCHED_301_JOB_SLUGS).map((slug) => ({ slug, expected: '301' as const })),
  ...Array.from(DEAD_410_JOB_SLUGS).map((slug) => ({ slug, expected: '410' as const })),
];

let failures = 0;
for (const { slug, expected } of all) {
  const args = ['-s', '-o', process.platform === 'win32' ? 'NUL' : '/dev/null', '-w', '%{http_code} %{num_redirects} %{url_effective}', '-L', '--max-redirs', '3', '-A', 'Googlebot'];
  if (bypass) args.push('-H', `x-vercel-protection-bypass: ${bypass}`);
  args.push(`${baseOrigin}/jobs/${slug}`);
  const out = execFileSync('curl.exe', args, { encoding: 'utf8' }).trim();
  const [codeStr, redirsStr] = out.split(' ');
  const code = Number(codeStr);
  const redirs = Number(redirsStr);

  if (expected === '410' && (code !== 410 || redirs !== 0)) {
    console.error(`FAIL [410] /jobs/${slug} -> code=${code}, redirs=${redirs}`);
    failures++;
  } else if (expected === '200' && (code !== 200 || redirs !== 0)) {
    console.error(`FAIL [200] /jobs/${slug} -> code=${code}, redirs=${redirs}`);
    failures++;
  } else if (expected === '301' && (code !== 200 || redirs > 1 || redirs < 1)) {
    console.error(`FAIL [301] /jobs/${slug} -> code=${code}, redirs=${redirs}`);
    failures++;
  }
}

console.log(`Checked ${all.length} slugs: ${all.length - failures}/${all.length} PASSED, ${failures} FAILED`);
if (failures > 0) process.exit(1);
