// src/lib/social-marketing/productEcosystemMap.ts
// TalentXcel Product Universe & Contextual CTA Routing Catalog
// Maps topics and intent to appropriate products, or selects BRAND_AUTHORITY (no product push)

import type { ProductSurface, CtaStrength } from './types';

export interface ProductEcosystemNode {
  surface: ProductSurface;
  name: string;
  description: string;
  primary_url: string;
  default_cta_strength: CtaStrength;
  cta_options: {
    soft: string;
    contextual: string;
    direct: string;
  };
  sample_keywords: string[];
}

export const TALENTXCEL_PRODUCT_ECOSYSTEM: Record<ProductSurface, ProductEcosystemNode> = {
  RESUME_ATS: {
    surface: 'RESUME_ATS',
    name: 'ATS Resume Scanner & Studio',
    description: 'Free AI-powered resume scanner and ATS formatting optimization.',
    primary_url: 'https://talentxcel.in/tools/ats-optimizer',
    default_cta_strength: 'CONTEXTUAL',
    cta_options: {
      soft: 'Curious how your resume scores against modern ATS systems? Test it free on TalentXcel.',
      contextual: 'Check your resume keywords and ATS compatibility with TalentXcel’s free optimizer.',
      direct: 'Run an instant free ATS resume audit now at talentxcel.in/tools/ats-optimizer.',
    },
    sample_keywords: ['resume', 'ats', 'cv', 'keyword optimization', 'bullet points', 'ats score', 'cover letter'],
  },
  JOBS: {
    surface: 'JOBS',
    name: 'Verified Jobs Engine',
    description: '100,000+ verified job listings across global locations with transparent salary data.',
    primary_url: 'https://talentxcel.in/jobs',
    default_cta_strength: 'CONTEXTUAL',
    cta_options: {
      soft: 'Looking for verified openings in this domain? Browse real listings on TalentXcel.',
      contextual: 'Explore open, verified roles matching these exact skills on TalentXcel Jobs.',
      direct: 'Apply directly to verified hiring teams at talentxcel.in/jobs.',
    },
    sample_keywords: ['jobs', 'hiring', 'vacancy', 'openings', 'fresher jobs', 'remote jobs', 'careers'],
  },
  SALARIES: {
    surface: 'SALARIES',
    name: 'Salary & Compensation Intelligence',
    description: 'Data-backed compensation benchmarks by experience, location, and tech stack.',
    primary_url: 'https://talentxcel.in/salaries',
    default_cta_strength: 'CONTEXTUAL',
    cta_options: {
      soft: 'Benchmarking your compensation? Review real industry ranges on TalentXcel.',
      contextual: 'Compare verified compensation bands for your role and seniority on TalentXcel Salaries.',
      direct: 'Unlock complete verified salary benchmarks at talentxcel.in/salaries.',
    },
    sample_keywords: ['salary', 'compensation', 'pay scale', 'ctc', 'negotiation', 'package', 'hike'],
  },
  CAREER_MAP: {
    surface: 'CAREER_MAP',
    name: 'Career Pathway & Roadmap Generator',
    description: 'Step-by-step career transition and skill progression blueprints.',
    primary_url: 'https://talentxcel.in/career-map',
    default_cta_strength: 'CONTEXTUAL',
    cta_options: {
      soft: 'Wondering what skills to learn next? Map your progression on TalentXcel.',
      contextual: 'Generate your personalized 2026 career pathway blueprint with TalentXcel Career Map.',
      direct: 'Build your step-by-step career transition roadmap at talentxcel.in/career-map.',
    },
    sample_keywords: ['career map', 'roadmap', 'transition', 'skills to learn', 'career path', 'promotion'],
  },
  LEARNING: {
    surface: 'LEARNING',
    name: 'Learning & Skill Upskilling',
    description: 'Curated technical courses, certifications, and industry learning paths.',
    primary_url: 'https://talentxcel.in/learning',
    default_cta_strength: 'CONTEXTUAL',
    cta_options: {
      soft: 'Ready to upskill in high-demand tools? Explore curated learning tracks on TalentXcel.',
      contextual: 'Master these in-demand capabilities through verified learning modules on TalentXcel.',
      direct: 'Start learning verified career skills at talentxcel.in/learning.',
    },
    sample_keywords: ['learning', 'course', 'certification', 'training', 'upskill', 'bootcamp'],
  },
  COLLEGES: {
    surface: 'COLLEGES',
    name: 'Global Higher Education & Scholarships',
    description: 'Tuition-free global degree discovery, fully-funded programs, and institutional admissions.',
    primary_url: 'https://talentxcel.in/colleges/global-programs',
    default_cta_strength: 'CONTEXTUAL',
    cta_options: {
      soft: 'Exploring international degrees? Discover tuition-free and funded options on TalentXcel.',
      contextual: 'Find verified global degree programs with competitive scholarships on TalentXcel Colleges.',
      direct: 'Explore verified global programs and funding at talentxcel.in/colleges/global-programs.',
    },
    sample_keywords: ['college', 'university', 'degree', 'scholarship', 'masters', 'tuition-free', 'bachelors'],
  },
  NETWORK: {
    surface: 'NETWORK',
    name: 'Verified Professional Network',
    description: 'Peer networking and verified professional identity graph.',
    primary_url: 'https://talentxcel.in/network',
    default_cta_strength: 'SOFT',
    cta_options: {
      soft: 'Connect with peers and practitioners working in these domains on TalentXcel Network.',
      contextual: 'Join verified tech and career discussions on the TalentXcel Professional Network.',
      direct: 'Build your verified industry connections at talentxcel.in/network.',
    },
    sample_keywords: ['networking', 'community', 'connections', 'professional profile', 'mentorship'],
  },
  EMPLOYER_ACQUISITION: {
    surface: 'EMPLOYER_ACQUISITION',
    name: 'TalentXcel Hire for Employers',
    description: 'Multi-location hiring, automated pipeline screening, and qualified candidate sourcing.',
    primary_url: 'https://talentxcel.in/hire',
    default_cta_strength: 'DIRECT',
    cta_options: {
      soft: 'Hiring for specialized talent? Discover qualified candidates on TalentXcel.',
      contextual: 'Scale your engineering and product hiring across 100K locations with TalentXcel Hire.',
      direct: 'Post your openings and screen top candidates at talentxcel.in/hire.',
    },
    sample_keywords: ['hiring manager', 'recruiters', 'talent acquisition', 'post job', 'cost per hire', 'sourcing'],
  },
  TOOLS: {
    surface: 'TOOLS',
    name: 'Career Calculators & Tools',
    description: 'Salary calculators, notice period planning, and interview prep utilities.',
    primary_url: 'https://talentxcel.in/tools',
    default_cta_strength: 'SOFT',
    cta_options: {
      soft: 'Explore free career utilities and calculators on TalentXcel Tools.',
      contextual: 'Use TalentXcel’s free calculators to model your career and compensation moves.',
      direct: 'Access free career utilities at talentxcel.in/tools.',
    },
    sample_keywords: ['calculator', 'tools', 'utilities', 'notice period', 'in-hand salary'],
  },
  CAREER_PASSPORT: {
    surface: 'CAREER_PASSPORT',
    name: 'Career Passport Credential',
    description: 'Tamper-proof verifiable career identity and skill credentials.',
    primary_url: 'https://talentxcel.in/career-passport',
    default_cta_strength: 'SOFT',
    cta_options: {
      soft: 'Showcase your verified achievements with a TalentXcel Career Passport.',
      contextual: 'Export your verified skills and endorsements via your TalentXcel Career Passport.',
      direct: 'Claim your verifiable career credential at talentxcel.in/career-passport.',
    },
    sample_keywords: ['passport', 'credential', 'verified skills', 'badge', 'endorsement'],
  },
  SERVICES: {
    surface: 'SERVICES',
    name: 'Career Advisory & Review Services',
    description: 'Executive resume reviews, mock interviews, and career coaching.',
    primary_url: 'https://talentxcel.in/services',
    default_cta_strength: 'CONTEXTUAL',
    cta_options: {
      soft: 'Need hands-on guidance? Explore professional advisory sessions on TalentXcel.',
      contextual: 'Partner with verified industry mentors for 1-on-1 interview and resume reviews on TalentXcel.',
      direct: 'Book a professional career consultation at talentxcel.in/services.',
    },
    sample_keywords: ['coaching', 'mentorship', 'resume review', 'mock interview', 'consultation'],
  },
  BRAND_AUTHORITY: {
    surface: 'BRAND_AUTHORITY',
    name: 'Brand Authority & Thought Leadership',
    description: 'Pure educational thought leadership. Zero product push to preserve credibility.',
    primary_url: 'https://talentxcel.in',
    default_cta_strength: 'NONE',
    cta_options: {
      soft: 'Follow TalentXcel for data-backed career and labor market intelligence.',
      contextual: 'Share your perspective in the comments below. Follow TalentXcel for more insights.',
      direct: 'Bookmark this insight. Follow TalentXcel for verified industry research.',
    },
    sample_keywords: ['macro trends', 'future of work', 'ai ethics', 'labor statistics', 'thought leadership'],
  },
};

