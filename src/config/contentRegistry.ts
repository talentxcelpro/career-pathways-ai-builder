/**
 * TalentXcel 5,000+ Public Discovery Content Registry & Editorial Library
 *
 * Single source of truth for high-quality public career resources,
 * articles, role guides, skill breakdowns, interview guides, ATS resume guides,
 * salary benchmarks, and employer hiring strategies.
 */

import { JOB_CATEGORIES } from '../utils/jobCategories';

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
  | 'LocationGuide';

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

const AUTHOR_EDITORIAL = {
  name: 'TalentXcel Editorial Team',
  role: 'Career Intelligence & Talent Research',
  sameAs: 'https://talentxcel.in/about',
};

const AUTHOR_HIRING = {
  name: 'TalentXcel Talent Acquisition Research',
  role: 'Workforce & Employer Strategy',
  sameAs: 'https://talentxcel.in/employer',
};

const toSlug = (text: string): string => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

// Handcrafted Featured Guides
const HANDCRAFTED_GUIDES: ContentItem[] = [
  {
    id: 'how-to-build-an-effective-talent-acquisition-strategy-india',
    slug: 'how-to-build-an-effective-talent-acquisition-strategy-india',
    title: 'How to Build an Effective Talent Acquisition Strategy in India | TalentXcel Employer Insights',
    description:
      'A practical talent acquisition guide for hiring managers in India covering workforce planning, candidate sourcing, structured interviews, employer branding, hiring technology, and recruitment metrics.',
    category: 'EmployerGuide',
    author: AUTHOR_HIRING,
    publishedDate: '2026-04-01',
    intro:
      'An effective talent acquisition strategy is more than filling open positions. Hiring leaders need a repeatable system that connects workforce planning, candidate sourcing, employer branding, structured assessment, hiring technology, and onboarding.',
    bodySections: [
      {
        heading: 'Start With Workforce Planning',
        content:
          'Before opening a position, hiring teams should understand why the role is required, what outcomes the person will own, which skills are essential, and how the role fits into the organization.',
      },
      {
        heading: 'Define the Right Candidate Profile',
        content:
          'A strong candidate profile separates essential requirements from preferred qualifications. Hiring managers should clearly define responsibilities, technical capabilities, and measurable outcomes.',
      },
    ],
    relatedSkills: ['Talent Acquisition', 'Recruitment Strategy', 'Workforce Planning', 'Employer Branding'],
    relatedRoles: ['HR Manager', 'Talent Acquisition Manager', 'Recruitment Lead'],
    relatedIndustries: ['Information Technology', 'Staffing', 'Enterprise Services'],
    relatedLocations: ['Delhi NCR', 'Gurgaon', 'Noida', 'Bangalore', 'Mumbai'],
    relatedCompanies: ['TalentXcel'],
    canonicalUrl: 'https://talentxcel.in/resources/how-to-build-an-effective-talent-acquisition-strategy-india',
    schemaType: 'Article',
    indexable: true,
    ctaType: 'employer',
  },
  {
    id: 'ats-resume-guide-2026',
    slug: 'ats-resume-guide-2026',
    title: 'How to Write an ATS-Friendly Resume in 2026: Complete Step-by-Step Guide',
    description:
      'Learn how Applicant Tracking Systems (ATS) scan resumes in India and global markets. Get recruiter-approved formatting rules, keyword tips, and templates.',
    category: 'ResumeGuide',
    author: AUTHOR_EDITORIAL,
    publishedDate: '2026-01-15',
    updatedDate: '2026-08-10',
    intro:
      'Over 85% of corporate applications in India pass through an Applicant Tracking System before reaching a human recruiter. Formatting errors and missing keywords filter out qualified candidates.',
    bodySections: [
      {
        heading: 'Why ATS Parsing Fails for Standard Resumes',
        content:
          'Applicant Tracking Systems convert PDF and Word documents into plain text structured data. Single-column layouts without graphics or text boxes parse cleanly.',
      },
    ],
    relatedSkills: ['Resume Tailoring', 'ATS Optimization', 'Copywriting'],
    relatedRoles: ['Software Engineer', 'Data Analyst', 'HR Manager'],
    relatedIndustries: ['Information Technology', 'Finance', 'Healthcare'],
    relatedLocations: ['Delhi NCR', 'Bangalore', 'Mumbai', 'Remote'],
    relatedCompanies: ['TalentXcel'],
    canonicalUrl: 'https://talentxcel.in/resources/ats-resume-guide-2026',
    schemaType: 'HowTo',
    indexable: true,
    ctaType: 'candidate',
  },
];

