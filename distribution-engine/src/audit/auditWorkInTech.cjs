/**
 * distribution-engine/src/audit/auditWorkInTech.cjs
 * Forensic audit of Work In Tech UK submission (SUB-REAL_0596-315099)
 */

const https = require('https');
const url = require('url');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const TARGET_URL = 'https://workintech.co.uk/contact';

function getPageDetails() {
  return new Promise((resolve) => {
    const parsed = new url.URL(TARGET_URL);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (err) => resolve({ error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ error: 'timeout' }); });
    req.end();
  });
}

function sendPostSimulation() {
  return new Promise((resolve) => {
    const parsed = new url.URL(TARGET_URL);
    const formData = new URLSearchParams();
    formData.append('name', 'TalentXcel Editorial Team');
    formData.append('email', 'editorial@talentxcel.in');
    formData.append('subject', 'Contributor Submission: Peer-Driven Professional Communities');
    formData.append('message', 'Full article submission body test');
    const postData = formData.toString();

    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': TARGET_URL,
        'Origin': 'https://workintech.co.uk'
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (err) => resolve({ error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ error: 'timeout' }); });
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('============================================================');
  console.log('FORENSIC AUDIT: Work In Tech UK (SUB-REAL_0596-315099)');
  console.log('============================================================\n');

  console.log('1. Fetching GET structure of https://workintech.co.uk/contact...');
  const getRes = await getPageDetails();
  console.log('GET Status Code:', getRes.statusCode);
  console.log('GET Headers:', JSON.stringify(getRes.headers, null, 2));
  console.log('Body length:', (getRes.body || '').length);

  // Check form tags, email addresses, contact mechanisms
  const hasForm = /<form/i.test(getRes.body);
  console.log('Has <form> tag:', hasForm);
  if (hasForm) {
    const formMatches = getRes.body.match(/<form[\s\S]*?<\/form>/gi) || [];
    console.log(`Found ${formMatches.length} form(s).`);
    formMatches.forEach((f, idx) => {
      console.log(`--- Form #${idx + 1} ---`);
      console.log(f.slice(0, 500));
    });
  }

  // Check title and text content
  const titleMatch = getRes.body ? getRes.body.match(/<title>([^<]*)<\/title>/i) : null;
  console.log('Page Title:', titleMatch ? titleMatch[1].trim() : 'NONE');

  // Check for editorial / contributor context
  const isEditorial = /editorial|contributor|write for us|guest post|article submission|submit story/i.test(getRes.body);
  console.log('Mentions Editorial / Contributor on page:', isEditorial);

  console.log('\n2. Testing POST request reproduction...');
  const postRes = await sendPostSimulation();
  console.log('POST Status Code:', postRes.statusCode);
  console.log('POST Response Headers:', JSON.stringify(postRes.headers, null, 2));
  console.log('POST Body Length:', (postRes.body || '').length);

  // Check if POST body differs from GET body
  const isBodyIdentical = getRes.body === postRes.body;
  console.log('Is POST body identical to GET body?:', isBodyIdentical);

  // Check if body has confirmation text
  const hasConfirmation = /thank\s*you|received|success|confirmation|inquiry\s*sent|ticket/i.test(postRes.body);
  console.log('Contains confirmation / success message?:', hasConfirmation);

  console.log('\nPOST Body Preview (first 1000 chars):');
  console.log(postRes.body ? postRes.body.slice(0, 1000) : 'EMPTY BODY');
}

run();
