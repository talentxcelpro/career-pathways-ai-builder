// backlink-engine/src/scripts/investigateAnomalies.cjs
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const dns = require('dns');
const { URL } = require('url');

console.log('=== INVESTIGATING PHASE 3 ANOMALIES ===');

// 1. Candidate #23: aitoolsmasters.com vs aitoolmasters.com
async function checkDns(domain) {
  return new Promise(resolve => {
    dns.resolve4(domain, (err, addresses) => {
      if (err) resolve({ domain, resolved: false, error: err.code });
      else resolve({ domain, resolved: true, addresses });
    });
  });
}

async function probeDomain(domain) {
  return new Promise(resolve => {
    const urlStr = `https://${domain}`;
    try {
      const u = new URL(urlStr);
      https.get(u.href, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        rejectUnauthorized: false,
        timeout: 7000
      }, res => {
        let data = '';
        res.on('data', c => { if (data.length < 50000) data += c; });
        res.on('end', () => {
          resolve({
            domain,
            statusCode: res.statusCode,
            location: res.headers.location || null,
            title: (data.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || ''
          });
        });
      }).on('error', e => resolve({ domain, error: e.message }))
        .on('timeout', () => resolve({ domain, error: 'TIMEOUT' }));
    } catch (e) {
      resolve({ domain, error: e.message });
    }
  });
}

async function run() {
  console.log('\n--- 1. Candidate #23 Reconciliation ---');
  console.log('DNS for aitoolsmasters.com:');
  console.log(await checkDns('aitoolsmasters.com'));
  console.log('Probe for aitoolsmasters.com:');
  console.log(await probeDomain('aitoolsmasters.com'));

  console.log('\nDNS for aitoolmasters.com:');
  console.log(await checkDns('aitoolmasters.com'));
  console.log('Probe for aitoolmasters.com:');
  console.log(await probeDomain('aitoolmasters.com'));

  console.log('\n--- 2. prompthive.pages.dev ---');
  console.log('DNS for prompthive.pages.dev:');
  console.log(await checkDns('prompthive.pages.dev'));
  console.log('Probe for prompthive.pages.dev:');
  console.log(await probeDomain('prompthive.pages.dev'));

  console.log('\n--- 3. tools.zalize.com ---');
  console.log('DNS for tools.zalize.com:');
  console.log(await checkDns('tools.zalize.com'));
  console.log('Probe for tools.zalize.com:');
  console.log(await probeDomain('tools.zalize.com'));
  console.log('DNS for apex zalize.com:');
  console.log(await checkDns('zalize.com'));

  console.log('\n--- 4. landing.mycloudmedia.co.uk ---');
  console.log('DNS for landing.mycloudmedia.co.uk:');
  console.log(await checkDns('landing.mycloudmedia.co.uk'));
  console.log('DNS for apex mycloudmedia.co.uk:');
  console.log(await checkDns('mycloudmedia.co.uk'));

  console.log('\n--- 5. Editorial Records Origins ---');
  // Check ai-toolflow.com in Batch 5 and Batch 6
  const b5 = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch5_classified.json'), 'utf8'));
  const b5Toolflow = b5.find(x => x.domain === 'ai-toolflow.com');
  console.log('ai-toolflow.com in Batch 5:', b5Toolflow ? { status: b5Toolflow.status, subCategory: b5Toolflow.subCategory, reason: b5Toolflow.reason } : 'Not found');

  // Check microsaasexamples.com in Batch 6 (#193)
  const b6 = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch6_classified_final.json'), 'utf8'));
  const b6Micro = b6.find(x => x.domain === 'microsaasexamples.com');
  console.log('microsaasexamples.com in Batch 6:', b6Micro ? { status: b6Micro.status, subCategory: b6Micro.subCategory, reason: b6Micro.reason } : 'Not found');
}

run();
