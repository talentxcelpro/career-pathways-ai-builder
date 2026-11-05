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
        <div id="tx-initial-content" class="tx-initial-content">
          <section style="max-width:1100px;margin:0 auto;padding:48px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
            <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;line-height:1.2;margin-bottom:16px;">
              Your Career. Your Talent. One Intelligent Platform.
            </h1>
            <p style="font-size:1.125rem;color:#94a3b8;line-height:1.7;margin-bottom:28px;">
              TalentXcel is the global career intelligence and professional networking platform connecting technology and leadership talent with verified jobs, career passports, and transparent compensation benchmarks.
            </p>
            <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:40px;">
              <a href="/jobs" style="background:#0284c7;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;">Explore Jobs</a>
              <a href="/passport" style="background:#1e293b;color:#38bdf8;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;">Career Passport</a>
              <a href="/salary" style="background:#1e293b;color:#38bdf8;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;">Salary Benchmarks</a>
            </div>
          </section>
        </div>
      </div>
    </main>

    `;

c = c.substring(0, startIdx) + newMain.replace(/\n/g, nl) + c.substring(endIdx);
fs.writeFileSync('index.html', c);
console.log('Successfully eliminated display:none cloaked crawler content from index.html!');
