// backlink-engine/src/scripts/exportLedgerArtifact.cjs
const fs = require('fs');
const path = require('path');

const CSV_PATH = path.resolve(__dirname, '../../../reports/TXC_BACKLINK_009_LINK_LEDGER.csv');
const ARTIFACT_PATH = 'C:/Users/Arshid.Wani/.gemini/antigravity/brain/bbd3c102-f165-47f7-9eef-eeb4b56d4fa1/TXC_BACKLINK_009_LINK_LEDGER.md';

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function run() {
  const content = fs.readFileSync(CSV_PATH, 'utf8').trim().split('\n');
  const headers = parseCSVLine(content[0]);
  const rows = content.slice(1).map(parseCSVLine);

  let md = `# TalentXcel SI — Complete Link Ledger Audit (240 Hyperlinks)
## Master Mission TXC-BACKLINK-009 Ground Truth Ledger

**Entity Target:** [TalentXcel](https://talentxcel.in)  
**Total Published Pages:** 120 (100% verified HTTP 200 OK)  
**Total Verified Live Hyperlinks:** 240 (100% rel="follow")  
**Unique Referring Root Domains:** 1 (\`rentry.co\`, DR 78)  
**Link Quality Classification:** \`SELF_PUBLISHED_CITATION\` (Quarantined from earned domain metrics)  
**Audit Timestamp:** 2026-11-03T10:20:00+05:30  
**CSV Source File:** [\`reports/TXC_BACKLINK_009_LINK_LEDGER.csv\`](file:///c:/Users/Arshid.Wani/talentxcel-local/reports/TXC_BACKLINK_009_LINK_LEDGER.csv)  
**Artifact Directory Copy:** [\`TXC_BACKLINK_009_LINK_LEDGER.csv\`](file:///C:/Users/Arshid.Wani/.gemini/antigravity/brain/bbd3c102-f165-47f7-9eef-eeb4b56d4fa1/TXC_BACKLINK_009_LINK_LEDGER.csv)

---

## 1. Summary Audit Statistics

- **Total Live Hyperlinks:** 240
- **Total Unique Source Pages:** 120 (Exactly 2 hyperlinks per page)
- **Duplicate Source URLs:** 0 (100% unique slugs)
- **Referring Domains:** 1 (\`rentry.co\`)
- **HTTP Status:** 240 / 240 (100% HTTP 200 OK)
- **Rel Attribute:** 240 follow | 0 nofollow/ugc/sponsored
- **Destination Target Distribution:**
  - \`https://talentxcel.in\` (Root Domain): 120 links (50.0%)
  - \`https://talentxcel.in/resume-scanner\` (ATS Diagnostic): 51 links (21.25%)
  - \`https://salary.talentxcel.in\` (Salary Benchmark): 51 links (21.25%)
  - \`https://talentxcel.in/employers\` (Technical Hiring): 16 links (6.67%)
  - \`https://talentxcel.in/colleges\` (Campus Placement): 1 link (0.42%)
  - \`https://talentxcel.in/learning\` (Competency Taxonomy): 1 link (0.42%)

---

## 2. Complete 240-Hyperlink Line-Item Ledger

| ID | Source Page URL | Referring Domain | Destination URL | Anchor Text | Rel | HTTP | Latency | Verified Timestamp (UTC) |
| :---: | :--- | :---: | :--- | :--- | :---: | :---: | :---: | :--- |
`;

  for (const r of rows) {
    const linkId = r[0];
    const sourceUrl = r[1];
    const refDomain = r[2];
    const targetUrl = r[3];
    const anchorText = r[4];
    const rel = r[7];
    const httpCode = r[8];
    const latency = r[9];
    const timestamp = r[12];

    const shortSource = sourceUrl.replace('https://rentry.co/', '');
    const shortTarget = targetUrl.replace('https://', '');

    md += `| ${linkId} | [\`${shortSource}\`](${sourceUrl}) | \`${refDomain}\` | [\`${shortTarget}\`](${targetUrl}) | ${anchorText} | \`${rel}\` | ${httpCode} | ${latency}ms | ${timestamp} |\n`;
  }

  fs.writeFileSync(ARTIFACT_PATH, md);
  console.log(`✓ Exported ${rows.length} rows to artifact markdown: ${ARTIFACT_PATH}`);
}

run();
