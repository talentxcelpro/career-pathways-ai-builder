const fs = require('fs');

let content = fs.readFileSync('scripts/generate-sitemap.ts', 'utf8');

const target = `  if (allColleges.length === 0) {
    allColleges = INDIAN_INSTITUTIONS_CATALOG.map(c => ({
      slug: c.slug,
      state: c.state,
      city: c.city
    }));
  }`;

const replacement = `  if (allColleges.length === 0) {
    // Only index authentic Tier-A accredited colleges (901 NIRF / Institute of Eminence), omitting thin Tier-B to protect crawl budget
    allColleges = INDIAN_INSTITUTIONS_CATALOG
      .filter(c => c.accreditation?.nirfRank || (c as any).nirfRank2024 || c.accreditation?.isInstituteOfEminence || (c as any).isIndexable)
      .map(c => ({
        slug: c.slug,
        state: c.location?.state,
        city: c.location?.city
      }));
  }`;

content = content.replace(target, replacement);

fs.writeFileSync('scripts/generate-sitemap.ts', content, 'utf8');
console.log('Successfully updated scripts/generate-sitemap.ts to filter colleges by indexability');