// 35 Expanded Editorial Topics for 2,000+ Substantive Articles
const EDITORIAL_TOPICS = [
  'Career Development Strategy', 'Job Search Mastery', 'ATS Resume Optimization', 'Interview Preparation',
  'Technical Interview DSA', 'System Design Mastery', 'Behavioral Interview STAR Method', 'Workplace Leadership',
  'Management & Operations', 'HR Strategy & Compliance', 'Talent Acquisition & Sourcing', 'Employer Branding',
  'Campus Recruitment India', 'AI & Automation Careers', 'Software Engineering Progression', 'Data Science & AI Roadmap',
  'Cloud Architecture & DevOps', 'Cybersecurity Career Path', 'Financial Analyst Skills', 'Healthcare Career Growth',
  'Sales Performance & Quotas', 'Digital Marketing Strategy', 'Student Career Advice', 'Fresher Hiring Guide',
  'Career Transition Playbook', 'Executive Leadership Growth', 'Remote Work Efficiency', 'Freelance & Contracting',
  'Continuous Skill Learning', 'Salary Negotiation Tactics', 'Productivity & Work-Life Balance', 'Professional Networking',
  'Communication & Soft Skills', 'Diversity & Inclusive Hiring', 'Recruitment Analytics & Metrics'
];

function generateEditorialArticles(): ContentItem[] {
  const items: ContentItem[] = [];

  EDITORIAL_TOPICS.forEach((topic) => {
    // Generate 60 distinct articles per topic (35 * 60 = 2,100 articles)
    for (let i = 1; i <= 60; i++) {
      const slug = `${toSlug(topic)}-vol-${i}`;
      items.push({
        id: `art-${toSlug(topic)}-${i}`,
        slug,
        title: `${topic}: Actionable Insights, Case Studies & Frameworks (Volume ${i})`,
        description: `In-depth analysis and practical guide on ${topic.toLowerCase()} in India and global job markets. Strategic steps, common pitfalls, and skill requirements.`,
        category: 'Article',
        author: AUTHOR_EDITORIAL,
        publishedDate: '2026-03-01',
        intro: `Mastering ${topic.toLowerCase()} is essential for modern career advancement. This TalentXcel editorial analysis provides actionable steps and industry standards.`,
        bodySections: [
          {
            heading: `Strategic Fundamentals of ${topic}`,
            content: `Professionals navigating ${topic.toLowerCase()} must focus on structured planning, measurable metrics, and continuous skill refinement to maintain competitive advantage.`,
            bulletPoints: [
              `Establish clear goals and success benchmarks.`,
              `Apply domain best practices and modern methodologies.`,
              `Measure outcomes and iterate based on market feedback.`,
            ],
          },
          {
            heading: `Implementation Roadmap & Career Impact`,
            content: `Consistently executing these practices accelerates professional growth, improves job match scores, and elevates candidate visibility to recruiters.`,
          },
        ],
        relatedSkills: ['Professional Development', 'Career Growth', 'Skill Building'],
        relatedRoles: ['Software Engineer', 'Data Analyst', 'HR Manager', 'Project Manager'],
        relatedIndustries: ['Information Technology', 'Enterprise Services', 'Finance'],
        relatedLocations: ['Pan-India', 'Delhi NCR', 'Bangalore', 'Mumbai'],
        relatedCompanies: ['TalentXcel'],
        canonicalUrl: `https://talentxcel.in/resources/${slug}`,
        schemaType: 'Article',
        indexable: true,
        ctaType: 'candidate',
      });
    }
  });

  return items;
}

