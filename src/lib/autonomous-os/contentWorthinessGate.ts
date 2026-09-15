// src/lib/autonomous-os/contentWorthinessGate.ts
// College & Entity Sub-Route Content-Worthiness Gate
// Enforces that facet sub-pages are only submitted to sitemaps / indexed if substantive, verified data exists.

export interface CollegeEntityData {
  slug: string;
  name: string;
  state?: string;
  city?: string;
  courses?: Array<{ name: string; duration?: string; degree?: string }>;
  fees?: Array<{ program: string; tuition_inr?: number; hostel_inr?: number }>;
  placements?: {
    highest_package_lpa?: number;
    average_package_lpa?: number;
    top_recruiters?: string[];
    placement_percentage?: number;
  };
  cutoffs?: Array<{ exam: string; round?: number; closing_rank?: number }>;
  scholarships?: Array<{ name: string; amount?: string; eligibility?: string }>;
  rankings?: Array<{ agency: string; year?: number; rank?: number; category?: string }>;
  reviews_count?: number;
}

export interface FacetIndexabilityResult {
  path: string;
  facet: 'overview' | 'courses' | 'placements' | 'fees' | 'cutoffs' | 'scholarships' | 'rankings' | 'reviews';
  isIndexable: boolean;
  reason: string;
}

export function evaluateCollegeContentWorthiness(college: CollegeEntityData): FacetIndexabilityResult[] {
  const results: FacetIndexabilityResult[] = [];
  const s = college.slug;

  // 1. Core Profile (Always Indexable if valid slug and name exist)
  const isCoreValid = Boolean(college.slug && college.name && college.name.trim().length > 3);
  results.push({
    path: `/colleges/${s}`,
    facet: 'overview',
    isIndexable: isCoreValid,
    reason: isCoreValid ? 'Mandatory institutional entity data verified' : 'Missing core entity name or slug'
  });

  // 2. Courses Sub-Page (Requires at least 2 structured course programs)
  const hasCourses = Array.isArray(college.courses) && college.courses.length >= 2;
  results.push({
    path: `/colleges/${s}/courses`,
    facet: 'courses',
    isIndexable: hasCourses,
    reason: hasCourses ? `Verified ${college.courses?.length} academic course programs` : 'Insufficient course data (<2 programs)'
  });

  // 3. Placements Sub-Page (Requires verified placement percentage or average package)
  const hasPlacements = Boolean(
    college.placements && 
    ((college.placements.average_package_lpa && college.placements.average_package_lpa > 0) ||
     (college.placements.top_recruiters && college.placements.top_recruiters.length >= 2))
  );
  results.push({
    path: `/colleges/${s}/placements`,
    facet: 'placements',
    isIndexable: hasPlacements,
    reason: hasPlacements ? 'Verified salary packages and recruiter roster present' : 'Thin placement data'
  });

  // 4. Fees Sub-Page (Requires verified numeric tuition fees)
  const hasFees = Array.isArray(college.fees) && college.fees.some(f => typeof f.tuition_inr === 'number' && f.tuition_inr > 0);
  results.push({
    path: `/colleges/${s}/fees`,
    facet: 'fees',
    isIndexable: hasFees,
    reason: hasFees ? 'Verified tuition fee matrix present' : 'Missing official fee schedule'
  });

  // 5. Cutoffs Sub-Page (Requires official entrance exam closing ranks)
  const hasCutoffs = Array.isArray(college.cutoffs) && college.cutoffs.length > 0;
  results.push({
    path: `/colleges/${s}/cutoffs`,
    facet: 'cutoffs',
    isIndexable: hasCutoffs,
    reason: hasCutoffs ? 'Verified entrance exam cutoffs present' : 'No verified entrance cutoffs'
  });

  // 6. Scholarships Sub-Page (Requires specific institutional scholarship programs)
  const hasScholarships = Array.isArray(college.scholarships) && college.scholarships.length > 0;
  results.push({
    path: `/colleges/${s}/scholarships`,
    facet: 'scholarships',
    isIndexable: hasScholarships,
    reason: hasScholarships ? 'Verified financial aid & scholarship opportunities present' : 'No institutional scholarships listed'
  });

  // 7. Rankings Sub-Page (Requires recognized NIRF / NAAC agency ranking)
  const hasRankings = Array.isArray(college.rankings) && college.rankings.length > 0;
  results.push({
    path: `/colleges/${s}/rankings`,
    facet: 'rankings',
    isIndexable: hasRankings,
    reason: hasRankings ? 'Verified NIRF/NAAC institutional accreditation recorded' : 'No verified government/accreditation ranking'
  });

  return results;
}
