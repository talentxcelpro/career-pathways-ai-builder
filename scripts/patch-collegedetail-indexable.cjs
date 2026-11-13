const fs = require('fs');

let content = fs.readFileSync('src/pages/colleges/CollegeDetail.tsx', 'utf8');

// Update import
content = content.replace(
  "import { indianEducationService } from '@/services/indianEducationService';",
  "import { indianEducationService, isCollegeIndexable } from '@/services/indianEducationService';"
);

// Add isIndexable calculation
const targetSlug = "const canonicalUrl = `https://talentxcel.in/colleges/${canonicalCollegeSlug}`;";
const replacementSlug = `const canonicalUrl = \`https://talentxcel.in/colleges/\${canonicalCollegeSlug}\`;\n  const isIndexable = isCollegeIndexable(catalogInstitution || dbCollege);`;
content = content.replace(targetSlug, replacementSlug);

// Update SocialMetaHead
const targetHead = `      <SocialMetaHead
        title={\`\${instName} — Fees, Cutoffs, Admissions & Placements | TalentXcel\`}
        description={\`Comprehensive verified dossier for \${instName} (\${instCity}, \${instState}): courses, fee structures, cutoff scores, placements, and career pathways.\`}
        canonicalUrl={canonicalUrl}
        category="colleges"
        ogType="article"
      />`;

const replacementHead = `      <SocialMetaHead
        title={\`\${instName} — Fees, Cutoffs, Admissions & Placements | TalentXcel\`}
        description={\`Comprehensive verified dossier for \${instName} (\${instCity}, \${instState}): courses, fee structures, cutoff scores, placements, and career pathways.\`}
        canonicalUrl={canonicalUrl}
        category="colleges"
        ogType="article"
        noindex={!isIndexable}
        robotsDirective={isIndexable ? 'index, follow' : 'noindex, follow'}
      />`;

content = content.replace(targetHead, replacementHead);
fs.writeFileSync('src/pages/colleges/CollegeDetail.tsx', content, 'utf8');
console.log('Successfully updated CollegeDetail.tsx with data-driven isIndexable');
