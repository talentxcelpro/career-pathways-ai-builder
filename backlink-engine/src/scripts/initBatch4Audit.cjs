// backlink-engine/src/scripts/initBatch4Audit.cjs
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../data/backlink_engine.db');
const db = new DatabaseSync(DB_PATH);

// 100 Raw Batch 4 Candidates provided by user
const RAW_CANDIDATES = [
  // A. Startup and product directories
  { num: 1, name: "EU-Startups", inputDomain: "eu-startups.com", category: "Startup & Product Directory" },
  { num: 2, name: "Arctic Startup", inputDomain: "arcticstartup.com", category: "Startup & Product Directory" },
  { num: 3, name: "Startup Beat", inputDomain: "startupbeat.com", category: "Startup & Product Directory" },
  { num: 4, name: "Startup Benchmarks", inputDomain: "startupbenchmarks.com", category: "Startup & Product Directory" },
  { num: 5, name: "Startup Inspire", inputDomain: "startupinspire.com", category: "Startup & Product Directory" },
  { num: 6, name: "Startup Tracker", inputDomain: "startuptracker.io", category: "Startup & Product Directory" },
  { num: 7, name: "Startup88", inputDomain: "startup88.com", category: "Startup & Product Directory" },
  { num: 8, name: "Startup Collections", inputDomain: "startupcollections.com", category: "Startup & Product Directory" },
  { num: 9, name: "Startup Heroes", inputDomain: "startupheroes.io", category: "Startup & Product Directory" },
  { num: 10, name: "The Startup Pitch", inputDomain: "thestartuppitch.com", category: "Startup & Product Directory" },
  { num: 11, name: "The Startup INC", inputDomain: "thestartupinc.com", category: "Startup & Product Directory" },
  { num: 12, name: "Startups Watch", inputDomain: "startups.watch", category: "Startup & Product Directory" },
  { num: 13, name: "Startups Gallery", inputDomain: "startupsgallery.com", category: "Startup & Product Directory" },
  { num: 14, name: "RocketHub", inputDomain: "rockethub.com", category: "Startup & Product Directory" },
  { num: 15, name: "Gust", inputDomain: "gust.com", category: "Startup & Product Directory" },
  { num: 16, name: "Magnitt", inputDomain: "magnitt.com", category: "Startup & Product Directory" },
  { num: 17, name: "InnMind", inputDomain: "innmind.com", category: "Startup & Product Directory" },
  { num: 18, name: "Feedough", inputDomain: "feedough.com", category: "Startup & Product Directory" },
  { num: 19, name: "Springwise", inputDomain: "springwise.com", category: "Startup & Product Directory" },
  { num: 20, name: "Built In", inputDomain: "builtin.com", category: "Startup & Product Directory" },

  // B. AI and software discovery
  { num: 21, name: "AI Infinity", inputDomain: "aiinfinity.com", category: "AI & Software Discovery" },
  { num: 22, name: "AI Library", inputDomain: "ailibrary.org", category: "AI & Software Discovery" },
  { num: 23, name: "AI Hustle", inputDomain: "aihustle.com", category: "AI & Software Discovery" },
  { num: 24, name: "AI Tools Inc", inputDomain: "aitools.inc", category: "AI & Software Discovery" },
  { num: 25, name: "Dokey AI", inputDomain: "dokey.ai", category: "AI & Software Discovery" },
  { num: 26, name: "AI Startups", inputDomain: "aistartups.net", category: "AI & Software Discovery" },
  { num: 27, name: "AI Resource Hub", inputDomain: "airesourcehub.com", category: "AI & Software Discovery" },
  { num: 28, name: "LLM Relevance", inputDomain: "llmrelevance.com", category: "AI & Software Discovery" },
  { num: 29, name: "BotsFloor", inputDomain: "botsfloor.com", category: "AI & Software Discovery" },
  { num: 30, name: "Bowora", inputDomain: "bowora.com", category: "AI & Software Discovery" },
  { num: 31, name: "DoMore AI", inputDomain: "domore.ai", category: "AI & Software Discovery" },
  { num: 32, name: "AIHunt", inputDomain: "aihunt.app", category: "AI & Software Discovery" },
  { num: 33, name: "PromptZone", inputDomain: "promptzone.com", category: "AI & Software Discovery" },
  { num: 34, name: "FlowGPT", inputDomain: "flowgpt.com", category: "AI & Software Discovery" },
  { num: 35, name: "Stacker News", inputDomain: "stacker.news", category: "AI & Software Discovery" },
  { num: 36, name: "All My Faves", inputDomain: "allmyfaves.com", category: "AI & Software Discovery" },
  { num: 37, name: "Acid Tools", inputDomain: "acidtools.com", category: "AI & Software Discovery" },
  { num: 38, name: "Tech Product Finder", inputDomain: "techproductfinder.com", category: "AI & Software Discovery" },
  { num: 39, name: "SaaS Radar", inputDomain: "saasradar.io", category: "AI & Software Discovery" },
  { num: 40, name: "Free SaaS Directory", inputDomain: "freesaasdirectory.com", category: "AI & Software Discovery" },

  // C. SaaS, business and company profiles
  { num: 41, name: "Crozdesk", inputDomain: "crozdesk.com", category: "SaaS, Business & Company Profiles" },
  { num: 42, name: "SoftwareWorld", inputDomain: "softwareworld.co", category: "SaaS, Business & Company Profiles" },
  { num: 43, name: "Appvizer", inputDomain: "appvizer.com", category: "SaaS, Business & Company Profiles" },
  { num: 44, name: "CompareCamp", inputDomain: "comparecamp.com", category: "SaaS, Business & Company Profiles" },
  { num: 45, name: "SiteJabber", inputDomain: "sitejabber.com", category: "SaaS, Business & Company Profiles" },
  { num: 46, name: "ProvenExpert", inputDomain: "provenexpert.com", category: "SaaS, Business & Company Profiles" },
  { num: 47, name: "Webwiki", inputDomain: "webwiki.com", category: "SaaS, Business & Company Profiles" },
  { num: 48, name: "Software Informer", inputDomain: "software.informer.com", category: "SaaS, Business & Company Profiles" },
  { num: 49, name: "AppAgg", inputDomain: "appagg.com", category: "SaaS, Business & Company Profiles" },
  { num: 50, name: "Softpedia", inputDomain: "softpedia.com", category: "SaaS, Business & Company Profiles" },
  { num: 51, name: "Serchen", inputDomain: "serchen.com", category: "SaaS, Business & Company Profiles" },
  { num: 52, name: "Cuspera", inputDomain: "cuspera.com", category: "SaaS, Business & Company Profiles" },
  { num: 53, name: "SelectHub", inputDomain: "selecthub.com", category: "SaaS, Business & Company Profiles" },
  { num: 54, name: "FeaturedCustomers", inputDomain: "featuredcustomers.com", category: "SaaS, Business & Company Profiles" },
  { num: 55, name: "CrowdReviews", inputDomain: "crowdreviews.com", category: "SaaS, Business & Company Profiles" },
  { num: 56, name: "Tekpon", inputDomain: "tekpon.com", category: "SaaS, Business & Company Profiles" },
  { num: 57, name: "Business Software", inputDomain: "business-software.com", category: "SaaS, Business & Company Profiles" },
  { num: 58, name: "SaaS Genius", inputDomain: "saasgenius.com", category: "SaaS, Business & Company Profiles" },
  { num: 59, name: "SaaS Scout", inputDomain: "saasscout.com", category: "SaaS, Business & Company Profiles" },
  { num: 60, name: "SaaS Worthy", inputDomain: "saasworthy.com", category: "SaaS, Business & Company Profiles" },

  // D. Developer, technology and integration ecosystems
  { num: 61, name: "API List", inputDomain: "apilist.fun", category: "Developer & Technology Ecosystems" },
  { num: 62, name: "Public APIs", inputDomain: "publicapis.io", category: "Developer & Technology Ecosystems" },
  { num: 63, name: "Open Source Alternative", inputDomain: "opensourcealternative.to", category: "Developer & Technology Ecosystems" },
  { num: 64, name: "NoCodeList", inputDomain: "nocodelist.co", category: "Developer & Technology Ecosystems" },
  { num: 65, name: "Discover Cloud", inputDomain: "discovercloud.com", category: "Developer & Technology Ecosystems" },
  { num: 66, name: "Tech Map", inputDomain: "techmap.io", category: "Developer & Technology Ecosystems" },
  { num: 67, name: "CodeProject", inputDomain: "codeproject.com", category: "Developer & Technology Ecosystems" },
  { num: 68, name: "DZone", inputDomain: "dzone.com", category: "Developer & Technology Ecosystems" },
  { num: 69, name: "InfoQ", inputDomain: "infoq.com", category: "Developer & Technology Ecosystems" },
  { num: 70, name: "The New Stack", inputDomain: "thenewstack.io", category: "Developer & Technology Ecosystems" },
  { num: 71, name: "Slashdot", inputDomain: "slashdot.org", category: "Developer & Technology Ecosystems" },
  { num: 72, name: "Lobsters", inputDomain: "lobste.rs", category: "Developer & Technology Ecosystems" },
  { num: 73, name: "OWASP Projects", inputDomain: "owasp.org", category: "Developer & Technology Ecosystems" },
  { num: 74, name: "Stack Overflow for Teams", inputDomain: "stackoverflow.com/teams", category: "Developer & Technology Ecosystems" },
  { num: 75, name: "Read the Docs", inputDomain: "readthedocs.io", category: "Developer & Technology Ecosystems" },

  // E. Editorial, founder and professional communities
  { num: 76, name: "MakeUseOf", inputDomain: "makeuseof.com", category: "Editorial & Founder Communities" },
  { num: 77, name: "GeekWire", inputDomain: "geekwire.com", category: "Editorial & Founder Communities" },
  { num: 78, name: "VentureBeat", inputDomain: "venturebeat.com", category: "Editorial & Founder Communities" },
  { num: 79, name: "Starter Story", inputDomain: "starterstory.com", category: "Editorial & Founder Communities" },
  { num: 80, name: "Failory", inputDomain: "failory.com", category: "Editorial & Founder Communities" },
  { num: 81, name: "Netted", inputDomain: "netted.net", category: "Editorial & Founder Communities" },
  { num: 82, name: "The Rundown AI", inputDomain: "therundown.ai", category: "Editorial & Founder Communities" },
  { num: 83, name: "Ben's Bites", inputDomain: "bensbites.com", category: "Editorial & Founder Communities" },
  { num: 84, name: "Recruiting Brainfood", inputDomain: "recruitingbrainfood.com", category: "Editorial & Founder Communities" },
  { num: 85, name: "SourceCon", inputDomain: "sourcecon.com", category: "Editorial & Founder Communities" },
  { num: 86, name: "HR Daily Advisor", inputDomain: "hrdailyadvisor.com", category: "Editorial & Founder Communities" },
  { num: 87, name: "HR Exchange Network", inputDomain: "hrexchangenetwork.com", category: "Editorial & Founder Communities" },
  { num: 88, name: "Personnel Today", inputDomain: "personneltoday.com", category: "Editorial & Founder Communities" },
  { num: 89, name: "HRO Today", inputDomain: "hrotoday.com", category: "Editorial & Founder Communities" },
  { num: 90, name: "Human Capital Institute", inputDomain: "hci.org", category: "Editorial & Founder Communities" },

  // F. Additional directories and launch communities
  { num: 91, name: "10words", inputDomain: "10words.io", category: "Directories & Launch Communities" },
  { num: 92, name: "Product Canyon", inputDomain: "productcanyon.com", category: "Directories & Launch Communities" },
  { num: 93, name: "ProductLaunchpad", inputDomain: "productlaunchpad.com", category: "Directories & Launch Communities" },
  { num: 94, name: "Simple Lister", inputDomain: "simplelister.com", category: "Directories & Launch Communities" },
  { num: 95, name: "Get Worm", inputDomain: "getworm.com", category: "Directories & Launch Communities" },
  { num: 96, name: "Owwly", inputDomain: "owwly.com", category: "Directories & Launch Communities" },
  { num: 97, name: "FiveTaco", inputDomain: "fivetaco.com", category: "Directories & Launch Communities" },
  { num: 98, name: "Launched", inputDomain: "launched.io", category: "Directories & Launch Communities" },
  { num: 99, name: "Project Hatch", inputDomain: "projecthatch.co", category: "Directories & Launch Communities" },
  { num: 100, name: "Website Launches", inputDomain: "websitelaunches.com", category: "Directories & Launch Communities" }
];

