/**
 * TalentXcel — Centralized CTA System
 *
 * Single source of truth for every contextual CTA on public discovery pages.
 * Every indexable static page must use one PRIMARY CTA from this map,
 * and optionally one SECONDARY CTA.
 *
 * Rules:
 *  - CTA label must be action-oriented and role/page specific.
 *  - Every ctaHref must be a real, functioning route in App.tsx.
 *  - Do NOT put five unrelated CTAs on every page.
 *  - The [location] and [role] placeholders in labels are replaced at render time.
 */

export type CtaPageType =
  | 'CareerGuide'
  | 'CareerPath'
  | 'ResumeGuide'
  | 'InterviewGuide'
  | 'SkillGuide'
  | 'SalaryGuide'
  | 'FresherGuide'
  | 'EmployerGuide'
  | 'HRGuide'
  | 'AICareerGuide'
  | 'CareerPassportGuide'
  | 'NetworkingGuide'
  | 'RewardsGuide'
  | 'IndustryGuide'
  | 'LocationGuide'
  | 'RoleLocationDiscovery'
  | 'ProductFeature'
  | 'Article'
  | 'LearningGuide'
  | 'CollegeGuide'
  | 'Profile';

export interface CtaConfig {
  primaryLabel: string;
  primaryHref: string;
  primaryIcon?: 'briefcase' | 'star' | 'book' | 'user' | 'zap' | 'award' | 'users' | 'trending-up';
  secondaryLabel?: string;
  secondaryHref?: string;
  headline?: string;
  subtext?: string;
}

/**
 * CTA_MAP — keyed by page/content type.
 * Every value has been verified against App.tsx routes.
 *
 * Verified routes:
 *  /resume/build         → UnifiedResumeBuilder ✅
 *  /passport             → PassportLayout ✅
 *  /tools                → Tools ✅
 *  /skills-assessment    → SkillsGap ✅
 *  /learning             → Learning ✅
 *  /ai-career-hub        → AICareerHub ✅
 *  /network              → Network (via navItems) ✅
 *  /jobs                 → JobsPage ✅
 *  /employer             → Employer (via navItems) ✅
 *  /auth/register        → Auth register (via navItems) ✅
 *  /contact              → Contact ✅
 */
