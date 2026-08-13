/**
 * TalentXcel — Client-Side Content Registry (Types Only)
 *
 * ⚠️  This file contains ONLY the TypeScript types and a content loader.
 *     The FULL content dataset is in scripts/contentRegistryData.ts
 *     and is NEVER imported by client-side React components.
 *
 * Architecture:
 *   Browser wants /resources/<slug>
 *     → ResourceDetail fetches /content/<slug>.json
 *     → JSON was generated at build time by scripts/generate-content-json.ts
 *     → If 404 → renders NotFound (no generic shell fallback)
 *
 * This file is safe to import in React components — it contains only types
 * and a fetch-based content loader function.
 */

// ─── Types ─────────────────────────────────────────────────────────────────

export type ContentCategory =
  | 'Article'
  | 'CareerGuide'
  | 'InterviewGuide'
  | 'ResumeGuide'
  | 'SkillGuide'
  | 'CareerPath'
  | 'SalaryGuide'
  | 'IndustryGuide'
  | 'EmployerGuide'
  | 'HRGuide'
  | 'LearningGuide'
  | 'CollegeGuide'
  | 'LocationGuide'
  | 'FresherGuide'
  | 'AICareerGuide'
  | 'CareerPassportGuide'
  | 'NetworkingGuide'
  | 'RewardsGuide'
  | 'ProductGuide';

export interface ContentItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ContentCategory;
  author: {
    name: string;
    role: string;
    sameAs?: string;
  };
  publishedDate: string;
  updatedDate?: string;
  intro: string;
  bodySections: {
    heading: string;
    content: string;
    bulletPoints?: string[];
  }[];
  relatedSkills: string[];
  relatedRoles: string[];
  relatedIndustries: string[];
  relatedLocations: string[];
  relatedCompanies: string[];
  canonicalUrl: string;
  schemaType: 'Article' | 'BlogPosting' | 'TechArticle' | 'Occupation' | 'DefinedTerm' | 'HowTo';
  indexable: boolean;
  ctaType: 'candidate' | 'employer' | 'dual';
}

// ─── Content Loader ─────────────────────────────────────────────────────────

/**
 * fetchContentItem — loads a single content item from its pre-generated JSON file.
 *
 * Returns null if the JSON file does not exist (→ renderer shows 404).
 * Never fetches the entire content registry.
 *
 * Usage in ResourceDetail:
 *   const item = await fetchContentItem(slug);
 *   if (!item) return <NotFound />;
 */
export async function fetchContentItem(slug: string): Promise<ContentItem | null> {
  if (!slug || slug.length === 0) return null;

  // Sanitize slug to prevent path traversal
  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!safeSlug) return null;

  try {
    const response = await fetch(`/content/${safeSlug}.json`, {
      headers: { Accept: 'application/json' },
      // Cache for 5 minutes during a session
      cache: 'default',
    });

    if (!response.ok) {
      // 404 → not found → renderer will show proper 404 page
      return null;
    }

    const data = await response.json();
    return data as ContentItem;
  } catch {
    // Network failure or parse error → treat as not found
    return null;
  }
}

/**
 * categoryToCtaPageType — maps ContentCategory to CtaPageType.
 * Used by ResourceDetail to get the correct CTA config.
 */
export function categoryToCtaPageType(category: ContentCategory): string {
  const map: Record<ContentCategory, string> = {
    Article: 'Article',
    CareerGuide: 'CareerGuide',
    CareerPath: 'CareerPath',
    ResumeGuide: 'ResumeGuide',
    InterviewGuide: 'InterviewGuide',
    SkillGuide: 'SkillGuide',
    SalaryGuide: 'SalaryGuide',
    EmployerGuide: 'EmployerGuide',
    HRGuide: 'HRGuide',
    IndustryGuide: 'IndustryGuide',
    LocationGuide: 'LocationGuide',
    LearningGuide: 'LearningGuide',
    CollegeGuide: 'CollegeGuide',
    FresherGuide: 'FresherGuide',
    AICareerGuide: 'AICareerGuide',
    CareerPassportGuide: 'CareerPassportGuide',
    NetworkingGuide: 'NetworkingGuide',
    RewardsGuide: 'RewardsGuide',
    ProductGuide: 'ProductFeature',
  };
  return map[category] ?? 'Article';
}

/**
 * getCategoryLabel — human-readable label for the category badge.
 */
export function getCategoryLabel(category: ContentCategory): string {
  const labels: Record<ContentCategory, string> = {
    Article: 'Article',
    CareerGuide: 'Career Guide',
    CareerPath: 'Career Path',
    ResumeGuide: 'Resume Guide',
    InterviewGuide: 'Interview Guide',
    SkillGuide: 'Skill Guide',
    SalaryGuide: 'Salary Guide',
    EmployerGuide: 'Employer Guide',
    HRGuide: 'HR Guide',
    IndustryGuide: 'Industry Guide',
    LocationGuide: 'Location Guide',
    LearningGuide: 'Learning Guide',
    CollegeGuide: 'College Guide',
    FresherGuide: 'Fresher Guide',
    AICareerGuide: 'AI Career Guide',
    CareerPassportGuide: 'Career Passport Guide',
    NetworkingGuide: 'Networking Guide',
    RewardsGuide: 'Rewards Guide',
    ProductGuide: 'Platform Feature',
  };
  return labels[category] ?? 'Guide';
}

// ─── Legacy compatibility ────────────────────────────────────────────────────
// The CONTENT_REGISTRY export is intentionally removed.
// Any component that previously imported CONTENT_REGISTRY must now use
// fetchContentItem(slug) instead.
//
// DO NOT re-add CONTENT_REGISTRY here — it would re-introduce the 34 MB bundle.
