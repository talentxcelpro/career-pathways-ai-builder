// backlink-engine/src/scripts/initBatch5Audit.cjs
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../data/backlink_engine.db');
const db = new DatabaseSync(DB_PATH);

const RAW_CANDIDATES = [
  // A. AI discovery and tool directories — 60
  { num: 1, name: "AEO Tools", inputDomain: "aeotools.space", group: "AI Discovery & Tool Directories" },
  { num: 2, name: "AI App Review", inputDomain: "ai-appreview.com", group: "AI Discovery & Tool Directories" },
  { num: 3, name: "AI Nav", inputDomain: "ai-nav.net", group: "AI Discovery & Tool Directories" },
  { num: 4, name: "AI Sites Net", inputDomain: "ai-sites.net", group: "AI Discovery & Tool Directories" },
  { num: 5, name: "AI Toolflow", inputDomain: "ai-toolflow.com", group: "AI Discovery & Tool Directories" },
  { num: 6, name: "AI-Tools Directory", inputDomain: "ai-tools.directory", group: "AI Discovery & Tool Directories" },
  { num: 7, name: "AI Chief", inputDomain: "aichief.com", group: "AI Discovery & Tool Directories" },
  { num: 8, name: "AIDir", inputDomain: "aidir.wiki", group: "AI Discovery & Tool Directories" },
  { num: 9, name: "AI Directory Wiki", inputDomain: "aidirectory.wiki", group: "AI Discovery & Tool Directories" },
  { num: 10, name: "AI Dream Hub", inputDomain: "aidreamhub.com", group: "AI Discovery & Tool Directories" },
  { num: 11, name: "AI Dust", inputDomain: "aidust.io", group: "AI Discovery & Tool Directories" },
  { num: 12, name: "AI Tools Explore", inputDomain: "aiex.me", group: "AI Discovery & Tool Directories" },
  { num: 13, name: "AI for Developers", inputDomain: "aifordevelopers.org", group: "AI Discovery & Tool Directories" },
  { num: 14, name: "AI Hubs", inputDomain: "aihubs.ai", group: "AI Discovery & Tool Directories" },
  { num: 15, name: "AI Hustle Tools", inputDomain: "aihustle.tools", group: "AI Discovery & Tool Directories" },
  { num: 16, name: "AI Kaptan", inputDomain: "aikaptan.com", group: "AI Discovery & Tool Directories" },
  { num: 17, name: "AI Match Pro", inputDomain: "aimatch.pro", group: "AI Discovery & Tool Directories" },
  { num: 18, name: "AI Nave", inputDomain: "ainave.com", group: "AI Discovery & Tool Directories" },
  { num: 19, name: "AI Pedia Hub", inputDomain: "aipediahub.com", group: "AI Discovery & Tool Directories" },
  { num: 20, name: "AI Resource Pro", inputDomain: "airesource.pro", group: "AI Discovery & Tool Directories" },
  { num: 21, name: "AI Tools Guru", inputDomain: "aitoolguru.com", group: "AI Discovery & Tool Directories" },
  { num: 22, name: "AI Tool List", inputDomain: "aitoollist.org", group: "AI Discovery & Tool Directories" },
  { num: 23, name: "AI Tools A2Z", inputDomain: "aitoolsa2z.com", group: "AI Discovery & Tool Directories" },
  { num: 24, name: "AI Tools Arena", inputDomain: "aitoolsarena.com", group: "AI Discovery & Tool Directories" },
  { num: 25, name: "AI Tools Corner", inputDomain: "aitoolscorner.com", group: "AI Discovery & Tool Directories" },
  { num: 26, name: "AI Tools Directory List", inputDomain: "aitoolsdirectorylist.com", group: "AI Discovery & Tool Directories" },
  { num: 27, name: "AI Tools Explorer", inputDomain: "aitoolsexplorer.com", group: "AI Discovery & Tool Directories" },
  { num: 28, name: "AI Tools Magazine", inputDomain: "aitoolsmagazine.com", group: "AI Discovery & Tool Directories" },
  { num: 29, name: "AI Tools Pin", inputDomain: "aitoolspin.com", group: "AI Discovery & Tool Directories" },
  { num: 30, name: "AI Tools Prime", inputDomain: "aitoolsprime.com", group: "AI Discovery & Tool Directories" },
  { num: 31, name: "AI Tool Trek", inputDomain: "aitooltrek.com", group: "AI Discovery & Tool Directories" },
  { num: 32, name: "AiToolz", inputDomain: "aitoolz.net", group: "AI Discovery & Tool Directories" },
  { num: 33, name: "AI Top Tools", inputDomain: "aitoptools.com", group: "AI Discovery & Tool Directories" },
  { num: 34, name: "AI XYZ", inputDomain: "aixyz.co", group: "AI Discovery & Tool Directories" },
  { num: 35, name: "All AI Tool List", inputDomain: "allaitoollist.com", group: "AI Discovery & Tool Directories" },
  { num: 36, name: "All AI Tools Tech", inputDomain: "allaitools.tech", group: "AI Discovery & Tool Directories" },
  { num: 37, name: "All AI Website", inputDomain: "allaiwebsite.com", group: "AI Discovery & Tool Directories" },
  { num: 38, name: "Allesora", inputDomain: "allesora.com", group: "AI Discovery & Tool Directories" },
  { num: 39, name: "Ankore", inputDomain: "ankore.io", group: "AI Discovery & Tool Directories" },
  { num: 40, name: "Appiod", inputDomain: "appiod.com", group: "AI Discovery & Tool Directories" },
  { num: 41, name: "AppRater", inputDomain: "apprater.net", group: "AI Discovery & Tool Directories" },
  { num: 42, name: "Apps400", inputDomain: "apps400.com", group: "AI Discovery & Tool Directories" },
  { num: 43, name: "Appscribed", inputDomain: "appscribed.com", group: "AI Discovery & Tool Directories" },
  { num: 44, name: "AppsListo", inputDomain: "appslisto.com", group: "AI Discovery & Tool Directories" },
  { num: 45, name: "AppsMamma", inputDomain: "appsmamma.com", group: "AI Discovery & Tool Directories" },
  { num: 46, name: "AppsMirror", inputDomain: "appsmirror.com", group: "AI Discovery & Tool Directories" },
  { num: 47, name: "Ask AI For It", inputDomain: "askaiforit.com", group: "AI Discovery & Tool Directories" },
  { num: 48, name: "Aura++", inputDomain: "auraplusplus.com", group: "AI Discovery & Tool Directories" },
  { num: 49, name: "Based Tools", inputDomain: "basedtools.ai", group: "AI Discovery & Tool Directories" },
  { num: 50, name: "Best of AI", inputDomain: "bestofai.io", group: "AI Discovery & Tool Directories" },
  { num: 51, name: "Best of Web", inputDomain: "bestofweb.site", group: "AI Discovery & Tool Directories" },
  { num: 52, name: "Beyond AI Tools", inputDomain: "beyondaitools.com", group: "AI Discovery & Tool Directories" },
  { num: 53, name: "Byblos AI", inputDomain: "byblosai.com", group: "AI Discovery & Tool Directories" },
  { num: 54, name: "Chatgate", inputDomain: "chatgate.ai", group: "AI Discovery & Tool Directories" },
  { num: 55, name: "ClaudePro Directory", inputDomain: "claudepro.directory", group: "AI Discovery & Tool Directories" },
  { num: 56, name: "DailyTech AI", inputDomain: "dailytech.ai", group: "AI Discovery & Tool Directories" },
  { num: 57, name: "DataLook", inputDomain: "datalook.io", group: "AI Discovery & Tool Directories" },
  { num: 58, name: "Dessign", inputDomain: "dessign.net", group: "AI Discovery & Tool Directories" },
  { num: 59, name: "Direct2App", inputDomain: "direct2app.com", group: "AI Discovery & Tool Directories" },
  { num: 60, name: "EveryDev", inputDomain: "everydev.ai", group: "AI Discovery & Tool Directories" },

  // B. AI, SaaS and productivity discovery — 20
  { num: 61, name: "Every AI", inputDomain: "every-ai.com", group: "AI, SaaS & Productivity Discovery" },
  { num: 62, name: "Evol Magazine Tools", inputDomain: "evolmagazine.com", group: "AI, SaaS & Productivity Discovery" },
  { num: 63, name: "Find An AI Tool", inputDomain: "findanaitools.com", group: "AI, SaaS & Productivity Discovery" },
  { num: 64, name: "Find My AI Tool", inputDomain: "findmyaitool.com", group: "AI, SaaS & Productivity Discovery" },
  { num: 65, name: "Flaex", inputDomain: "flaex.ai", group: "AI, SaaS & Productivity Discovery" },
  { num: 66, name: "FlowTools", inputDomain: "flowtools.co", group: "AI, SaaS & Productivity Discovery" },
  { num: 67, name: "Future AGI Tools", inputDomain: "futureagitools.com", group: "AI, SaaS & Productivity Discovery" },
  { num: 68, name: "Futurepedia Wiki", inputDomain: "futurepedia.wiki", group: "AI, SaaS & Productivity Discovery" },
  { num: 69, name: "God of Prompt", inputDomain: "godofprompt.ai", group: "AI, SaaS & Productivity Discovery" },
  { num: 70, name: "GrabOn AI Tools", inputDomain: "grabon.in", group: "AI, SaaS & Productivity Discovery" },
  { num: 71, name: "Havnai", inputDomain: "havnai.com", group: "AI, SaaS & Productivity Discovery" },
  { num: 72, name: "How2AI Tools", inputDomain: "how2aitools.com", group: "AI, SaaS & Productivity Discovery" },
  { num: 73, name: "HyperTools", inputDomain: "hypertools.so", group: "AI, SaaS & Productivity Discovery" },
  { num: 74, name: "Intelligent Tools", inputDomain: "intelligenttools.co", group: "AI, SaaS & Productivity Discovery" },
  { num: 75, name: "Kick Product", inputDomain: "kickproduct.com", group: "AI, SaaS & Productivity Discovery" },
  { num: 76, name: "Leading AI Tools", inputDomain: "leadingai.tools", group: "AI, SaaS & Productivity Discovery" },
  { num: 77, name: "LineZine", inputDomain: "linezine.com", group: "AI, SaaS & Productivity Discovery" },
  { num: 78, name: "List Your Tool", inputDomain: "listyourtool.com", group: "AI, SaaS & Productivity Discovery" },
  { num: 79, name: "Makerlist", inputDomain: "makerlist.io", group: "AI, SaaS & Productivity Discovery" },
  { num: 80, name: "Marketing Tools List", inputDomain: "marketingtoolslist.com", group: "AI, SaaS & Productivity Discovery" },

  // C. Launch, agent and founder platforms — 20
  { num: 81, name: "Most Popular AI Tools", inputDomain: "mostpopularaitools.com", group: "Launch, Agent & Founder Platforms" },
  { num: 82, name: "My AI Tool Hub", inputDomain: "myaitoolhub.com", group: "Launch, Agent & Founder Platforms" },
  { num: 83, name: "NavFolders", inputDomain: "navfolders.com", group: "Launch, Agent & Founder Platforms" },
  { num: 84, name: "NavTools AI", inputDomain: "navtools.ai", group: "Launch, Agent & Founder Platforms" },
  { num: 85, name: "NeonRev", inputDomain: "neonrev.com", group: "Launch, Agent & Founder Platforms" },
  { num: 86, name: "Open SaaS Directory", inputDomain: "opensaas.directory", group: "Launch, Agent & Founder Platforms" },
  { num: 87, name: "OpenTools", inputDomain: "opentools.ai", group: "Launch, Agent & Founder Platforms" },
  { num: 88, name: "Peak AI Growth", inputDomain: "peakaigrowth.com", group: "Launch, Agent & Founder Platforms" },
  { num: 89, name: "Powered by AI", inputDomain: "poweredbyai.app", group: "Launch, Agent & Founder Platforms" },
  { num: 90, name: "Selljam AI", inputDomain: "selljam.ai", group: "Launch, Agent & Founder Platforms" },
  { num: 91, name: "Stackviv", inputDomain: "stackviv.ai", group: "Launch, Agent & Founder Platforms" },
  { num: 92, name: "Startup Tools List", inputDomain: "startuptoolslist.com", group: "Launch, Agent & Founder Platforms" },
  { num: 93, name: "Stratup AI", inputDomain: "stratup.ai", group: "Launch, Agent & Founder Platforms" },
  { num: 94, name: "Submit AI Tools", inputDomain: "submitaitools.org", group: "Launch, Agent & Founder Platforms" },
  { num: 95, name: "Super AI Tools", inputDomain: "superaitools.io", group: "Launch, Agent & Founder Platforms" },
  { num: 96, name: "AI Hunt List", inputDomain: "aihuntlist.com", group: "Launch, Agent & Founder Platforms" },
  { num: 97, name: "AI You Need", inputDomain: "aiyouneed.com", group: "Launch, Agent & Founder Platforms" },
  { num: 98, name: "Launch Vault", inputDomain: "launchvault.dev", group: "Launch, Agent & Founder Platforms" },
  { num: 99, name: "OpenHunts", inputDomain: "openhunts.com", group: "Launch, Agent & Founder Platforms" },
  { num: 100, name: "AI Agents Directory", inputDomain: "aiagentsdirectory.com", group: "Launch, Agent & Founder Platforms" }
];