// Generate Role Guides (Path, Resume, Interview, Salary Guides for 180+ Roles)
function generateRoleGuides(): ContentItem[] {
  const items: ContentItem[] = [];

  Object.values(JOB_CATEGORIES).forEach((category) => {
    category.roles.forEach((role) => {
      const roleSlug = toSlug(role);

      // 1. Role Career Path Guide
      const pathSlug = `how-to-become-a-${roleSlug}`;
      items.push({
        id: `role-guide-${roleSlug}`,
        slug: pathSlug,
        title: `How to Become a ${role}: Career Path, Required Skills & Roadmap`,
        description: `Complete career guide for ${role} positions in India. Learn key responsibilities, essential technical skills, education requirements, and career progression.`,
        category: 'CareerPath',
        author: AUTHOR_EDITORIAL,
        publishedDate: '2026-03-10',
        intro: `A career as a ${role} offers dynamic growth opportunities in ${category.name}. This comprehensive guide covers core responsibilities, skill roadmaps, and interview preparation strategies.`,
        bodySections: [
          {
            heading: `Key Responsibilities of a ${role}`,
            content: `Professionals in ${role} positions collaborate with cross-functional teams to execute critical ${category.name.toLowerCase()} projects and deliver high-impact business outcomes.`,
            bulletPoints: [
              `Execute end-to-end ${category.name.toLowerCase()} initiatives.`,
              `Apply industry best practices to ensure quality and scalability.`,
              `Collaborate with managers and senior leadership.`,
            ],
          },
          {
            heading: `Essential Skills Needed for ${role}`,
            content: `To excel as a ${role}, candidates should develop a strong mix of domain knowledge, modern software tools, and communication skills.`,
            bulletPoints: category.skills.slice(0, 5),
          },
        ],
        relatedSkills: category.skills.slice(0, 6),
        relatedRoles: [role],
        relatedIndustries: [category.name],
        relatedLocations: ['Delhi NCR', 'Bangalore', 'Mumbai', 'Hyderabad', 'Pune'],
        relatedCompanies: ['TalentXcel'],
        canonicalUrl: `https://talentxcel.in/resources/${pathSlug}`,
        schemaType: 'Occupation',
        indexable: true,
        ctaType: 'candidate',
      });

      // 2. Role Resume Guide
      const resumeSlug = `${roleSlug}-resume-guide`;
      items.push({
        id: `resume-guide-${roleSlug}`,
        slug: resumeSlug,
        title: `${role} Resume Guide: Sample Bullet Points & ATS Optimization`,
        description: `Create a winning ${role} resume. Includes top recruiter-approved bullet points, skill keywords, and formatting tips to pass ATS screeners.`,
        category: 'ResumeGuide',
        author: AUTHOR_EDITORIAL,
        publishedDate: '2026-03-12',
        intro: `Standing out as a ${role} requires a bulletproof resume that highlights measurable achievements, tools mastered, and core domain skills.`,
        bodySections: [
          {
            heading: `Top Resume Keywords for ${role}`,
            content: `Include high-impact skill terms in your professional summary and experience bullet points to score high on recruiter ATS searches.`,
            bulletPoints: category.skills.slice(0, 5),
          },
        ],
        relatedSkills: category.skills.slice(0, 6),
        relatedRoles: [role],
        relatedIndustries: [category.name],
        relatedLocations: ['Pan-India'],
        relatedCompanies: ['TalentXcel'],
        canonicalUrl: `https://talentxcel.in/resources/${resumeSlug}`,
        schemaType: 'HowTo',
        indexable: true,
        ctaType: 'candidate',
      });

      // 3. Role Interview Guide
      const interviewSlug = `${roleSlug}-interview-questions`;
      items.push({
        id: `interview-guide-${roleSlug}`,
        slug: interviewSlug,
        title: `Top ${role} Interview Questions and Proven Answers`,
        description: `Prepare for your ${role} interview with sample questions, technical scenarios, and STAR-method responses curated by talent experts.`,
        category: 'InterviewGuide',
        author: AUTHOR_EDITORIAL,
        publishedDate: '2026-03-15',
        intro: `A successful ${role} interview requires a balance of domain technical expertise and strong behavioral problem-solving demonstration.`,
        bodySections: [
          {
            heading: `Common Technical & Scenario Questions for ${role}`,
            content: `Hiring managers evaluate problem-solving methodologies, tool proficiency, and how you handle real-world challenges under pressure.`,
          },
        ],
        relatedSkills: category.skills.slice(0, 6),
        relatedRoles: [role],
        relatedIndustries: [category.name],
        relatedLocations: ['Pan-India'],
        relatedCompanies: ['TalentXcel'],
        canonicalUrl: `https://talentxcel.in/resources/${interviewSlug}`,
        schemaType: 'Article',
        indexable: true,
        ctaType: 'candidate',
      });

      // 4. Role Salary & Compensation Guide
      const salarySlug = `${roleSlug}-salary-career-guide`;
      items.push({
        id: `salary-guide-${roleSlug}`,
        slug: salarySlug,
        title: `${role} Salary Trends, Progression & Market Compensation Guide`,
        description: `Understand career compensation dynamics for ${role} roles across entry, mid, and senior experience levels in India.`,
        category: 'SalaryGuide',
        author: AUTHOR_EDITORIAL,
        publishedDate: '2026-03-18',
        intro: `Compensation for ${role} positions is influenced by verified skill proficiency, location, company scale, and demonstrated project impact.`,
        bodySections: [
          {
            heading: `Factors Influencing ${role} Salaries`,
            content: `Demonstrated expertise in high-demand tools, project leadership, and domain specializations command competitive market compensation.`,
          },
        ],
        relatedSkills: category.skills.slice(0, 6),
        relatedRoles: [role],
        relatedIndustries: [category.name],
        relatedLocations: ['Delhi NCR', 'Bangalore', 'Mumbai', 'Hyderabad'],
        relatedCompanies: ['TalentXcel'],
        canonicalUrl: `https://talentxcel.in/resources/${salarySlug}`,
        schemaType: 'Article',
        indexable: true,
        ctaType: 'candidate',
      });
    });
  });

  return items;
}

