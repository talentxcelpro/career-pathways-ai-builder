const https = require('https');

const candidates = [
  { name: 'AI SaaS Radar', url: 'https://aisaasradar.com/submit' },
  { name: 'ToolDock', url: 'https://tools.zalize.com/submit' },
  { name: 'ThatsMyAI', url: 'https://thatsmy.ai/submit' },
  { name: 'Deekoya AI', url: 'https://deekoyaai.in/submit' },
  { name: 'AI ToolsXplorer', url: 'https://aitoolsxplorer.in/submit-tool' }
];

function inspectForm(cand) {
  return new Promise((resolve) => {
    try {
      const u = new URL(cand.url);
      const req = https.request(
        {
          hostname: u.hostname,
          path: u.pathname + u.search,
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          timeout: 10000
        },
        (res) => {
          let body = '';
          res.on('data', chunk => { if (body.length < 500000) body += chunk; });
          res.on('end', () => {
            const hasForm = /<form[\s\S]*?>/i.test(body);
            const formActionMatch = body.match(/<form[^>]+action=["']([^"']*)["']/i);
            const formMethodMatch = body.match(/<form[^>]+method=["']([^"']*)["']/i);
            const hasRecaptcha = /recaptcha/i.test(body);
            const hasTurnstile = /turnstile|challenges\.cloudflare\.com/i.test(body);
            const hasHcaptcha = /hcaptcha/i.test(body);
            const inputs = [...body.matchAll(/<input[^>]+name=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
            const textareas = [...body.matchAll(/<textarea[^>]+name=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
            const selects = [...body.matchAll(/<select[^>]+name=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);

            resolve({
              name: cand.name,
              url: cand.url,
              statusCode: res.statusCode,
              hasForm,
              action: formActionMatch ? formActionMatch[1] : 'DEFAULT_SAME_URL',
              method: formMethodMatch ? formMethodMatch[1] : 'GET/POST',
              captcha: hasRecaptcha ? 'reCAPTCHA' : hasTurnstile ? 'Cloudflare Turnstile' : hasHcaptcha ? 'hCaptcha' : 'None detected',
              inputNames: inputs.slice(0, 10),
              textareaNames: textareas,
              selectNames: selects,
              bodySnippet: body.slice(0, 500).replace(/\s+/g, ' ')
            });
          });
        }
      );
      req.on('error', err => resolve({ name: cand.name, url: cand.url, error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ name: cand.name, url: cand.url, error: 'TIMEOUT' }); });
      req.end();
    } catch (e) {
      resolve({ name: cand.name, url: cand.url, error: e.message });
    }
  });
}

async function run() {
  console.log('Inspecting submission form endpoints...');
  for (const c of candidates) {
    const res = await inspectForm(c);
    console.log(`\n=== ${res.name} (${res.url}) ===`);
    if (res.error) {
      console.log(`Error: ${res.error}`);
    } else {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Form found: ${res.hasForm}`);
      console.log(`Action: ${res.action} | Method: ${res.method}`);
      console.log(`CAPTCHA: ${res.captcha}`);
      console.log(`Inputs:`, res.inputNames);
      console.log(`Textareas:`, res.textareaNames);
      console.log(`Selects:`, res.selectNames);
    }
  }
}

run();