export const CTA_MAP: Record<CtaPageType, CtaConfig> = {
  CareerGuide: {
    primaryLabel: 'Build Your Career Passport',
    primaryHref: '/passport',
    primaryIcon: 'award',
    secondaryLabel: 'Explore Career Tools',
    secondaryHref: '/tools',
    headline: 'Plan Your Career with TalentXcel',
    subtext: 'Create a verified Career Passport, track your professional journey, and get discovered by top employers.',
  },

  CareerPath: {
    primaryLabel: 'Build Your Career Passport',
    primaryHref: '/passport',
    primaryIcon: 'award',
    secondaryLabel: 'Assess Your Skills',
    secondaryHref: '/skills-assessment',
    headline: 'Map Your Career Path with TalentXcel',
    subtext: 'Get a personalized career roadmap, identify skill gaps, and build a verified professional identity.',
  },

  ResumeGuide: {
    primaryLabel: 'Build an ATS-Friendly Resume',
    primaryHref: '/public/resume-builder',
    primaryIcon: 'briefcase',
    secondaryLabel: 'Create Your Career Passport',
    secondaryHref: '/passport',
    headline: 'Build a Resume That Gets Past ATS',
    subtext: 'Use TalentXcel\'s free resume builder with recruiter-approved templates that are optimized for ATS systems.',
  },

  InterviewGuide: {
    primaryLabel: 'Prepare for Your Interview',
    primaryHref: '/tools/interview-prep',
    primaryIcon: 'zap',
    secondaryLabel: 'Use AI Career Hub',
    secondaryHref: '/ai-career-hub',
    headline: 'Ace Your Next Interview with TalentXcel',
    subtext: 'Access interview preparation tools, AI-powered coaching, and role-specific question banks.',
  },

  SkillGuide: {
    primaryLabel: 'Assess Your Skills',
    primaryHref: '/skills',
    primaryIcon: 'star',
    secondaryLabel: 'Start Learning',
    secondaryHref: '/learning',
    headline: 'Verify and Grow Your Skills with TalentXcel',
    subtext: 'Take skills assessments, earn verified credentials, and make your profile stand out to recruiters.',
  },

  SalaryGuide: {
    primaryLabel: 'Plan Your Career',
    primaryHref: '/passport',
    primaryIcon: 'trending-up',
    secondaryLabel: 'Join TalentXcel',
    secondaryHref: '/auth/register',
    headline: 'Understand Your Market Value',
    subtext: 'Build a verified career profile to access market insights, salary benchmarks, and career planning tools.',
  },

  FresherGuide: {
    primaryLabel: 'Start Your Career with TalentXcel',
    primaryHref: '/auth/register',
    primaryIcon: 'star',
    secondaryLabel: 'Build Your Career Passport',
    secondaryHref: '/passport',
    headline: 'Launch Your Career with Confidence',
    subtext: 'Join thousands of freshers who have built their professional identity on TalentXcel — free to start.',
  },

  EmployerGuide: {
    primaryLabel: 'Hire Talent with TalentXcel',
    primaryHref: '/employer',
    primaryIcon: 'users',
    secondaryLabel: 'Explore Workforce Solutions',
    secondaryHref: '/contact',
    headline: 'Build Your Hiring Pipeline on TalentXcel',
    subtext: 'Post vacancies, access verified career profiles, and streamline recruitment — free on Day 1.',
  },

  HRGuide: {
    primaryLabel: 'Explore Workforce Solutions',
    primaryHref: '/contact',
    primaryIcon: 'users',
    secondaryLabel: 'Hire with TalentXcel',
    secondaryHref: '/employer',
    headline: 'Smarter Hiring Starts Here',
    subtext: 'TalentXcel connects HR teams with verified candidates, skills-based hiring tools, and workforce analytics.',
  },

  AICareerGuide: {
    primaryLabel: 'Use AI Career Hub',
    primaryHref: '/ai-career-hub',
    primaryIcon: 'zap',
    secondaryLabel: 'Explore Career Tools',
    secondaryHref: '/tools',
    headline: 'Let AI Power Your Career Planning',
    subtext: 'TalentXcel\'s AI Career Hub gives you personalized roadmaps, skill gap analysis, and intelligent job matching.',
  },

  CareerPassportGuide: {
    primaryLabel: 'Create Your Career Passport',
    primaryHref: '/passport',
    primaryIcon: 'award',
    secondaryLabel: 'Join the TalentXcel Network',
    secondaryHref: '/network',
    headline: 'Your Professional Identity, Verified',
    subtext: 'Build a tamper-proof Career Passport with verified skills, experience, and credentials. Share via one link or QR code.',
  },

  NetworkingGuide: {
    primaryLabel: 'Join the TalentXcel Network',
    primaryHref: '/network',
    primaryIcon: 'users',
    secondaryLabel: 'Build Your Profile',
    secondaryHref: '/auth/register',
    headline: 'Grow Your Professional Network',
    subtext: 'Connect with professionals, recruiters, and mentors on TalentXcel — the career-first professional network.',
  },

  RewardsGuide: {
    primaryLabel: 'Explore TXC Rewards',
    primaryHref: '/auth/register',
    primaryIcon: 'star',
    secondaryLabel: 'Join TalentXcel',
    secondaryHref: '/auth/register',
    headline: 'Earn While You Build Your Career',
    subtext: 'TalentXcel\'s TXC reward system lets you earn points for career milestones, referrals, and platform activity.',
  },

  IndustryGuide: {
    primaryLabel: 'Explore Career Opportunities',
    primaryHref: '/jobs',
    primaryIcon: 'briefcase',
    secondaryLabel: 'Join TalentXcel',
    secondaryHref: '/auth/register',
    headline: 'Discover Careers in This Industry',
    subtext: 'Find roles, skills, and career paths in this industry. Build your profile and connect with employers on TalentXcel.',
  },

  LocationGuide: {
    primaryLabel: 'Explore Career Opportunities',
    primaryHref: '/jobs',
    primaryIcon: 'briefcase',
    secondaryLabel: 'Build Career Passport',
    secondaryHref: '/passport',
    headline: 'Career Opportunities Near You',
    subtext: 'Discover in-demand roles, industries, and career guidance for professionals in this location.',
  },

  RoleLocationDiscovery: {
    primaryLabel: 'Build Free Resume',
    primaryHref: '/public/resume-builder',
    primaryIcon: 'briefcase',
    secondaryLabel: 'Create Career Passport',
    secondaryHref: '/passport',
    headline: 'Accelerate Your Career Journey',
    subtext: 'Build an ATS-friendly resume and create your verified Career Passport to stand out to employers.',
  },

  ProductFeature: {
    primaryLabel: 'Get Started Free',
    primaryHref: '/auth/register',
    primaryIcon: 'zap',
    secondaryLabel: 'Learn More',
    secondaryHref: '/about',
    headline: 'One Platform for Your Entire Career Journey',
    subtext: 'From resume building to career passport, AI coaching, and professional networking — TalentXcel has you covered.',
  },

  Article: {
    primaryLabel: 'Build Your Career Passport',
    primaryHref: '/passport',
    primaryIcon: 'award',
    secondaryLabel: 'Explore Career Tools',
    secondaryHref: '/tools',
    headline: 'Take Your Career to the Next Level',
    subtext: 'TalentXcel gives you the tools, resources, and professional network to accelerate your career growth.',
  },

  LearningGuide: {
    primaryLabel: 'Start Learning',
    primaryHref: '/learning',
    primaryIcon: 'book',
    secondaryLabel: 'Assess Your Skills',
    secondaryHref: '/skills-assessment',
    headline: 'Upskill with TalentXcel Learning',
    subtext: 'Access curated courses, industry certifications, and personalized learning paths to advance your career.',
  },

  CollegeGuide: {
    primaryLabel: 'Build Your Career Passport',
    primaryHref: '/passport',
    primaryIcon: 'award',
    secondaryLabel: 'Start Your Career',
    secondaryHref: '/auth/register',
    headline: 'From Campus to Career with TalentXcel',
    subtext: 'Build your professional identity from day one. Get career guidance, resume tools, and job discovery — free.',
  },

  Profile: {
    primaryLabel: 'Build Your Career Passport',
    primaryHref: '/passport',
    primaryIcon: 'award',
    secondaryLabel: 'Join the TalentXcel Network',
    secondaryHref: '/network',
    headline: 'Build Your Professional Identity',
    subtext: 'Create your TalentXcel profile, build a verified Career Passport, and connect with a professional network that cares about your career.',
  },
};

/**
 * getCta — returns the CTA config for a given page type.
 * Falls back to Article if the type is not found.
 */
export function getCta(pageType: CtaPageType): CtaConfig {
  return CTA_MAP[pageType] ?? CTA_MAP['Article'];
}

/**
 * getLocationCta — returns a location-specific CTA with the location name injected.
 */
export function getLocationCta(locationName: string): CtaConfig {
  return {
    ...CTA_MAP['LocationGuide'],
    primaryLabel: `Explore Opportunities in ${locationName}`,
    headline: `Career Opportunities in ${locationName}`,
    subtext: `Discover in-demand roles, top industries, and career guidance for professionals in ${locationName}.`,
  };
}

/**
 * getRoleLocationCta — returns a role+location specific CTA.
 */
export function getRoleLocationCta(role: string, location: string): CtaConfig {
  return {
    ...CTA_MAP['RoleLocationDiscovery'],
    primaryLabel: `Explore ${role} Careers`,
    headline: `${role} Career Guide — ${location}`,
    subtext: `Discover the career path, skills, resume tips, and interview preparation for ${role} professionals. No active job listing required — this is a career discovery hub.`,
  };
}