function extractCanonicalRoot(input) {
  let clean = input.toLowerCase().trim();
  clean = clean.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  clean = clean.replace(/^www\./, '');
  // handling two-part TLDs if any
  const parts = clean.split('.');
  if (parts.length > 2 && !['co.in', 'net.in', 'org.in', 'ac.in', 'gov.in', 'co.uk'].includes(parts.slice(-2).join('.'))) {
    return parts.slice(-2).join('.');
  }
  return clean;
}

// Map existing sources
const targetTable = db.prepare('SELECT root_domain, platform_name FROM acquisition_targets').all();
const targetMap = new Map();
targetTable.forEach(r => targetMap.set(r.root_domain.toLowerCase().trim(), 'acquisition_targets: ' + r.platform_name));

const cohortTable = db.prepare('SELECT root_domain, platform_name FROM cohort_50_opportunities').all();
const cohortMap = new Map();
cohortTable.forEach(r => cohortMap.set(r.root_domain.toLowerCase().trim(), 'cohort_50: ' + r.platform_name));

const b2Table = db.prepare('SELECT root_domain, platform_name FROM batch2_prospects').all();
const b2Map = new Map();
b2Table.forEach(r => b2Map.set(r.root_domain.toLowerCase().trim(), 'batch2_prospects: ' + r.platform_name));

