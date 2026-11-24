const https = require('https');
const zlib = require('zlib');

function getDecompressed(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const encoding = res.headers['content-encoding'];
        console.log('Content-Encoding:', encoding, 'Raw bytes:', buffer.length);
        let decompressed;
        if (encoding === 'gzip') {
          decompressed = zlib.gunzipSync(buffer).toString('utf8');
        } else if (encoding === 'br') {
          decompressed = zlib.brotliDecompressSync(buffer).toString('utf8');
        } else {
          decompressed = buffer.toString('utf8');
        }
        resolve(decompressed);
      });
    }).on('error', reject);
  });
}

async function main() {
  const data = await getDecompressed('https://talentxcel.in/assets/index-DsGSNLTD.js');
  console.log('Decompressed bytes:', data.length);
  console.log('1. Contains G-CMYNTTNT56?', data.includes('G-CMYNTTNT56'));
  console.log('2. Contains /r/:code?', data.includes('/r/:code'));
  console.log('3. Contains /verify/:username?', data.includes('/verify/:username'));
  console.log('4. Contains path:"/auth"?', data.includes('path:"/auth"'));
}

main().catch(console.error);
