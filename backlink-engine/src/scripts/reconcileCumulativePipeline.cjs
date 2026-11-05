// backlink-engine/src/scripts/reconcileCumulativePipeline.cjs
const fs = require('fs');
const path = require('path');

// Public Suffix List logic for registrable domain extraction
function extractRegistrableRootDomain(input) {
  if (!input) return { registrableDomain: 'UNVERIFIED', isSubdomain: false, isSharedHosting: false, hostPrefix: '' };
  
  let clean = input.toLowerCase().trim();
  clean = clean.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '');
  clean = clean.split('/')[0].split(':')[0];

  // Shared hosting platforms on Public Suffix List
  if (clean.endsWith('.pages.dev')) {
    const parts = clean.split('.');
    return {
      registrableDomain: 'pages.dev',
      isSubdomain: true,
      isSharedHosting: true,
      hostPrefix: parts.slice(0, -2).join('.')
    };
  }

  if (clean.endsWith('.vercel.app')) {
    const parts = clean.split('.');
    return {
      registrableDomain: 'vercel.app',
      isSubdomain: true,
      isSharedHosting: true,
      hostPrefix: parts.slice(0, -2).join('.')
    };
  }

  // Multi-part TLDs
  const multiPartTlds = ['.co.uk', '.com.au', '.co.in', '.ac.in', '.org.uk', '.org.in', '.net.in', '.gen.in'];
  for (const tld of multiPartTlds) {
    if (clean.endsWith(tld)) {
      const remainder = clean.slice(0, -tld.length);
      const parts = remainder.split('.');
      const sld = parts[parts.length - 1];
      const registrableDomain = `${sld}${tld}`;
      const isSubdomain = parts.length > 1;
      const hostPrefix = isSubdomain ? parts.slice(0, -1).join('.') : '';
      return { registrableDomain, isSubdomain, isSharedHosting: false, hostPrefix };
    }
  }

  // Standard TLDs
  const parts = clean.split('.');
  if (parts.length >= 2) {
    const registrableDomain = parts.slice(-2).join('.');
    const isSubdomain = parts.length > 2;
    const hostPrefix = isSubdomain ? parts.slice(0, -2).join('.') : '';
    return { registrableDomain, isSubdomain, isSharedHosting: false, hostPrefix };
  }

  return { registrableDomain: clean, isSubdomain: false, isSharedHosting: false, hostPrefix: '' };
}

// Load Batch 6 data
const b6Raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch6_probe_resolved.json'), 'utf8'));
const b6SubmitAudit = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch6_submit_endpoints_audit.json'), 'utf8'));
const submitMap = new Map();
b6SubmitAudit.forEach(s => submitMap.set(s.num, s));

const phase4 = JSON.parse(fs.readFileSync(path.join(__dirname, 'phase4_classification_breakdown.json'), 'utf8'));
const fullyReadySet = new Set(phase4.fullyVerifiedReady.map(x => x.num));
const pendingTermsSet = new Set(phase4.pendingTerms.map(x => x.num));
const reauditBlockedSet = new Set(phase4.blockedOrPaid.map(x => x.num));

