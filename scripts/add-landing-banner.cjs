// scripts/add-landing-banner.cjs
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'landing', 'LandingPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('import { Link } from \'react-router-dom\';')) {
  content = `import { Link } from 'react-router-dom';\n` + content;
}

const banner = `      {/* 12 Independent Businesses Ecosystem Access Banner */}
      <div className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white text-xs font-bold py-2 px-4 shadow-xs select-none">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">TalentXcel Multi-Product Commercial Operating System:</span>
            <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md">12 Businesses Online</span>
          </div>
          <Link 
            to="/local-testing-index" 
            className="inline-flex items-center gap-1 bg-white text-[#2563EB] hover:bg-white/90 text-xs font-bold px-3 py-1 rounded-lg shadow-2xs transition-all"
          >
            <span>Launch Local Testing Directory (12 Subdomains) →</span>
          </Link>
        </div>
      </div>\n`;

if (!content.includes('12 Independent Businesses Ecosystem Access Banner')) {
  content = content.replace(
    /<div className="min-h-screen w-full max-w-full overflow-x-hidden">\s*<SEOHead/,
    `<div className="min-h-screen w-full max-w-full overflow-x-hidden">\n${banner}      <SEOHead`
  );
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully added local testing banner to LandingPage.tsx');