function extractCanonicalRoot(input) {
  let clean = input.toLowerCase().trim();
  clean = clean.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  clean = clean.replace(/^www\./, '');
  const parts = clean.split('.');
  if (parts.length > 2 && !['co.in', 'net.in', 'org.in', 'ac.in', 'gov.in', 'co.uk'].includes(parts.slice(-2).join('.'))) {
    return parts.slice(-2).join('.');
  }
  return clean;
}

// Build reference maps from all historical SQLite tables
function loadMap(table, col, nameCol) {
  try {
    const rows = db.prepare(`SELECT ${col} as root, ${nameCol} as name FROM ${table}`).all();
    const map = new Map();
    rows.forEach(r => {
      if (r.root) map.set(r.root.toLowerCase().trim(), `${table}: ${r.name || ''}`);
    });
    return map;
  } catch (e) {
    return new Map();
  }
}

const acqMap = loadMap('acquisition_targets', 'root_domain', 'platform_name');
const cohortMap = loadMap('cohort_50_opportunities', 'root_domain', 'platform_name');
const b2Map = loadMap('batch2_prospects', 'root_domain', 'platform_name');
const b2bMap = loadMap('b2b_directory_profiles', 'platform_domain', 'platform_name');
const domainsMap = loadMap('domains', 'root_domain', 'name');
const backlinksMap = loadMap('backlinks', 'referring_domain', 'anchor_text');

