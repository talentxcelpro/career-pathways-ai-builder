// backlink-engine/src/scripts/rank30Candidates.cjs
const fs = require('fs');

const candidates = JSON.parse(fs.readFileSync('backlink-engine/src/scripts/detailed_30_ready.json', 'utf8'));

// Priority categories:
// 1. HRTech, recruitment & staffing (Tier 1, Score 5)
// 2. ATS, career platforms & professional development (Tier 2, Score 5)
// 3. Employer, university & campus networks (Tier 3, Score 4.5)
// 4. Credible B2B SaaS directories (Tier 4, Score 4)
// 5. General AI directories with confirmed career/productivity fit (Tier 5, Score 3.5 - 4)

// Let's inspect each candidate
candidates.forEach((c, idx) => {
  console.log(`[#${c.num}] ${c.name} (${c.rootDomain}) | Form: ${c.hasUrlField && c.hasSubmitButton} | Free: ${c.hasFreeMention} | Badge: ${c.badgeRequired} | MentionsCareer: ${c.mentionsCareerOrProductivity}`);
});
