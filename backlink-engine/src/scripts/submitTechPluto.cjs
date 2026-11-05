// backlink-engine/src/scripts/submitTechPluto.cjs
const https = require('https');
const querystring = require('querystring');

const formId = '1FAIpQLScmzHxA16yQUsr_pCwIjlMd3jvvValvon9zXs2NevoFosQ8Cg';

const description = "TalentXcel is an AI-powered career operating system and talent intelligence platform engineered for engineers, recruiters, and academic institutions across India and emerging tech ecosystems. Founded in Srinagar and serving candidates nationwide, TalentXcel provides automated ATS resume diagnostics, parser compatibility scoring, and real-time compensation benchmarks across tier-1 and tier-2 technology hubs. By replacing outdated recruitment friction with verifiable skill diagnostics, transparent salary analytics, and direct campus placement pipelines, TalentXcel empowers job seekers to optimize their career trajectories while enabling hiring teams to source verified technical talent efficiently without expensive intermediaries. The platform operates with zero-cost foundational access for candidates and open research datasets for the technical community.";

const problem = "Technical hiring in India suffers from extreme resume black holes, misleading compensation benchmarks, and inefficient campus-to-corporate pipelines. Most candidates are rejected by applicant tracking systems without diagnostic feedback, while engineering talent lacks verified salary transparency across tech corridors. TalentXcel solves this by providing instant AI-driven ATS diagnostics, actionable format and keyword scoring, and verified salary benchmark analytics that bridge candidate qualifications directly with employer requirements.";

const postData = querystring.stringify({
  'entry.1209074235': 'Arshid',
  'entry.2086255310': 'founder@talentxcel.in',
  'entry.1824094704': 'TalentXcel',
  'entry.1690307628': 'https://talentxcel.in',
  'entry.1824317337': 'Arshid Wani',
  'entry.54120070': description,
  'entry.1999643629': problem
});

const options = {
  hostname: 'docs.google.com',
  port: 443,
  path: `/forms/d/e/${formId}/formResponse`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Referer': `https://docs.google.com/forms/d/e/${formId}/viewform`
  }
};

console.log('Submitting TechPluto startup profile...');
const req = https.request(options, res => {
  console.log('HTTP Status:', res.statusCode);
  console.log('Headers location:', res.headers.location);
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 302 || body.includes('Your response has been recorded')) {
      console.log('SUCCESS: Form response recorded for TechPluto!');
    } else {
      console.log('Response body preview:', body.slice(0, 500));
    }
  });
});

req.on('error', e => console.error('Error submitting form:', e));
req.write(postData);
req.end();
