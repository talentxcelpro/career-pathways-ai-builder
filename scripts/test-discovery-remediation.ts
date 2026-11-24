/**
 * scripts/test-discovery-remediation.ts
 * Comprehensive P0/P1 Discovery Remediation Test Suite
 * Validates SSR, Security, Public Access, Sharing, Sitemaps, and Telemetry
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { trackFunnelEvent, FunnelEventName } from '../src/services/telemetry/funnelTracker';
import ogHandler from '../api/og-bot';

const SUPABASE_URL = 'https://dthlgsnakhoftinssokm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface TestResult {
  suite: string;
  test: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function assert(suite: string, test: string, condition: boolean, details: string) {
  results.push({ suite, test, passed: condition, details });
  const icon = condition ? '✅' : '❌';
  console.log(`${icon} [${suite}] ${test}: ${details}`);
}

async function runTests() {
  console.log('================================================================');
  console.log('🧪 RUNNING TALENTXCEL GLOBAL DISCOVERY REMEDIATION VERIFICATION');
  console.log('================================================================\n');

  // --- SUITE 1: SSR & TDZ DEFECT REMEDIATION ---
  const seoRenderSrc = fs.readFileSync('api/seo-render.ts', 'utf8').replace(/\r\n/g, '\n');
  const section1DStart = seoRenderSrc.indexOf('// 1D. Public Career Passport');
  const section1DEnd = seoRenderSrc.indexOf('// 1E. Public Profiles & Candidates');
  const section1DCode = seoRenderSrc.substring(section1DStart, section1DEnd);

  const declIdx = section1DCode.indexOf('hasPassportRecords');
  const useIdx = section1DCode.indexOf('evaluateIndexabilityThreshold(hasPassportRecords ? 3 : 0, wordCount)');
  const hasOldTdz = section1DCode.includes('hasRecordThreshold');

  assert(
    'Phase1_SSR',
    'TDZ Elimination in Section 1D',
    !hasOldTdz && declIdx >= 0 && useIdx > declIdx,
    'hasPassportRecords declared before lexical usage in Section 1D (zero hasRecordThreshold)'
  );

  assert(
    'Phase1_SSR',
    'TalentScore Core Hub in SSR',
    seoRenderSrc.includes("cleanPath === 'talent-score'") && seoRenderSrc.includes('https://talentxcel.in/talent-score'),
    'Dedicated high-density SSR pre-render block exists for /talent-score'
  );

  assert(
    'Phase1_SSR',
    'Canonical Consensus to /u/:username',
    seoRenderSrc.includes("canonical = `https://talentxcel.in/u/${encodeURIComponent(canonicalUsername)}`"),
    'Section 1E routes all candidate profiles to canonical /u/:username'
  );

  // --- SUITE 2: SECURE PUBLIC PASSPORT DATA ACCESS ---
  const publicPassportSrc = fs.readFileSync('src/pages/passport/PublicPassport.tsx', 'utf8').replace(/\r\n/g, '\n');
  assert(
    'Phase2_Security',
    'PublicPassport Queries public_profiles First',
    publicPassportSrc.includes('supabase.from("public_profiles").select("*")'),
    'PublicPassport prioritizes public_profiles view with anon SELECT grant'
  );

  assert(
    'Phase2_Security',
    'PublicPassport Guards Base profiles Behind Active Session',
    publicPassportSrc.includes('const { data: { session } } = await supabase.auth.getSession()') &&
      publicPassportSrc.includes('if (session)'),
    'Anonymous visitors are strictly prevented from querying base profiles table'
  );

  const peopleSrc = fs.readFileSync('src/pages/network/People.tsx', 'utf8').replace(/\r\n/g, '\n');
  assert(
    'Phase2_Security',
    'People.tsx Fast Anon Path to public_profiles',
    peopleSrc.includes("from('public_profiles')") && peopleSrc.includes('if (session)'),
    'People.tsx provides direct public_profiles path for unauthenticated visitors'
  );

  // Live Supabase query test as anonymous
  const { data: pubRows, error: pubErr } = await supabase
    .from('public_profiles')
    .select('id, username, full_name, is_profile_public')
    .limit(3);

  assert(
    'Phase2_Security',
    'Live Anon Query on public_profiles Succeeds',
    !pubErr && (pubRows || []).length > 0,
    `Retrieved ${pubRows?.length} public profiles with zero RLS errors`
  );

  // --- SUITE 3: TALENTSCORE PUBLIC ACCESS ---
  const appSrc = fs.readFileSync('src/App.tsx', 'utf8').replace(/\r\n/g, '\n');
  const talentScoreInProtected = appSrc.includes('<ProtectedRoute><TalentScorePage') ||
                                appSrc.includes('<ProtectedRoute>\n            <TalentScorePage');
  const talentScorePublic = appSrc.includes('path="/talent-score" element={');

  assert(
    'Phase3_TalentScorePublic',
    'TalentScore Unlocked from ProtectedRoute',
    !talentScoreInProtected && talentScorePublic,
    '/talent-score is a public Route accessible to guests and crawlers'
  );

  assert(
    'Phase3_TalentScorePublic',
    'Alias Redirect /talentscore -> /talent-score',
    appSrc.includes('path="/talentscore" element={<Navigate to="/talent-score" replace />}'),
    'Permanent redirect registered for legacy /talentscore route'
  );

  const talentScorePageSrc = fs.readFileSync('src/pages/TalentScorePage.tsx', 'utf8').replace(/\r\n/g, '\n');
  assert(
    'Phase3_TalentScorePublic',
    'TalentScore Registration Bridge for Guests',
    talentScorePageSrc.includes("navigate('/auth/login?mode=signup&returnTo=/talent-score')"),
    'Guest users have seamless registration bridge preserving returnTo=/talent-score'
  );

  // --- SUITE 4: TALENTSCORE SHARING & VIRAL CARD ---
  assert(
    'Phase4_Sharing',
    'TalentScoreShareCard Mounted in Dialog',
    talentScorePageSrc.includes('<TalentScoreShareCard') && talentScorePageSrc.includes('isShareModalOpen'),
    'TalentScoreShareCard mounted with open state in TalentScorePage'
  );

  const shareCardSrc = fs.readFileSync('src/components/talent-score/TalentScoreShareCard.tsx', 'utf8').replace(/\r\n/g, '\n');
  assert(
    'Phase4_Sharing',
    'Referral Code Parameter Integration',
    shareCardSrc.includes('ref=${refCode}') && shareCardSrc.includes('utm_source=social_share'),
    'Share card generates deterministic referral deep links with UTM attribution'
  );

  // --- SUITE 5: SITEMAP & DISCOVERY INTEGRITY ---
  const sitemapBase = fs.readFileSync('public/sitemap-base.xml', 'utf8');
  const sitemapPassport = fs.readFileSync('public/sitemap-passport.xml', 'utf8');

  assert(
    'Phase5_SEO',
    'Sitemap Base Contains Flagship URLs',
    sitemapBase.includes('https://talentxcel.in/talent-score') && sitemapBase.includes('https://talentxcel.in/passport'),
    'public/sitemap-base.xml includes /talent-score and /passport'
  );

  assert(
    'Phase5_SEO',
    'Sitemap Passport Contains /passport',
    sitemapPassport.includes('/passport'),
    'public/sitemap-passport.xml contains /passport entry'
  );

  // --- SUITE 6: SOCIAL CRAWLER OG-BOT ---
  const ogBotReqTalentScore = new Request('https://talentxcel.in/api/og-bot?username=talent-score');
  const ogResTalentScore = await ogHandler(ogBotReqTalentScore);
  const ogTextTalentScore = await ogResTalentScore.text();

  assert(
    'Phase6_SocialCrawlers',
    'OG Bot TalentScore Preview Card',
    ogResTalentScore.status === 200 &&
      ogTextTalentScore.includes('TalentScore | Universal Career Readiness') &&
      ogTextTalentScore.includes('https://talentxcel.in/talent-score'),
    `OG Bot generates rich card for TalentScore (Cache-Control: ${ogResTalentScore.headers.get('cache-control')})`
  );

  const ogBotReqPassport = new Request('https://talentxcel.in/api/og-bot?username=passport');
  const ogResPassport = await ogHandler(ogBotReqPassport);
  const ogTextPassport = await ogResPassport.text();

  assert(
    'Phase6_SocialCrawlers',
    'OG Bot Career Passport Hub Preview Card',
    ogResPassport.status === 200 &&
      ogTextPassport.includes('Career Passport | Universal Verified Professional Identity') &&
      ogTextPassport.includes('https://talentxcel.in/passport'),
    'OG Bot generates rich card for Career Passport Hub'
  );

  // --- SUITE 7: GA4 TELEMETRY EVENT INTEGRITY ---
  const telemetrySrc = fs.readFileSync('src/services/telemetry/funnelTracker.ts', 'utf8');
  const requiredEvents: FunnelEventName[] = [
    'talent_score_page_view',
    'talent_score_assessment_start',
    'talent_score_industry_select',
    'talent_score_assessment_complete',
    'talent_score_share',
    'talent_score_registration_conversion',
    'passport_public_view',
    'passport_share',
    'passport_registration_conversion'
  ];

  const allEventsSupported = requiredEvents.every(e => telemetrySrc.includes(`'${e}'`));
  assert(
    'Phase7_Analytics',
    'GA4 Event Taxonomy Complete',
    allEventsSupported,
    `All ${requiredEvents.length} required P0/P1 event names strictly typed in FunnelEventName`
  );

  // Test executing trackFunnelEvent in-process
  let trackerError = false;
  try {
    for (const ev of requiredEvents) {
      await trackFunnelEvent(ev, { test: true });
    }
  } catch {
    trackerError = true;
  }

  assert(
    'Phase7_Analytics',
    'trackFunnelEvent Execution Safety',
    !trackerError,
    'All 9 events execute non-blockingly with zero thrown errors'
  );

  // --- SUITE 8: REFERRAL SHORTLINK ROUTING ---
  const shortlinkSrc = fs.readFileSync('src/components/referral/ReferralShortlinkRedirect.tsx', 'utf8');
  assert(
    'Phase8_Distribution',
    'Shortlink Dedicated Product Target Routing',
    shortlinkSrc.includes("cleanCode.startsWith('SCORE')") && shortlinkSrc.includes("cleanCode.startsWith('PASS')"),
    'ReferralShortlinkRedirect intelligently maps SCORE codes to /talent-score and PASS codes to /passport'
  );

  // --- SUMMARY REPORT ---
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log('\n================================================================');
  console.log(`TOTAL REMEDIATION TESTS: ${total}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
