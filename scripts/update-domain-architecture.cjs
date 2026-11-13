// scripts/update-domain-architecture.cjs
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'config', 'domainArchitecture.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update ProductUniverse
content = content.replace(
  /export type ProductUniverse =[\s\S]*?\| 'RESUME';/,
  `export type ProductUniverse =
  | 'CORE'
  | 'JOBS'
  | 'LEARNING'
  | 'PASSPORT'
  | 'GOVERNMENT'
  | 'EMPLOYERS'
  | 'COLLEGES'
  | 'CAREERS'
  | 'SALARY'
  | 'RESUME'
  | 'CA_PRACTICE'
  | 'LEGAL_PRACTICE'
  | 'SERVICES';`
);

// 2. Update DOMAIN_TO_UNIVERSE
content = content.replace(
  /'resume\.talentxcel\.in': 'RESUME',/,
  `'resume.talentxcel.in': 'RESUME',
  'ca.talentxcel.in': 'CA_PRACTICE',
  'legal.talentxcel.in': 'LEGAL_PRACTICE',
  'services.talentxcel.in': 'SERVICES',`
);

// 3. Update UNIVERSE_PRIMARY_DOMAIN
content = content.replace(
  /RESUME: 'https:\/\/resume\.talentxcel\.in',/,
  `RESUME: 'https://resume.talentxcel.in',
  CA_PRACTICE: 'https://ca.talentxcel.in',
  LEGAL_PRACTICE: 'https://legal.talentxcel.in',
  SERVICES: 'https://services.talentxcel.in',`
);

// 4. Update UNIVERSE_ROOT_PATHS
content = content.replace(
  /RESUME: '\/resume',/,
  `RESUME: '/resume',
  CA_PRACTICE: '/ca',
  LEGAL_PRACTICE: '/legal',
  SERVICES: '/services',`
);

// 5. Update AUTH_ALLOWED_HOSTNAMES
content = content.replace(
  /'resume\.talentxcel\.in',(\s*\] as const;)/,
  `'resume.talentxcel.in',
  'ca.talentxcel.in',
  'legal.talentxcel.in',
  'services.talentxcel.in',$1`
);

// 6. Update GOOGLE_OAUTH_AUTHORIZED_JAVASCRIPT_ORIGINS
content = content.replace(
  /'https:\/\/resume\.talentxcel\.in',(\s*\] as const;\s*\/\*\*)/,
  `'https://resume.talentxcel.in',
  'https://ca.talentxcel.in',
  'https://legal.talentxcel.in',
  'https://services.talentxcel.in',$1`
);

// 7. Update GOOGLE_OAUTH_AUTHORIZED_REDIRECT_URIS
content = content.replace(
  /'https:\/\/resume\.talentxcel\.in\/auth\/callback',(\s*\] as const;)/,
  `'https://resume.talentxcel.in/auth/callback',
  'https://ca.talentxcel.in/auth/callback',
  'https://legal.talentxcel.in/auth/callback',
  'https://services.talentxcel.in/auth/callback',$1`
);

// 8. Update Subdomain prefix matching in getCurrentUniverse
content = content.replace(
  /if \(host\.startsWith\('resume\.'\) \|\| host\.startsWith\('resume-'\)\) return 'RESUME';/,
  `if (host.startsWith('resume.') || host.startsWith('resume-')) return 'RESUME';
  if (host.startsWith('ca.') || host.startsWith('ca-')) return 'CA_PRACTICE';
  if (host.startsWith('legal.') || host.startsWith('legal-')) return 'LEGAL_PRACTICE';
  if (host.startsWith('services.') || host.startsWith('services-')) return 'SERVICES';`
);

// 9. Update getAuthoritativeUniverseForRoute
content = content.replace(
  /\/\/ Core Career Ecosystem/,
  `// CA PracticeOS
  if (clean === '/ca' || clean.startsWith('/ca/')) {
    return 'CA_PRACTICE';
  }

  // Legal PracticeOS
  if (clean === '/legal' || clean.startsWith('/legal/')) {
    return 'LEGAL_PRACTICE';
  }

  // Professional ServicesOS
  if (clean === '/services' || clean.startsWith('/services/')) {
    return 'SERVICES';
  }

  // Core Career Ecosystem`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated domainArchitecture.ts');
