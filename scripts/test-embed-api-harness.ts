// scripts/test-embed-api-harness.ts
// Direct serverless API harness testing for /api/embed/asset and /api/embed/telemetry

import assert from 'node:assert';
import assetHandler from '../api/embed/asset';
import telemetryHandler from '../api/embed/telemetry';

function createMockReqRes(method: string, query: any = {}, body: any = {}, headers: any = {}) {
  const resHeaders: Record<string, string> = {};
  let statusCode = 200;
  let responseData: any = null;

  const req: any = {
    method,
    query,
    body,
    headers: {
      'x-forwarded-for': '203.0.113.195',
      ...headers
    },
    socket: { remoteAddress: '203.0.113.195' }
  };

  const res: any = {
    setHeader: (key: string, value: string) => {
      resHeaders[key.toLowerCase()] = value;
    },
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (data: any) => {
      responseData = data;
      return res;
    },
    end: () => res
  };

  return { req, res, getStatus: () => statusCode, getData: () => responseData, getHeaders: () => resHeaders };
}

async function runApiValidation() {
  console.log('\n======================================================');
  console.log('TALENTXCEL EMBED SERVERLESS API VALIDATION HARNESS');
  console.log('======================================================\n');

  // 1. Valid Asset Lookup
  {
    const { req, res, getStatus, getData } = createMockReqRes('GET', {
      category: 'college',
      slug: 'indian-institute-of-technology-madras'
    });

    await assetHandler(req, res);
    assert.strictEqual(getStatus(), 200, 'Valid asset query must return HTTP 200');
    const data = getData();
    assert.ok(data.title.includes('Indian Institute Of Technology Madras'));
    assert.strictEqual(data.asset_type, 'college');
    assert.strictEqual(data.verified, true);
    console.log('✔ PASS: API /api/embed/asset - Valid asset returns 200 with schema payload');
  }

  // 2. Missing Slug/ID (400)
  {
    const { req, res, getStatus, getData } = createMockReqRes('GET', {});
    await assetHandler(req, res);
    assert.strictEqual(getStatus(), 400, 'Missing slug must return HTTP 400');
    assert.ok(getData().error);
    console.log('✔ PASS: API /api/embed/asset - Missing slug returns 400 Bad Request');
  }

  // 3. Telemetry Ingestion (200)
  {
    const { req, res, getStatus, getData } = createMockReqRes(
      'POST',
      {},
      {
        assetId: 'college-placement-roi',
        assetCategory: 'college',
        eventType: 'impression',
        publisherDomain: 'https://iitm.ac.in/placements'
      },
      { 'x-forwarded-for': '198.51.100.1' }
    );

    await telemetryHandler(req, res);
    assert.strictEqual(getStatus(), 200);
    const data = getData();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.tracked.publisher_domain, 'iitm.ac.in');
    assert.strictEqual(data.tracked.event_type, 'impression');
    console.log('✔ PASS: API /api/embed/telemetry - Valid impression logged and sanitized');
  }

  // 4. Telemetry Missing AssetId (400)
  {
    const { req, res, getStatus } = createMockReqRes('POST', {}, { publisherDomain: 'dev.to' });
    await telemetryHandler(req, res);
    assert.strictEqual(getStatus(), 400, 'Missing assetId must return 400');
    console.log('✔ PASS: API /api/embed/telemetry - Missing assetId returns 400');
  }

  // 5. Telemetry Deduplication Window
  {
    const testIp = '198.51.100.99';
    const { req: req1, res: res1, getData: getData1 } = createMockReqRes(
      'POST',
      {},
      { assetId: 'skills-demand-index', eventType: 'impression', publisherDomain: 'dev.to' },
      { 'x-forwarded-for': testIp }
    );
    await telemetryHandler(req1, res1);
    assert.strictEqual(getData1().deduplicated, false);

    // Immediate repeat within 500ms
    const { req: req2, res: res2, getData: getData2 } = createMockReqRes(
      'POST',
      {},
      { assetId: 'skills-demand-index', eventType: 'impression', publisherDomain: 'dev.to' },
      { 'x-forwarded-for': testIp }
    );
    await telemetryHandler(req2, res2);
    assert.strictEqual(getData2().deduplicated, true, 'Immediate identical request must be flagged deduplicated: true');
    console.log('✔ PASS: API /api/embed/telemetry - Duplicate event correctly deduplicated');
  }

  // 6. Telemetry Rate Limiting (61 requests from same IP -> 429)
  {
    const spamIp = '203.0.113.88';
    let hit429 = false;

    for (let i = 0; i < 65; i++) {
      const { req, res, getStatus } = createMockReqRes(
        'POST',
        {},
        { assetId: `asset-${i}`, eventType: 'render', publisherDomain: 'spam-site.com' },
        { 'x-forwarded-for': spamIp }
      );
      await telemetryHandler(req, res);
      if (getStatus() === 429) {
        hit429 = true;
        break;
      }
    }

    assert.strictEqual(hit429, true, 'Exceeding 60 requests/minute must return HTTP 429');
    console.log('✔ PASS: API /api/embed/telemetry - Rate limit enforced at 60 req/min (HTTP 429 returned)');
  }

  console.log('\n======================================================');
  console.log('🎯 SERVERLESS API HARNESS: ALL TESTS PASSED');
  console.log('======================================================\n');
}

runApiValidation().catch((err) => {
  console.error('API validation failed:', err);
  process.exit(1);
});
