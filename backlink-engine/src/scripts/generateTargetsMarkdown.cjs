// backlink-engine/src/scripts/generateTargetsMarkdown.cjs
const Database = require('node:sqlite').DatabaseSync;
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../data/backlink_engine.db');
const db = new Database(DB_PATH);
const ARTIFACT_PATH = 'C:/Users/Arshid.Wani/.gemini/antigravity/brain/bbd3c102-f165-47f7-9eef-eeb4b56d4fa1/TXC_100_ACQUISITION_TARGETS_DATABASE.md';
const REPORT_PATH = path.resolve(__dirname, '../../../reports/TXC_100_ACQUISITION_TARGETS_DATABASE.md');

function run() {
  const rows = db.prepare("SELECT * FROM acquisition_targets ORDER BY priority ASC, id ASC").all();

  let md = `# TalentXcel — Structured 100-Site Acquisition Database
## Multi-Channel Domain Acquisition Engine Architecture

**Target Entity:** [TalentXcel](https://talentxcel.in)  
**Total Curated Targets:** 100 Unique Referring Root Domains  
**Policy Standard:** ₹0.00 / $0.00 (Zero Paid Placements Strictly Enforced)  
**Engine Controls Enforced:**  
- *Rule 1:* One root domain = one referring domain (enforced by UNIQUE constraint on \`root_domain\`).
- *Rule 2:* Cost tiers strictly recorded as \`₹0_FREE\`, \`CONDITIONAL_FREE\`, \`PAID\`, or \`UNKNOWN\`.
- *Rule 3:* Submission modality tracked: Self-Service, Editorial Review, Community-Driven, Partnership-Based.
- *Rule 4:* Public listing URL recorded only post-approval.
- *Rule 5:* Rel attributes tracked objectively (follow, nofollow, ugc, sponsored).
- *Rule 6:* Destination routes point to canonical routes (\`/resume/ats-check\`, \`/salary\`, \`/employers/post-job\`, \`/colleges\`, \`/learning\`).
- *Rule 7:* Zero mass automation; human review before every submission.

---

## 1. Top 25 Shortlist (Priority 1 — Immediate Focus)

| Target ID | Platform Name | Root Domain | Category | Listing Angle | Cost Tier | Submission URL | Current Status |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- | :---: |
`;

  const p1 = rows.filter(r => r.priority === 1);
  for (const r of p1) {
    md += `| \`${r.id}\` | **${r.platform_name}** | \`${r.root_domain}\` | \`${r.category}\` | ${r.listing_angle} | \`${r.cost_tier}\` | [Submit Link](${r.submission_url}) | \`${r.current_status}\` |\n`;
  }

  md += `\n---

## 2. Core 50 Targets (Priority 2 — High-Relevance SaaS, Developer & Indian Tech)

| Target ID | Platform Name | Root Domain | Category | Listing Angle | Cost Tier | Submission URL | Current Status |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- | :---: |
`;

  const p2 = rows.filter(r => r.priority === 2);
  for (const r of p2) {
    md += `| \`${r.id}\` | **${r.platform_name}** | \`${r.root_domain}\` | \`${r.category}\` | ${r.listing_angle} | \`${r.cost_tier}\` | [Submit Link](${r.submission_url}) | \`${r.current_status}\` |\n`;
  }

  md += `\n---

## 3. Extended Backlog (Priority 3 — AI Directories & Business Discovery)

| Target ID | Platform Name | Root Domain | Category | Listing Angle | Cost Tier | Submission URL | Current Status |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- | :---: |
`;

  const p3 = rows.filter(r => r.priority === 3);
  for (const r of p3) {
    md += `| \`${r.id}\` | **${r.platform_name}** | \`${r.root_domain}\` | \`${r.category}\` | ${r.listing_angle} | \`${r.cost_tier}\` | [Submit Link](${r.submission_url}) | \`${r.current_status}\` |\n`;
  }

  md += `\n---

## 4. Multi-Channel Strategic Angles Summary

1. **Career Technology / ATS Product:** Focus on resume parser diagnostics, skill gap scoring, and compensation percentiles. (Platforms: SourceForge, AlternativeTo, SaaSHub, Toolify, DevHunt, Slant).
2. **HRTech / Recruitment Platform:** Focus on employer hiring, interview workflows, and institutional placement modernizations. (Platforms: HRStack, Global HR World, Candidately, Veritas HR, Map of HR Tech, DHRMap, SHRM).
3. **Indian Technology Company:** Focus on legitimate company registration, founder discovery, and ecosystem footprint. (Platforms: Inc42, YourStory, Tracxn, NextBigWhat, StartupTalky, Ventmark, GoodFirms, Clutch).
4. **Developer Open-Source Resources:** Focus on genuine public repositories, datasets, and citable research whitepapers. (Platforms: GitHub, npm, PyPI, Zenodo, Hugging Face, Dev.to, Hashnode, Internet Archive).
`;

  fs.writeFileSync(ARTIFACT_PATH, md);
  fs.writeFileSync(REPORT_PATH, md);
  console.log('✓ Successfully wrote 100-site targets markdown to:', ARTIFACT_PATH);
}

run();