const backlinksTable = db.prepare('SELECT DISTINCT referring_domain FROM backlinks').all();
const backlinkMap = new Map();
backlinksTable.forEach(r => backlinkMap.set(r.referring_domain.toLowerCase().trim(), 'backlinks'));

console.log('--- Canonical Deduplication Check on 100 Candidates ---');
const dedupList = [];

RAW_CANDIDATES.forEach(c => {
  const root = extractCanonicalRoot(c.inputDomain);
  let duplicateSource = null;

  if (targetMap.has(root)) duplicateSource = targetMap.get(root);
  else if (cohortMap.has(root)) duplicateSource = cohortMap.get(root);
  else if (b2Map.has(root)) duplicateSource = b2Map.get(root);
  else if (backlinkMap.has(root)) duplicateSource = backlinkMap.get(root);

  dedupList.push({
    num: c.num,
    name: c.name,
    inputDomain: c.inputDomain,
    canonicalRoot: root,
    category: c.category,
    isDuplicate: !!duplicateSource,
    duplicateSource: duplicateSource || 'NONE_UNIQUE'
  });
});

const duplicates = dedupList.filter(d => d.isDuplicate);
const uniques = dedupList.filter(d => !d.isDuplicate);

console.log(`Total Candidates: ${dedupList.length}`);
console.log(`Duplicates Found: ${duplicates.length}`);
console.log(`Unique New Candidates: ${uniques.length}`);

console.log('\nDuplicates details:');
duplicates.forEach(d => console.log(`  [#${d.num}] ${d.name} (${d.canonicalRoot}) -> Found in ${d.duplicateSource}`));

// Save to JSON for next probe step
fs.writeFileSync('backlink-engine/src/scripts/batch4_dedup_initial.json', JSON.stringify(dedupList, null, 2), 'utf8');
