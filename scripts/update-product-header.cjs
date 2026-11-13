// scripts/update-product-header.cjs
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'products', 'common', 'ProductHeader.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace navLinks with localhost-aware resolution and all 12 products
const oldNavBlock = /const navLinks = \[[\s\S]*?\];/;
const newNavBlock = `const isLocal = typeof window !== 'undefined' && window.location.hostname.includes('localhost');
  const portStr = typeof window !== 'undefined' && window.location.port ? \`:\${window.location.port}\` : ':8080';

  const getSubdomainUrl = (sub: string, fallbackPath: string) => {
    if (isLocal) {
      return \`http://\${sub}.localhost\${portStr}\`;
    }
    return \`https://\${sub}.talentxcel.in\`;
  };

  const navLinks = [
    { key: 'jobs', label: 'Jobs', to: getSubdomainUrl('jobs', '/jobs'), localPath: '/jobs' },
    { key: 'resume', label: 'Resume', to: getSubdomainUrl('resume', '/resume'), localPath: '/resume' },
    { key: 'salary', label: 'Salary', to: getSubdomainUrl('salary', '/salary'), localPath: '/salary' },
    { key: 'colleges', label: 'CampusOS', to: getSubdomainUrl('colleges', '/colleges'), localPath: '/colleges' },
    { key: 'passport', label: 'Passport', to: getSubdomainUrl('passport', '/passport'), localPath: '/passport' },
    { key: 'government', label: 'SarkariHub', to: getSubdomainUrl('government', '/government-jobs'), localPath: '/government-jobs' },
    { key: 'careers', label: 'Pathfinder', to: getSubdomainUrl('careers', '/career-map'), localPath: '/career-map' },
    { key: 'learning', label: 'SkillPods', to: getSubdomainUrl('learning', '/courses'), localPath: '/courses' },
    { key: 'ca', label: 'CA Practice', to: getSubdomainUrl('ca', '/ca'), localPath: '/ca' },
    { key: 'legal', label: 'Legal Practice', to: getSubdomainUrl('legal', '/legal'), localPath: '/legal' },
    { key: 'services', label: 'Services', to: getSubdomainUrl('services', '/services'), localPath: '/services' },
    { key: 'employers', label: 'Hire →', to: getSubdomainUrl('employers', '/hire'), localPath: '/hire', isEmployer: true },
  ];`;

content = content.replace(oldNavBlock, newNavBlock);

// Also add link to /local-testing-index in the top value banner
content = content.replace(
  /<Link to="\/billing" className="text-\[#2563EB\] hover:underline font-semibold flex items-center gap-1">[\s\S]*?<\/Link>/,
  `<Link to="/local-testing-index" className="text-[#2563EB] hover:underline font-bold flex items-center gap-1 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
              <Sparkles className="h-3 w-3" />
              <span>12 Products Local Index</span>
            </Link>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated ProductHeader.tsx with 12 local links');
