// backlink-engine/src/scripts/inspectTechPlutoGoogleForm.cjs
const https = require('https');

https.get('https://docs.google.com/forms/d/e/1FAIpQLScmzHxA16yQUsr_pCwIjlMd3jvvValvon9zXs2NevoFosQ8Cg/viewform', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' }
}, res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const formMatch = html.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*([\s\S]*?);<\/script>/);
    if (formMatch) {
      console.log('FB_PUBLIC_LOAD_DATA_ found!');
      try {
        const data = JSON.parse(formMatch[1]);
        const formTitle = data[1][8];
        console.log('Form Title:', formTitle);
        const questions = data[1][1];
        console.log(`Total questions: ${questions.length}`);
        questions.forEach((q, idx) => {
          const title = q[1];
          const entryId = q[4] ? q[4][0][0] : null;
          console.log(`Q${idx+1}: "${title}" (entry.${entryId})`);
        });
      } catch (e) {
        console.error('Parse error:', e.message);
      }
    } else {
      console.log('FB_PUBLIC_LOAD_DATA_ not found directly');
    }
  });
});