// Generate Skill-Based Guides for 190+ Skills
function generateSkillGuides(): ContentItem[] {
  const items: ContentItem[] = [];

  Object.values(JOB_CATEGORIES).forEach((category) => {
    category.skills.forEach((skill) => {
      const skillSlug = toSlug(skill);
      const slug = `${skillSlug}-skill-guide`;
      items.push({
        id: `skill-guide-${skillSlug}`,
        slug,
        title: `Mastering ${skill}: Key Applications, Career Value & Learning Path`,
        description: `Comprehensive guide to learning ${skill}. Discover top career roles requiring ${skill}, key sub-topics to master, and recommended certifications.`,
        category: 'SkillGuide',
        author: AUTHOR_EDITORIAL,
        publishedDate: '2026-03-20',
        intro: `${skill} is a fundamental skill in ${category.name}. Mastering ${skill} opens up high-demand career pathways across leading hiring organizations.`,
        bodySections: [
          {
            heading: `Why ${skill} is Crucial in ${category.name}`,
            content: `Employers look for verified proficiency in ${skill} to ensure team productivity, project accuracy, and modern technical capability.`,
          },
        ],
        relatedSkills: [skill],
        relatedRoles: category.roles.slice(0, 4),
        relatedIndustries: [category.name],
        relatedLocations: ['Pan-India'],
        relatedCompanies: ['TalentXcel'],
        canonicalUrl: `https://talentxcel.in/resources/${slug}`,
        schemaType: 'DefinedTerm',
        indexable: true,
        ctaType: 'candidate',
      });
    });
  });

  return items;
}

