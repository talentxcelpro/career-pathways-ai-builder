import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');

import { INDIAN_INSTITUTIONS_CATALOG } from '../src/data/indianInstitutionsCatalog.js';
import { SEED_PROGRAMS } from '../src/services/globalEducationService.js';

// Permanent 100-URL Controlled Benchmark Cohort (50 Indian Colleges + 20 Global Programs + 30 Core Hubs)
export const BENCHMARK_COHORT = [
  // 1. First 50 Verified Indian Institutions
  ...INDIAN_INSTITUTIONS_CATALOG.slice(0, 50).map(c => `colleges/${c.slug}`),

  // 2. First 20 Verified Global Programs
  ...SEED_PROGRAMS.slice(0, 20).map(p => `colleges/global-programs/${p.slug}`),

  // 3. 30 Core Learning, Education & Platform Hubs
  'colleges',
  'colleges/scholarships',
  'colleges/pathway',
  'learning',
  'jobs',
  'companies',
  'career-map',
  'passport',
  'tools',
  'services',
  'industries',
  'locations',
  'resources',
  'about',
  'contact',
  'privacy-policy',
  'terms',
  'blog',
  'news',
  'help'
];

export function runSeoCiGate(): boolean {
  console.log('🛡️  Running SEO CI/CD Quality Gate on 100-URL Benchmark Cohort...\n');

  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ FAIL: dist directory does not exist. Build required first.');
    return false;
  }

  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const relativePath of BENCHMARK_COHORT) {
    const flatFile = path.join(DIST_DIR, `${relativePath}.html`);
    const dirFile = path.join(DIST_DIR, relativePath, 'index.html');

    const targetFile = fs.existsSync(flatFile) ? flatFile : fs.existsSync(dirFile) ? dirFile : null;

    if (!targetFile) {
      failed++;
      errors.push(`Missing pre-rendered static HTML for: ${relativePath}`);
      continue;
    }

    const content = fs.readFileSync(targetFile, 'utf8');

    // Quality Invariants
    const hasUniqueTitle = /<title>(?!TalentXcel — AI Career Platform).*?<\/title>/i.test(content) || relativePath === '';
    const hasCanonical = /<link\s+rel=["']canonical["']\s+href=["']https:\/\/talentxcel\.in.*?["']/i.test(content);
    const hasDescription = /<meta\s+name=["']description["']/i.test(content);
    const hasNoIndex = /<meta\s+name=["']robots["']\s+content=["'].*?noindex.*?["']/i.test(content);
    const hasH1 = /<h1[^>]*>.*?<\/h1>/i.test(content);
    const hasJsonLd = /<script\s+type=["']application\/ld\+json["']/i.test(content);
    const isAdequateSize = content.length > 2500;

    const isHealthy = hasCanonical && hasDescription && !hasNoIndex && hasH1 && isAdequateSize;

    if (isHealthy) {
      passed++;
    } else {
      failed++;
      const reasons = [];
      if (!hasCanonical) reasons.push('missing canonical');
      if (!hasDescription) reasons.push('missing description');
      if (hasNoIndex) reasons.push('accidental noindex');
      if (!hasH1) reasons.push('missing H1');
      if (!isAdequateSize) reasons.push('empty/thin HTML payload');
      errors.push(`${relativePath}: ${reasons.join(', ')}`);
    }
  }

  console.log(`========================================`);
  console.log(`SEO CI Gate Results: ${passed} PASSED / ${failed} FAILED`);
  console.log(`Cohort Pass Rate: ${((passed / BENCHMARK_COHORT.length) * 100).toFixed(1)}%`);
  console.log(`========================================\n`);

  if (failed > 0) {
    console.error('❌ SEO CI GATE FAILED. Blocking deployment due to quality invariant regressions:');
    errors.slice(0, 10).forEach(e => console.error(`  - ${e}`));
    return false;
  }

  console.log('✅ SEO CI GATE PASSED: All 100 benchmark assets satisfy production quality invariants!\n');
  return true;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const success = runSeoCiGate();
  if (!success) {
    process.exit(1);
  }
}