// Correct each Batch 6 record
const b6Corrected = b6Raw.map(item => {
  const num = item.num;
  const name = item.name;
  const inputDomain = item.inputDomain;
  const p = item.probe || {};
  const sub = submitMap.get(num) || {};
  const rDomain = extractRegistrableRootDomain(inputDomain);

  let status = '';
  let subCategory = '';
  let reason = '';
  let score = 0;
  let submissionUrl = sub.submitUrl || p.finalUrl || '';
  let authType = 'NONE';
  let pricingType = 'FREE';
  let badgeRequirement = 'NO';
  let targetAngle = 'ATS Resume Diagnostic Scanner (https://talentxcel.in/resume/ats-check)';
  let technicalEvidence = '';

  // Specific anomaly corrections:
  // 1. Candidate #23 AI Tools Masters (aitoolsmasters.com)
  if (num === 23) {
    status = 'BLOCKED';
    subCategory = 'DOMAIN_HIJACKED_SPAM';
    reason = 'Candidate #23 input aitoolsmasters.com redirects via HTTP 301 to https://7parabian.com/ (Online Slot777 gambling affiliate page: "KUE68 : Login Resmi Slot777")';
    score = 0;
    submissionUrl = 'https://7parabian.com/';
    authType = 'N/A';
    pricingType = 'N/A';
    badgeRequirement = 'N/A';
    targetAngle = 'N/A';
    technicalEvidence = 'HTTP 301 redirect to 7parabian.com (Online Slot Gambling)';
    return {
      num, name, inputDomain, canonicalRoot: rDomain.registrableDomain, finalUrl: p.finalUrl || '',
      isSubdomain: rDomain.isSubdomain, isSharedHosting: rDomain.isSharedHosting, hostPrefix: rDomain.hostPrefix,
      group: item.group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence
    };
  }

  // 2. Candidate #181 Indie Page (indiepage.com)
  if (num === 181) {
    status = 'BLOCKED';
    subCategory = 'DOMAIN_PARKED_EXPIRED';
    reason = 'Candidate #181 input indiepage.com redirects to https://www.hugedomains.com/domain_profile.cfm?d=indiepage.com ("IndiePage.com is for sale")';
    score = 0;
    submissionUrl = 'https://www.hugedomains.com/';
    authType = 'N/A';
    pricingType = 'N/A';
    badgeRequirement = 'N/A';
    targetAngle = 'N/A';
    technicalEvidence = 'HTTP 302 redirect to HugeDomains sale parking';
    return {
      num, name, inputDomain, canonicalRoot: rDomain.registrableDomain, finalUrl: p.finalUrl || '',
      isSubdomain: rDomain.isSubdomain, isSharedHosting: rDomain.isSharedHosting, hostPrefix: rDomain.hostPrefix,
      group: item.group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence
    };
  }

  // 3. Historical Duplicate Check
  if (item.isDuplicate) {
    status = 'DUPLICATE';
    subCategory = 'HISTORICAL_DATABASE_DUPLICATE';
    reason = `Already present in database: ${item.duplicateSource}`;
    score = 0;
    submissionUrl = '';
    authType = 'N/A';
    pricingType = 'N/A';
    badgeRequirement = 'N/A';
    targetAngle = 'N/A';
    technicalEvidence = `Deduplicated against ${item.duplicateSource}`;
    return {
      num, name, inputDomain, canonicalRoot: rDomain.registrableDomain, finalUrl: p.finalUrl || '',
      isSubdomain: rDomain.isSubdomain, isSharedHosting: rDomain.isSharedHosting, hostPrefix: rDomain.hostPrefix,
      group: item.group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence
    };
  }

  // 4. Network / DNS / SSL errors
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
    return {
      num, name, inputDomain, canonicalRoot: rDomain.registrableDomain, finalUrl: p.finalUrl || '',
      isSubdomain: rDomain.isSubdomain, isSharedHosting: rDomain.isSharedHosting, hostPrefix: rDomain.hostPrefix,
      group: item.group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence
    };
  }

  // 5. Cloudflare WAF / 403 / 429
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
    return {
      num, name, inputDomain, canonicalRoot: rDomain.registrableDomain, finalUrl: p.finalUrl || '',
      isSubdomain: rDomain.isSubdomain, isSharedHosting: rDomain.isSharedHosting, hostPrefix: rDomain.hostPrefix,
      group: item.group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence
    };
  }

  // 6. Server Errors (500+)
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
    return {
      num, name, inputDomain, canonicalRoot: rDomain.registrableDomain, finalUrl: p.finalUrl || '',
      isSubdomain: rDomain.isSubdomain, isSharedHosting: rDomain.isSharedHosting, hostPrefix: rDomain.hostPrefix,
      group: item.group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence
    };
  }

  // 7. Re-audit blocked (404 on submit endpoint: #14, #28, #175)
  if (reauditBlockedSet.has(num) || (sub && sub.statusCode === 404)) {
    status = 'BLOCKED';
    subCategory = 'NO_PUBLIC_SUBMISSION_PORTAL';
    reason = `Submission endpoint returned HTTP 404 Not Found (${sub.submitUrl || p.finalUrl})`;
    score = 0;
    submissionUrl = sub.submitUrl || p.finalUrl;
    authType = 'N/A';
    pricingType = 'N/A';
    badgeRequirement = 'N/A';
    targetAngle = 'N/A';
    technicalEvidence = `HTTP 404 on submit route: ${sub.submitUrl}`;
    return {
      num, name, inputDomain, canonicalRoot: rDomain.registrableDomain, finalUrl: p.finalUrl || '',
      isSubdomain: rDomain.isSubdomain, isSharedHosting: rDomain.isSharedHosting, hostPrefix: rDomain.hostPrefix,
      group: item.group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence
    };
  }

  // 8. Irrelevant Non-Directory Sites
  if (rDomain.registrableDomain === 'spoke.com' || rDomain.registrableDomain === 'wavel.ai' || rDomain.registrableDomain === 'devhub.com') {
    status = 'IRRELEVANT';
    subCategory = 'SINGLE_SAAS_NON_DIRECTORY';
    reason = 'Single SaaS product company; not a software directory';
    score = 0;
    submissionUrl = p.finalUrl;
    authType = 'N/A';
    pricingType = 'N/A';
    badgeRequirement = 'N/A';
    targetAngle = 'N/A';
    technicalEvidence = `Title: "${p.title}"`;
    return {
      num, name, inputDomain, canonicalRoot: rDomain.registrableDomain, finalUrl: p.finalUrl || '',
      isSubdomain: rDomain.isSubdomain, isSharedHosting: rDomain.isSharedHosting, hostPrefix: rDomain.hostPrefix,
      group: item.group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence
    };
  }

  if (rDomain.registrableDomain === 'curated.design' || rDomain.registrableDomain === 'saaslandingpage.com') {
    status = 'IRRELEVANT';
    subCategory = 'DESIGN_GALLERY_ONLY';
    reason = 'Design screenshot gallery showcasing visual UI screenshots; not an ATS/SaaS functional product directory';
    score = 1;
    submissionUrl = p.finalUrl;
    authType = 'N/A';
    pricingType = 'N/A';
    badgeRequirement = 'N/A';
    targetAngle = 'N/A';
    technicalEvidence = `Title: "${p.title}"`;
    return {
      num, name, inputDomain, canonicalRoot: rDomain.registrableDomain, finalUrl: p.finalUrl || '',
      isSubdomain: rDomain.isSubdomain, isSharedHosting: rDomain.isSharedHosting, hostPrefix: rDomain.hostPrefix,
      group: item.group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence
    };
  }

  if (rDomain.registrableDomain === 'runacapital.com' || rDomain.registrableDomain === 'runacap.com') {
    status = 'IRRELEVANT';
    subCategory = 'VC_INDEX_NON_DIRECTORY';
    reason = 'Venture capital index specifically tracking open source GitHub repositories; TalentXcel is not open source';
    score = 0;
    submissionUrl = p.finalUrl;
    authType = 'N/A';
    pricingType = 'N/A';
    badgeRequirement = 'N/A';
    targetAngle = 'N/A';
    technicalEvidence = 'Title: "Runa Capital"';
    return {
      num, name, inputDomain, canonicalRoot: rDomain.registrableDomain, finalUrl: p.finalUrl || '',
      isSubdomain: rDomain.isSubdomain, isSharedHosting: rDomain.isSharedHosting, hostPrefix: rDomain.hostPrefix,
      group: item.group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence
    };
  }

  if (rDomain.registrableDomain === 'microconf.com') {
    status = 'IRRELEVANT';
    subCategory = 'COMMUNITY_SLACK_MEMBERSHIP';
    reason = 'Private founder community & conference network; no public product directory listing route';
    score = 1;
    submissionUrl = p.finalUrl;
    authType = 'N/A';
    pricingType = 'N/A';
    badgeRequirement = 'N/A';
    targetAngle = 'N/A';
    technicalEvidence = 'Title: "MicroConf - The Original Community"';
    return {
      num, name, inputDomain, canonicalRoot: rDomain.registrableDomain, finalUrl: p.finalUrl || '',
      isSubdomain: rDomain.isSubdomain, isSharedHosting: rDomain.isSharedHosting, hostPrefix: rDomain.hostPrefix,
      group: item.group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence
    };
  }

  // 9. Reciprocal Required
  if (sub && (sub.hasReciprocal || rDomain.registrableDomain === 'aisotools.com' || rDomain.registrableDomain === 'huzzler.so' || rDomain.registrableDomain === 'altern.ai' || rDomain.registrableDomain === 'ainavdir.com')) {
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
    return {
      num, name, inputDomain, canonicalRoot: rDomain.registrableDomain, finalUrl: p.finalUrl || '',
      isSubdomain: rDomain.isSubdomain, isSharedHosting: rDomain.isSharedHosting, hostPrefix: rDomain.hostPrefix,
      group: item.group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence
    };
  }

  // 10. Auth Required (Account registration / Google OAuth)
  const isAuth = (sub && (sub.isRedirectToLogin || sub.hasLoginWall)) ||
    rDomain.registrableDomain === 'superpublic.org' || rDomain.registrableDomain === 'spotlitely.com' || rDomain.registrableDomain === 'toolhunter.ai' ||
    rDomain.registrableDomain === 'aat.ee' || rDomain.registrableDomain === 'cloudfindr.co' || rDomain.registrableDomain === 'aifeed.dev' ||
    rDomain.registrableDomain === 'dayslaunch.com';

  if (isAuth) {
    status = 'AUTH_REQUIRED';
    subCategory = 'ACCOUNT_CREATION_REQUIRED';
    reason = `Submission endpoint enforces user authentication (${sub.location ? `redirects to ${sub.location}` : 'login session required'})`;
    score = 3;
    submissionUrl = sub.submitUrl || p.finalUrl;
    authType = 'FOUNDER_LOGIN_OAUTH';
    pricingType = 'FREE_TIER_AVAILABLE';
    badgeRequirement = 'NO';
    targetAngle = 'ATS Resume Diagnostic Scanner (https://talentxcel.in/resume/ats-check)';
    technicalEvidence = `Redirected to auth wall: ${sub.location || 'Login Wall'}`;
    return {
      num, name, inputDomain, canonicalRoot: rDomain.registrableDomain, finalUrl: p.finalUrl || '',
      isSubdomain: rDomain.isSubdomain, isSharedHosting: rDomain.isSharedHosting, hostPrefix: rDomain.hostPrefix,
      group: item.group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence
    };
  }

  // 11. Editorial Pitch Required
  if (rDomain.registrableDomain === 'dynamicbusiness.com' || rDomain.registrableDomain === 'proofstories.io' || rDomain.registrableDomain === 'microsaasexamples.com') {
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
    return {
      num, name, inputDomain, canonicalRoot: rDomain.registrableDomain, finalUrl: p.finalUrl || '',
      isSubdomain: rDomain.isSubdomain, isSharedHosting: rDomain.isSharedHosting, hostPrefix: rDomain.hostPrefix,
      group: item.group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence
    };
  }

  // 12. Paid Directories
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
    return {
      num, name, inputDomain, canonicalRoot: rDomain.registrableDomain, finalUrl: p.finalUrl || '',
      isSubdomain: rDomain.isSubdomain, isSharedHosting: rDomain.isSharedHosting, hostPrefix: rDomain.hostPrefix,
      group: item.group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence
    };
  }

  // 13. Blocked: No public submission portal
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
    return {
      num, name, inputDomain, canonicalRoot: rDomain.registrableDomain, finalUrl: p.finalUrl || '',
      isSubdomain: rDomain.isSubdomain, isSharedHosting: rDomain.isSharedHosting, hostPrefix: rDomain.hostPrefix,
      group: item.group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence
    };
  }

  // 14. Phase 4 Rigorous Classification:
  // If in fullyReadySet -> READY_FOR_HUMAN_APPROVAL
  if (fullyReadySet.has(num)) {
    status = 'READY_FOR_HUMAN_APPROVAL';
    subCategory = 'FREE_OPEN_SUBMISSION';
    reason = 'Active directory submission form (HTTP 200) with complete inputs, explicit free tier verified, no auth wall, and zero reciprocal badges';
    score = 4;
    submissionUrl = sub.submitUrl || p.finalUrl;
    authType = 'NONE';
    pricingType = 'FREE';
    badgeRequirement = 'NO';
    targetAngle = 'ATS Resume Diagnostic Scanner (https://talentxcel.in/resume/ats-check)';
    technicalEvidence = `HTTP 200 | Complete open form with verified free tier: ${submissionUrl}`;
    return {
      num, name, inputDomain, canonicalRoot: rDomain.registrableDomain, finalUrl: p.finalUrl || '',
      isSubdomain: rDomain.isSubdomain, isSharedHosting: rDomain.isSharedHosting, hostPrefix: rDomain.hostPrefix,
      group: item.group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence
    };
  }

  // 15. If in pendingTermsSet -> FORM_ACCESS_VERIFIED_PENDING_TERMS_AND_ELIGIBILITY
  if (pendingTermsSet.has(num)) {
    status = 'FORM_ACCESS_VERIFIED_PENDING_TERMS_AND_ELIGIBILITY';
    subCategory = 'FORM_VERIFIED_TERMS_PENDING';
    reason = 'Submission form access verified (HTTP 200), but explicit free tier or field semantic terms require human confirmation before staging';
    score = 3;
    submissionUrl = sub.submitUrl || p.finalUrl;
    authType = 'NONE';
    pricingType = 'UNVERIFIED_PENDING_REVIEW';
    badgeRequirement = 'NO_MANDATORY_BADGE_DETECTED';
    targetAngle = 'ATS Resume Diagnostic Scanner (https://talentxcel.in/resume/ats-check)';
    technicalEvidence = `HTTP 200 | Form access verified, terms pending review: ${submissionUrl}`;
    return {
      num, name, inputDomain, canonicalRoot: rDomain.registrableDomain, finalUrl: p.finalUrl || '',
      isSubdomain: rDomain.isSubdomain, isSharedHosting: rDomain.isSharedHosting, hostPrefix: rDomain.hostPrefix,
      group: item.group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence
    };
  }

  // Fallback
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
  return {
    num, name, inputDomain, canonicalRoot: rDomain.registrableDomain, finalUrl: p.finalUrl || '',
    isSubdomain: rDomain.isSubdomain, isSharedHosting: rDomain.isSharedHosting, hostPrefix: rDomain.hostPrefix,
    group: item.group, status, subCategory, score, reason, submissionUrl, authType, pricingType, badgeRequirement, targetAngle, technicalEvidence
  };
});

// Category counts
const counts = {};
b6Corrected.forEach(c => {
  counts[c.status] = (counts[c.status] || 0) + 1;
});

console.log('=== REMEDIATED BATCH 6 TOP-LEVEL COUNTS ===');
console.log(counts);
const totalReconciled = Object.values(counts).reduce((a, b) => a + b, 0);
console.log('Total verified:', totalReconciled);

fs.writeFileSync(path.join(__dirname, 'batch6_remediated_records.json'), JSON.stringify(b6Corrected, null, 2), 'utf8');
console.log('Saved to batch6_remediated_records.json');