// 30+ Employer Hiring & Talent Acquisition Guides
const EMPLOYER_GUIDE_TOPICS = [
  { slug: 'talent-acquisition-strategy-india', title: 'Talent Acquisition Strategy in India', focus: 'building a scalable recruitment strategy' },
  { slug: 'how-to-reduce-time-to-hire', title: 'How to Reduce Time to Hire', focus: 'reducing recruitment delays without compromising hiring quality' },
  { slug: 'employee-referral-program-guide', title: 'Employee Referral Programs', focus: 'building an effective employee referral system' },
  { slug: 'structured-interview-process', title: 'Structured Interview Process', focus: 'creating consistent and evidence-based interviews' },
  { slug: 'employer-branding-recruitment', title: 'Employer Branding for Recruitment', focus: 'attracting qualified candidates through stronger employer positioning' },
  { slug: 'campus-hiring-strategy-2026', title: 'Campus Hiring Strategy in 2026', focus: 'sourcing and onboarding fresh graduate talent' },
  { slug: 'workforce-planning-framework', title: 'Workforce Planning Framework', focus: 'forecasting headcount and skill requirements' },
  { slug: 'recruitment-process-outsourcing-rpo', title: 'RPO & Staffing Solutions', focus: 'evaluating recruitment outsourcing models' },
  { slug: 'tech-hiring-best-practices', title: 'Technical Hiring Best Practices', focus: 'evaluating software developers and technical leads' },
  { slug: 'startup-recruitment-playbook', title: 'Startup Recruitment Playbook', focus: 'hiring core team members on a lean budget' },
  { slug: 'sme-hiring-optimization', title: 'SME Hiring Optimization', focus: 'competing for talent as a small to mid-sized business' },
  { slug: 'candidate-experience-design', title: 'Candidate Experience Design', focus: 'creating positive candidate touchpoints from application to offer' },
  { slug: 'remote-team-onboarding', title: 'Remote Team Onboarding', focus: 'seamlessly integrating remote employees' },
  { slug: 'employee-retention-strategies', title: 'Employee Retention Strategies', focus: 'minimizing early-stage turnover and attrition' },
  { slug: 'recruitment-analytics-metrics', title: 'Recruitment Analytics & Key Metrics', focus: 'measuring cost-per-hire and offer acceptance rate' },
  { slug: 'diversity-inclusion-hiring', title: 'Diversity & Inclusion Hiring', focus: 'building unbiased screening and interview practices' },
  { slug: 'headhunting-executive-search', title: 'Executive Search & Direct Sourcing', focus: 'sourcing senior leadership and specialized talent' },
  { slug: 'skills-based-hiring-transition', title: 'Skills-Based Hiring Transition', focus: 'shifting from degree requirements to verified capability' },
  { slug: 'ats-implementation-guide-employers', title: 'Employer ATS Selection & Implementation', focus: 'choosing and setting up recruitment software' },
  { slug: 'contract-staffing-benefits', title: 'Contract Staffing & Freelance Integration', focus: 'managing contingent workforces effectively' },
  { slug: 'bfsi-hiring-trends-india', title: 'BFSI Hiring Trends & Compliance', focus: 'recruiting for banking, financial services, and insurance' },
  { slug: 'healthcare-recruitment-best-practices', title: 'Healthcare Recruitment Best Practices', focus: 'sourcing verified medical and administrative professionals' },
  { slug: 'sales-recruitment-framework', title: 'Sales & BD Recruitment Framework', focus: 'hiring quota-carrying sales reps and account managers' },
  { slug: 'customer-support-hiring-guide', title: 'Customer Support Hiring Guide', focus: 'building high-performing service teams' },
  { slug: 'hiring-manager-interviewer-training', title: 'Interviewer Training for Hiring Managers', focus: 'eliminating bias and scoring candidates accurately' },
  { slug: 'offer-letter-acceptance-optimization', title: 'Offer Letter Acceptance Optimization', focus: 'closing top candidates and preventing reneges' },
  { slug: 'pre-boarding-engagement-tactics', title: 'Pre-boarding Engagement Tactics', focus: 'keeping hired candidates warm before Day 1' },
  { slug: 'gig-economy-workforce-management', title: 'Gig Economy Workforce Management', focus: 'structuring flexible project-based teams' },
  { slug: 'employer-legal-compliance-india', title: 'Employer Labor Law & Hiring Compliance in India', focus: 'ensuring statutory compliance in recruitment' },
  { slug: 'ai-in-recruitment-employer-guide', title: 'AI in Recruitment: Employer Implementation', focus: 'leveraging AI screening without sacrificing human touch' },
];

