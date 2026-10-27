const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const urls = [
  'https://jobs.talentxcel.in/industries/artificial-intelligence',
  'https://jobs.talentxcel.in/jobs/data-analyst/hyderabad',
  'https://jobs.talentxcel.in/jobs/freshers',
  'https://jobs.talentxcel.in/jobs/job-cld-01',
  'https://jobs.talentxcel.in/jobs/job-fin-01',
  'https://jobs.talentxcel.in/jobs/job-hlth-01',
  'https://jobs.talentxcel.in/jobs/job-hr-01',
  'https://jobs.talentxcel.in/jobs/job-hsp-01',
  'https://jobs.talentxcel.in/jobs/software-engineer/bangalore',
  'https://talentxcel.in/auth/register?role=candidate'
];

async function inspect() {
  for (const u of urls) {
    try {
      const res = await fetch(u, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
        redirect: 'manual'
      });
      const location = res.headers.get('location') || '';
      const text = await res.text();
      const canonMatch = text.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
                         text.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
      const canon = canonMatch ? canonMatch[1] : 'NONE';
      const robotsMatch = text.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
      const robots = robotsMatch ? robotsMatch[1] : 'NONE';
      const titleMatch = text.match(/<title>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : 'NONE';
      const engine = res.headers.get('x-render-engine') || 'Vercel-Edge';

      console.log(`\nURL:    ${u}`);
      console.log(`Status: ${res.status}${location ? ' -> ' + location : ''}`);
      console.log(`Engine: ${engine}`);
      console.log(`Robots: ${robots}`);
      console.log(`Canon:  ${canon}`);
      console.log(`Title:  ${title.trim().slice(0, 70)}`);
    } catch (err) {
      console.error(`ERROR on ${u}: ${err.message}`);
    }
  }
}

async function testLocalHandler() {
  console.log('\n================ LOCAL SEO-RENDER HANDLER TEST ================');
  const { default: handler } = await import('../api/seo-render.ts');
  const paths = [
    'industries/artificial-intelligence',
    'jobs/data-analyst/hyderabad',
    'jobs/freshers',
    'jobs/job-cld-01',
    'jobs/job-fin-01',
    'jobs/job-hlth-01',
    'jobs/job-hr-01',
    'jobs/job-hsp-01',
    'jobs/software-engineer/bangalore',
    'auth/register'
  ];
  for (const p of paths) {
    const req = new Request('https://talentxcel.in/api/seo-render?path=' + p);
    const res = await handler(req);
    const html = await res.text();
    const title = (html.match(/<title>([^<]+)<\/title>/) || [])[1];
    const canon = (html.match(/<link rel=["']canonical["'] href=["']([^"']+)["']/) || [])[1];
    const schema = html.includes('application/ld+json');
    console.log(`[${res.status}] Path: ${p}`);
    console.log(`     Canon:  ${canon}`);
    console.log(`     Schema: ${schema ? 'YES' : 'NO'}`);
    console.log(`     Title:  ${title}`);
  }
}

testLocalHandler();

