// backlink-engine/src/scripts/submitBetalistV2.cjs
const https = require('https');
const querystring = require('querystring');

// Step 1: GET the form to extract authenticity token AND session cookie
function getForm() {
  return new Promise((resolve, reject) => {
    https.get('https://betalist.com/submissions/new', {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    }, res => {
      let html = '';
      const setCookies = res.headers['set-cookie'] || [];
      res.on('data', c => html += c);
      res.on('end', () => {
        const tokenMatch = html.match(/name="authenticity_token"[^>]*value="([^"]+)"/);
        const token = tokenMatch ? tokenMatch[1] : null;
        const cookieStr = setCookies.map(c => c.split(';')[0]).join('; ');
        resolve({ token, cookieStr, html });
      });
    }).on('error', reject);
  });
}

async function run() {
  const { token, cookieStr } = await getForm();
  if (!token) { console.log('No token found'); return; }
  console.log('Token:', token.slice(0, 30), '...');

  // Inspect what fields form expects
  const fs = require('fs');
  const htmlPage = (await getForm()).html;
  const inputs = [...htmlPage.matchAll(/<input\b([^>]*)>/gi)].map(m => m[1]);
  const textareas = [...htmlPage.matchAll(/<textarea\b([^>]*)>/gi)].map(m => m[1]);
  console.log('Form inputs:', inputs.filter(i => !i.includes('authenticity_token')));
  console.log('Form textareas:', textareas);
}

run();
