const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/components/landing/LandingPage.tsx');
let code = fs.readFileSync(filePath, 'utf8');

if (!code.includes('PassportClaimWidget')) {
  code = code.replace(
    "import { AboutTalentXcelSEO } from './AboutTalentXcelSEO';",
    "import { AboutTalentXcelSEO } from './AboutTalentXcelSEO';\nimport { PassportClaimWidget } from '@/pages/passport/components/PassportClaimWidget';"
  );

  code = code.replace(
    '<SEOJobCategories />',
    `<div className="max-w-7xl mx-auto px-4 py-6">
        <PassportClaimWidget />
      </div>\n      <SEOJobCategories />`
  );
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('✓ Successfully embedded PassportClaimWidget into LandingPage.tsx');
