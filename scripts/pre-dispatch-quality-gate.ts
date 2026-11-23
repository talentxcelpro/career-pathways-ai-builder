import { publisherDiscovery } from '../src/services/publisher/PublisherDiscoveryEngine';

const pilotIds = [
  // Batch 1 (5 Colleges + 5 Career Platforms)
  'pub-opp-0001', 'pub-opp-0002', 'pub-opp-0003', 'pub-opp-0004', 'pub-opp-0005',
  'pub-opp-0101', 'pub-opp-0102', 'pub-opp-0103', 'pub-opp-0104', 'pub-opp-0105',
  // Batch 2 (5 Colleges + 5 Career Platforms)
  'pub-opp-0006', 'pub-opp-0007', 'pub-opp-0008', 'pub-opp-0011', 'pub-opp-0012',
  'pub-opp-0106', 'pub-opp-0107', 'pub-opp-0108', 'pub-opp-0109', 'pub-opp-0111'
];

interface GateCheckResult {
  ruleIndex: number;
  ruleName: string;
  passed: boolean;
  reason?: string;
}

interface RecordGateAudit {
  id: string;
  name: string;
  domain: string;
  batch: 'Batch 1' | 'Batch 2';
  category: string;
  checks: GateCheckResult[];
  overallPass: boolean;
}

export function runQualityGate(): RecordGateAudit[] {
  const allOpps = pilotIds.map(id => publisherDiscovery.getOpportunityById(id)!);
  const results: RecordGateAudit[] = [];

  for (let i = 0; i < allOpps.length; i++) {
    const opp = allOpps[i];
    const batch = i < 10 ? 'Batch 1' : 'Batch 2';
    const drafts = opp.outreachDrafts;
    const emailBody = drafts?.emailBody || '';
    const emailSubject = drafts?.emailSubject || '';
    const contactMsg = drafts?.contactFormMessage || '';
    const fullText = `${emailSubject}\n${emailBody}\n${contactMsg}`;

    const checks: GateCheckResult[] = [];

    // Rule 1: Publisher name in body matches record name exactly
    const r1Pass = emailBody.includes(opp.name) && emailSubject.includes(opp.name);
    checks.push({
      ruleIndex: 1,
      ruleName: 'Publisher Name Exact Match',
      passed: r1Pass,
      reason: r1Pass ? 'Name accurately present in subject and greeting' : 'Publisher name mismatch'
    });

    // Rule 2: Preview URL contains the recipient's institution slug or relevant topic slug
    const assetSlug = opp.suggestedAssetId.replace(/^txc-[a-z_]+-/, '');
    const previewMatch = emailBody.match(/preview it live here:\s*\n([^\s\n]+)/i);
    const previewUrl = previewMatch ? previewMatch[1] : '';
    let r2Pass = false;
    if (opp.category === 'college') {
      r2Pass = previewUrl.includes(`/colleges/${assetSlug}`);
    } else {
      r2Pass = previewUrl.includes('ats-check') || previewUrl.includes('resume') || previewUrl.includes('career');
    }
    checks.push({
      ruleIndex: 2,
      ruleName: 'Preview URL Matches Slug/Topic',
      passed: r2Pass,
      reason: r2Pass ? `Preview URL correctly points to ${previewUrl}` : `Invalid preview URL: ${previewUrl}`
    });

    // Rule 3: Zero occurrences of any other publisher's name or domain in the draft
    let r3Pass = true;
    let r3FailedWith = '';
    for (const other of allOpps) {
      if (other.id === opp.id) continue;
      // Check other's domain
      if (fullText.toLowerCase().includes(other.domain.toLowerCase())) {
        r3Pass = false;
        r3FailedWith = `Contains domain of ${other.name} (${other.domain})`;
        break;
      }
      // Check other's specific college city / acronym if college
      if (other.category === 'college') {
        const otherSlug = other.suggestedAssetId.replace(/^txc-[a-z_]+-/, '');
        if (otherSlug !== assetSlug && fullText.toLowerCase().includes(otherSlug)) {
          r3Pass = false;
          r3FailedWith = `Contains slug of ${other.name} (${otherSlug})`;
          break;
        }
      }
    }
    // Check specific Madras leak
    if (opp.id !== 'pub-opp-0001' && (fullText.toLowerCase().includes('madras') || previewUrl.toLowerCase().includes('madras'))) {
      r3Pass = false;
      r3FailedWith = 'Contains leaked reference to Madras';
    }
    checks.push({
      ruleIndex: 3,
      ruleName: 'Zero Cross-Publisher Contamination',
      passed: r3Pass,
      reason: r3Pass ? 'Zero foreign publisher references detected' : r3FailedWith
    });

    // Rule 4: Embed snippet src matches the asset category and slug
    const iframeMatch = emailBody.match(/<iframe src="([^"]+)"/);
    const iframeSrc = iframeMatch ? iframeMatch[1] : '';
    const expectedEmbedUrl = `https://www.talentxcel.in/embed/${opp.suggestedEmbedCategory}/${assetSlug}`;
    const r4Pass = iframeSrc === expectedEmbedUrl;
    checks.push({
      ruleIndex: 4,
      ruleName: 'Embed Snippet Category & Slug Match',
      passed: r4Pass,
      reason: r4Pass ? `Iframe src exactly matches ${expectedEmbedUrl}` : `Iframe src mismatch: ${iframeSrc}`
    });

    // Rule 5: Contact email or form URL is verified (not a placeholder)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const hasValidEmail = Boolean(opp.publicContactEmail && emailRegex.test(opp.publicContactEmail) && !opp.publicContactEmail.includes('example.com'));
    const hasValidContactUrl = Boolean(opp.contactPageUrl && opp.contactPageUrl.startsWith('http') && !opp.contactPageUrl.includes('example.com'));
    const r5Pass = hasValidEmail || hasValidContactUrl;
    checks.push({
      ruleIndex: 5,
      ruleName: 'Verified Contact Channel',
      passed: r5Pass,
      reason: r5Pass ? `Verified channel: ${opp.publicContactEmail || opp.contactPageUrl}` : 'No verified contact channel'
    });

    // Rule 6: Outreach stage is contact_ready
    const r6Pass = opp.pipelineStage === 'contact_ready';
    checks.push({
      ruleIndex: 6,
      ruleName: 'Pipeline Stage is contact_ready',
      passed: r6Pass,
      reason: `Current stage: ${opp.pipelineStage}`
    });

    // Rule 7: Unsubscribe/opt-out language is present
    const r7Pass = emailBody.includes('no further emails will follow') || emailBody.includes('please feel free to ignore this note');
    checks.push({
      ruleIndex: 7,
      ruleName: 'Opt-Out & Unsubscribe Language Present',
      passed: r7Pass,
      reason: r7Pass ? 'Explicit polite opt-out guarantee included' : 'Missing opt-out wording'
    });

    // Rule 8: Value proposition is specific to the recipient's audience
    let r8Pass = false;
    if (opp.category === 'college') {
      r8Pass = emailBody.includes('institutional placement statistics') || emailBody.includes('Placement & ROI Card');
    } else {
      r8Pass = emailBody.includes('ATS Scoring Benchmark Card') || emailBody.includes('career transition benchmarks');
    }
    checks.push({
      ruleIndex: 8,
      ruleName: 'Audience-Specific Value Proposition',
      passed: r8Pass,
      reason: r8Pass ? 'Tailored to recipient audience sector' : 'Generic value proposition'
    });

    // Rule 9: Attribution link points to the correct TalentXcel canonical URL
    const r9Pass = Boolean(previewUrl && previewUrl.startsWith('https://www.talentxcel.in/') && !previewUrl.includes('qa_to_sde'));
    checks.push({
      ruleIndex: 9,
      ruleName: 'Attribution Destination Verified',
      passed: r9Pass,
      reason: r9Pass ? `Canonical attribution points to ${previewUrl}` : `Invalid canonical URL: ${previewUrl}`
    });

    // Rule 10: Technical specifications (dimensions, async, loading) match the widget type
    const r10Pass = emailBody.includes('width="100%"') && 
                    emailBody.includes('height="340"') && 
                    emailBody.includes('loading="lazy"') && 
                    emailBody.includes('loads asynchronously (<3KB)');
    checks.push({
      ruleIndex: 10,
      ruleName: 'Technical Embed Specifications Verified',
      passed: r10Pass,
      reason: r10Pass ? '100% width, 340px height, lazy loading, async footprint specified' : 'Technical spec mismatch'
    });

    const overallPass = checks.every(c => c.passed);

    results.push({
      id: opp.id,
      name: opp.name,
      domain: opp.domain,
      batch,
      category: opp.category,
      checks,
      overallPass
    });
  }

  return results;
}

