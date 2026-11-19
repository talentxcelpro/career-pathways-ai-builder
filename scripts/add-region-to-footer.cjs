const fs = require('fs');
const path = require('path');

const footerPath = path.join(__dirname, '../src/components/navigation/SubdomainMeshFooter.tsx');
let content = fs.readFileSync(footerPath, 'utf8');

if (!content.includes('RegionSelector')) {
  content = content.replace(
    "import React from 'react';",
    "import React from 'react';\r\nimport { RegionSelector } from '@/components/common/RegionSelector';"
  );

  content = content.replace(
    '<span>&copy; 2026 TalentXcel Global Professional Network. All subdomains actively indexed.</span>',
    '<div className=\"flex flex-col gap-2\">\r\n            <RegionSelector variant=\"footer\" />\r\n            <span>&copy; 2026 TalentXcel Global Professional Network. All regions actively consolidated on apex canonicals.</span>\r\n          </div>'
  );

  fs.writeFileSync(footerPath, content, 'utf8');
  console.log('SubdomainMeshFooter.tsx updated with RegionSelector!');
} else {
  console.log('SubdomainMeshFooter.tsx already has RegionSelector');
}
