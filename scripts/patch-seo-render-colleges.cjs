const fs = require('fs');

let content = fs.readFileSync('api/seo-render.ts', 'utf8');

// 1. Add import
content = content.replace(
  "import collegeSlugsList from './_college-slugs.json';",
  "import collegeSlugsList from './_college-slugs.json';\nimport collegeTierASlugsList from './_college-tier-a-slugs.json';"
);

// 2. Add Set
content = content.replace(
  "const COLLEGE_SLUGS_SET = new Set(collegeSlugsList);",
  "const COLLEGE_SLUGS_SET = new Set(collegeSlugsList);\nconst TIER_A_COLLEGE_SLUGS_SET = new Set(collegeTierASlugsList);"
);

// 3. Update robotsDirective in college handler
const target = `      if (!COLLEGE_SLUGS_SET.has(slug)) {
        return null; // Genuine 404 for non-existent college (Soft 404 eliminated!)
      }
      const collegeName = formatTitle(slug.replace(/-campus.*/, ''));`;

const replacement = `      if (!COLLEGE_SLUGS_SET.has(slug)) {
        return null; // Genuine 404 for non-existent college (Soft 404 eliminated!)
      }
      // Data-driven indexability: Tier-A (NIRF accredited / Institute of Eminence) indexed; Tier-B thin pages get noindex, follow
      const isTierA = TIER_A_COLLEGE_SLUGS_SET.has(slug) || (typeof process !== 'undefined' && process.env?.INDEX_ALL_COLLEGES === 'true');
      robotsDirective = isTierA ? 'index, follow' : 'noindex, follow';

      const collegeName = formatTitle(slug.replace(/-campus.*/, ''));`;

content = content.replace(target, replacement);

fs.writeFileSync('api/seo-render.ts', content, 'utf8');
console.log('Successfully updated api/seo-render.ts with data-driven college indexability');
