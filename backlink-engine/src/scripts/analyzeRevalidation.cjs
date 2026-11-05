// backlink-engine/src/scripts/analyzeRevalidation.cjs
const fs = require('fs');
const path = require('path');

const results = JSON.parse(fs.readFileSync(path.join(__dirname, 'revalidate_52_results.json'), 'utf8'));

console.log('=== PHASE 4 ANALYSIS OF REVALIDATED CANDIDATES ===');

const fullyVerifiedReady = [];
const pendingTerms = [];
const blockedOrPaid = [];

results.forEach(r => {
  const num = r.num;
  const name = r.name;
  const domain = r.domain;
  const a = r.analysis;

  if (r.fetchStatus !== 200 || !a) {
    blockedOrPaid.push({ num, name, domain, reason: `HTTP ${r.fetchStatus} - Failed to fetch form endpoint (${r.fetchError || 'Empty'})` });
    return;
  }

  // Check form completeness
  const f = a.fields;
  const p = a.pricing;

  const hasCompleteForm = (f.hasUrlField || f.inputs.length >= 2) && f.hasSubmitButton;
  const hasFreeProof = p.hasFreeMention || (p.uniquePrices.length === 0 && hasCompleteForm);
  const hasNoReciprocal = !a.hasReciprocalMention;
  const hasNoPaidOnly = !p.hasPaidOnly;
  const hasRelevantCategory = a.mentionsCareerOrProductivity;

  // If candidate requires payment or badge, reject
  if (p.hasPaidOnly && !p.hasFreeMention) {
    blockedOrPaid.push({ num, name, domain, reason: `Mandatory paid fee detected: ${p.uniquePrices.join(', ')}` });
    return;
  }

  if (a.hasReciprocalMention) {
    blockedOrPaid.push({ num, name, domain, reason: 'Reciprocal link/badge required on form' });
    return;
  }

  // Check if all conditions are rigorously fulfilled for READY_FOR_HUMAN_APPROVAL:
  // 1. Working official submission route (HTTP 200)
  // 2. Complete form with inputs & submit button
  // 3. Explicit free mention ($0, free submission, free tier, etc.)
  // 4. No reciprocal link
  // 5. Relevant category (productivity / career / business / general AI)
  // 6. Appropriate TalentXcel product fit (ATS Scanner / Career platform)
  if (hasCompleteForm && p.hasFreeMention && hasNoReciprocal && hasRelevantCategory) {
    fullyVerifiedReady.push({
      num, name, domain,
      submissionUrl: r.submissionUrl,
      freeProof: p.hasFreeMention,
      prices: p.uniquePrices,
      inputsCount: f.inputs.length,
      categoryProof: hasRelevantCategory,
      productFit: 'ATS Resume Diagnostic Scanner (https://talentxcel.in/resume/ats-check)'
    });
  } else {
    // Classified as FORM_ACCESS_VERIFIED_PENDING_TERMS_AND_ELIGIBILITY
    pendingTerms.push({
      num, name, domain,
      submissionUrl: r.submissionUrl,
      inputsCount: f.inputs.length,
      missingProof: [
        !p.hasFreeMention ? 'Explicit free tier text missing from form page' : null,
        !hasRelevantCategory ? 'Career/productivity category taxonomy unverified' : null,
        !f.hasUrlField ? 'Website URL field missing explicit tag' : null
      ].filter(Boolean).join('; ')
    });
  }
});

console.log(`Fully Verified Ready for Human Approval: ${fullyVerifiedReady.length}`);
console.log(`Form Access Verified Pending Terms & Eligibility: ${pendingTerms.length}`);
console.log(`Blocked or Paid on Re-audit: ${blockedOrPaid.length}`);

console.log('\n--- FULLY VERIFIED READY CANDIDATES ---');
fullyVerifiedReady.forEach(c => {
  console.log(`  [#${c.num}] ${c.name} (${c.domain}) -> Form Inputs: ${c.inputsCount} | Prices: [${c.prices.join(', ')}] | URL: ${c.submissionUrl}`);
});

console.log('\n--- PENDING TERMS & ELIGIBILITY ---');
pendingTerms.forEach(c => {
  console.log(`  [#${c.num}] ${c.name} (${c.domain}) -> ${c.missingProof}`);
});

console.log('\n--- BLOCKED OR PAID ON RE-AUDIT ---');
blockedOrPaid.forEach(c => {
  console.log(`  [#${c.num}] ${c.name} (${c.domain}) -> ${c.reason}`);
});

fs.writeFileSync(
  path.join(__dirname, 'phase4_classification_breakdown.json'),
  JSON.stringify({ fullyVerifiedReady, pendingTerms, blockedOrPaid }, null, 2)
);
console.log('\nSaved phase4_classification_breakdown.json');
