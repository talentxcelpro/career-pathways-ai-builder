const fs = require('fs');

let c = fs.readFileSync('index.html', 'utf8');
const startIdx = c.indexOf('<main id="main-content"');
const endIdx = c.indexOf('<!-- Chunk Error Handler');

if (startIdx === -1 || endIdx === -1) {
  console.error('Marker not found in index.html');
  process.exit(1);
}

const isCRLF = c.includes('\r\n');
const nl = isCRLF ? '\r\n' : '\n';

const newMain = `<main id="main-content" role="main">
      <div id="root">
        <div id="tx-initial-content" class="tx-initial-content" style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;">
            <div style="position:relative;width:180px;height:52px;display:flex;align-items:center;justify-content:center;">
              <img src="/talentxcel-brand-logo.png" alt="TalentXcel" style="width:150px;height:auto;object-fit:contain;display:block;" />
            </div>
            <div style="display:flex;align-items:center;gap:8px;margin-top:20px;">
              <div style="width:16px;height:16px;border:2px solid #e2e8f0;border-top-color:#0284c7;border-radius:50%;animation:txSpin 0.8s linear infinite;"></div>
              <p style="font-size:13px;font-weight:500;color:#64748b;letter-spacing:-0.01em;margin:0;">Loading your experience...</p>
            </div>
            <style>
              @keyframes txSpin { to { transform: rotate(360deg); } }
            </style>
          </div>
        </div>
      </div>
    </main>

    `;

c = c.substring(0, startIdx) + newMain.replace(/\n/g, nl) + c.substring(endIdx);
fs.writeFileSync('index.html', c);
console.log('Successfully applied TalentXcel branded loader in index.html!');
