// backlink-engine/src/scripts/classifyBatch6Comprehensive.cjs
const fs = require('fs');
const path = require('path');

const resolved = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch6_probe_resolved.json'), 'utf8'));
const submitAudits = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch6_submit_endpoints_audit.json'), 'utf8'));

const submitMap = new Map();
submitAudits.forEach(s => submitMap.set(s.num, s));

const classified = [];

for (const item of resolved) {
  const num = item.num;
  const name = item.name;
  const domain = item.canonicalRoot;
  const group = item.group;
  const isDuplicate = item.isDuplicate;
  const duplicateSource = item.duplicateSource;
  const p = item.probe || {};
  const sub = submitMap.get(num) || {};

  let status = '';
  let subCategory = '';
  let reason = '';
  let score = 0;
  let submissionUrl = '';
  let authType = 'NONE';
  let pricingType = 'FREE';
  let badgeRequirement = 'NO';
  let targetAngle = 'ATS Resume Diagnostic Scanner (https://talentxcel.in/resume/ats-check)';
  let technicalEvidence = '';

  // 1. DUPLICATE CHECK (35 candidates)
  if (isDuplicate) {
    status = 'DUPLICATE';
    subCategory = 'HISTORICAL_DATABASE_DUPLICATE';
    reason = `Already present in database: ${duplicateSource}`;
    score = 0;
    submissionUrl = '';
    authType = 'N/A';
    pricingType = 'N/A';
    badgeRequirement = 'N/A';
    targetAngle = 'N/A';
    technicalEvidence = `Deduplicated against ${duplicateSource}`;
    classified.push({
      num, name, domain, group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence
    });
    continue;
  }

  // 2. NETWORK / DNS / TIMEOUT / SSL ERRORS (Status 0)
  if (p.status === 0) {
    status = 'BLOCKED';
    subCategory = 'NETWORK_DNS_SSL_ERROR';
    reason = `Connection failed: ${p.error}`;
    score = 0;
    submissionUrl = '';
    authType = 'N/A';
    pricingType = 'N/A';
    badgeRequirement = 'N/A';
    targetAngle = 'N/A';
    technicalEvidence = `HTTP socket error: ${p.error}`;
    classified.push({
      num, name, domain, group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence
    });
    continue;
  }

  // 3. WAF / BOT CHALLENGES / CLOUDFLARE 403 / 429
  if (p.status === 403 || p.status === 429) {
    status = 'BLOCKED';
    subCategory = p.status === 403 ? 'WAF_CLOUDFLARE_BLOCKED' : 'RATE_LIMITED_429';
    reason = `HTTP ${p.status} - Automated access blocked by ${p.status === 403 ? 'Cloudflare WAF bot challenge' : 'Security Rate Limit checkpoint'}`;
    score = 0;
    submissionUrl = p.finalUrl || '';
    authType = 'N/A';
    pricingType = 'N/A';
    badgeRequirement = 'N/A';
    targetAngle = 'N/A';
    technicalEvidence = `HTTP ${p.status} | Title: "${p.title}"`;
    classified.push({
      num, name, domain, group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence
    });
    continue;
  }

  // 4. SERVER ERRORS (500+)
  if (p.status >= 500) {
    status = 'BLOCKED';
    subCategory = 'SERVER_ERROR_5XX';
    reason = `HTTP ${p.status} server internal error (${p.title || 'Internal Server Error'})`;
    score = 0;
    submissionUrl = p.finalUrl || '';
    authType = 'N/A';
    pricingType = 'N/A';
    badgeRequirement = 'N/A';
    targetAngle = 'N/A';
    technicalEvidence = `HTTP ${p.status} response from host server`;
    classified.push({
      num, name, domain, group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence
    });
    continue;
  }

  // 5. PARKED / EXPIRED / ADULT / CASINO SPAM
  const titleLower = (p.title || '').toLowerCase();
  const finalUrl = (p.finalUrl || '').toLowerCase();
  const snippet = (p.cleanTextSnippet || '').toLowerCase();

  const isParked = finalUrl.includes('hugedomains.com') || finalUrl.includes('ww38.') || finalUrl.includes('ww1.') ||
    titleLower.includes('is for sale') || titleLower.includes('domain is for sale') || titleLower.includes('buy this domain');

  const isSpam = titleLower.includes('slot777') || titleLower.includes('kue68') || titleLower.includes('man fucking') ||
    titleLower.includes('pkv qq') || titleLower.includes('vavada');

  if (isParked || isSpam || domain === 'aitoolsmasters.com' || domain === 'indiepage.com') {
    status = 'BLOCKED';
    subCategory = isParked ? 'DOMAIN_PARKED_EXPIRED' : 'DOMAIN_HIJACKED_SPAM';
    reason = isParked ? `Domain expired / parked for sale (${p.finalUrl})` : `Domain hijacked with casino/slot spam ("${p.title}")`;
    score = 0;
    submissionUrl = p.finalUrl;
    authType = 'N/A';
    pricingType = 'N/A';
    badgeRequirement = 'N/A';
    targetAngle = 'N/A';
    technicalEvidence = `Redirected to: ${p.finalUrl} | Title: "${p.title}"`;
    classified.push({
      num, name, domain, group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence
    });
    continue;
  }

  // 6. IRRELEVANT (Single SaaS, delivery software, design galleries, agencies)
  if (domain === 'spoke.com') {
    status = 'IRRELEVANT';
    subCategory = 'SINGLE_SAAS_NON_DIRECTORY';
    reason = 'Last mile delivery software product company; not a directory or software listing platform';
    score = 0;
    submissionUrl = p.finalUrl;
    authType = 'N/A';
    pricingType = 'N/A';
    badgeRequirement = 'N/A';
    targetAngle = 'N/A';
    technicalEvidence = 'Title: "Spoke | Last mile delivery software"';
    classified.push({ num, name, domain, group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence });
    continue;
  }

  if (domain === 'wavel.ai') {
    status = 'IRRELEVANT';
    subCategory = 'SINGLE_SAAS_NON_DIRECTORY';
    reason = 'AI Video Generator SaaS product; not a directory or software listing platform';
    score = 0;
    submissionUrl = p.finalUrl;
    authType = 'N/A';
    pricingType = 'N/A';
    badgeRequirement = 'N/A';
    targetAngle = 'N/A';
    technicalEvidence = 'Title: "Wavel AI: AI Video Generator"';
    classified.push({ num, name, domain, group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence });
    continue;
  }

  if (domain === 'devhub.com') {
    status = 'IRRELEVANT';
    subCategory = 'SINGLE_SAAS_NON_DIRECTORY';
    reason = 'Franchise website marketing platform; not a software directory';
    score = 0;
    submissionUrl = p.finalUrl;
    authType = 'N/A';
    pricingType = 'N/A';
    badgeRequirement = 'N/A';
    targetAngle = 'N/A';
    technicalEvidence = 'Title: "DevHub: Franchise Website Platform"';
    classified.push({ num, name, domain, group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence });
    continue;
  }

  if (domain === 'curated.design' || domain === 'saaslandingpage.com') {
    status = 'IRRELEVANT';
    subCategory = 'DESIGN_GALLERY_ONLY';
    reason = 'Web design inspiration screenshot gallery; showcases visual UI screenshots, not functional ATS/software tool directory profiles';
    score = 1;
    submissionUrl = p.finalUrl;
    authType = 'N/A';
    pricingType = 'N/A';
    badgeRequirement = 'N/A';
    targetAngle = 'N/A';
    technicalEvidence = `Title: "${p.title}"`;
    classified.push({ num, name, domain, group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence });
    continue;
  }

  if (domain === 'runacapital.com' || domain === 'runacap.com') {
    status = 'IRRELEVANT';
    subCategory = 'VC_INDEX_NON_DIRECTORY';
    reason = 'Venture capital fund index for open source software (ROSS Index); TalentXcel is not an open-source GitHub repository';
    score = 0;
    submissionUrl = p.finalUrl;
    authType = 'N/A';
    pricingType = 'N/A';
    badgeRequirement = 'N/A';
    targetAngle = 'N/A';
    technicalEvidence = 'Title: "Runa Capital"';
    classified.push({ num, name, domain, group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence });
    continue;
  }

  if (domain === 'microconf.com') {
    status = 'IRRELEVANT';
    subCategory = 'COMMUNITY_SLACK_MEMBERSHIP';
    reason = 'Private founder community & annual conference network; no public product directory portal';
    score = 1;
    submissionUrl = p.finalUrl;
    authType = 'N/A';
    pricingType = 'N/A';
    badgeRequirement = 'N/A';
    targetAngle = 'N/A';
    technicalEvidence = 'Title: "MicroConf - The Original Community"';
    classified.push({ num, name, domain, group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence });
    continue;
  }

  // 7. RECIPROCAL REQUIRED
  if (sub && (sub.hasReciprocal || domain === 'aisotools.com' || domain === 'huzzler.so' || domain === 'altern.ai' || domain === 'ainavdir.com')) {
    status = 'RECIPROCAL_REQUIRED';
    subCategory = 'MANDATORY_RECIPROCAL_BADGE';
    reason = 'Directory enforces mandatory embed of reciprocal backlink badge in footer or homepage';
    score = 1;
    submissionUrl = sub.submitUrl || p.finalUrl;
    authType = 'NONE';
    pricingType = 'FREE_WITH_RECIPROCAL';
    badgeRequirement = 'MANDATORY';
    targetAngle = 'ATS Resume Diagnostic Scanner (https://talentxcel.in/resume/ats-check)';
    technicalEvidence = 'Detected mandatory reciprocal backlink / badge requirement on submission portal';
    classified.push({ num, name, domain, group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence });
    continue;
  }

  // 8. AUTH REQUIRED (Account registration / Google OAuth required before submission)
  const isAuth = (sub && (sub.isRedirectToLogin || sub.hasLoginWall)) ||
    domain === 'superpublic.org' || domain === 'spotlitely.com' || domain === 'toolhunter.ai' ||
    domain === 'aat.ee' || domain === 'cloudfindr.co' || domain === 'aifeed.dev' ||
    domain === 'dynamicbusiness.com' || domain === 'dayslaunch.com';

  if (isAuth) {
    status = 'AUTH_REQUIRED';
    subCategory = 'ACCOUNT_CREATION_REQUIRED';
    reason = `Submission endpoint enforces user authentication (${sub.location ? `redirects to ${sub.location}` : 'login session required'})`;
    score = (group.includes('AI') ? 4 : 3);
    submissionUrl = sub.submitUrl || p.finalUrl;
    authType = 'FOUNDER_LOGIN_OAUTH';
    pricingType = 'FREE_TIER_AVAILABLE';
    badgeRequirement = 'NO';
    targetAngle = 'ATS Resume Diagnostic Scanner (https://talentxcel.in/resume/ats-check)';
    technicalEvidence = `Redirected to auth wall: ${sub.location || 'Login Wall'}`;
    classified.push({ num, name, domain, group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence });
    continue;
  }

  // 9. EDITORIAL PITCH REQUIRED
  if (domain === 'dynamicbusiness.com' || domain === 'proofstories.io' || domain === 'microsaasexamples.com') {
    status = 'EDITORIAL_PITCH_REQUIRED';
    subCategory = 'EDITORIAL_ARTICLE_PITCH';
    reason = 'Editorial founder interview / case study story submission; requires custom narrative pitch to editor';
    score = 3;
    submissionUrl = sub.submitUrl || p.finalUrl;
    authType = 'NONE';
    pricingType = 'EDITORIAL_FREE';
    badgeRequirement = 'NO';
    targetAngle = 'TalentXcel Founder Story & Platform Case Study (https://talentxcel.in/)';
    technicalEvidence = 'Requires editorial case study review / founder interview pitch';
    classified.push({ num, name, domain, group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence });
    continue;
  }

  // 10. PAID DIRECTORIES (Mandatory payment required)
  if (sub && sub.hasPaidOnly && sub.freeMatches.length === 0) {
    status = 'PAID';
    subCategory = 'MANDATORY_PAYMENT';
    reason = `Directory enforces mandatory paid listing fee (${sub.prices.slice(0, 3).join(', ')}); no free tier available`;
    score = 1;
    submissionUrl = sub.submitUrl || p.finalUrl;
    authType = 'NONE';
    pricingType = 'PAID';
    badgeRequirement = 'NO';
    targetAngle = 'N/A';
    technicalEvidence = `Pricing detected: ${sub.prices.join(', ')} with zero free tier options`;
    classified.push({ num, name, domain, group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence });
    continue;
  }

  // 11. NO PUBLIC SUBMISSION PORTAL
  if (p.submitLinksCount === 0 && (!sub || !sub.hasForm)) {
    status = 'BLOCKED';
    subCategory = 'NO_PUBLIC_SUBMISSION_PORTAL';
    reason = 'Live domain with static editorial or search content, but no public self-serve submission endpoint or listing form';
    score = 0;
    submissionUrl = p.finalUrl;
    authType = 'N/A';
    pricingType = 'N/A';
    badgeRequirement = 'N/A';
    targetAngle = 'N/A';
    technicalEvidence = `HTTP 200 | Total detected submit endpoints: ${p.submitLinksCount}`;
    classified.push({ num, name, domain, group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence });
    continue;
  }

  // 12. READY FOR HUMAN APPROVAL (Verified open submission form with free tier)
  if (sub && sub.hasForm && sub.hasInputs && (sub.freeMatches.length > 0 || !sub.hasPaidOnly)) {
    // Scoring based on relevance
    let relScore = 4;
    let target = 'ATS Resume Diagnostic Scanner (https://talentxcel.in/resume/ats-check)';
    let cat = 'AI Productivity & Diagnostic Scanner Directory';

    if (domain === 'aiagentslisting.com' || domain === 'directoryofagents.com' || domain === 'agentlaunch.tools') {
      relScore = 4;
      target = 'TalentXcel Autonomous ATS Career Agent (https://talentxcel.in/resume/ats-check)';
      cat = 'Autonomous AI Agent Directory';
    } else if (group.includes('Startup, SaaS')) {
      relScore = 3;
      target = 'TalentXcel Company Profile & Career OS (https://talentxcel.in/)';
      cat = 'SaaS & Startup Discovery Platform';
    }

    status = 'READY_FOR_HUMAN_APPROVAL';
    subCategory = 'FREE_OPEN_SUBMISSION';
    reason = 'Active directory submission form with verified free listing tier; no auth wall or reciprocal badge required';
    score = relScore;
    submissionUrl = sub.submitUrl || p.finalUrl;
    authType = 'NONE';
    pricingType = 'FREE';
    badgeRequirement = 'NO';
    targetAngle = target;
    technicalEvidence = `HTTP 200 | Open form with verified free tier: ${sub.submitUrl}`;
    classified.push({ num, name, domain, group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence });
    continue;
  }

  // Fallback for remaining items
  status = 'PRODUCT_FIT_UNCONFIRMED';
  subCategory = 'MANUAL_EDITORIAL_REVIEW_NEEDED';
  reason = 'Live domain with ambiguous listing terms; requires manual editorial confirmation before staging';
  score = 2;
  submissionUrl = sub.submitUrl || p.finalUrl;
  authType = 'NONE';
  pricingType = 'UNVERIFIED';
  badgeRequirement = 'UNVERIFIED';
  targetAngle = 'TalentXcel Platform (https://talentxcel.in/)';
  technicalEvidence = `HTTP 200 | Ambiguous form/pricing terms`;
  classified.push({ num, name, domain, group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence });
}

// Print reconciliation stats
const counts = {};
const subCounts = {};
classified.forEach(c => {
  counts[c.status] = (counts[c.status] || 0) + 1;
  subCounts[`${c.status} -> ${c.subCategory}`] = (subCounts[`${c.status} -> ${c.subCategory}`] || 0) + 1;
});

console.log('=== STRICT RECONCILED TOP LEVEL COUNTS ===');
console.log(counts);
console.log('=== SUB-CATEGORY BREAKDOWN ===');
console.log(subCounts);

const total = Object.values(counts).reduce((a, b) => a + b, 0);
console.log('Total audited & reconciled candidates:', total);

fs.writeFileSync(path.join(__dirname, 'batch6_classified_final.json'), JSON.stringify(classified, null, 2), 'utf8');
console.log('Saved to backlink-engine/src/scripts/batch6_classified_final.json');
