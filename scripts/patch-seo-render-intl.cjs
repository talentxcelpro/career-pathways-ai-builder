const fs = require('fs');
const path = require('path');

const seoRenderPath = path.join(__dirname, '../api/seo-render.ts');
let content = fs.readFileSync(seoRenderPath, 'utf8');

const hubDef = `
const INTERNATIONAL_HUB_SLUGS: Record<string, { roleTitle: string; city: string; country: string; countryCode: string; flag: string; currency: string; metaTitle: string; metaDescription: string; canonicalUrl: string; visaNote: string }> = {
  'data-analyst-dubai-uae': {
    roleTitle: 'Data Analyst & Analytics Engineer',
    city: 'Dubai',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    flag: '🇦🇪',
    currency: 'AED',
    metaTitle: 'Data Analyst Jobs in Dubai, UAE (2026) — Verified Vacancies in AED | TalentXcel Jobs',
    metaDescription: 'Explore verified Data Analyst and Analytics Engineer jobs in Dubai, UAE. Direct employer routing to Tabby FinTech, Careem, and Dubai tech firms with verified AED compensation and UAE visa sponsorship.',
    canonicalUrl: 'https://jobs.talentxcel.in/jobs/data-analyst-dubai-uae',
    visaNote: 'UAE Labour Law requires employers to sponsor international hires with an entry permit and 2-year renewable employment residence visa upon signed offer acceptance.'
  },
  'software-engineer-abu-dhabi-uae': {
    roleTitle: 'Software Engineer & Systems Specialist',
    city: 'Abu Dhabi',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    flag: '🇦🇪',
    currency: 'AED',
    metaTitle: 'Software Engineer Jobs in Abu Dhabi, UAE (2026) — Verified Vacancies in AED | TalentXcel Jobs',
    metaDescription: 'Apply for verified Software Engineer and Systems Analyst roles in Abu Dhabi, UAE. Official vacancies at First Abu Dhabi Bank (FAB), ADNOC, and Cleveland Clinic Abu Dhabi with verified AED salaries.',
    canonicalUrl: 'https://jobs.talentxcel.in/jobs/software-engineer-abu-dhabi-uae',
    visaNote: 'Sovereign entities and multinational institutions in Abu Dhabi process full UAE Ministry of Human Resources & Emiratisation (MOHRE) employment residency permits.'
  },
  'cloud-engineer-riyadh-saudi-arabia': {
    roleTitle: 'Cloud Engineer & Infrastructure Architect',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    countryCode: 'SA',
    flag: '🇸🇦',
    currency: 'SAR',
    metaTitle: 'Cloud Engineer Jobs in Riyadh, Saudi Arabia (2026) — Verified SAR Vacancies | TalentXcel Jobs',
    metaDescription: 'Discover verified Cloud Engineer and Sovereign Cloud Architect positions in Riyadh, Saudi Arabia. Explore tier-1 openings at Aramco Digital and Saudi enterprise hubs with verified SAR compensation.',
    canonicalUrl: 'https://jobs.talentxcel.in/jobs/cloud-engineer-riyadh-saudi-arabia',
    visaNote: 'International hires in Riyadh receive full Iqama sponsorship and relocation logistics support under the Saudi Ministry of Human Resources regulations.'
  },
  'data-analyst-remote-usa': {
    roleTitle: 'Data Analyst & Quantitative Specialist',
    city: 'Remote USA',
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    currency: 'USD',
    metaTitle: 'Data Analyst Remote Jobs in USA (2026) — Verified USD Compensation | TalentXcel Jobs',
    metaDescription: 'Browse verified remote Data Analyst jobs based in the United States. Direct applications to JPMorgan Chase, Capital One, and US employers. Verified USD salary benchmarks and clear US work authorization terms.',
    canonicalUrl: 'https://jobs.talentxcel.in/jobs/data-analyst-remote-usa',
    visaNote: 'US domestic remote positions require valid United States work authorization. Employer sponsorship is explicitly noted where available.'
  },
  'software-engineer-remote-us': {
    roleTitle: 'Software Engineer',
    city: 'Remote USA & Global',
    country: 'United States & Worldwide',
    countryCode: 'US',
    flag: '🇺🇸',
    currency: 'USD',
    metaTitle: 'Remote Software Engineer Jobs USA & Global (2026) — Verified USD Salaries | TalentXcel Jobs',
    metaDescription: 'Verified remote Software Engineer openings with top US and global all-remote employers including Microsoft, AWS, Snowflake, GitLab, and Automattic. Filter by US-only and international remote eligibility.',
    canonicalUrl: 'https://jobs.talentxcel.in/jobs/software-engineer-remote-us',
    visaNote: 'Worldwide Remote listings are open to candidates residing in India and internationally without US visa requirements. US-based roles specify US work authorization requirements.'
  }
};
`;

if (!content.includes('INTERNATIONAL_HUB_SLUGS')) {
  content = content.replace(
    'const CANONICAL_ROLES_SET = new Set(CANONICAL_ROLES);',
    `const CANONICAL_ROLES_SET = new Set(CANONICAL_ROLES);\r\n${hubDef}`
  );
}

const hubBranch = `    // 5E-2: Verified International Employment Hubs
    else if (INTERNATIONAL_HUB_SLUGS[secondary]) {
      const hub = INTERNATIONAL_HUB_SLUGS[secondary];
      title = hub.metaTitle;
      description = hub.metaDescription;
      canonical = hub.canonicalUrl;
      h1 = \`\${hub.roleTitle} in \${hub.city}, \${hub.country}\`;
      bodyContent = \`
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div class="flex items-center gap-2">
            <span class="text-2xl">\${hub.flag}</span>
            <span class="text-xs font-semibold text-blue-400 bg-blue-950/80 border border-blue-800/60 px-2.5 py-1 rounded">Verified Regional Market Hub &middot; \${hub.currency}</span>
          </div>
          <h2 class="text-xl font-bold text-white">\${escapeHtml(hub.roleTitle)} Opportunities in \${escapeHtml(hub.city)}</h2>
          <p class="text-slate-300 text-sm leading-relaxed">\${escapeHtml(hub.metaDescription)}</p>
          <div class="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Visa &amp; Work Authorization Terms</h3>
            <p class="text-slate-300 text-xs">\${escapeHtml(hub.visaNote)}</p>
          </div>
          <div class="pt-2 flex flex-wrap gap-3">
            <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">View \${escapeHtml(hub.roleTitle)} Listings &rarr;</a>
            <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Scan ATS Resume &rarr;</a>
          </div>
        </section>
      \`;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "Occupation",
        "name": hub.roleTitle,
        "occupationLocation": {
          "@type": "City",
          "name": hub.city,
          "address": {
            "@type": "PostalAddress",
            "addressCountry": hub.countryCode
          }
        },
        "description": hub.metaDescription
      };
    }`;

if (!content.includes('// 5E-2: Verified International Employment Hubs')) {
  content = content.replace(
    '    // 5F: Single job posting lookup',
    `${hubBranch}\r\n    // 5F: Single job posting lookup`
  );
}

fs.writeFileSync(seoRenderPath, content, 'utf8');
console.log('✓ Successfully wired international landing page hubs in api/seo-render.ts');
