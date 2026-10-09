/**
 * Verified Real Company Logo Resolver for TalentXcel Jobs
 * Resolves authentic, high-resolution vector logos for all verified employers,
 * public sector bodies, defense/space agencies, tech giants, and client partners.
 */

export const VERIFIED_COMPANY_LOGOS: Record<string, string> = {
  // Global Tech & Enterprises
  'google deepmind': '/assets/company-logos/google.svg',
  'google': '/assets/company-logos/google.svg',
  'microsoft azure': '/assets/company-logos/microsoft.svg',
  'microsoft': '/assets/company-logos/microsoft.svg',
  'amazon web services (aws)': '/assets/company-logos/aws.svg',
  'amazon web services': '/assets/company-logos/aws.svg',
  'aws': '/assets/company-logos/aws.svg',
  'amazon': '/assets/company-logos/aws.svg',
  'apple india': '/assets/company-logos/apple.svg',
  'apple': '/assets/company-logos/apple.svg',
  'stripe india': '/assets/company-logos/stripe.svg',
  'stripe': '/assets/company-logos/stripe.svg',
  'jpmorgan chase & co.': '/assets/company-logos/jpmorgan.svg',
  'jpmorgan chase': '/assets/company-logos/jpmorgan.svg',
  'jpmorgan': '/assets/company-logos/jpmorgan.svg',
  'deloitte consulting': '/assets/company-logos/deloitte.svg',
  'deloitte': '/assets/company-logos/deloitte.svg',
  'mckinsey & company': '/assets/company-logos/mckinsey.svg',
  'mckinsey': '/assets/company-logos/mckinsey.svg',
  'crowdstrike': '/assets/company-logos/crowdstrike.svg',
  'atlassian': '/assets/company-logos/atlassian.svg',
  'zoho corporation': '/assets/company-logos/zoho.svg',
  'zoho': '/assets/company-logos/zoho.svg',
  'tata elxsi': '/assets/company-logos/tata.svg',
  'tata': '/assets/company-logos/tata.svg',
  'tower research capital': '/assets/company-logos/tower-research.svg',
  'tower research': '/assets/company-logos/tower-research.svg',
  'dhl supply chain': '/assets/company-logos/dhl.svg',
  'dhl': '/assets/company-logos/dhl.svg',
  'taj hotels & resorts': '/assets/company-logos/taj-hotels.svg',
  'taj hotels': '/assets/company-logos/taj-hotels.svg',
  'apollo hospitals group': '/assets/company-logos/apollo-hospitals.svg',
  'apollo hospitals': '/assets/company-logos/apollo-hospitals.svg',

  // Space, Defense & Science
  'nasa jet propulsion laboratory / goddard space flight center': '/assets/company-logos/nasa.svg',
  'nasa': '/assets/company-logos/nasa.svg',
  'indian space research organisation (isro)': '/assets/company-logos/isro.svg',
  'indian space research organisation': '/assets/company-logos/isro.svg',
  'isro': '/assets/company-logos/isro.svg',
  'defence research and development organisation (drdo)': '/assets/company-logos/drdo.svg',
  'defence research and development organisation': '/assets/company-logos/drdo.svg',
  'drdo': '/assets/company-logos/drdo.svg',
  'european space operations centre (esoc - esa)': '/assets/company-logos/esa.svg',
  'european space agency': '/assets/company-logos/esa.svg',
  'esa': '/assets/company-logos/esa.svg',
  'csiro australia': '/assets/company-logos/csiro.svg',
  'csiro': '/assets/company-logos/csiro.svg',

  // Banking & Energy
  'reserve bank of India (rbi)': '/assets/company-logos/rbi.svg',
  'reserve bank of india': '/assets/company-logos/rbi.svg',
  'rbi': '/assets/company-logos/rbi.svg',
  'indian oil corporation ltd (iocl)': '/assets/company-logos/iocl.svg',
  'indian oil corporation': '/assets/company-logos/iocl.svg',
  'iocl': '/assets/company-logos/iocl.svg',
  'monetary authority of singapore (mas)': '/assets/company-logos/mas-singapore.svg',
  'monetary authority of singapore': '/assets/company-logos/mas-singapore.svg',
  'mas': '/assets/company-logos/mas-singapore.svg',

  // Governments & Public Institutions
  'union public service commission (govt. of india)': '/assets/company-logos/upsc.svg',
  'union public service commission': '/assets/company-logos/upsc.svg',
  'upsc': '/assets/company-logos/upsc.svg',
  'department for science, innovation and technology (dsit)': '/assets/company-logos/uk-government.svg',
  'dsit': '/assets/company-logos/uk-government.svg',
  'uk cabinet office & defence digital': '/assets/company-logos/uk-government.svg',
  'uk cabinet office': '/assets/company-logos/uk-government.svg',
  'centers for disease control and prevention (cdc)': '/assets/company-logos/cdc.svg',
  'centers for disease control and prevention': '/assets/company-logos/cdc.svg',
  'cdc': '/assets/company-logos/cdc.svg',
  'cybersecurity and infrastructure security agency (cisa)': '/assets/company-logos/cisa.svg',
  'cybersecurity and infrastructure security agency': '/assets/company-logos/cisa.svg',
  'cisa': '/assets/company-logos/cisa.svg',
  'us department of energy (office of clean energy demonstrations)': '/assets/company-logos/us-doe.svg',
  'us department of energy': '/assets/company-logos/us-doe.svg',
  'european commission (directorate-general for communications networks - dg connect)': '/assets/company-logos/european-commission.svg',
  'european commission': '/assets/company-logos/european-commission.svg',
  'government technology agency (govtech singapore)': '/assets/company-logos/govtech-singapore.svg',
  'govtech singapore': '/assets/company-logos/govtech-singapore.svg',
  'australian signals directorate (asd)': '/assets/company-logos/asd-australia.svg',
  'australian signals directorate': '/assets/company-logos/asd-australia.svg',
  'shared services canada (services partagés canada)': '/assets/company-logos/canada-government.svg',
  'shared services canada': '/assets/company-logos/canada-government.svg',
  'digital dubai authority (govt. of dubai)': '/assets/company-logos/dubai-government.svg',
  'digital dubai authority': '/assets/company-logos/dubai-government.svg',
  'roads and transport authority (rta dubai)': '/assets/company-logos/dubai-government.svg',
  'rta dubai': '/assets/company-logos/dubai-government.svg',

  // Savantis & TalentXcel
  'savantis solutions': '/assets/company-logos/savantis.svg',
  'savantis': '/assets/company-logos/savantis.svg',
  'talentxcel services': '/talentxcel-official-logo.png',
  'talentxcel services (client partner)': '/talentxcel-official-logo.png',
  'talentxcel enterprise': '/talentxcel-official-logo.png',
  'talenxcel': '/talentxcel-official-logo.png',
  'talentxcel': '/talentxcel-official-logo.png'
};

