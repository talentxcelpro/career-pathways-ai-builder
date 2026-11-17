const https = require('https');

const PROD_URL = "https://dthlgsnakhoftinssokm.supabase.co";
const PROD_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc";

async function testRealStorageObject() {
  console.log('Testing access to real private object in user-uploads bucket as anon...');
  
  // Public URL attempt (bucket is private so should fail)
  const publicUrl = `/storage/v1/object/public/user-uploads/5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062/video_resumes/video_resume.mp4`;
  // Authenticated URL attempt with anon key
  const authUrl = `/storage/v1/object/authenticated/user-uploads/5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062/video_resumes/video_resume.mp4`;

  function check(path) {
    return new Promise((resolve) => {
      const options = {
        hostname: new URL(PROD_URL).hostname,
        port: 443,
        path: path,
        method: 'GET',
        headers: {
          'apikey': PROD_ANON_KEY,
          'Authorization': 'Bearer ' + PROD_ANON_KEY
        }
      };
      https.get(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({ status: res.statusCode, body: data });
        });
      }).on('error', err => resolve({ error: err.message }));
    });
  }

  const resPublic = await check(publicUrl);
  console.log('Public endpoint attempt:', resPublic.status, resPublic.body);

  const resAuth = await check(authUrl);
  console.log('Authenticated endpoint attempt with anon key:', resAuth.status, resAuth.body);
}

testRealStorageObject().catch(console.error);
