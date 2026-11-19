const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/pages/passport/components/PassportAcquisitionLanding.tsx');
let code = fs.readFileSync(filePath, 'utf8');

if (!code.includes('PassportClaimWidget')) {
  code = code.replace(
    "import { CareerPassportHeader } from './CareerPassportHeader';",
    "import { CareerPassportHeader } from './CareerPassportHeader';\nimport { PassportClaimWidget } from './PassportClaimWidget';"
  );

  code = code.replace(
    '{/* ── SECTION 2: 6 MICRO VALUE PROPOSITIONS',
    `<div className="max-w-4xl mx-auto px-4 my-8">
          <PassportClaimWidget />
        </div>\n\n        {/* ── SECTION 2: 6 MICRO VALUE PROPOSITIONS`
  );
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('✓ Successfully embedded PassportClaimWidget into PassportAcquisitionLanding.tsx');