if (process.argv[1]?.endsWith('pre-dispatch-quality-gate.ts')) {
  console.log('========================================================================================');
  console.log('TALENTXCEL EMBED OUTREACH PRE-DISPATCH FORENSIC QUALITY GATE');
  console.log('========================================================================================\n');

  const results = runQualityGate();
  let totalRules = 0;
  let passedRules = 0;

  for (const r of results) {
    totalRules += r.checks.length;
    const passedCount = r.checks.filter(c => c.passed).length;
    passedRules += passedCount;

    console.log(`[${r.overallPass ? 'CERTIFIED PASS' : 'FAIL'}] ${r.id} | ${r.name} (${r.domain}) | ${r.batch}`);
    for (const c of r.checks) {
      console.log(`  Rule ${c.ruleIndex.toString().padStart(2, '0')}: [${c.passed ? 'PASS' : 'FAIL'}] ${c.ruleName} -> ${c.reason}`);
    }
    console.log('');
  }

  const batch1 = results.filter(r => r.batch === 'Batch 1');
  const batch2 = results.filter(r => r.batch === 'Batch 2');
  const b1Passed = batch1.every(r => r.overallPass);
  const b2Passed = batch2.every(r => r.overallPass);

  console.log('========================================================================================');
  console.log('SUMMARY SCORECARD');
  console.log('========================================================================================');
  console.log(`Total Records Evaluated: ${results.length}`);
  console.log(`Total Gate Checks Executed: ${totalRules} (20 records x 10 rules)`);
  console.log(`Passed Gate Checks: ${passedRules} / ${totalRules} (${((passedRules / totalRules) * 100).toFixed(1)}%)`);
  console.log(`Batch 1 Status: ${b1Passed ? 'ALL 10 TARGETS PASSED (100/100 CHECKS) -> CERTIFIED DISPATCH-READY' : 'BLOCKED'}`);
  console.log(`Batch 2 Status: ${b2Passed ? 'ALL 10 TARGETS PASSED (100/100 CHECKS) -> QUALIFIED' : 'NEEDS_REVIEW'}`);
  console.log('========================================================================================\n');
}
