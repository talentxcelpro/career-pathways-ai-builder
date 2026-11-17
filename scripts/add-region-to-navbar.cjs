const fs = require('fs');
const path = require('path');

const navPath = path.join(__dirname, '../src/components/navigation/Navbar.tsx');
let content = fs.readFileSync(navPath, 'utf8');

if (!content.includes('RegionSelector')) {
  content = content.replace(
    "import { useAuth } from '@/contexts/AuthContext';",
    "import { useAuth } from '@/contexts/AuthContext';\r\nimport { RegionSelector } from '@/components/common/RegionSelector';"
  );

  // Add in authenticated view before Messages
  content = content.replace(
    '{/* Direct Messages Icon Link */}',
    '<RegionSelector className="hidden sm:flex mr-1" />\r\n\r\n                {/* Direct Messages Icon Link */}'
  );

  // Add in guest view before Recruiter Entry Door
  content = content.replace(
    '{/* Clear Recruiter Entry Door */}',
    '<RegionSelector className="hidden sm:flex mr-1" />\r\n\r\n              {/* Clear Recruiter Entry Door */}'
  );

  fs.writeFileSync(navPath, content, 'utf8');
  console.log('Navbar.tsx successfully updated with RegionSelector!');
} else {
  console.log('Navbar.tsx already has RegionSelector');
}
