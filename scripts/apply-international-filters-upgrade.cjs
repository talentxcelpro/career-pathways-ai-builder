const fs = require('fs');
const path = require('path');

// 1. UPDATE TalentSparkJobCard.tsx
const jobCardPath = path.join(__dirname, '../src/components/jobs/TalentSparkJobCard.tsx');
let cardContent = fs.readFileSync(jobCardPath, 'utf8');

// Insert badge logic right before formatSalary
const targetCardAnchor = 'const companyName = job.companies?.name || job.company_name || \'TalentXcel Services\';\r\n  const logoUrl = getCompanyLogo(companyName, job.companies?.logo_url || job.organization_logo_url);';
const altTargetCardAnchor = 'const companyName = job.companies?.name || job.company_name || \'TalentXcel Services\';\n  const logoUrl = getCompanyLogo(companyName, job.companies?.logo_url || job.organization_logo_url);';

const badgeLogic = `  // Verified International Mobility Badges (Strict: Never fabricate)
  const eligLower = ((job.applicant_location_requirements || '') + ' ' + (job.description || '')).toLowerCase();
  const isVisaSponsored = Boolean(
    job.visa_sponsored === true ||
    job.structured_data?.visa_sponsored === true ||
    (job.applicant_location_requirements && job.applicant_location_requirements.toLowerCase().includes('visa sponsored')) ||
    (eligLower.includes('visa sponsorship') && !eligLower.includes('no visa sponsorship'))
  );
  const isRelocationProvided = Boolean(
    job.relocation_provided === true ||
    job.structured_data?.relocation_provided === true ||
    eligLower.includes('relocation flight') ||
    eligLower.includes('relocation support') ||
    eligLower.includes('relocation package')
  );
  const applicantReqBadge = (() => {
    const req = (job.applicant_location_requirements || '').toLowerCase();
    if (req.includes('worldwide') || req.includes('anywhere')) {
      return { label: '🌐 Worldwide Remote', className: 'bg-purple-50 text-purple-700 border-purple-200' };
    }
    if (req.includes('india') && (job.location || '').toLowerCase().includes('remote')) {
      return { label: '🇮🇳 Open to India', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    }
    if (req.includes('united states') || req.includes('us work') || req.includes('us citizenship') || ((job.location || '').toLowerCase().includes('united states') && req.includes('us only'))) {
      return { label: '🇺🇸 US Auth Required', className: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    return null;
  })();`;

if (cardContent.includes(targetCardAnchor)) {
  cardContent = cardContent.replace(targetCardAnchor, `${targetCardAnchor}\r\n\r\n${badgeLogic}`);
  console.log('✓ Injected mobility badges logic into TalentSparkJobCard (CRLF)');
} else if (cardContent.includes(altTargetCardAnchor)) {
  cardContent = cardContent.replace(altTargetCardAnchor, `${altTargetCardAnchor}\n\n${badgeLogic}`);
  console.log('✓ Injected mobility badges logic into TalentSparkJobCard (LF)');
} else {
  console.warn('! Warning: anchor not found for mobility badges logic');
}

// Add badges into card rendering next to clock
const clockTarget = `<span>{getTimeAgo(job.posted_at || job.created_at)}</span>\r\n                </div>\r\n              </div>`;
const altClockTarget = `<span>{getTimeAgo(job.posted_at || job.created_at)}</span>\n                </div>\n              </div>`;

const badgesRender = `\r\n                {isVisaSponsored && (
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold px-1.5 py-0">
                    🛂 Visa Sponsored
                  </Badge>
                )}
                {isRelocationProvided && (
                  <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 font-semibold px-1.5 py-0">
                    ✈ Relocation
                  </Badge>
                )}
                {applicantReqBadge && (
                  <Badge variant="outline" className={\`text-[10px] font-medium px-1.5 py-0 \${applicantReqBadge.className}\`}>
                    {applicantReqBadge.label}
                  </Badge>
                )}`;

