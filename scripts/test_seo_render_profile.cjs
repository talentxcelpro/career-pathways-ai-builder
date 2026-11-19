// scripts/test_seo_render_profile.cjs
const http = require('http');

async function testEdgeHandler() {
  console.log('Testing api/seo-render handler for profile revocation & 404 protection...');
  
  // Dynamically import handler
  const { default: handler } = await import('../api/seo-render.ts');

  // Test 1: Non-existent / unconsented profile
  const req1 = new Request('https://talentxcel.in/api/seo-render?path=profile/00000000-0000-0000-0000-000000000000');
  const res1 = await handler(req1);
  console.log('Test 1 (Unconsented / Missing Profile):');
  console.log('  Status:', res1.status);
  console.log('  X-Robots-Tag:', res1.headers.get('x-robots-tag'));
  console.log('  X-Render-Engine:', res1.headers.get('x-render-engine'));

  const text1 = await res1.text();
  const pass1 = res1.status === 404 && res1.headers.get('x-robots-tag') === 'noindex, nofollow';
  console.log('  -> Result:', pass1 ? 'PASS' : 'FAIL');

  // Test 2: Candidate path variant (/candidate/revoked-candidate)
  const req2 = new Request('https://talentxcel.in/api/seo-render?path=candidate/revoked-user-slug');
  const res2 = await handler(req2);
  console.log('\nTest 2 (Candidate URL variant):');
  console.log('  Status:', res2.status);
  console.log('  X-Robots-Tag:', res2.headers.get('x-robots-tag'));
  const pass2 = res2.status === 404 && res2.headers.get('x-robots-tag') === 'noindex, nofollow';
  console.log('  -> Result:', pass2 ? 'PASS' : 'FAIL');

  if (pass1 && pass2) {
    console.log('\n✅ All SEO edge revocation checks passed!');
    process.exit(0);
  } else {
    console.error('\n❌ SEO edge revocation check failed!');
    process.exit(1);
  }
}

testEdgeHandler().catch(err => {
  console.error('Fatal error running test:', err);
  process.exit(1);
});
