const { runSql } = require('./db-audit-helper.cjs');
const https = require('https');

function httpGet(url) {
  return new Promise((resolve) => {
    try {
      const req = https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => { if (data.length < 500) data += chunk; });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            bodySnippet: data.slice(0, 200)
          });
        });
      });
      req.on('error', (e) => resolve({ error: e.message }));
      req.setTimeout(5000, () => {
        req.destroy();
        resolve({ error: 'timeout' });
      });
    } catch (e) {
      resolve({ error: e.message });
    }
  });
}

async function main() {
  console.log('--- 1. INSPECT STORAGE BUCKETS (STAGING) ---');
  const buckets = await runSql(`
    SELECT id, name, public, file_size_limit, allowed_mime_types
    FROM storage.buckets
    ORDER BY id;
  `, 'staging');
  console.log(JSON.stringify(buckets, null, 2));

  console.log('\n--- 2. INSPECT SAMPLE OBJECTS PER BUCKET ---');
  const objects = await runSql(`
    SELECT bucket_id, name, id, created_at
    FROM storage.objects
    LIMIT 20;
  `, 'staging');
  console.log(JSON.stringify(objects, null, 2));

  console.log('\n--- 3. TEST ANONYMOUS HTTP GET REQUESTS ---');
  const stagingUrl = 'https://pvwwtquuexhyydwihjbi.supabase.co';

  if (Array.isArray(objects) && objects.length > 0) {
    for (const obj of objects.slice(0, 5)) {
      const testUrl = `${stagingUrl}/storage/v1/object/public/${obj.bucket_id}/${obj.name}`;
      console.log(`Probing public URL: ${testUrl}`);
      const res = await httpGet(testUrl);
      console.log(` -> Status: ${res.statusCode}, Body: ${res.bodySnippet}`);
    }
  }

  // Also test private buckets specifically: resumes, documents, cv-files
  const sensitiveBuckets = ['resumes', 'cv-files', 'documents', 'private-resumes'];
  for (const b of sensitiveBuckets) {
    const testUrl = `${stagingUrl}/storage/v1/object/public/${b}/sample-resume.pdf`;
    const res = await httpGet(testUrl);
    console.log(`Probe sensitive bucket [${b}]: Status=${res.statusCode}, Body=${res.bodySnippet}`);
  }
}

main().catch(console.error);
