// src/config/jobs/experiences.ts
// Standardized Experience Tiers for TalentXcel Jobs Matrix
// Supports Freshers, 1-3 Years, and 3-5 Years

export interface JobExperienceConfig {
  slug: string;
  label: string;
  badgeLabel: string;
  minYears: number;
  maxYears: number;
  description: string;
  careerAdvice: string;
}

export const JOB_EXPERIENCES: JobExperienceConfig[] = [
  {
    slug: 'freshers',
    label: 'Freshers & Entry Level',
    badgeLabel: '0-1 Years Experience',
    minYears: 0,
    maxYears: 1,
    description: 'Entry-level positions, graduate trainee programs, internships, and associate roles for recent graduates.',
    careerAdvice: 'Focus on personal portfolio projects, foundational problem-solving, clean code principles, and an ATS-optimized resume emphasizing internships and certifications.'
  },
  {
    slug: '1-3-years',
    label: '1 to 3 Years Experience',
    badgeLabel: '1-3 Years Experience',
    minYears: 1,
    maxYears: 3,
    description: 'Junior to mid-level roles for professionals with 1 to 3 years of hands-on production experience.',
    careerAdvice: 'Highlight end-to-end features shipped, quantifiable business impact, system ownership, and proficiency in modern toolchains and automated testing.'
  },
  {
    slug: '3-5-years',
    label: '3 to 5 Years Experience',
    badgeLabel: '3-5 Years Experience',
    minYears: 3,
    maxYears: 5,
    description: 'Mid-level to senior specialist roles requiring proven architectural independence and team leadership.',
    careerAdvice: 'Emphasize distributed system design, cross-functional collaboration, performance optimization, and mentorship of junior engineers.'
  }
];
export const EXPERIENCE_LEVELS = JOB_EXPERIENCES;

const EXPERIENCE_MAP = new Map<string, JobExperienceConfig>();

for (const exp of JOB_EXPERIENCES) {
  EXPERIENCE_MAP.set(exp.slug, exp);
}

// Synonyms mapping
EXPERIENCE_MAP.set('fresher', JOB_EXPERIENCES[0]);
EXPERIENCE_MAP.set('entry-level', JOB_EXPERIENCES[0]);
EXPERIENCE_MAP.set('0-1-years', JOB_EXPERIENCES[0]);
EXPERIENCE_MAP.set('junior', JOB_EXPERIENCES[1]);
EXPERIENCE_MAP.set('mid-level', JOB_EXPERIENCES[2]);

export function getExperienceBySlug(slug: string): JobExperienceConfig | undefined {
  if (!slug) return undefined;
  return EXPERIENCE_MAP.get(slug.toLowerCase().trim());
}
