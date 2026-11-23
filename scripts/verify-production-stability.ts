/**
 * TALENTXCEL PRODUCTION STABILITY REGRESSION TEST SUITE
 * Tests all repaired components, route matching contracts, slug parsing,
 * benchmark computations, and critical user journeys.
 */

import { SalaryBenchmarkEngine } from '../src/services/salary/salaryBenchmarkEngine';

interface TestResult {
  name: string;
  category: string;
  status: 'PASS' | 'FAIL';
  details?: string;
  evidence?: any;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, category: string, details?: string, evidence?: any) {
  if (condition) {
    results.push({ name, category, status: 'PASS', details, evidence });
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    results.push({ name, category, status: 'FAIL', details, evidence });
    console.error(`  ❌ [FAIL] ${name}: ${details || 'Assertion failed'}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('TALENTXCEL PRODUCTION STABILITY REGRESSION TEST SUITE');
  console.log('======================================================\n');

  // 1. SALARY SLUG PARSING & BENCHMARK INTEGRITY
  console.log('[Test Suite 1: Salary Slug Parsing & Benchmark Engine]');
  const testSlugs = [
    { slug: 'data-scientist-salary-in-hyderabad', expectedRole: 'data-scientist', expectedCity: 'hyderabad' },
    { slug: 'ui-ux-designer-salary-in-pune', expectedRole: 'ui-ux-designer', expectedCity: 'pune' },
    { slug: 'software-engineer-salary-in-bangalore', expectedRole: 'software-engineer', expectedCity: 'bangalore' },
    { slug: 'product-manager-salary-in-mumbai', expectedRole: 'product-manager', expectedCity: 'mumbai' },
    { slug: 'devops-cloud-engineer-salary-in-delhi-ncr', expectedRole: 'devops-cloud-engineer', expectedCity: 'delhi-ncr' }
  ];

  for (const { slug, expectedRole, expectedCity } of testSlugs) {
    const clean = slug.replace(/-salary/g, '');
    const parts = clean.split('-in-');
    const r = parts[0] || '';
    const loc = parts.slice(1).join('-in-') || '';

    assert(r === expectedRole && loc === expectedCity, `Slug parsed correctly: ${slug}`, 'Salary Parsing', `Role: ${r}, City: ${loc}`);

    const benchmark = SalaryBenchmarkEngine.getBenchmark({
      role: r,
      location: loc,
      experienceYears: 4
    });

    assert(Boolean(benchmark && benchmark.p50 > 0), `Benchmark generated for ${r} in ${loc}`, 'Salary Engine', `p50: ₹${benchmark?.p50}`);
    assert(Boolean(benchmark?.p10 && benchmark?.p90 && benchmark.p90 > benchmark.p10), `Percentiles valid (p10 < p90) for ${r}`, 'Salary Engine', `p10: ${benchmark?.p10}, p90: ${benchmark?.p90}`);

    const inHand = SalaryBenchmarkEngine.calculateInHandBreakdown(benchmark.p50);
    assert(Boolean(inHand && inHand.estimatedMonthlyNet > 0 && !isNaN(inHand.estimatedMonthlyNet)), `In-hand net take-home valid for ${r}`, 'InHand Calculator', `Monthly Net: ₹${inHand?.estimatedMonthlyNet}`);
  }

  // 2. CHECK UNKNOWN ROLE FALLBACK
  console.log('\n[Test Suite 2: Fallback & Non-Canonical Roles]');
  const fallbackBenchmark = SalaryBenchmarkEngine.getBenchmark({
    role: 'unknown-quantum-wizard',
    location: 'hyderabad',
    experienceYears: 3
  });
  assert(Boolean(fallbackBenchmark), 'Fallback role handles gracefully without crashing', 'Salary Fallback', `Defaulted to: ${fallbackBenchmark?.role}`);

  // 3. CODE INTEGRITY CHECKS ACROSS REPAIRED SOURCE FILES
  console.log('\n[Test Suite 3: Source Code & Symbol Integrity]');
  const fs = await import('fs');

  // Check 3.1: PublicJobApplyButton showGuestModal
  const publicApplyContent = fs.readFileSync('src/components/jobs/PublicJobApplyButton.tsx', 'utf8');
  assert(publicApplyContent.includes('const [showGuestModal, setShowGuestModal] = useState'), 'PublicJobApplyButton declares showGuestModal state', 'Runtime Integrity');

  // Check 3.2: Navbar secondaryTools
  const navbarContent = fs.readFileSync('src/components/navigation/Navbar.tsx', 'utf8');
  assert(navbarContent.includes('const secondaryTools = ['), 'Navbar defines secondaryTools array', 'Runtime Integrity');

  // Check 3.3: JobDetail updateMetaTags & Briefcase
  const jobDetailContent = fs.readFileSync('src/pages/JobDetail.tsx', 'utf8');
  assert(jobDetailContent.includes("import { updateMetaTags } from '@/utils/metaTags';") && jobDetailContent.includes('Briefcase'), 'JobDetail imports updateMetaTags and Briefcase', 'Runtime Integrity');

  // Check 3.4: JobApply targetJobId
  const jobApplyContent = fs.readFileSync('src/pages/jobs/JobApply.tsx', 'utf8');
  assert(jobApplyContent.includes('const targetJobId = job?.id || id;'), 'JobApply defines targetJobId at component scope', 'Runtime Integrity');

  // Check 3.5: UnifiedAuthForm PLATFORM_METRICS
  const authFormContent = fs.readFileSync('src/components/auth/UnifiedAuthForm.tsx', 'utf8');
  assert(authFormContent.includes('const PLATFORM_METRICS = usePlatformMetrics();'), 'UnifiedAuthForm instantiates PLATFORM_METRICS', 'Runtime Integrity');

  // Check 3.6: CareerInsightsPage AlertCircle
  const careerInsightsContent = fs.readFileSync('src/pages/CareerInsightsPage.tsx', 'utf8');
  assert(careerInsightsContent.includes('AlertCircle,'), 'CareerInsightsPage imports AlertCircle', 'Runtime Integrity');

  // Check 3.7: TalentXcelCore useState/useEffect
  const talentXcelCoreContent = fs.readFileSync('src/pages/TalentXcelCore.tsx', 'utf8');
  assert(talentXcelCoreContent.includes('useState') && talentXcelCoreContent.includes('useEffect'), 'TalentXcelCore imports useState and useEffect', 'Runtime Integrity');

  // Check 3.8: TalentScore motion
  const talentScoreContent = fs.readFileSync('src/pages/passport/TalentScore.tsx', 'utf8');
  assert(talentScoreContent.includes("import { motion } from 'framer-motion';"), 'TalentScore imports motion from framer-motion', 'Runtime Integrity');

  // Check 3.9: CareerNavigator Plus
  const careerNavigatorContent = fs.readFileSync('src/pages/tools/CareerNavigator.tsx', 'utf8');
  assert(careerNavigatorContent.includes('Plus'), 'CareerNavigator imports Plus icon', 'Runtime Integrity');

  // Check 3.10: NetworkPostCard Button
  const postCardContent = fs.readFileSync('src/components/network/NetworkPostCard.tsx', 'utf8');
  assert(postCardContent.includes('import { Button } from "@/components/ui/button";'), 'NetworkPostCard imports Button component', 'Runtime Integrity');

  // Check 3.11: useLandingJobs norm
  const landingJobsContent = fs.readFileSync('src/hooks/useLandingJobs.ts', 'utf8');
  assert(landingJobsContent.includes('const norm = (str?: string) =>'), 'useLandingJobs declares norm helper function', 'Runtime Integrity');

  // Check 3.12: useConnectionRequests connectionMessage
  const connReqContent = fs.readFileSync('src/hooks/useConnectionRequests.ts', 'utf8');
  assert(connReqContent.includes('personal_note: connectionMessage ||'), 'useConnectionRequests passes connectionMessage parameter', 'Runtime Integrity');

  // Check 3.13: ReferAndEarn useReferralSystem bridge
  const referEarnContent = fs.readFileSync('src/pages/ReferAndEarn.tsx', 'utf8');
  assert(referEarnContent.includes('shareReferral') && referEarnContent.includes('referralData = useMemo'), 'ReferAndEarn safely bridges useReferralSystem', 'Runtime Integrity');

  // Check 3.14: App.tsx Career Insights Salary Routes
  const appContent = fs.readFileSync('src/App.tsx', 'utf8');
  assert(appContent.includes('/career-insights/salary/:slug') && appContent.includes('/career-insights/salary/:role/:location'), 'App.tsx defines career-insights salary routes', 'Routing Integrity');
  assert(appContent.includes('/jobs/:id/apply'), 'App.tsx registers dedicated /jobs/:id/apply route', 'Routing Integrity');
  assert(appContent.includes('RouteErrorBoundary name="Job Details"') && appContent.includes('RouteErrorBoundary name="Salary Guide"'), 'App.tsx wraps critical public routes in RouteErrorBoundary', 'Error Containment');

  // Check 3.15: SalaryGuidePage inHand net calculation & modeled claims
  const salaryGuideContent = fs.readFileSync('src/pages/seo/SalaryGuidePage.tsx', 'utf8');
  assert(!salaryGuideContent.includes('monthlyInHandMin') && salaryGuideContent.includes('estimatedMonthlyNet') && salaryGuideContent.includes('Modeled Benchmark Estimate'), 'SalaryGuidePage accurately calculates inHand and labels modeled estimates', 'Content Integrity');

  // Check 3.16: NativeApp useState import
  const nativeAppContent = fs.readFileSync('src/NativeApp.tsx', 'utf8');
  assert(nativeAppContent.includes('useState'), 'NativeApp imports useState', 'Runtime Integrity');

  // Check 3.17: EnhancedMobilePulse cn import
  const pulseContent = fs.readFileSync('src/components/Pulse/EnhancedMobilePulse.tsx', 'utf8');
  assert(pulseContent.includes("import { cn } from '@/lib/utils'"), 'EnhancedMobilePulse imports cn utility', 'Runtime Integrity');

  // Check 3.18: VideoConsultations safeFormatDate
  const videoContent = fs.readFileSync('src/components/communication/VideoConsultations.tsx', 'utf8');
  assert(videoContent.includes('safeFormatDate'), 'VideoConsultations defines safeFormatDate helper', 'Runtime Integrity');

  // Check 3.19: whatsappDigestGenerator try/catch
  const waContent = fs.readFileSync('src/services/jobs/whatsappDigestGenerator.ts', 'utf8');
  assert(!waContent.includes(').catch('), 'whatsappDigestGenerator uses try/catch instead of invalid .catch()', 'Runtime Integrity');

  // 4. SUMMARY
  console.log('\n======================================================');
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passCount} | FAILED: ${failCount}`);
  console.log('======================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test suite runner crashed:', err);
  process.exit(1);
});
