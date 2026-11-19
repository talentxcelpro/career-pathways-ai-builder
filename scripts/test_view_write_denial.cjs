const https = require('https');

const STAGING_URL = "https://pvwwtquuexhyydwihjbi.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";

function httpReq(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(STAGING_URL + path);
    const options = {
      method,
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      headers: {
        'apikey': ANON_KEY,
        ...headers
      }
    };
    if (body) {
      options.headers['Content-Type'] = 'application/json';
    }
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function testWriteDenial() {
  console.log('=== TESTING WRITE DENIAL ON public.public_profiles (STAGING) ===');
  
  // 1. POST (Insert) attempt by anon
  const resPost = await httpReq('POST', '/rest/v1/public_profiles', {}, { full_name: 'Hacker Name' });
  console.log('Anon POST status:', resPost.status, resPost.body?.message || resPost.body);

  // 2. PATCH (Update) attempt by anon
  const resPatch = await httpReq('PATCH', '/rest/v1/public_profiles?id=eq.0b28a473-bcbb-4c49-b291-f9ea0daf4add', {}, { full_name: 'Hacked Name' });
  console.log('Anon PATCH status:', resPatch.status, resPatch.body?.message || resPatch.body);

  // 3. DELETE attempt by anon
  const resDelete = await httpReq('DELETE', '/rest/v1/public_profiles?id=eq.0b28a473-bcbb-4c49-b291-f9ea0daf4add');
  console.log('Anon DELETE status:', resDelete.status, resDelete.body?.message || resDelete.body);
}

testWriteDenial().catch(console.error);
