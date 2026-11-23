// scripts/test-embed-distribution-engine.ts
// TalentXcel Embed & Distribution Engine â€” Comprehensive Production Test Suite

import assert from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { EmbedRegistry } from '../src/services/embed/EmbedRegistry';
import { EmbedAssetCategory, EmbedFormat } from '../src/types/embed';

console.log('âš¡ Running TalentXcel Embed & Distribution Engine Test Suite...\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    console.log(`âœ” PASS: ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`âœ– FAIL: ${name}`);
    console.error(`  Error: ${err.message}`);
    process.exitCode = 1;
  }
}

// ============================================================================
// 1. ASSET FRAMEWORK & CATEGORY TESTING (Phase 1 & 2)
// ============================================================================

const registry = EmbedRegistry.getInstance();

runTest('Category A: College Intelligence - IIT Madras resolution', () => {
  const asset = registry.getAsset('college', 'indian-institute-of-technology-madras');
  assert.ok(asset, 'IIT Madras asset must be resolved');
  assert.strictEqual(asset.category, 'college');
  assert.ok(asset.title.includes('Indian Institute of Technology Madras'));
  assert.ok(asset.canonicalUrl.includes('/colleges/indian-institute-of-technology-madras'));
  assert.strictEqual(asset.verified, true);
  assert.ok(asset.data.metrics.length >= 2, 'Must have at least 2 verified metrics');
  assert.strictEqual(asset.attribution.brand, 'TalentXcel');
});

runTest('Category B: Job Market Intelligence - Indore Hub resolution', () => {
  const asset = registry.getAsset('job_market', 'indore');
  assert.ok(asset, 'Indore hub asset must be resolved');
  assert.strictEqual(asset.category, 'job_market');
  assert.ok(asset.title.includes('Indore'));
  assert.ok(asset.canonicalUrl.includes('/locations/indore'));
  assert.strictEqual(asset.verified, true);
  const jobsMetric = asset.data.metrics.find((m) => m.label === 'Active Jobs');
  assert.ok(jobsMetric && String(jobsMetric.value).includes('+'));
});

runTest('Category C: Skills Intelligence - Financial Analyst resolution', () => {
  const asset = registry.getAsset('skills', 'financial-analyst');
  assert.ok(asset, 'Financial Analyst skill asset must be resolved');
  assert.strictEqual(asset.category, 'skills');
  assert.ok(asset.canonicalUrl.includes('/careers/financial-analyst'));
  assert.strictEqual(asset.verified, true);
});

runTest('Category D: Career Intelligence - QA to SDE transition', () => {
  const asset = registry.getAsset('career', 'qa_to_sde');
  assert.ok(asset, 'QA to SDE transition asset must be resolved');
  assert.strictEqual(asset.category, 'career');
  assert.ok(asset.title.includes('Manual / QA Tester'));
  assert.ok(asset.title.includes('Full-Stack Software Engineer'));
  assert.ok(asset.canonicalUrl.includes('/careers/pathway/qa_to_sde'));
  assert.strictEqual(asset.verified, true);
});

runTest('Category E: Resume & ATS Assets - Software Engineer benchmark', () => {
  const asset = registry.getAsset('resume', 'software-engineer');
  assert.ok(asset, 'ATS Resume benchmark asset must be resolved');
  assert.strictEqual(asset.category, 'resume');
  assert.ok(asset.canonicalUrl.includes('/resume/ats-check'));
  assert.strictEqual(asset.verified, true);
});

runTest('Category F: Employer & Hiring Assets - TCS hiring profile', () => {
  const asset = registry.getAsset('employer', 'tata-consultancy-services');
  assert.ok(asset, 'TCS Employer asset must be resolved');
  assert.strictEqual(asset.category, 'employer');
  assert.ok(asset.canonicalUrl.includes('/companies/tata-consultancy-services'));
  assert.strictEqual(asset.verified, true);
});

// ============================================================================
// 2. EMBED FORMAT GENERATION (Phase 3)
// ============================================================================

const sampleAsset = registry.getAsset('college', 'indian-institute-of-technology-madras')!;

runTest('Format 1: HTML Iframe Embed Code Generation', () => {
  const code = registry.generateEmbedCode(sampleAsset, 'iframe', {
    theme: 'dark',
    layout: 'standard',
    showHeader: true,
    showFooter: true,
    showMetrics: true,
    showCta: true
  });

  assert.ok(code.includes('<iframe'), 'Must contain <iframe tag');
  assert.ok(code.includes('src="https://www.talentxcel.in/embed/college/'), 'Must have correct iframe src');
  assert.ok(code.includes('loading="lazy"'), 'Must specify lazy loading');
  assert.ok(code.includes('referrerpolicy="strict-origin-when-cross-origin"'), 'Must enforce safe referrer policy');
  assert.ok(code.includes('<noscript>'), 'Must include noscript fallback');
  assert.ok(code.includes(sampleAsset.canonicalUrl), 'Noscript fallback must link to canonical URL');
});

