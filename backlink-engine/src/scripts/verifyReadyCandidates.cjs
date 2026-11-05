const https = require('https');
const http = require('http');
const { URL } = require('url');

const targets = [
  { num: 14, name: 'AI Hubs', url: 'https://aihubs.ai/submit' },
  { num: 63, name: 'Find An AI Tool', url: 'https://findanaitools.com/s/submit' },
  { num: 66, name: 'FlowTools', url: 'https://www.flowtools.co/submit' },
  { num: 73, name: 'HyperTools', url: 'https://hypertools.so/submit' },
  { num: 74, name: 'Intelligent Tools', url: 'https://intelligenttools.co/submit' },
  { num: 83, name: 'NavFolders', url: 'https://navfolders.com/submit' },
  { num: 91, name: 'Stackviv', url: 'https://stackviv.ai/submit' },
  { num: 96, name: 'AI Hunt List', url: 'https://aihuntlist.com/submission/new' },
  { num: 98, name: 'Launch Vault', url: 'https://www.launchvault.dev/projects/submit' }
];

async function checkTarget(t) {
  return new Promise(resolve => {
    try {
      const u = new URL(t.url);
      const client = u.protocol === 'https:' ? https : http;
      client.get(u.href, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
        },
        rejectUnauthorized: false
      }, res => {
        let html = '';
        res.on('data', c => html += c);
        res.on('end', () => {
          const lower = html.toLowerCase();
          const hasForm = /<form/i.test(html);
          const hasInputs = /<input/i.test(html);
          const hasFree = /free/i.test(lower);
          const hasPrice = /\$|pricing|usd|stripe/i.test(lower);
          const hasAuth = /sign\s*in|log\s*in|google/i.test(lower);
          resolve({
            num: t.num,
            name: t.name,
            url: t.url,
            status: res.statusCode,
            hasForm,
            hasInputs,
            hasFree,
            hasPrice,
            hasAuth,
            htmlLen: html.length
          });
        });
      }).on('error', e => resolve({ num: t.num, name: t.name, error: e.message }));
    } catch(err) {
      resolve({ num: t.num, name: t.name, error: err.message });
    }
  });
}

async function run() {
  for (const t of targets) {
    const res = await checkTarget(t);
    console.log(JSON.stringify(res));
  }
}

run();
