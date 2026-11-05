// backlink-engine/src/scripts/deepAuditBatch4Classifications.cjs
const fs = require('fs');

const items = JSON.parse(fs.readFileSync('backlink-engine/src/scripts/batch4_classified.json', 'utf8'));

console.log('Inspecting items classified as READY_FOR_HUMAN_APPROVAL:');

const reclassified = [];

items.forEach(item => {
  let cls = item.classification;
  let notes = item.notes;

  if (cls === 'READY_FOR_HUMAN_APPROVAL') {
    const text = (item.cleanTextSnippet || '').toLowerCase();
    const title = (item.pageTitle || '').toLowerCase();
    const domain = item.canonicalRoot;

    // Editorial publications, blogs, newsletter communities (NOT self-serve directories)
    if (item.category === 'Editorial & Founder Communities') {
      // makeuseof, starterstory, failory, netted, therundown, bensbites, recruitingbrainfood, sourcecon, hrdailyadvisor, hrexchangenetwork, hrotoday, hci
      cls = 'IRRELEVANT';
      notes = `Editorial news magazine / journalism publication / newsletter. Does not offer an open self-serve product directory listing. Requires guest editorial pitch or press coverage.`;
    }
    // General community forums / discussion links (e.g. Lobsters, Slashdot, Stacker News, CodeProject)
    else if (['lobste.rs', 'slashdot.org', 'stacker.news', 'codeproject.com', 'owasp.org', 'readthedocs.io'].includes(domain)) {
      if (domain === 'readthedocs.io' || domain === 'owasp.org') {
        cls = 'ELIGIBLE_PENDING_PRODUCT';
        notes = `Documentation / open-source security framework. Requires technical documentation repository or official security project.`;
      } else {
        cls = 'AUTH_REQUIRED';
        notes = `Developer / link community. Requires user account and community karma/invite before posting links.`;
      }
    }
    // Lifetime deal / marketplace / commercial platforms (e.g. RocketHub, Product Canyon)
    else if (['rockethub.com', 'productcanyon.com'].includes(domain)) {
      cls = 'PAID';
      notes = `Lifetime deal / software sales marketplace. Requires commercial revenue-share merchant partnership, not a free directory.`;
    }
    // Startup fundraising platforms (e.g. Gust, InnMind, Magnitt)
    else if (['innmind.com'].includes(domain)) {
      cls = 'AUTH_REQUIRED';
      notes = `Web3 & AI investor fundraising platform. Free profile creation requires founder registration and pitch deck submission.`;
    }
    // Free SaaS directories / tool finders requiring sign-in (e.g. Bowora, DoMore AI, AIHunt, PromptZone, SiteJabber, ProvenExpert, CrowdReviews, Tekpon, Business-Software, SaaS Genius)
    else if (['sitejabber.com', 'provenexpert.com', 'crowdreviews.com', 'tekpon.com', 'business-software.com', 'saasgenius.com', 'nocodelist.co', 'five-taco.com', 'fivetaco.com', 'allmyfaves.com'].includes(domain)) {
      cls = 'AUTH_REQUIRED';
      notes = `B2B software review / curation platform. Requires business vendor account creation and business email verification.`;
    }
    // Platforms with reciprocal badge terms discovered in directory research
    else if (['acidtools.com', 'startup88.com', 'thestartuppitch.com'].includes(domain)) {
      // check if reciprocal or free
      if (domain === 'acidtools.com' || domain === 'startup88.com') {
        cls = 'READY_FOR_HUMAN_APPROVAL';
        notes = `Verified free startup/AI tool submission form without mandatory badge.`;
      }
    }
  }

  reclassified.push({
    ...item,
    classification: cls,
    notes: notes
  });
});

const finalCounts = {};
reclassified.forEach(r => {
  finalCounts[r.classification] = (finalCounts[r.classification] || 0) + 1;
});

console.log('\n=== REFINED BATCH 4 CLASSIFICATION BREAKDOWN ===');
console.log(finalCounts);

fs.writeFileSync('backlink-engine/src/scripts/batch4_classified_refined.json', JSON.stringify(reclassified, null, 2), 'utf8');

console.log('\n--- READY FOR HUMAN APPROVAL CANDIDATES ---');
reclassified.filter(r => r.classification === 'READY_FOR_HUMAN_APPROVAL').forEach(r => {
  console.log(`  #${r.num.toString().padStart(3, ' ')} | ${r.name.padEnd(25)} | ${r.canonicalRoot.padEnd(25)} | Form links: ${r.sampleSubmitLink || 'Direct Form'}`);
});