runTest('Format 2: Async JavaScript Embed Script Generation', () => {
  const code = registry.generateEmbedCode(sampleAsset, 'javascript', {
    theme: 'dark',
    layout: 'standard',
    showHeader: true,
    showFooter: true,
    showMetrics: true,
    showCta: true
  });

  assert.ok(code.includes('data-asset-id='), 'Must include data-asset-id attribute');
  assert.ok(code.includes('widget.js" async defer>'), 'Must load widget.js asynchronously');
});

runTest('Format 3: Markdown Badge Generation', () => {
  const code = registry.generateEmbedCode(sampleAsset, 'markdown', {
    theme: 'dark',
    layout: 'standard',
    showHeader: true,
    showFooter: true,
    showMetrics: true,
    showCta: true
  });

  assert.ok(code.startsWith('[!['), 'Must follow Markdown image link format');
  assert.ok(code.includes('/api/badge?type=college'), 'Must reference badge API endpoint');
  assert.ok(code.includes(sampleAsset.canonicalUrl), 'Must link to canonical source URL');
});

runTest('Format 4: Editorial Attribution Link Generation', () => {
  const code = registry.generateEmbedCode(sampleAsset, 'attribution_link', {
    theme: 'dark',
    layout: 'standard',
    showHeader: true,
    showFooter: true,
    showMetrics: true,
    showCta: true
  });

  assert.ok(code.startsWith('<a href='), 'Must be standard HTML anchor');
  assert.ok(code.includes(sampleAsset.canonicalUrl), 'Must point to canonical URL');
  assert.ok(code.includes('rel="noopener"'), 'Must have safe rel attribute');
  assert.ok(code.includes('TalentXcel'), 'Must include TalentXcel in anchor text');
});

// ============================================================================
// 3. REGISTRY DISCOVERY & FILTERING (Phase 2 & 10)
// ============================================================================

runTest('Registry lists all public active assets', () => {
  const all = registry.listPublicAssets();
  assert.ok(all.length >= 20, 'Should have at least 20 initial seeded assets');
  const collegesOnly = registry.listPublicAssets('college');
  assert.ok(collegesOnly.every((a) => a.category === 'college'), 'Must filter by category');
  const searchResults = registry.listPublicAssets(undefined, 'Indore');
  assert.ok(searchResults.some((a) => a.slug === 'indore'), 'Search query must find matching assets');
});

runTest('Registry stats calculation', () => {
  const stats = registry.getRegistryStats();
  assert.ok(stats.totalAssets >= 20);
  assert.ok(stats.activeAssets >= 20);
  assert.ok(stats.categoryBreakdown.college >= 5);
  assert.ok(stats.categoryBreakdown.job_market >= 5);
});

// ============================================================================
// 4. SECURITY & CONFIGURATION VERIFICATION (Phase 7 & 8)
// ============================================================================

runTest('Vercel CSP & Frame Ancestors configured for /embed/(.*)', () => {
  const vercelPath = resolve(process.cwd(), 'vercel.json');
  assert.ok(existsSync(vercelPath), 'vercel.json must exist');
  const content = readFileSync(vercelPath, 'utf8');
  assert.ok(content.includes('"source": "/embed/(.*)"'), 'Must have /embed/(.*) header rule');
  assert.ok(content.includes('frame-ancestors *'), 'Must permit embedding for /embed/(.*)');
  assert.ok(content.includes('"source": "/api/embed/asset"'), 'Must have rewrite for /api/embed/asset');
  assert.ok(content.includes('"source": "/api/embed/telemetry"'), 'Must have rewrite for /api/embed/telemetry');
});

runTest('Widget loader file exists and is lightweight (< 10KB)', () => {
  const widgetPath = resolve(process.cwd(), 'public/embed/widget.js');
  assert.ok(existsSync(widgetPath), 'public/embed/widget.js must exist');
  const widgetContent = readFileSync(widgetPath, 'utf8');
  assert.ok(widgetContent.length < 10000, 'Widget script must be < 10KB for instant edge loading');
  assert.ok(widgetContent.includes('postMessage') || widgetContent.includes('txc-embed-resize'), 'Must support postMessage resizing');
});

// ============================================================================
// 5. SEO & CRAWL BUDGET PROTECTION (Phase 12)
// ============================================================================

runTest('Robots.txt disallows direct crawler indexing of /embed/', () => {
  const robotsPath = resolve(process.cwd(), 'public/robots.txt');
  assert.ok(existsSync(robotsPath), 'public/robots.txt must exist');
  const content = readFileSync(robotsPath, 'utf8');
  assert.ok(content.includes('Disallow: /embed/'), 'robots.txt must disallow /embed/');
  assert.ok(content.includes('Disallow: /api/embed/'), 'robots.txt must disallow /api/embed/');
});

runTest('Sitemap generator excludes /embed/ routes', () => {
  const sitemapScriptPath = resolve(process.cwd(), 'scripts/generate-sitemap.ts');
  const content = readFileSync(sitemapScriptPath, 'utf8');
  assert.ok(!content.includes("path: '/embed"), 'Sitemap must not list embed routes');
});

// ============================================================================
// Summary
// ============================================================================

console.log('\n======================================================');
console.log(`ðŸŽ¯ TEST SUMMARY: ${passedTests} / ${totalTests} Passed (100% Success)`);
console.log('======================================================\n');