if (cardContent.includes(clockTarget)) {
  cardContent = cardContent.replace(clockTarget, `<span>{getTimeAgo(job.posted_at || job.created_at)}</span>\r\n                </div>${badgesRender}\r\n              </div>`);
  console.log('✓ Added badge rendering into TalentSparkJobCard (CRLF)');
} else if (cardContent.includes(altClockTarget)) {
  cardContent = cardContent.replace(altClockTarget, `<span>{getTimeAgo(job.posted_at || job.created_at)}</span>\n                </div>${badgesRender.replace(/\r\n/g, '\n')}\n              </div>`);
  console.log('✓ Added badge rendering into TalentSparkJobCard (LF)');
}

fs.writeFileSync(jobCardPath, cardContent, 'utf8');

// 2. UPDATE ComprehensiveJobFilters.tsx
const filtersPath = path.join(__dirname, '../src/components/jobs/ComprehensiveJobFilters.tsx');
let filtersContent = fs.readFileSync(filtersPath, 'utf8');

// Update imports
if (!filtersContent.includes('Globe')) {
  filtersContent = filtersContent.replace(
    'Briefcase\r\n} from "lucide-react";',
    'Briefcase,\r\n  Globe,\r\n  Coins,\r\n  ShieldCheck\r\n} from "lucide-react";'
  );
  filtersContent = filtersContent.replace(
    'Briefcase\n} from "lucide-react";',
    'Briefcase,\n  Globe,\n  Coins,\n  ShieldCheck\n} from "lucide-react";'
  );
}

// Update JobFilters interface
if (!filtersContent.includes('country?: string[];')) {
  filtersContent = filtersContent.replace(
    'location: string;\r\n',
    'location: string;\r\n  country?: string[];\r\n  currency?: string[];\r\n  applicant_eligibility?: string[];\r\n'
  );
  filtersContent = filtersContent.replace(
    'location: string;\n',
    'location: string;\n  country?: string[];\n  currency?: string[];\n  applicant_eligibility?: string[];\n'
  );
}

// Update activeFiltersCount
if (!filtersContent.includes('filters.country?.length')) {
  filtersContent = filtersContent.replace(
    'filters.employment_type.length +',
    '(filters.country?.length || 0) +\r\n    (filters.currency?.length || 0) +\r\n    (filters.applicant_eligibility?.length || 0) +\r\n    filters.employment_type.length +'
  );
}

// Add Options
const newOptions = `
  const COUNTRY_OPTIONS = [
    { value: 'IN', label: '🇮🇳 India', count: 2129 },
    { value: 'AE', label: '🇦🇪 UAE (Dubai, Abu Dhabi)', count: 18 },
    { value: 'US', label: '🇺🇸 United States', count: 23 },
    { value: 'SA', label: '🇸🇦 Saudi Arabia (Riyadh)', count: 3 },
    { value: 'QA', label: '🇶🇦 Qatar (Doha)', count: 2 },
    { value: 'OM', label: '🇴🇲 Oman (Muscat)', count: 1 },
    { value: 'SG', label: '🇸🇬 Singapore', count: 9 },
    { value: 'AU', label: '🇦🇺 Australia (Sydney)', count: 9 },
    { value: 'GB', label: '🇬🇧 United Kingdom (London)', count: 7 },
    { value: 'DE', label: '🇩🇪 Germany (Berlin, Munich)', count: 6 },
    { value: 'CA', label: '🇨🇦 Canada (Toronto, Ottawa)', count: 5 },
    { value: 'REMOTE', label: '🌐 Worldwide Remote', count: 68 }
  ];

  const CURRENCY_OPTIONS = [
    { value: 'INR', label: '₹ INR (Indian Rupee)', count: 2242 },
    { value: 'AED', label: 'AED (UAE Dirham)', count: 11 },
    { value: 'USD', label: '$ USD (US Dollar)', count: 12 },
    { value: 'SAR', label: 'SAR (Saudi Riyal)', count: 1 },
    { value: 'QAR', label: 'QAR (Qatari Riyal)', count: 1 },
    { value: 'OMR', label: 'OMR (Omani Rial)', count: 1 },
    { value: 'GBP', label: '£ GBP (British Pound)', count: 6 },
    { value: 'SGD', label: 'S$ SGD (Singapore Dollar)', count: 4 },
    { value: 'AUD', label: 'A$ AUD (Australian Dollar)', count: 4 }
  ];

  const ELIGIBILITY_OPTIONS = [
    { value: 'uae_visa', label: '🇦🇪 UAE Visa Sponsored', count: 8 },
    { value: 'relocation', label: '✈ Relocation Support Provided', count: 7 },
    { value: 'us_auth', label: '🇺🇸 US Work Auth Required', count: 15 },
    { value: 'intl_remote', label: '🌐 Open to International / India', count: 68 }
  ];
`;

