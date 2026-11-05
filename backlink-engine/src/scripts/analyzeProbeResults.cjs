const fs = require('fs');
const path = require('path');

const probeResults = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch5_probe_results.json'), 'utf8'));

console.log('=== TOTAL PROBES:', probeResults.length);

const summary = {
  duplicate: [],
  network_error: [],
  waf_blocked: [],
  parked_or_spam: [],
  http_errors: [],
  live_200: []
};

for (const item of probeResults) {
  if (item.isDuplicate) {
    summary.duplicate.push(item);
    continue;
  }

  const p = item.probe;
  if (!p) {
    summary.network_error.push({ item, reason: 'No probe data' });
    continue;
  }

  if (p.status === 0) {
    summary.network_error.push({ item, reason: p.error });
    continue;
  }

  if (p.status === 403 || p.status === 429) {
    summary.waf_blocked.push({ item, status: p.status, reason: p.title || p.error });
    continue;
  }

  if (p.status >= 500) {
    summary.http_errors.push({ item, status: p.status, reason: p.title || p.error });
    continue;
  }

  // Check for parked domains, spam, adult, casino
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
    summary.parked_or_spam.push({ item, reason: isParked ? 'Domain parked / for sale' : 'Spam / adult / gambling hijack' });
    continue;
  }

  summary.live_200.push(item);
}

console.log('Breakdown:');
console.log('- Duplicate in DB:', summary.duplicate.length);
console.log('- Network/DNS/SSL errors (status 0):', summary.network_error.length);
console.log('- WAF / Bot blocked (403/429):', summary.waf_blocked.length);
console.log('- Server errors (500+):', summary.http_errors.length);
console.log('- Parked / Hijacked Spam:', summary.parked_or_spam.length);
console.log('- Remaining Candidates for directory/listing check:', summary.live_200.length);

fs.writeFileSync(path.join(__dirname, 'batch5_initial_breakdown.json'), JSON.stringify(summary, null, 2));
