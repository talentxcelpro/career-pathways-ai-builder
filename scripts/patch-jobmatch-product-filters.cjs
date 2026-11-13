const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/products/JobMatchProduct.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Expand getCountryFromLocation
const oldCountryFunc = `function getCountryFromLocation(location?: string, city?: string): { code: string; flag: string; name: string } {
  const loc = \`\${city || ''} \${location || ''}\`.toLowerCase();
  if (loc.includes('united arab emirates') || loc.includes('dubai') || loc.includes('abu dhabi') || loc.includes('sharjah') || loc.includes('uae')) {
    return { code: 'AE', flag: '🇦🇪', name: 'UAE' };
  }
  if (loc.includes('saudi arabia') || loc.includes('riyadh') || loc.includes('ksa') || loc.includes('jeddah')) {
    return { code: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' };
  }
  if (loc.includes('qatar') || loc.includes('doha')) {
    return { code: 'QA', flag: '🇶🇦', name: 'Qatar' };
  }
  if (loc.includes('oman') || loc.includes('muscat')) {
    return { code: 'OM', flag: '🇴🇲', name: 'Oman' };
  }
  if (loc.includes('united states') || loc.includes('usa') || loc.includes('seattle') || loc.includes('austin') || loc.includes('san francisco') || loc.includes('new york') || loc.includes('san mateo')) {
    return { code: 'US', flag: '🇺🇸', name: 'United States' };
  }
  if (loc.includes('united kingdom') || loc.includes('london') || loc.includes('uk')) {
    return { code: 'GB', flag: '🇬🇧', name: 'UK' };
  }
  if (loc.includes('germany') || loc.includes('berlin') || loc.includes('munich')) {
    return { code: 'DE', flag: '🇩🇪', name: 'Germany' };
  }
  if (loc.includes('remote') || loc.includes('worldwide') || loc.includes('global')) {
    return { code: 'REMOTE', flag: '🌐', name: 'Global Remote' };
  }
  return { code: 'IN', flag: '🇮🇳', name: 'India' };
}`;

const newCountryFunc = `function getCountryFromLocation(location?: string, city?: string): { code: string; flag: string; name: string } {
  const loc = \`\${city || ''} \${location || ''}\`.toLowerCase();
  if (loc.includes('united arab emirates') || loc.includes('dubai') || loc.includes('abu dhabi') || loc.includes('sharjah') || loc.includes('uae')) {
    return { code: 'AE', flag: '🇦🇪', name: 'UAE' };
  }
  if (loc.includes('saudi arabia') || loc.includes('riyadh') || loc.includes('ksa') || loc.includes('jeddah')) {
    return { code: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' };
  }
  if (loc.includes('qatar') || loc.includes('doha')) {
    return { code: 'QA', flag: '🇶🇦', name: 'Qatar' };
  }
  if (loc.includes('oman') || loc.includes('muscat')) {
    return { code: 'OM', flag: '🇴🇲', name: 'Oman' };
  }
  if (loc.includes('united states') || loc.includes('usa') || loc.includes('washington') || loc.includes('atlanta') || loc.includes('seattle') || loc.includes('austin') || loc.includes('san francisco') || loc.includes('new york') || loc.includes('san mateo')) {
    return { code: 'US', flag: '🇺🇸', name: 'United States' };
  }
  if (loc.includes('united kingdom') || loc.includes('london') || loc.includes('uk')) {
    return { code: 'GB', flag: '🇬🇧', name: 'UK' };
  }
  if (loc.includes('germany') || loc.includes('berlin') || loc.includes('munich') || loc.includes('darmstadt')) {
    return { code: 'DE', flag: '🇩🇪', name: 'Germany' };
  }
  if (loc.includes('singapore')) {
    return { code: 'SG', flag: '🇸🇬', name: 'Singapore' };
  }
  if (loc.includes('australia') || loc.includes('sydney') || loc.includes('canberra')) {
    return { code: 'AU', flag: '🇦🇺', name: 'Australia' };
  }
  if (loc.includes('canada') || loc.includes('toronto') || loc.includes('ottawa')) {
    return { code: 'CA', flag: '🇨🇦', name: 'Canada' };
  }
  if (loc.includes('belgium') || loc.includes('brussels')) {
    return { code: 'BE', flag: '🇧🇪', name: 'Belgium' };
  }
  if (loc.includes('remote') || loc.includes('worldwide') || loc.includes('global')) {
    return { code: 'REMOTE', flag: '🌐', name: 'Global Remote' };
  }
  return { code: 'IN', flag: '🇮🇳', name: 'India' };
}`;