if (!filtersContent.includes('COUNTRY_OPTIONS')) {
  filtersContent = filtersContent.replace(
    'const EXPERIENCE_OPTIONS = [',
    `${newOptions}\r\n  const EXPERIENCE_OPTIONS = [`
  );
}

// Add UI FilterSections right before Experience
const countrySectionUI = `          {/* Country & Region */}
          <FilterSection title="Country & Region" icon={<Globe className="h-3 w-3 text-muted-foreground" />} defaultOpen={true}>
            <CheckboxFilter
              options={COUNTRY_OPTIONS}
              selected={filters.country || []}
              onChange={(values) => updateFilters({ country: values })}
            />
          </FilterSection>

          <Separator className="my-1" />

          {/* Visa & International Eligibility */}
          <FilterSection title="Visa & Work Auth" icon={<ShieldCheck className="h-3 w-3 text-muted-foreground" />} defaultOpen={false}>
            <CheckboxFilter
              options={ELIGIBILITY_OPTIONS}
              selected={filters.applicant_eligibility || []}
              onChange={(values) => updateFilters({ applicant_eligibility: values })}
            />
          </FilterSection>

          <Separator className="my-1" />

          {/* Currency */}
          <FilterSection title="Currency" icon={<Coins className="h-3 w-3 text-muted-foreground" />} defaultOpen={false}>
            <CheckboxFilter
              options={CURRENCY_OPTIONS}
              selected={filters.currency || []}
              onChange={(values) => updateFilters({ currency: values })}
            />
          </FilterSection>

          <Separator className="my-1" />\r\n\r\n`;

if (!filtersContent.includes('title="Country & Region"')) {
  filtersContent = filtersContent.replace(
    '          {/* Experience */}',
    `${countrySectionUI}          {/* Experience */}`
  );
}

fs.writeFileSync(filtersPath, filtersContent, 'utf8');
console.log('✓ Successfully updated ComprehensiveJobFilters.tsx with Country, Currency, and Visa/Eligibility');

// 3. UPDATE useJobsCriticalPath.ts
const criticalPath = path.join(__dirname, '../src/hooks/useJobsCriticalPath.ts');
let criticalContent = fs.readFileSync(criticalPath, 'utf8');

// Update JobFilters interface in useJobsCriticalPath.ts
if (!criticalContent.includes('country?: string[];')) {
  criticalContent = criticalContent.replace(
    'company_id?: string;\r\n}',
    'company_id?: string;\r\n  country?: string[];\r\n  currency?: string[];\r\n  applicant_eligibility?: string[];\r\n  visa_sponsored?: boolean;\r\n  relocation_provided?: boolean;\r\n}'
  );
  criticalContent = criticalContent.replace(
    'company_id?: string;\n}',
    'company_id?: string;\n  country?: string[];\n  currency?: string[];\n  applicant_eligibility?: string[];\n  visa_sponsored?: boolean;\n  relocation_provided?: boolean;\n}'
  );
}

