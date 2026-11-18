// scripts/test-all-defects.ts
import { resolveMatrixParams } from '../src/config/jobs/matrixResolver';
import { learningAggregatorService } from '../src/services/learningAggregatorService';
import { isCollegeIndexable } from '../src/services/indianEducationService';
import { readFileSync } from 'fs';
import { resolve } from 'path';

async function runDefectTests() {
  console.log('=================================================================');
  console.log('TALENTXCEL SEARCH RECOVERY VERIFICATION TEST SUITE');
  console.log('=================================================================');

  let passed = 0;
  let failed = 0;

  function assert(desc: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`  [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${desc} - ${details || 'Assertion failed'}`);
      failed++;
    }
  }

  // 1. DEF-001 & DEF-002: Matrix Routing & Dual-City Collision Prevention
  console.log('\n--- 1. Testing Matrix Routing & Dual-City Collision (DEF-001/002) ---');
  const indiaRes = resolveMatrixParams('software-engineer', 'freshers', 'bangalore');
  assert(
    'Standard India Route (/jobs/software-engineer/freshers/bangalore)',
    indiaRes?.canonicalUrl === 'https://talentxcel.in/jobs/software-engineer/freshers/bangalore' &&
    indiaRes?.location.slug === 'bangalore'
  );

  const intlRes = resolveMatrixParams('software-engineer', 'freshers', 'london', 'gb');
  assert(
    'Standard International Route (/jobs/software-engineer/freshers/gb/london)',
    intlRes?.canonicalUrl === 'https://talentxcel.in/jobs/software-engineer/freshers/gb/london' &&
    intlRes?.location.countryCode === 'GB'
  );

  const dualCityCollision = resolveMatrixParams('software-engineer', 'freshers', 'nagpur', 'bangalore');
  assert(
    'Dual-City Collision (/jobs/.../bangalore/nagpur) is REJECTED (returns null)',
    dualCityCollision === null,
    `Returned ${dualCityCollision?.location?.cityName}`
  );

  const dualCityCollision2 = resolveMatrixParams('software-engineer', 'freshers', 'pune', 'chennai');
  assert(
    'Dual-City Collision (/jobs/.../chennai/pune) is REJECTED (returns null)',
    dualCityCollision2 === null
  );

  const invalidCountry = resolveMatrixParams('software-engineer', 'freshers', 'bangalore', 'invalid_country');
  assert(
    'Invalid Country Code is REJECTED (returns null)',
    invalidCountry === null
  );

  const mismatchedCountryCity = resolveMatrixParams('software-engineer', 'freshers', 'nagpur', 'gb');
  assert(
    'City in Wrong Country (Nagpur in GB) is REJECTED (returns null)',
    mismatchedCountryCity === null
  );

  // 2. Route Redirects in App.tsx
  console.log('\n--- 2. Testing App.tsx Redirects ---');
  const appCode = readFileSync(resolve('src/App.tsx'), 'utf8');
  assert(
    'App.tsx contains redirect for /jobs/software-engineer/freshers/bangalore/nagpur',
    appCode.includes('path="/jobs/software-engineer/freshers/bangalore/nagpur"') &&
    appCode.includes('to="/jobs/software-engineer/freshers/bangalore"')
  );
  assert(
    'App.tsx contains redirect for /jobs/biomedical-engineer/chennai/bangalore',
    appCode.includes('path="/jobs/biomedical-engineer/chennai/bangalore"') &&
    appCode.includes('to="/jobs/biomedical-engineer/bangalore"')
  );
  assert(
    'App.tsx contains redirect for /jobs/experience/entry-level/bangalore/pune',
    appCode.includes('path="/jobs/experience/entry-level/bangalore/pune"') &&
    appCode.includes('to="/jobs/software-engineer/freshers/bangalore"')
  );

  // 3. DEF-004: Course Fallback Logic
  console.log('\n--- 3. Testing Course Fallback Logic (DEF-004) ---');
  const validCourse = await learningAggregatorService.getCourseBySlugOrId('microsoft-power-bi-data-analyst');
  assert(
    'Valid course slug returns correct course object',
    validCourse !== null && validCourse.slug === 'microsoft-power-bi-data-analyst'
  );

  const unknownCourse = await learningAggregatorService.getCourseBySlugOrId('non-existent-course-slug-12345');
  assert(
    'Unknown course slug returns NULL (does NOT silently return Power BI)',
    unknownCourse === null,
    `Returned ${unknownCourse ? (unknownCourse as any).title : 'null'}`
  );

  const emptyCourse = await learningAggregatorService.getCourseBySlugOrId('');
  assert(
    'Empty course identifier returns NULL',
    emptyCourse === null
  );

  const unknownProvider = await learningAggregatorService.getProviderBySlug('non-existent-provider-xyz');
  assert(
    'Unknown provider slug returns NULL',
    unknownProvider === null
  );

  // 4. DEF-003 & DEF-006: AggregatedCourseDetail.tsx SEO & Clean Content
  console.log('\n--- 4. Testing AggregatedCourseDetail.tsx (DEF-003 & DEF-006) ---');
  const courseDetailCode = readFileSync(resolve('src/pages/learning/AggregatedCourseDetail.tsx'), 'utf8');
  assert(
    'AggregatedCourseDetail imports Helmet and SocialMetaHead',
    courseDetailCode.includes("import { Helmet } from 'react-helmet-async'") &&
    courseDetailCode.includes("import { SocialMetaHead } from '@/components/seo/SocialMetaHead'")
  );
  assert(
    'AggregatedCourseDetail renders SocialMetaHead with noindex on 404',
    courseDetailCode.includes('noindex={true}') &&
    courseDetailCode.includes('robotsDirective="noindex, follow"')
  );
  assert(
    'AggregatedCourseDetail renders BreadcrumbList and Course JSON-LD',
    courseDetailCode.includes("'@type': 'BreadcrumbList'") &&
    courseDetailCode.includes("'@type': 'Course'")
  );
  assert(
    'AggregatedCourseDetail does NOT contain hardcoded Savantis Solutions',
    !courseDetailCode.includes('Savantis Solutions')
  );
  assert(
    'AggregatedCourseDetail does NOT contain hardcoded Nexgenn Services',
    !courseDetailCode.includes('Nexgenn Services')
  );
  assert(
    'AggregatedCourseDetail connects to dynamic skills jobs search',
    courseDetailCode.includes('course.skills.slice(0, 4).map') &&
    courseDetailCode.includes('navigate(`/jobs?q=')
  );

  // 5. DEF-005: College Catalog Verification & Non-Indexability
  console.log('\n--- 5. Testing College Catalog & Non-Indexability (DEF-005) ---');
  const catalog = JSON.parse(readFileSync(resolve('src/data/indianInstitutionsCatalog.json'), 'utf8'));
  const cbit = catalog.find((c: any) => c.slug === 'cbit-college-of-pharmacy-health-sciences-hyderabad-2');
  const gov = catalog.find((c: any) => c.slug === 'govindammal-aditanar-engineering-college-chennai-2');

  assert(
    'CBIT Pharmacy is marked isIndexable: false and noindex: true',
    cbit?.isIndexable === false && cbit?.is_indexable === false && cbit?.noindex === true
  );
  assert(
    'CBIT Pharmacy false MBBS/MD claims removed',
    cbit?.academics?.flagshipPrograms?.[0] === 'Information Pending Verification' &&
    cbit?.costs?.annualTuition === 0
  );
  assert(
    'isCollegeIndexable(cbit) evaluates to FALSE',
    isCollegeIndexable(cbit) === false
  );

  assert(
    'Govindammal Engineering is marked isIndexable: false and noindex: true',
    gov?.isIndexable === false && gov?.is_indexable === false && gov?.noindex === true
  );
  assert(
    'Govindammal false Anna Univ / engineering claims removed',
    gov?.academics?.flagshipPrograms?.[0] === 'Information Pending Verification' &&
    gov?.costs?.annualTuition === 0
  );
  assert(
    'isCollegeIndexable(gov) evaluates to FALSE',
    isCollegeIndexable(gov) === false
  );

  console.log('\n=================================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('=================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runDefectTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
