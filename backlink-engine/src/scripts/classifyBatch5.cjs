const fs = require('fs');
const path = require('path');

const probeResults = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch5_probe_results.json'), 'utf8'));
const deepResults = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch5_deep_results.json'), 'utf8'));
const deepMap = new Map();
deepResults.forEach(d => deepMap.set(d.num, d));

const classifications = [];

for (const item of probeResults) {
  const num = item.num;
  const name = item.name;
  const domain = item.canonicalRoot;
  const group = item.group;
  const p = item.probe || {};
  const deep = deepMap.get(num);

  let status = '';
  let subCategory = '';
  let reason = '';
  let submissionUrl = '';
  let authRequirement = 'NONE';
  let pricingRequirement = 'FREE';
  let badgeRequirement = 'NO';
  let targetAngle = 'ATS Resume Diagnostic Scanner (https://talentxcel.in/resume/ats-check)';

  // 1. DUPLICATE CHECK
  if (item.isDuplicate) {
    status = 'DUPLICATE';
    subCategory = 'HISTORICAL_DATABASE_DUPLICATE';
    reason = `Already present in database as ${item.duplicateSource} (${domain})`;
    classifications.push({
      num, name, domain, group, status, subCategory, reason, submissionUrl: '', authRequirement: 'N/A', pricingRequirement: 'N/A', badgeRequirement: 'N/A', targetAngle: 'N/A'
    });
    continue;
  }

  // 2. NETWORK / DNS / TIMEOUT / SSL BLOCKS
  if (p.status === 0) {
    status = 'BLOCKED';
    subCategory = 'NETWORK_DNS_SSL_ERROR';
    reason = `Connection failed: ${p.error}`;
    classifications.push({
      num, name, domain, group, status, subCategory, reason, submissionUrl: '', authRequirement: 'N/A', pricingRequirement: 'N/A', badgeRequirement: 'N/A', targetAngle: 'N/A'
    });
    continue;
  }

  // 3. WAF / BOT BLOCKS / RATE LIMITS
  if (p.status === 403 || p.status === 429) {
    status = 'BLOCKED';
    subCategory = p.status === 403 ? 'WAF_CLOUDFLARE_BLOCKED' : 'RATE_LIMITED_429';
    reason = `HTTP ${p.status} - Access blocked by security challenge / rate limit: ${p.title || 'Security Block'}`;
    classifications.push({
      num, name, domain, group, status, subCategory, reason, submissionUrl: '', authRequirement: 'N/A', pricingRequirement: 'N/A', badgeRequirement: 'N/A', targetAngle: 'N/A'
    });
    continue;
  }

  // 4. SERVER ERRORS (500+)
  if (p.status >= 500) {
    status = 'BLOCKED';
    subCategory = 'SERVER_ERROR_5XX';
    reason = `HTTP ${p.status} server error (${p.title || 'Internal Server Error'})`;
    classifications.push({
      num, name, domain, group, status, subCategory, reason, submissionUrl: '', authRequirement: 'N/A', pricingRequirement: 'N/A', badgeRequirement: 'N/A', targetAngle: 'N/A'
    });
    continue;
  }

  // 5. PARKED / HIJACKED / SPAM / ADULT / GAMBLING
  const titleLower = (p.title || '').toLowerCase();
  const finalUrl = (p.finalUrl || '').toLowerCase();
  const snippet = (p.cleanTextSnippet || '').toLowerCase();

  const isParked = finalUrl.includes('ww38.') || finalUrl.includes('ww1.') || finalUrl.includes('ww25.') ||
    titleLower.includes('domain is for sale') || titleLower.includes('buy this domain') ||
    titleLower.includes('parked') || snippet.includes('buy this domain');

  const isSpamOrHijacked = titleLower.includes('man fucking') || titleLower.includes('horny') ||
    titleLower.includes('rupiah89') || titleLower.includes('vavada casino') ||
    titleLower.includes('pkv qq') || titleLower.includes('poker online') ||
    snippet.includes('slot gacor') || snippet.includes('judi online');

  if (isParked || isSpamOrHijacked) {
    status = 'BLOCKED';
    subCategory = isParked ? 'DOMAIN_PARKED_EXPIRED' : 'DOMAIN_HIJACKED_SPAM';
    reason = isParked ? `Domain is parked / for sale (${p.finalUrl})` : `Domain hijacked with adult/gambling spam ("${p.title}")`;
    classifications.push({
      num, name, domain, group, status, subCategory, reason, submissionUrl: '', authRequirement: 'N/A', pricingRequirement: 'N/A', badgeRequirement: 'N/A', targetAngle: 'N/A'
    });
    continue;
  }

  // 6. IRRELEVANT (Non-directory / Agency / Coupon)
  if (deep && deep.isIrrelevant) {
    status = 'IRRELEVANT';
    subCategory = 'NON_DIRECTORY_ENTITY';
    reason = deep.irrelevancyReason;
    classifications.push({
      num, name, domain, group, status, subCategory, reason, submissionUrl: '', authRequirement: 'N/A', pricingRequirement: 'N/A', badgeRequirement: 'N/A', targetAngle: 'N/A'
    });
    continue;
  }

  // Check additional irrelevancy based on title / content:
  // e.g. dessign.net is a WordPress themes site
  if (domain === 'dessign.net') {
    status = 'IRRELEVANT';
    subCategory = 'NON_DIRECTORY_ENTITY';
    reason = 'WordPress theme and design portfolio site; not an AI/software tool directory';
    classifications.push({
      num, name, domain, group, status, subCategory, reason, submissionUrl: '', authRequirement: 'N/A', pricingRequirement: 'N/A', badgeRequirement: 'N/A', targetAngle: 'N/A'
    });
    continue;
  }

  if (domain === 'apps400.com' || domain === 'apprater.net' || domain === 'appiod.com' || domain === 'appslisto.com' || domain === 'appsmamma.com' || domain === 'appsmirror.com' || domain === 'appscribed.com' || domain === 'direct2app.com') {
    // Mobile app review sites (iOS / Android IPA/APK app review blogs)
    status = 'IRRELEVANT';
    subCategory = 'MOBILE_APP_STORE_ONLY';
    reason = 'Mobile app (iOS App Store / Google Play) review blog; requires native mobile application package, not web SaaS/ATS platform';
    classifications.push({
      num, name, domain, group, status, subCategory, reason, submissionUrl: '', authRequirement: 'N/A', pricingRequirement: 'N/A', badgeRequirement: 'N/A', targetAngle: 'N/A'
    });
    continue;
  }

  // Check submit page analysis if present
  const sub = deep ? deep.submitPageAnalysis : null;
  submissionUrl = sub && sub.submitUrl ? sub.submitUrl : (p.sampleSubmitLink || p.finalUrl);

  // Check for Reciprocal Badge requirement
  if (sub && sub.hasReciprocal) {
    status = 'RECIPROCAL_REQUIRED';
    subCategory = 'MANDATORY_RECIPROCAL_BADGE';
    reason = 'Directory requires reciprocal badge / backlink embed in footer or homepage';
    badgeRequirement = 'MANDATORY';
    classifications.push({
      num, name, domain, group, status, subCategory, reason, submissionUrl, authRequirement: 'NONE', pricingRequirement: 'FREE_WITH_RECIPROCAL', badgeRequirement, targetAngle
    });
    continue;
  }

  // Check for Paid Only
  if (sub && sub.hasPaidOnly && !sub.hasFreeMention) {
    status = 'PAID';
    subCategory = 'MANDATORY_PAYMENT';
    reason = 'Directory requires paid submission or sponsored placement; no free tier available';
    pricingRequirement = 'PAID';
    classifications.push({
      num, name, domain, group, status, subCategory, reason, submissionUrl, authRequirement: 'NONE', pricingRequirement, badgeRequirement: 'NO', targetAngle
    });
    continue;
  }

  // Check for Auth Required
  if (sub && sub.hasLogin && !sub.hasForm) {
    status = 'AUTH_REQUIRED';
    subCategory = 'ACCOUNT_CREATION_REQUIRED';
    reason = 'Requires user/founder account creation or Google OAuth before accessing submission form';
    authRequirement = 'OAUTH_OR_EMAIL_LOGIN';
    classifications.push({
      num, name, domain, group, status, subCategory, reason, submissionUrl, authRequirement, pricingRequirement: 'FREE_TIER_AVAILABLE', badgeRequirement: 'NO', targetAngle
    });
    continue;
  }

  // Check if no submission link or form exists at all
  if (p.submitLinksCount === 0 && (!sub || !sub.hasForm)) {
    // Site is live but has no self-serve submission portal
    status = 'BLOCKED';
    subCategory = 'NO_PUBLIC_SUBMISSION_PORTAL';
    reason = 'Live domain with editorial content but no public self-serve submission endpoint or contact directory form';
    classifications.push({
      num, name, domain, group, status, subCategory, reason, submissionUrl: p.finalUrl, authRequirement: 'N/A', pricingRequirement: 'N/A', badgeRequirement: 'N/A', targetAngle: 'N/A'
    });
    continue;
  }

  // If auth is required along with form
  if (sub && sub.hasLogin && sub.hasForm) {
    status = 'AUTH_REQUIRED';
    subCategory = 'ACCOUNT_CREATION_REQUIRED';
    reason = 'Submission form requires login session / user authentication to submit';
    authRequirement = 'LOGIN_REQUIRED';
    classifications.push({
      num, name, domain, group, status, subCategory, reason, submissionUrl, authRequirement, pricingRequirement: 'FREE_TIER_AVAILABLE', badgeRequirement: 'NO', targetAngle
    });
    continue;
  }

  // Otherwise, READY_FOR_HUMAN_APPROVAL
  status = 'READY_FOR_HUMAN_APPROVAL';
  subCategory = 'FREE_OPEN_SUBMISSION';
  reason = 'Live directory with active submission form/endpoint, verified free tier option, compatible with TalentXcel ATS diagnostic';
  classifications.push({
    num, name, domain, group, status, subCategory, reason, submissionUrl, authRequirement: 'NONE', pricingRequirement: 'FREE', badgeRequirement: 'NO', targetAngle
  });
}

console.log('=== CLASSIFICATION SUMMARY ===');
const counts = {};
const subCounts = {};
classifications.forEach(c => {
  counts[c.status] = (counts[c.status] || 0) + 1;
  subCounts[`${c.status} -> ${c.subCategory}`] = (subCounts[`${c.status} -> ${c.subCategory}`] || 0) + 1;
});

console.log('Top level counts:', counts);
console.log('Subcategory counts:', subCounts);

let total = 0;
for (const k in counts) total += counts[k];
console.log('Total verified:', total);

fs.writeFileSync(path.join(__dirname, 'batch5_classified.json'), JSON.stringify(classifications, null, 2));