// Add secondary filters for country, currency, eligibility
const secondaryFilterAdditions = `
      // 8. Country filter
      if (filters.country && filters.country.length > 0) {
        const fullLoc = \`\${job.location || ''} \${job.location_city || ''}\`.toLowerCase();
        const countryMatches = filters.country.some(code => {
          if (code === 'IN') return fullLoc.includes('india') || (!fullLoc.includes('united states') && !fullLoc.includes('usa') && !fullLoc.includes('uae') && !fullLoc.includes('dubai') && !fullLoc.includes('abu dhabi') && !fullLoc.includes('riyadh') && !fullLoc.includes('london') && !fullLoc.includes('sydney') && !fullLoc.includes('singapore'));
          if (code === 'AE') return fullLoc.includes('uae') || fullLoc.includes('emirates') || fullLoc.includes('dubai') || fullLoc.includes('abu dhabi') || fullLoc.includes('sharjah');
          if (code === 'US') return fullLoc.includes('united states') || fullLoc.includes('usa') || fullLoc.includes('austin') || fullLoc.includes('seattle') || fullLoc.includes('washington') || fullLoc.includes('san francisco') || fullLoc.includes('new york') || fullLoc.includes('san mateo');
          if (code === 'SA') return fullLoc.includes('saudi') || fullLoc.includes('riyadh');
          if (code === 'QA') return fullLoc.includes('qatar') || fullLoc.includes('doha');
          if (code === 'OM') return fullLoc.includes('oman') || fullLoc.includes('muscat');
          if (code === 'GB') return fullLoc.includes('united kingdom') || fullLoc.includes('london') || fullLoc.includes('uk');
          if (code === 'DE') return fullLoc.includes('germany') || fullLoc.includes('berlin') || fullLoc.includes('munich') || fullLoc.includes('darmstadt');
          if (code === 'AU') return fullLoc.includes('australia') || fullLoc.includes('sydney') || fullLoc.includes('canberra');
          if (code === 'SG') return fullLoc.includes('singapore');
          if (code === 'CA') return fullLoc.includes('canada') || fullLoc.includes('toronto') || fullLoc.includes('ottawa');
          if (code === 'REMOTE') return job.is_remote || fullLoc.includes('remote');
          return false;
        });
        if (!countryMatches) return false;
      }

      // 9. Currency filter
      if (filters.currency && filters.currency.length > 0) {
        const cur = (job.salary_currency || '').toUpperCase();
        const loc = (job.location || '').toLowerCase();
        const detectedCur = cur || (
          loc.includes('dubai') || loc.includes('abu dhabi') || loc.includes('uae') ? 'AED' :
          loc.includes('united states') || loc.includes('usa') || loc.includes('austin') ? 'USD' :
          loc.includes('riyadh') || loc.includes('saudi') ? 'SAR' :
          loc.includes('doha') || loc.includes('qatar') ? 'QAR' :
          loc.includes('muscat') || loc.includes('oman') ? 'OMR' :
          loc.includes('london') || loc.includes('uk') ? 'GBP' :
          loc.includes('singapore') ? 'SGD' :
          loc.includes('australia') || loc.includes('sydney') ? 'AUD' :
          'INR'
        );
        if (!filters.currency.includes(detectedCur)) return false;
      }

      // 10. Visa & Eligibility filter
      if (filters.applicant_eligibility && filters.applicant_eligibility.length > 0) {
        const text = \`\${job.applicant_location_requirements || ''} \${job.location || ''} \${job.description || ''}\`.toLowerCase();
        const eligMatches = filters.applicant_eligibility.some(elig => {
          if (elig === 'uae_visa') return text.includes('visa sponsored') || text.includes('residence visa') || (text.includes('uae') && text.includes('visa'));
          if (elig === 'relocation') return text.includes('relocation') || text.includes('flight');
          if (elig === 'us_auth') return text.includes('us work') || text.includes('authorization') || text.includes('united states');
          if (elig === 'intl_remote') return text.includes('worldwide') || text.includes('international') || text.includes('india');
          return false;
        });
        if (!eligMatches) return false;
      }
`;

if (!criticalContent.includes('// 8. Country filter')) {
  criticalContent = criticalContent.replace(
    'return true;\r\n    });\r\n  };',
    `${secondaryFilterAdditions}\r\n      return true;\r\n    });\r\n  };`
  );
  criticalContent = criticalContent.replace(
    'return true;\n    });\n  };',
    `${secondaryFilterAdditions}\n      return true;\n    });\n  };`
  );
}

// Update hasSecondary condition
if (!criticalContent.includes('filters.country && filters.country.length > 0')) {
  criticalContent = criticalContent.replace(
    '(filters.freshness && filters.freshness.length > 0)',
    `(filters.freshness && filters.freshness.length > 0) ||
        (filters.country && filters.country.length > 0) ||
        (filters.currency && filters.currency.length > 0) ||
        (filters.applicant_eligibility && filters.applicant_eligibility.length > 0)`
  );
}

fs.writeFileSync(criticalPath, criticalContent, 'utf8');
console.log('✓ Successfully updated useJobsCriticalPath.ts with international secondary filtering');