/**
 * Generate a deterministic stylized monogram SVG data URI for unlisted companies
 */
export function generateCompanyMonogram(companyName: string = 'Enterprise'): string {
  const cleanName = companyName.trim() || 'Enterprise';
  const words = cleanName.split(/\s+/).filter(Boolean);
  const initials = words.length > 1
    ? (words[0][0] + words[1][0]).toUpperCase()
    : cleanName.slice(0, 2).toUpperCase();

  // Deterministic color palette based on name hash
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hues = [210, 225, 250, 280, 160, 190, 30, 340];
  const hue = hues[Math.abs(hash) % hues.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
    <defs>
      <linearGradient id="g_${Math.abs(hash)}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="hsl(${hue}, 80%, 45%)"/>
        <stop offset="100%" stop-color="hsl(${(hue + 35) % 360}, 85%, 35%)"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14" fill="url(#g_${Math.abs(hash)})"/>
    <text x="32" y="40" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="22" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Primary resolver: takes company name and raw logo URL, returns authentic logo URL
 */
export function getCompanyLogo(companyName?: string, rawLogoUrl?: string): string {
  // If a valid custom logo URL was supplied that isn't null, generic placeholder, or empty
  if (
    rawLogoUrl &&
    rawLogoUrl !== '/talentxcel-official-logo.png' &&
    rawLogoUrl !== '/logo.png' &&
    rawLogoUrl !== '/placeholder.svg' &&
    !rawLogoUrl.includes('ui-avatars.com')
  ) {
    return rawLogoUrl;
  }

  const nameKey = (companyName || '').trim().toLowerCase();
  if (nameKey && VERIFIED_COMPANY_LOGOS[nameKey]) {
    return VERIFIED_COMPANY_LOGOS[nameKey];
  }

  // Check partial match for known prefixes (e.g., "NASA JPL", "Apollo Hospitals Pune")
  for (const [key, logoPath] of Object.entries(VERIFIED_COMPANY_LOGOS)) {
    if (key.length > 3 && (nameKey.includes(key) || key.includes(nameKey))) {
      return logoPath;
    }
  }

  // If company is TalentXcel partner
  if (nameKey.includes('talentxcel')) {
    return '/talentxcel-official-logo.png';
  }

  // Dynamic fallback monogram
  return generateCompanyMonogram(companyName);
}
