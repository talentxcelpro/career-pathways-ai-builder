const fs = require('fs');

const catalog = JSON.parse(fs.readFileSync('src/data/indianInstitutionsCatalog.json', 'utf8'));
const tierASlugs = [];

catalog.forEach(item => {
  if (item.accreditation?.nirfRank || item.nirfRank2024 || item.accreditation?.isInstituteOfEminence) {
    if (item.slug && !tierASlugs.includes(item.slug)) {
      tierASlugs.push(item.slug);
    }
  }
});

fs.writeFileSync('api/_college-tier-a-slugs.json', JSON.stringify(tierASlugs, null, 2), 'utf8');
console.log(`Successfully generated api/_college-tier-a-slugs.json with ${tierASlugs.length} Tier-A slugs.`);