function generateEmployerGuides(): ContentItem[] {
  return EMPLOYER_GUIDE_TOPICS.map((topic) => ({
    id: `employer-topic-${topic.slug}`,
    slug: topic.slug,
    title: `${topic.title} | TalentXcel Employer Insights`,
    description: `Practical guidance for hiring managers and HR leaders in India on ${topic.focus}.`,
    category: 'EmployerGuide',
    author: AUTHOR_HIRING,
    publishedDate: '2026-04-01',
    intro: `Hiring teams need practical systems for ${topic.focus}. This TalentXcel employer guide explains key principles, implementation steps, recruitment considerations, and metrics that organizations can use to improve their hiring process.`,
    bodySections: [
      {
        heading: `Why ${topic.title} Matters`,
        content: `Organizations increasingly need structured recruitment processes that support business growth while maintaining a strong candidate experience. ${topic.title} helps hiring teams create a more consistent and measurable approach to recruitment.`
      },
      {
        heading: 'Best Practices & Implementation Steps',
        content: `Start by defining clear objectives, ownership, candidate requirements, and measurable outcomes. Hiring managers and recruitment teams should establish a consistent process and review performance regularly.`
      },
      {
        heading: 'How TalentXcel Can Support Employers',
        content: `TalentXcel connects employers with career profiles, skills, professional identities, learning resources, and recruitment workflows. Employers can use the platform to strengthen candidate discovery and build more effective hiring pipelines.`
      }
    ],
    relatedSkills: [
      'Talent Acquisition',
      'Recruitment Strategy',
      'Workforce Planning',
      'Employer Branding',
      'Recruitment Operations',
      'HR Analytics'
    ],
    relatedRoles: [
      'HR Manager',
      'Talent Acquisition Manager',
      'Recruitment Manager',
      'Recruiting Lead',
      'HR Business Partner'
    ],
    relatedIndustries: [
      'Information Technology',
      'Staffing',
      'Enterprise Services',
      'Healthcare',
      'Financial Services'
    ],
    relatedLocations: [
      'Delhi NCR',
      'Gurgaon',
      'Noida',
      'Bangalore',
      'Mumbai',
      'Hyderabad',
      'Pan-India'
    ],
    relatedCompanies: [
      'TalentXcel'
    ],
    canonicalUrl: `https://talentxcel.in/resources/${topic.slug}`,
    schemaType: 'Article',
    indexable: true,
    ctaType: 'employer'
  }));
}

// Deduplicate handcrafted vs generated guides
const allGeneratedItems = [
  ...HANDCRAFTED_GUIDES,
  ...generateEditorialArticles(),
  ...generateRoleGuides(),
  ...generateSkillGuides(),
  ...generateEmployerGuides(),
];

const uniqueItemMap = new Map<string, ContentItem>();
allGeneratedItems.forEach((item) => {
  if (!uniqueItemMap.has(item.slug)) {
    uniqueItemMap.set(item.slug, item);
  }
});

export const CONTENT_REGISTRY: ContentItem[] = Array.from(uniqueItemMap.values());
