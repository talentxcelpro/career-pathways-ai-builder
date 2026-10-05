// scripts/inspect_problem_samples_gsc.cjs
// Deep Inspection of Problematic URL Templates via Google Search Console URL Inspection API

const fs = require('fs');
const crypto = require('crypto');
const https = require('https');

async function getAccessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const base64Url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const unsignedToken = `${base64Url(header)}.${base64Url(claimSet)}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsignedToken);
  const signature = sign.sign(key.private_key, 'base64url');
  const jwt = `${unsignedToken}.${signature}`;

  return new Promise((resolve, reject) => {
    const postData = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
    const req = https.request('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) resolve(parsed.access_token);
          else reject(new Error(JSON.stringify(parsed)));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function inspectUrl(inspectionUrl, siteUrl, token) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ inspectionUrl, siteUrl });
    const req = https.request('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function run() {
  const key = JSON.parse(fs.readFileSync('gcp-key.json', 'utf8'));
  const token = await getAccessToken(key);
  const siteUrl = 'https://talentxcel.in/';

  // 10 Sample URLs representing the main hypothesized problem clusters
  const testUrls = [
    // 1. College Facet Subpages (Hypothesis: Duplicate without user-selected canonical / Alternate)
    { type: 'COLLEGE_FACET_FEES', url: 'https://talentxcel.in/colleges/indian-institute-of-technology-bombay/fees' },
    { type: 'COLLEGE_FACET_COURSES', url: 'https://talentxcel.in/colleges/indian-institute-of-technology-delhi/courses' },
    { type: 'COLLEGE_FACET_PLACEMENTS', url: 'https://talentxcel.in/colleges/indian-institute-of-technology-madras/placements' },

    // 2. Combinatorial Experience Jobs (Hypothesis: Soft 404 / Discovered not indexed)
    { type: 'JOB_EXP_ROLE_LOC', url: 'https://talentxcel.in/jobs/freshers-software-engineer-in-bangalore' },
    { type: 'JOB_EXP_ROLE_LOC', url: 'https://talentxcel.in/jobs/senior-product-manager-in-mumbai' },

    // 3. Combinatorial Role-Jobs-In-Loc (Hypothesis: Soft 404 / Discovered not indexed)
    { type: 'JOB_ROLE_LOC', url: 'https://talentxcel.in/jobs/python-developer-jobs-in-pune' },
    { type: 'JOB_ROLE_LOC', url: 'https://talentxcel.in/jobs/react-developer-jobs-in-hyderabad' },

    // 4. College Degree in State (Hypothesis: Discovered not indexed / Thin)
    { type: 'COLLEGE_DEGREE_STATE', url: 'https://talentxcel.in/colleges/btech/in-delhi' },

    // 5. Salary Matrix (Hypothesis: Discovered not indexed / Thin)
    { type: 'SALARY_MATRIX', url: 'https://talentxcel.in/salaries/data-scientist-salary-in-bangalore' },

    // 6. Company Hiring (Hypothesis: Discovered not indexed)
    { type: 'COMPANY_HIRING', url: 'https://talentxcel.in/jobs/company/google/software-engineer' }
  ];

  console.log(`Starting forensic GSC URL inspection for ${testUrls.length} representative template samples...\n`);

  const results = [];

  for (const item of testUrls) {
    console.log(`Inspecting [${item.type}]: ${item.url}...`);
    const res = await inspectUrl(item.url, siteUrl, token);
    const result = res.data && res.data.inspectionResult;
    const indexStatus = result && result.indexStatusResult;

    const record = {
      template: item.type,
      url: item.url,
      httpStatus: res.status,
      verdict: indexStatus ? indexStatus.verdict : 'UNKNOWN',
      coverageState: indexStatus ? indexStatus.coverageState : (res.data ? res.data.error?.message || 'NO_DATA' : 'ERROR'),
      crawledAs: indexStatus ? indexStatus.crawledAs : null,
      googleCanonical: indexStatus ? indexStatus.googleCanonical : null,
      userCanonical: indexStatus ? indexStatus.userCanonical : null,
      lastCrawlTime: indexStatus ? indexStatus.lastCrawlTime : null,
      pageFetchState: indexStatus ? indexStatus.pageFetchState : null,
      robotsTxtState: indexStatus ? indexStatus.robotsTxtState : null,
      raw: res.data
    };

    console.log(`  -> Verdict: ${record.verdict} | CoverageState: ${record.coverageState}`);
    if (record.googleCanonical) console.log(`  -> Google Canonical: ${record.googleCanonical}`);
    if (record.lastCrawlTime) console.log(`  -> Last Crawl: ${record.lastCrawlTime}`);
    console.log('');
    results.push(record);
  }

  fs.writeFileSync('GSC_PROBLEM_TEMPLATES_INSPECTION.json', JSON.stringify(results, null, 2));
  console.log('Saved inspection results to GSC_PROBLEM_TEMPLATES_INSPECTION.json');
}

run().catch(console.error);