content = content.replace(oldCountryFunc.replace(/\r\n/g, '\n'), newCountryFunc.replace(/\r\n/g, '\n'));
content = content.replace(oldCountryFunc.replace(/\n/g, '\r\n'), newCountryFunc.replace(/\n/g, '\r\n'));

// 2. Wire sidebarFilters.country, currency, and applicant_eligibility into filteredJobs
const oldSidebarFilterEnd = `      if (sidebarFilters.company_type && sidebarFilters.company_type.length > 0) {
        const full = \`\${job.company_name} \${(job as any).company_type || ''}\`.toLowerCase();
        const matchesType = sidebarFilters.company_type.some((type: string) => full.includes(type.toLowerCase()));
        if (!matchesType) return false;
      }`;

const newSidebarFilterEnd = `      if (sidebarFilters.company_type && sidebarFilters.company_type.length > 0) {
        const full = \`\${job.company_name} \${(job as any).company_type || ''}\`.toLowerCase();
        const matchesType = sidebarFilters.company_type.some((type: string) => full.includes(type.toLowerCase()));
        if (!matchesType) return false;
      }

      // Sidebar Country Filter
      if (sidebarFilters.country && sidebarFilters.country.length > 0) {
        const country = getCountryFromLocation(job.location, job.location_city);
        const matchesCountry = sidebarFilters.country.some((code: string) => {
          if (code === 'REMOTE') return job.is_remote || (job.location || '').toLowerCase().includes('remote');
          return country.code === code;
        });
        if (!matchesCountry) return false;
      }

      // Sidebar Currency Filter
      if (sidebarFilters.currency && sidebarFilters.currency.length > 0) {
        const country = getCountryFromLocation(job.location, job.location_city);
        const jobCurr = ((job as any).salary_currency || '').toUpperCase() || (
          country.code === 'AE' ? 'AED' :
          country.code === 'US' ? 'USD' :
          country.code === 'SA' ? 'SAR' :
          country.code === 'QA' ? 'QAR' :
          country.code === 'OM' ? 'OMR' :
          country.code === 'GB' ? 'GBP' :
          country.code === 'SG' ? 'SGD' :
          country.code === 'AU' ? 'AUD' :
          'INR'
        );
        if (!sidebarFilters.currency.includes(jobCurr)) return false;
      }

      // Sidebar Visa & Eligibility Filter
      if (sidebarFilters.applicant_eligibility && sidebarFilters.applicant_eligibility.length > 0) {
        const eligStr = \`\${(job as any).applicant_location_requirements || ''} \${job.location || ''} \${(job as any).description || ''}\`.toLowerCase();
        const matchesElig = sidebarFilters.applicant_eligibility.some((elig: string) => {
          if (elig === 'uae_visa') return eligStr.includes('uae') && (eligStr.includes('visa sponsored') || eligStr.includes('residence visa'));
          if (elig === 'us_auth') return eligStr.includes('us work') || eligStr.includes('authorization') || eligStr.includes('united states');
          if (elig === 'intl_remote') return eligStr.includes('worldwide') || eligStr.includes('international') || eligStr.includes('india');
          if (elig === 'relocation') return eligStr.includes('relocation') || eligStr.includes('flight');
          return false;
        });
        if (!matchesElig) return false;
      }`;

content = content.replace(oldSidebarFilterEnd.replace(/\r\n/g, '\n'), newSidebarFilterEnd.replace(/\r\n/g, '\n'));
content = content.replace(oldSidebarFilterEnd.replace(/\n/g, '\r\n'), newSidebarFilterEnd.replace(/\n/g, '\r\n'));

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Successfully updated JobMatchProduct.tsx with country location mapping and sidebar filter integration');