// Also load Batch 4 candidates
let b4Map = new Map();
try {
  const b4 = JSON.parse(fs.readFileSync('backlink-engine/src/scripts/batch4_classified_refined.json', 'utf8'));
  b4.forEach(b => b4Map.set(b.canonicalRoot, `batch4: ${b.name}`));
} catch (e) {}

console.log('--- Batch 5 Canonical Deduplication ---');
const dedupList = [];
const seenInBatch = new Map();

RAW_CANDIDATES.forEach(c => {
  const root = extractCanonicalRoot(c.inputDomain);
  let duplicateDetails = [];

  if (acqMap.has(root)) duplicateDetails.push(acqMap.get(root));
  if (cohortMap.has(root)) duplicateDetails.push(cohortMap.get(root));
  if (b2Map.has(root)) duplicateDetails.push(b2Map.get(root));
  if (b2bMap.has(root)) duplicateDetails.push(b2bMap.get(root));
  if (domainsMap.has(root)) duplicateDetails.push(domainsMap.get(root));
  if (backlinksMap.has(root)) duplicateDetails.push(backlinksMap.get(root));
  if (b4Map.has(root)) duplicateDetails.push(b4Map.get(root));

  if (seenInBatch.has(root)) {
    duplicateDetails.push(`Intra-Batch 5 Duplicate of #${seenInBatch.get(root)}`);
  } else {
    seenInBatch.set(root, c.num);
  }

  const isDuplicate = duplicateDetails.length > 0;
  dedupList.push({
    num: c.num,
    name: c.name,
    inputDomain: c.inputDomain,
    canonicalRoot: root,
    group: c.group,
    isDuplicate,
    duplicateSource: isDuplicate ? duplicateDetails.join('; ') : 'NONE_UNIQUE'
  });
});

const dupes = dedupList.filter(d => d.isDuplicate);
const uniques = dedupList.filter(d => !d.isDuplicate);

console.log(`Total Candidates: ${dedupList.length}`);
console.log(`Canonical Duplicates: ${dupes.length}`);
console.log(`Genuinely New Unique Domains: ${uniques.length}`);

if (dupes.length > 0) {
  console.log('\nDuplicates details:');
  dupes.forEach(d => console.log(`  [#${d.num}] ${d.name} (${d.canonicalRoot}) -> ${d.duplicateSource}`));
}

fs.writeFileSync('backlink-engine/src/scripts/batch5_dedup_initial.json', JSON.stringify(dedupList, null, 2), 'utf8');
console.log('Saved to backlink-engine/src/scripts/batch5_dedup_initial.json');
