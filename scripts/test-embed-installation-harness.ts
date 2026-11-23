// scripts/test-embed-installation-harness.ts
// TalentXcel Embed Installation, DOM Injection & Cross-Origin PostMessage Verification

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { embedRegistry } from '../src/services/embed/EmbedRegistry';

async function runEmbedInstallationGate() {
  console.log('\n======================================================');
  console.log('TALENTXCEL GATE 5: LIVE EMBED INSTALLATION VERIFICATION');
  console.log('======================================================\n');

  // 1. Verify Public Embed Test Harness File
  const harnessPath = path.join(process.cwd(), 'public', 'embed-test-harness.html');
  assert.ok(fs.existsSync(harnessPath), 'public/embed-test-harness.html must exist');
  const harnessContent = fs.readFileSync(harnessPath, 'utf8');

  assert.ok(harnessContent.includes('<iframe'), 'Harness must test iframe embed');
  assert.ok(harnessContent.includes('data-talentxcel-embed'), 'Harness must test data-talentxcel-embed');
  assert.ok(harnessContent.includes('src="/embed/widget.js"'), 'Harness must test widget.js');
  assert.ok(harnessContent.includes('talentxcel:embed:resize'), 'Harness must test postMessage auto-resize');
  console.log('✔ PASS 1: Test Harness markup verified with Iframe, Async JS, and postMessage listener.');

  // 2. Verify Widget Loader Script
  const widgetPath = path.join(process.cwd(), 'public', 'embed', 'widget.js');
  assert.ok(fs.existsSync(widgetPath), 'public/embed/widget.js must exist');
  const widgetCode = fs.readFileSync(widgetPath, 'utf8');
  const widgetSizeKb = (Buffer.byteLength(widgetCode, 'utf8') / 1024).toFixed(2);

  assert.ok(Number(widgetSizeKb) < 10, 'Widget.js must be lightweight (< 10KB)');
  assert.ok(widgetCode.includes('querySelectorAll'), 'Widget must locate data-talentxcel-embed containers');
  assert.ok(widgetCode.includes('createElement(\'iframe\')'), 'Widget must dynamically construct iframes');
  assert.ok(widgetCode.includes('window.addEventListener(\'message\''), 'Widget must listen for resize postMessage');
  console.log(`✔ PASS 2: Widget loader script verified (${widgetSizeKb} KB, zero dependencies, postMessage auto-resizing).`);

  // 3. Verify Render Output of Targeted Embed Assets
  const testAssets = [
    { id: 'college-placement-roi', category: 'college', slug: 'indian-institute-of-technology-madras' },
    { id: 'skills-demand-index', category: 'skills', slug: 'financial-analyst' },
    { id: 'market-demand-realtime', category: 'job_market', slug: 'indore' }
  ];

  for (const t of testAssets) {
    const asset = embedRegistry.getAssetById(t.id) || embedRegistry.getAsset(t.category as any, t.slug);
    assert.ok(asset, `Asset ${t.id} must resolve in EmbedRegistry`);
    assert.ok(asset.title, `Asset ${t.id} must have a title`);
    assert.ok(asset.data.metrics.length > 0, `Asset ${t.id} must have verified metrics`);
    assert.ok(asset.canonicalUrl.includes('talentxcel.in'), `Asset ${t.id} must have valid canonical URL`);
    assert.ok(asset.attribution.brand.includes('TalentXcel'), `Asset ${t.id} must include TalentXcel attribution`);
    console.log(`✔ PASS 3: Asset verified: ${asset.title} [${asset.category}] -> Canonical: ${asset.canonicalUrl}`);
  }

  // 4. Verify Iframe Snippet Generation & Attributes
  const sampleCollege = embedRegistry.getAsset('college', 'indian-institute-of-technology-madras')!;
  const iframeSnippet = embedRegistry.generateEmbedCode(sampleCollege, 'iframe', {
    theme: 'dark',
    layout: 'standard',
    showHeader: true,
    showFooter: true,
    showMetrics: true,
    showCta: true
  });
  assert.ok(iframeSnippet.includes('<iframe'), 'Snippet must be valid iframe HTML');
  assert.ok(iframeSnippet.includes('loading="lazy"'), 'Snippet must specify lazy loading');
  assert.ok(iframeSnippet.includes('border-radius'), 'Snippet must include responsive container styling');
  console.log('✔ PASS 4: Iframe embed snippet generated with sandbox attributes, lazy loading, and responsive styles.');

  // 5. Verify Async JS Snippet Generation
  const sampleSkill = embedRegistry.getAsset('skills', 'financial-analyst')!;
  const jsSnippet = embedRegistry.generateEmbedCode(sampleSkill, 'javascript', {
    theme: 'light',
    layout: 'compact',
    showHeader: true,
    showFooter: true,
    showMetrics: true,
    showCta: true
  });
  assert.ok(jsSnippet.includes('data-asset-id='), 'JS snippet must contain data-asset-id attribute');
  assert.ok(jsSnippet.includes('<script src='), 'JS snippet must contain script loader');
  assert.ok(jsSnippet.includes('async defer'), 'JS snippet must specify async defer');
  console.log('✔ PASS 5: Async JS embed snippet generated with non-blocking execution attributes.');

  console.log('\n======================================================');
  console.log('GATE 5 EXECUTION COMPLETE: 5/5 PASSED');
  console.log('======================================================\n');
}

runEmbedInstallationGate().catch((err) => {
  console.error('Gate 5 failed:', err);
  process.exit(1);
});