/**
 * Resolves the best product match for a given topic or query string.
 * Falls back to BRAND_AUTHORITY if no strong product intent is identified.
 */
export function resolveTargetProduct(topicText: string): {
  surface: ProductSurface;
  destinationUrl: string;
  defaultCtaStrength: CtaStrength;
  suggestedCta: string;
} {
  const normalized = topicText.toLowerCase();

  for (const [surfaceKey, node] of Object.entries(TALENTXCEL_PRODUCT_ECOSYSTEM) as [ProductSurface, ProductEcosystemNode][]) {
    if (surfaceKey === 'BRAND_AUTHORITY') continue;
    for (const kw of node.sample_keywords) {
      if (normalized.includes(kw)) {
        return {
          surface: node.surface,
          destinationUrl: node.primary_url,
          defaultCtaStrength: node.default_cta_strength,
          suggestedCta: node.cta_options.contextual,
        };
      }
    }
  }

  // Default to pure Brand Authority (No aggressive product push)
  const authority = TALENTXCEL_PRODUCT_ECOSYSTEM.BRAND_AUTHORITY;
  return {
    surface: 'BRAND_AUTHORITY',
    destinationUrl: authority.primary_url,
    defaultCtaStrength: 'NONE',
    suggestedCta: authority.cta_options.soft,
  };
}
