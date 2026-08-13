/**
 * TalentXcel — Server/Build-Only Content Registry Data
 *
 * ⚠️  DO NOT IMPORT THIS FILE INTO ANY CLIENT-SIDE REACT COMPONENT.
 *
 * This file contains the FULL 5,000+ item content dataset used ONLY by:
 *   - scripts/generate-sitemap.ts (sitemap generation)
 *   - scripts/generate-content-json.ts (per-page JSON files for the renderer)
 *
 * The browser should NEVER download this entire dataset.
 * Instead, ResourceDetail.tsx fetches only /content/<slug>.json for the
 * specific page being rendered.
 *
 * Architecture:
 *
 *   BUILD TIME:
 *     scripts/generate-content-json.ts
 *       → imports CONTENT_DATA from this file
 *       → writes public/content/<slug>.json for each item
 *
 *   RUNTIME (browser):
 *     ResourceDetail.tsx
 *       → fetches /content/<slug>.json
 *       → renders only that one item
 *       → returns 404 if JSON not found (prevents generic shell)
 *
 *   SITEMAP:
 *     scripts/generate-sitemap.ts
 *       → imports CONTENT_DATA from this file
 *       → registers /resources/<slug> for each indexable item
 */

import { JOB_CATEGORIES } from '../src/utils/jobCategories';

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

// ─── Authors ─────────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toSlug = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ─── Handcrafted Featured Guides ──────────────────────────────────────────────

const HANDCRAFTED_GUIDES: ContentItem[] = [
  {
    id: 'how-to-build-an-effective-talent-acquisition-strategy-india',
    slug: 'how-to-build-an-effective-talent-acquisition-strategy-india',
    title: 'How to Build an Effective Talent Acquisition Strategy in India | TalentXcel Employer Insights',
    description: 'A practical talent acquisition guide for hiring managers in India covering workforce planning, candidate sourcing, structured interviews, employer branding, hiring technology, and recruitment metrics.',
    category: 'EmployerGuide',
    author: AUTHOR_HIRING,
    publishedDate: '2026-04-01',
    intro: 'An effective talent acquisition strategy is more than filling open positions. Hiring leaders need a repeatable system that connects workforce planning, candidate sourcing, employer branding, structured assessment, hiring technology, and onboarding.',
    bodySections: [
      {
        heading: 'Start With Workforce Planning',
        content: 'Before opening a position, hiring teams should understand why the role is required, what outcomes the person will own, which skills are essential, and how the role fits into the organization.',
      },
      {
        heading: 'Define the Right Candidate Profile',
        content: 'A strong candidate profile separates essential requirements from preferred qualifications. Hiring managers should clearly define responsibilities, technical capabilities, and measurable outcomes.',
      },
      {
        heading: 'Build a Multi-Channel Sourcing Strategy',
        content: 'Relying on one sourcing channel limits candidate quality and diversity. Effective hiring teams combine active sourcing, inbound applications, referral programs, and professional network outreach.',
        bulletPoints: [
          'Use AI-powered job matching to surface qualified candidates faster.',
          'Build an employee referral program with clear incentives.',
          'Invest in employer branding to attract passive candidates.',
          'Leverage verified candidate profiles from platforms like TalentXcel.',
        ],
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
    description: 'Learn how Applicant Tracking Systems (ATS) scan resumes in India and global markets. Get recruiter-approved formatting rules, keyword tips, and templates.',
    category: 'ResumeGuide',
    author: AUTHOR_EDITORIAL,
    publishedDate: '2026-01-15',
    updatedDate: '2026-08-10',
    intro: 'Over 85% of corporate applications in India pass through an Applicant Tracking System before reaching a human recruiter. Formatting errors and missing keywords filter out qualified candidates before a human ever reads the application.',
    bodySections: [
      {
        heading: 'Why ATS Parsing Fails for Standard Resumes',
        content: 'Applicant Tracking Systems convert PDF and Word documents into plain text structured data. Single-column layouts without graphics or text boxes parse cleanly. Multi-column layouts, headers and footers, and graphic elements commonly cause parsing failures.',
        bulletPoints: [
          'Avoid multi-column layouts — ATS systems read left to right, top to bottom.',
          'Use standard section headings: Summary, Experience, Education, Skills.',
          'Save your resume as a PDF only if the posting explicitly accepts PDFs.',
          'Never put contact details in the document header or footer section.',
        ],
      },
      {
        heading: 'Keyword Strategy That Actually Works',
        content: 'The most effective keyword strategy mirrors the exact language used in the job description. Use the specific tool names, certification acronyms, and skill phrases the employer listed — not synonyms.',
        bulletPoints: [
          'Copy exact phrases from the job description into your skills section.',
          'Include both spelled-out and acronym versions of certifications (e.g., "Project Management Professional (PMP)").',
          'Add a dedicated skills section near the top of the resume.',
        ],
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

// ─── Editorial Articles (35 topics × 10 angles = 350) ────────────────────────

const SEARCH_ANGLES = [
  'complete-guide', 'step-by-step-roadmap', 'top-strategies-for-success',
  'best-practices-and-frameworks', 'key-skills-and-competencies',
  'industry-benchmarks-and-trends', 'expert-tips-for-professionals',
  'common-pitfalls-and-how-to-avoid-them', 'proven-methodologies',
  'action-plan-for-career-growth',
];

const EDITORIAL_TOPICS = [
  { topic: 'Career Development Strategy', skills: ['Career Planning', 'Goal Setting', 'Professional Development'], roles: ['Any Professional', 'Manager', 'Team Lead'], industries: ['All Industries'] },
  { topic: 'Job Search Mastery', skills: ['Job Search', 'Networking', 'Personal Branding'], roles: ['Job Seeker', 'Career Changer'], industries: ['All Industries'] },
  { topic: 'ATS Resume Optimization', skills: ['Resume Writing', 'ATS Optimization', 'Keyword Research'], roles: ['Job Seeker', 'HR Professional'], industries: ['All Industries'] },
  { topic: 'Interview Preparation', skills: ['Interview Skills', 'Communication', 'Storytelling'], roles: ['Job Seeker', 'Fresher'], industries: ['All Industries'] },
  { topic: 'Technical Interview DSA', skills: ['Data Structures', 'Algorithms', 'Problem Solving', 'Python', 'Java'], roles: ['Software Engineer', 'Full Stack Developer', 'Backend Developer'], industries: ['Technology'] },
  { topic: 'System Design Mastery', skills: ['System Design', 'Architecture', 'Scalability', 'AWS', 'Docker'], roles: ['Software Engineer', 'Technical Lead', 'Cloud Architect'], industries: ['Technology'] },
  { topic: 'Behavioral Interview STAR Method', skills: ['Communication', 'Leadership', 'Problem Solving'], roles: ['Manager', 'Business Analyst', 'Product Manager'], industries: ['All Industries'] },
  { topic: 'Workplace Leadership', skills: ['Leadership', 'Team Management', 'Decision Making', 'Communication'], roles: ['Manager', 'Team Lead', 'Director'], industries: ['All Industries'] },
  { topic: 'Management & Operations', skills: ['Operations Management', 'Project Management', 'Process Improvement'], roles: ['Operations Manager', 'Production Manager', 'Plant Manager'], industries: ['Manufacturing', 'Consulting'] },
  { topic: 'HR Strategy & Compliance', skills: ['HR Management', 'Labor Law', 'Compliance', 'Employee Relations'], roles: ['HR Manager', 'HR Business Partner', 'CHRO'], industries: ['All Industries'] },
  { topic: 'Talent Acquisition & Sourcing', skills: ['Recruiting', 'Sourcing', 'Employer Branding', 'ATS'], roles: ['Recruiter', 'Talent Acquisition Manager', 'HR Manager'], industries: ['Staffing', 'All Industries'] },
  { topic: 'Employer Branding', skills: ['Employer Branding', 'Content Marketing', 'Social Media', 'HR Marketing'], roles: ['HR Manager', 'Talent Acquisition Manager', 'Marketing Manager'], industries: ['All Industries'] },
  { topic: 'Campus Recruitment India', skills: ['Campus Hiring', 'Graduate Recruitment', 'Employer Branding'], roles: ['Campus Recruiter', 'HR Manager', 'Talent Acquisition Specialist'], industries: ['IT', 'BFSI', 'Manufacturing'] },
  { topic: 'AI & Automation Careers', skills: ['AI', 'Machine Learning', 'Python', 'Deep Learning', 'NLP'], roles: ['AI Engineer', 'Machine Learning Engineer', 'Data Scientist'], industries: ['Technology'] },
  { topic: 'Software Engineering Progression', skills: ['Software Architecture', 'Code Quality', 'System Design', 'Python', 'Java'], roles: ['Software Engineer', 'Senior Engineer', 'Technical Lead', 'Engineering Manager'], industries: ['Technology'] },
  { topic: 'Data Science & AI Roadmap', skills: ['Python', 'Machine Learning', 'Statistics', 'SQL', 'TensorFlow'], roles: ['Data Scientist', 'Data Analyst', 'ML Engineer'], industries: ['Technology', 'Finance'] },
  { topic: 'Cloud Architecture & DevOps', skills: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform'], roles: ['Cloud Architect', 'DevOps Engineer', 'Site Reliability Engineer'], industries: ['Technology'] },
  { topic: 'Cybersecurity Career Path', skills: ['Network Security', 'Penetration Testing', 'SIEM', 'Cryptography'], roles: ['Cybersecurity Analyst', 'Security Engineer', 'CISO'], industries: ['Technology', 'Finance', 'Government'] },
  { topic: 'Financial Analyst Skills', skills: ['Financial Modeling', 'Excel', 'Valuation', 'Bloomberg', 'Risk Analysis'], roles: ['Financial Analyst', 'Investment Banker', 'Portfolio Manager'], industries: ['Finance', 'Banking'] },
  { topic: 'Healthcare Career Growth', skills: ['Patient Care', 'Clinical Documentation', 'Healthcare Regulations', 'Medical Coding'], roles: ['Nurse', 'Healthcare Administrator', 'Clinical Research Coordinator'], industries: ['Healthcare', 'Pharmaceuticals'] },
  { topic: 'Sales Performance & Quotas', skills: ['CRM Software', 'Lead Generation', 'Negotiation', 'Sales Forecasting'], roles: ['Sales Manager', 'Account Manager', 'Business Development Manager'], industries: ['Sales', 'Technology', 'BFSI'] },
  { topic: 'Digital Marketing Strategy', skills: ['SEO', 'SEM', 'Google Analytics', 'Social Media Marketing', 'Content Marketing'], roles: ['Digital Marketing Manager', 'SEO Specialist', 'Content Strategist'], industries: ['Marketing', 'E-commerce'] },
  { topic: 'Student Career Advice', skills: ['Career Planning', 'Resume Writing', 'Interview Skills', 'Networking'], roles: ['Fresher', 'Graduate', 'Intern'], industries: ['All Industries'] },
  { topic: 'Fresher Hiring Guide', skills: ['Campus Hiring', 'Graduate Assessment', 'Onboarding'], roles: ['HR Manager', 'Campus Recruiter', 'Talent Acquisition Specialist'], industries: ['All Industries'] },
  { topic: 'Career Transition Playbook', skills: ['Career Planning', 'Skill Gap Analysis', 'Personal Branding', 'Networking'], roles: ['Career Changer', 'Professional', 'Manager'], industries: ['All Industries'] },
  { topic: 'Executive Leadership Growth', skills: ['Strategic Leadership', 'Executive Presence', 'Board Management', 'P&L Management'], roles: ['Director', 'VP', 'CEO', 'C-Suite Executive'], industries: ['All Industries'] },
  { topic: 'Remote Work Efficiency', skills: ['Remote Collaboration', 'Time Management', 'Communication Tools', 'Project Management'], roles: ['Remote Worker', 'Manager', 'Software Engineer'], industries: ['Technology', 'Consulting'] },
  { topic: 'Freelance & Contracting', skills: ['Freelancing', 'Client Management', 'Contract Negotiation', 'Project Management'], roles: ['Freelancer', 'Contractor', 'Consultant'], industries: ['Technology', 'Media', 'Consulting'] },
  { topic: 'Continuous Skill Learning', skills: ['Learning & Development', 'Upskilling', 'E-learning', 'Certification'], roles: ['Any Professional', 'Manager', 'Fresher'], industries: ['All Industries'] },
  { topic: 'Salary Negotiation Tactics', skills: ['Negotiation', 'Communication', 'Market Research', 'Financial Literacy'], roles: ['Job Seeker', 'Professional', 'Manager'], industries: ['All Industries'] },
  { topic: 'Productivity & Work-Life Balance', skills: ['Time Management', 'Prioritization', 'Mindfulness', 'Goal Setting'], roles: ['Any Professional', 'Manager', 'Remote Worker'], industries: ['All Industries'] },
  { topic: 'Professional Networking', skills: ['Networking', 'Personal Branding', 'LinkedIn', 'Communication'], roles: ['Job Seeker', 'Professional', 'Sales Executive'], industries: ['All Industries'] },
  { topic: 'Communication & Soft Skills', skills: ['Communication', 'Presentation', 'Emotional Intelligence', 'Active Listening'], roles: ['Any Professional', 'Manager', 'Sales Executive'], industries: ['All Industries'] },
  { topic: 'Diversity & Inclusive Hiring', skills: ['D&I Strategy', 'Bias Reduction', 'Inclusive Hiring', 'Culture Building'], roles: ['HR Manager', 'Recruiter', 'D&I Manager'], industries: ['All Industries'] },
  { topic: 'Recruitment Analytics & Metrics', skills: ['Recruitment Analytics', 'ATS', 'Data Analysis', 'HR Metrics'], roles: ['HR Manager', 'Talent Acquisition Manager', 'HR Analyst'], industries: ['All Industries'] },
];

function generateEditorialArticles(): ContentItem[] {
  const items: ContentItem[] = [];
  EDITORIAL_TOPICS.forEach(({ topic, skills, roles, industries }) => {
    SEARCH_ANGLES.forEach((angle, idx) => {
      const topicSlug = toSlug(topic);
      const slug = `${topicSlug}-${angle}`;
      const angleTitle = angle.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const title = `${topic}: ${angleTitle} | TalentXcel Career Intelligence`;
      items.push({
        id: `art-${topicSlug}-${idx + 1}`,
        slug,
        title,
        description: `In-depth analysis and practical guide on ${topic.toLowerCase()}. Strategic frameworks, common pitfalls, skill requirements, and career outcomes for professionals and organisations.`,
        category: 'Article',
        author: AUTHOR_EDITORIAL,
        publishedDate: '2026-03-01',
        intro: `Mastering ${topic.toLowerCase()} is essential for modern career advancement. This TalentXcel editorial guide provides actionable steps, industry standards, and practical frameworks that professionals can apply immediately.`,
        bodySections: [
          {
            heading: `Strategic Fundamentals of ${topic}`,
            content: `Professionals navigating ${topic.toLowerCase()} must focus on structured planning, measurable metrics, and continuous skill refinement. The most effective practitioners combine domain expertise with a learning mindset that adapts to market changes.`,
            bulletPoints: [
              'Establish clear goals with measurable success benchmarks.',
              'Apply domain-specific best practices and modern methodologies.',
              'Measure outcomes and iterate based on market and performance feedback.',
              'Build a professional network to accelerate knowledge sharing.',
            ],
          },
          {
            heading: `Implementation Roadmap & Career Impact`,
            content: `Consistently executing these practices accelerates professional growth, improves job match scores, and elevates candidate visibility to recruiters. Organisations that invest in structured ${topic.toLowerCase()} programs see measurably better hiring and retention outcomes.`,
            bulletPoints: [
              'Start with a personal or organisational audit of current capability.',
              'Build a 30/60/90-day implementation plan with clear milestones.',
              'Identify and close the top 3 skill gaps first.',
              'Track progress monthly and adjust the plan as market signals change.',
            ],
          },
        ],
        relatedSkills: skills.slice(0, 5),
        relatedRoles: roles.slice(0, 4),
        relatedIndustries: industries,
        relatedLocations: ['Delhi NCR', 'Bangalore', 'Mumbai', 'Hyderabad', 'Pan-India'],
        relatedCompanies: ['TalentXcel'],
        canonicalUrl: `https://talentxcel.in/resources/${slug}`,
        schemaType: 'Article',
        indexable: true,
        ctaType: 'candidate',
      });
    });
  });
  return items;
}

// ─── Role Guides (Roles × 4 content types) ──────────────────────────────────

function generateRoleGuides(): ContentItem[] {
  const items: ContentItem[] = [];
  Object.values(JOB_CATEGORIES).forEach((category) => {
    category.roles.forEach((role) => {
      const roleSlug = toSlug(role);

      // 1. Career Path Guide
      items.push({
        id: `role-guide-${roleSlug}`,
        slug: `how-to-become-a-${roleSlug}`,
        title: `How to Become a ${role}: Career Path, Skills & Roadmap | TalentXcel`,
        description: `Complete career guide for ${role}. Learn key responsibilities, essential skills, education requirements, career progression, and salary expectations.`,
        category: 'CareerPath',
        author: AUTHOR_EDITORIAL,
        publishedDate: '2026-03-10',
        intro: `A career as a ${role} offers dynamic growth opportunities in ${category.name}. This comprehensive guide covers core responsibilities, skill roadmaps, career progression milestones, and interview preparation strategies.`,
        bodySections: [
          {
            heading: `What Does a ${role} Do?`,
            content: `Professionals in ${role} positions collaborate with cross-functional teams to execute critical ${category.name.toLowerCase()} projects. Day-to-day responsibilities include planning, execution, stakeholder communication, and continuous quality improvement.`,
            bulletPoints: [
              `Execute end-to-end ${category.name.toLowerCase()} initiatives aligned with business objectives.`,
              'Apply industry best practices to ensure quality, speed, and scalability.',
              'Collaborate with managers, senior leadership, and cross-functional peers.',
              'Continuously develop technical and domain expertise.',
            ],
          },
          {
            heading: `Essential Skills for ${role}`,
            content: `To excel as a ${role}, candidates should develop a strong mix of domain knowledge, modern tools, and communication skills. Verified skills credentials improve your visibility to recruiters and hiring managers significantly.`,
            bulletPoints: category.skills.slice(0, 6),
          },
          {
            heading: `Career Progression Path`,
            content: `Most ${role} professionals begin at entry or associate level, progressing to senior and lead positions within 3–7 years based on demonstrated impact, skill development, and leadership ability.`,
            bulletPoints: [
              `Entry Level ${role}: 0–2 years — skill building and foundational projects.`,
              `Mid-Level ${role}: 2–5 years — independent execution and mentorship.`,
              `Senior ${role}: 5–10 years — strategy, architecture, and leadership.`,
              `Lead / Manager: 8+ years — team ownership and organisational impact.`,
            ],
          },
        ],
        relatedSkills: category.skills.slice(0, 6),
        relatedRoles: [role],
        relatedIndustries: [category.name],
        relatedLocations: ['Delhi NCR', 'Bangalore', 'Mumbai', 'Hyderabad', 'Pune'],
        relatedCompanies: ['TalentXcel'],
        canonicalUrl: `https://talentxcel.in/resources/how-to-become-a-${roleSlug}`,
        schemaType: 'Occupation',
        indexable: true,
        ctaType: 'candidate',
      });

      // 2. Resume Guide
      items.push({
        id: `resume-guide-${roleSlug}`,
        slug: `${roleSlug}-resume-guide`,
        title: `${role} Resume Guide: ATS Keywords, Format & Sample Bullet Points`,
        description: `Create a winning ${role} resume. Includes top recruiter-approved bullet points, ATS keywords, formatting tips, and career summary templates.`,
        category: 'ResumeGuide',
        author: AUTHOR_EDITORIAL,
        publishedDate: '2026-03-12',
        intro: `Standing out as a ${role} requires a resume that highlights measurable achievements, essential tools, and core domain skills — while passing ATS screening. This guide walks you through every section with specific examples and formatting best practices.`,
        bodySections: [
          {
            heading: `Top ATS Keywords for ${role} Resumes`,
            content: `Include high-impact skill terms in your professional summary and experience bullet points to score high on recruiter ATS keyword searches. Use both the full skill name and common abbreviations.`,
            bulletPoints: category.skills.slice(0, 6),
          },
          {
            heading: `Strong Resume Bullet Points for ${role}`,
            content: `Recruiters spend an average of 7 seconds scanning a resume. Lead each bullet with a strong action verb followed by a quantified outcome. Avoid vague descriptions — use numbers, percentages, and timelines.`,
            bulletPoints: [
              `Led [project type] initiative that improved [metric] by [X]% within [timeframe].`,
              `Implemented [tool/technology] to streamline [process], reducing [cost/time] by [X]%.`,
              `Collaborated with [cross-functional team] to deliver [outcome] ahead of schedule.`,
              `Designed and maintained [system/process] supporting [X] users/transactions.`,
            ],
          },
        ],
        relatedSkills: category.skills.slice(0, 6),
        relatedRoles: [role],
        relatedIndustries: [category.name],
        relatedLocations: ['Pan-India'],
        relatedCompanies: ['TalentXcel'],
        canonicalUrl: `https://talentxcel.in/resources/${roleSlug}-resume-guide`,
        schemaType: 'HowTo',
        indexable: true,
        ctaType: 'candidate',
      });

      // 3. Interview Guide
      items.push({
        id: `interview-guide-${roleSlug}`,
        slug: `${roleSlug}-interview-questions`,
        title: `Top ${role} Interview Questions & Proven Answers | TalentXcel`,
        description: `Prepare for your ${role} interview with sample questions, technical scenarios, and STAR-method responses curated by talent experts at TalentXcel.`,
        category: 'InterviewGuide',
        author: AUTHOR_EDITORIAL,
        publishedDate: '2026-03-15',
        intro: `A successful ${role} interview requires a balance of domain technical expertise and strong behavioral communication. Hiring managers evaluate problem-solving approaches, tool proficiency, and how you handle real-world challenges under pressure.`,
        bodySections: [
          {
            heading: `Common Technical Questions for ${role}`,
            content: `Technical interview rounds for ${role} positions typically cover domain knowledge, practical tool usage, scenario-based problem solving, and architecture or design decisions.`,
            bulletPoints: [
              `"Walk me through a complex ${category.name.toLowerCase()} project you led from start to finish."`,
              `"How do you handle conflicting priorities and tight deadlines?"`,
              `"Describe a situation where you identified and resolved a critical ${category.name.toLowerCase()} problem."`,
              `"What tools and methodologies do you use for ${category.skills[0] || 'core tasks'}?"`,
            ],
          },
          {
            heading: `Behavioral Interview Preparation (STAR Method)`,
            content: `Most ${role} interviews include behavioral questions using the STAR framework (Situation, Task, Action, Result). Prepare 5–8 specific stories that demonstrate leadership, problem-solving, collaboration, and impact.`,
            bulletPoints: [
              'Situation: Describe the context or challenge concisely.',
              'Task: Explain your specific responsibility or goal.',
              'Action: Detail the exact steps you took and why.',
              'Result: Share the measurable outcome with specific numbers where possible.',
            ],
          },
        ],
        relatedSkills: category.skills.slice(0, 6),
        relatedRoles: [role],
        relatedIndustries: [category.name],
        relatedLocations: ['Pan-India'],
        relatedCompanies: ['TalentXcel'],
        canonicalUrl: `https://talentxcel.in/resources/${roleSlug}-interview-questions`,
        schemaType: 'Article',
        indexable: true,
        ctaType: 'candidate',
      });

      // 4. Salary Guide
      items.push({
        id: `salary-guide-${roleSlug}`,
        slug: `${roleSlug}-salary-career-guide`,
        title: `${role} Salary Trends & Career Compensation Guide | TalentXcel`,
        description: `Understand career compensation for ${role} roles across entry, mid, and senior levels. Covers skill premiums, location differentials, and negotiation strategies in India.`,
        category: 'SalaryGuide',
        author: AUTHOR_EDITORIAL,
        publishedDate: '2026-03-18',
        intro: `Compensation for ${role} positions is influenced by verified skill proficiency, location, company scale, industry, and demonstrated project impact. This guide helps ${role} professionals understand their market value and negotiate with confidence.`,
        bodySections: [
          {
            heading: `Key Factors That Influence ${role} Salaries`,
            content: `Demonstrated expertise in high-demand tools, project leadership experience, and domain specializations command competitive market compensation. Location and company size also play a significant role in total compensation packages.`,
            bulletPoints: [
              'Verified skills and certifications command 15–30% salary premium.',
              'Bangalore and Mumbai typically offer the highest compensation for tech roles.',
              'Senior professionals with leadership experience earn 2–4× fresher-level compensation.',
              'Specialised skills like AI/ML, Cloud, or Cybersecurity have strong salary premiums.',
            ],
          },
          {
            heading: `How to Negotiate Your ${role} Salary`,
            content: `Effective salary negotiation requires market data, timing, and confident communication. Research comparable roles on job platforms, benchmark against your verified skill set, and present a clear case based on your contributions and market rates.`,
            bulletPoints: [
              'Research comparable compensation using multiple data sources.',
              'Highlight verified skills, certifications, and quantified achievements.',
              'Negotiate total compensation — not just base salary.',
              'Consider stock, performance bonuses, and learning budgets in your evaluation.',
            ],
          },
        ],
        relatedSkills: category.skills.slice(0, 6),
        relatedRoles: [role],
        relatedIndustries: [category.name],
        relatedLocations: ['Delhi NCR', 'Bangalore', 'Mumbai', 'Hyderabad'],
        relatedCompanies: ['TalentXcel'],
        canonicalUrl: `https://talentxcel.in/resources/${roleSlug}-salary-career-guide`,
        schemaType: 'Article',
        indexable: true,
        ctaType: 'candidate',
      });
    });
  });
  return items;
}

// ─── Skill Guides (190+ skills) ──────────────────────────────────────────────

function generateSkillGuides(): ContentItem[] {
  const items: ContentItem[] = [];
  Object.values(JOB_CATEGORIES).forEach((category) => {
    category.skills.forEach((skill) => {
      const skillSlug = toSlug(skill);
      items.push({
        id: `skill-guide-${skillSlug}`,
        slug: `${skillSlug}-skill-guide`,
        title: `Mastering ${skill}: Career Value, Applications & Learning Path | TalentXcel`,
        description: `Comprehensive guide to learning ${skill}. Discover career roles requiring ${skill}, key sub-topics to master, learning resources, and how to demonstrate proficiency to employers.`,
        category: 'SkillGuide',
        author: AUTHOR_EDITORIAL,
        publishedDate: '2026-03-20',
        intro: `${skill} is a high-demand skill in ${category.name}. Mastering ${skill} opens career pathways across leading organisations and significantly improves your match score with employers who prioritise this capability.`,
        bodySections: [
          {
            heading: `Why ${skill} Is Essential in ${category.name}`,
            content: `Employers look for verified proficiency in ${skill} to ensure team productivity, project accuracy, and modern technical capability. Candidates with demonstrated ${skill} expertise consistently outperform those with only theoretical knowledge.`,
            bulletPoints: [
              `${skill} is listed as a required skill in over 60% of ${category.name.toLowerCase()} job postings.`,
              'Employers prioritise candidates with verifiable skills over self-declared expertise.',
              `Proficiency in ${skill} accelerates career progression by 1–3 years on average.`,
              'Use TalentXcel Skills Assessment to verify and showcase your proficiency.',
            ],
          },
          {
            heading: `How to Learn and Demonstrate ${skill}`,
            content: `The most effective way to build ${skill} proficiency is through a combination of structured learning, hands-on project work, and verified assessment. Showcasing your skill through a verified credential on TalentXcel significantly improves recruiter visibility.`,
            bulletPoints: [
              `Start with structured online courses covering ${skill} fundamentals.`,
              'Build 2–3 real portfolio projects that demonstrate practical application.',
              'Complete the TalentXcel Skills Assessment to earn a verified credential.',
              'List the credential on your Career Passport and resume.',
            ],
          },
        ],
        relatedSkills: [skill],
        relatedRoles: category.roles.slice(0, 4),
        relatedIndustries: [category.name],
        relatedLocations: ['Pan-India', 'Bangalore', 'Delhi NCR', 'Mumbai'],
        relatedCompanies: ['TalentXcel'],
        canonicalUrl: `https://talentxcel.in/resources/${skillSlug}-skill-guide`,
        schemaType: 'DefinedTerm',
        indexable: true,
        ctaType: 'candidate',
      });
    });
  });
  return items;
}

// ─── Employer Guides (30 topics) ─────────────────────────────────────────────

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
    category: 'EmployerGuide' as ContentCategory,
    author: AUTHOR_HIRING,
    publishedDate: '2026-04-01',
    intro: `Hiring teams need practical systems for ${topic.focus}. This TalentXcel employer guide explains key principles, implementation steps, and metrics organisations can use to improve their hiring process and build stronger talent pipelines.`,
    bodySections: [
      {
        heading: `Why ${topic.title} Matters`,
        content: `Organisations need structured recruitment processes that support business growth while maintaining a strong candidate experience. ${topic.title} helps hiring teams create a more consistent and measurable approach to talent acquisition.`,
        bulletPoints: [
          'Define clear objectives and success metrics before implementation.',
          'Involve hiring managers and HR teams in the design process.',
          'Measure outcomes regularly and refine based on data.',
          'Align recruitment processes with broader organisational goals.',
        ],
      },
      {
        heading: 'Best Practices & Implementation Steps',
        content: `Start by defining clear objectives, ownership, candidate requirements, and measurable outcomes. Hiring managers and recruitment teams should establish a consistent process and review performance regularly against benchmarks.`,
        bulletPoints: [
          'Document your current process and identify the top 3 friction points.',
          'Implement one change at a time and measure the impact before the next iteration.',
          'Use data from your ATS and recruitment metrics to guide decisions.',
          'Benchmark against industry peers and best-in-class recruitment standards.',
        ],
      },
      {
        heading: 'How TalentXcel Supports Employers',
        content: `TalentXcel connects employers with verified career profiles, skills credentials, professional identities, learning resources, and recruitment workflows. Employers can use the platform to strengthen candidate discovery and build more effective hiring pipelines.`,
      },
    ],
    relatedSkills: ['Talent Acquisition', 'Recruitment Strategy', 'Workforce Planning', 'Employer Branding', 'HR Analytics'],
    relatedRoles: ['HR Manager', 'Talent Acquisition Manager', 'Recruitment Manager', 'HR Business Partner'],
    relatedIndustries: ['Information Technology', 'Staffing', 'Enterprise Services', 'Healthcare', 'Financial Services'],
    relatedLocations: ['Delhi NCR', 'Gurgaon', 'Noida', 'Bangalore', 'Mumbai', 'Hyderabad', 'Pan-India'],
    relatedCompanies: ['TalentXcel'],
    canonicalUrl: `https://talentxcel.in/resources/${topic.slug}`,
    schemaType: 'Article',
    indexable: true,
    ctaType: 'employer',
  }));
}

// ─── Fresher Guides (20 entry topics × 5 angles = up to 100 unique pages) ────
//     Explicitly scoped to avoid thin/near-duplicate content.

const FRESHER_TOPICS = [
  { topic: 'Software Engineering Fresher', field: 'software engineering', roles: ['Software Engineer', 'Frontend Developer', 'Backend Developer'], skills: ['JavaScript', 'Python', 'Java', 'React', 'Git'] },
  { topic: 'Data Science Fresher', field: 'data science and analytics', roles: ['Data Analyst', 'Data Scientist'], skills: ['Python', 'SQL', 'Statistics', 'Machine Learning', 'Excel'] },
  { topic: 'Digital Marketing Fresher', field: 'digital marketing', roles: ['Digital Marketing Manager', 'Content Creator', 'SEO Specialist'], skills: ['SEO', 'Google Analytics', 'Content Marketing', 'Social Media', 'Copywriting'] },
  { topic: 'Finance Fresher', field: 'finance and accounting', roles: ['Financial Analyst', 'Accountant', 'Credit Analyst'], skills: ['Financial Modeling', 'Excel', 'Accounting', 'Financial Reporting', 'Tally'] },
  { topic: 'HR Fresher', field: 'human resources', roles: ['HR Executive', 'Talent Acquisition Coordinator', 'HR Generalist'], skills: ['Recruitment', 'HR Policies', 'Employee Relations', 'Payroll', 'Onboarding'] },
  { topic: 'Sales Fresher', field: 'sales and business development', roles: ['Sales Development Representative', 'Business Development Executive', 'Inside Sales Representative'], skills: ['Communication', 'CRM Software', 'Lead Generation', 'Negotiation', 'Product Knowledge'] },
  { topic: 'Operations Fresher', field: 'operations and supply chain', roles: ['Operations Executive', 'Logistics Coordinator', 'Supply Chain Analyst'], skills: ['Supply Chain Management', 'Excel', 'ERP Systems', 'Inventory Management', 'Process Improvement'] },
  { topic: 'Healthcare Fresher', field: 'healthcare and clinical careers', roles: ['Medical Assistant', 'Clinical Research Coordinator', 'Healthcare Administrator'], skills: ['Patient Care', 'Medical Coding', 'Healthcare Regulations', 'Clinical Documentation', 'Medical Knowledge'] },
  { topic: 'UI UX Design Fresher', field: 'UI/UX design and product design', roles: ['UI/UX Designer', 'Product Designer', 'Graphic Designer'], skills: ['Figma', 'Adobe Creative Suite', 'User Research', 'Wireframing', 'Prototyping'] },
  { topic: 'Content Writing Fresher', field: 'content writing and copywriting', roles: ['Content Writer', 'Copywriter', 'Technical Writer'], skills: ['Content Writing', 'SEO Writing', 'Copywriting', 'Research', 'Editing'] },
  { topic: 'Cybersecurity Fresher', field: 'cybersecurity and information security', roles: ['Security Analyst', 'SOC Analyst', 'Cybersecurity Specialist'], skills: ['Network Security', 'Linux', 'Ethical Hacking', 'SIEM', 'Vulnerability Assessment'] },
  { topic: 'Cloud Computing Fresher', field: 'cloud computing and DevOps', roles: ['Cloud Engineer', 'DevOps Engineer', 'Site Reliability Engineer'], skills: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Linux'] },
  { topic: 'Product Management Fresher', field: 'product management', roles: ['Product Manager', 'Associate Product Manager', 'Business Analyst'], skills: ['Product Thinking', 'Agile', 'Data Analysis', 'User Research', 'Roadmapping'] },
  { topic: 'Teaching Fresher', field: 'education and teaching', roles: ['Teacher', 'Academic Counsellor', 'Curriculum Developer'], skills: ['Curriculum Development', 'Communication', 'Classroom Management', 'Educational Technology'] },
  { topic: 'Legal Fresher', field: 'law and legal services', roles: ['Legal Assistant', 'Junior Advocate', 'Compliance Officer'], skills: ['Legal Research', 'Contract Drafting', 'Compliance', 'Documentation', 'Communication'] },
  { topic: 'Mechanical Engineering Fresher', field: 'mechanical engineering', roles: ['Mechanical Engineer', 'Production Engineer', 'Quality Engineer'], skills: ['AutoCAD', 'SolidWorks', 'Manufacturing Processes', 'Six Sigma', 'Quality Control'] },
  { topic: 'Civil Engineering Fresher', field: 'civil engineering and construction', roles: ['Civil Engineer', 'Site Engineer', 'Structural Engineer'], skills: ['AutoCAD', 'Structural Analysis', 'Project Management', 'Construction Management'] },
  { topic: 'MBA Fresher', field: 'MBA and management careers', roles: ['Business Analyst', 'Management Trainee', 'Strategy Consultant'], skills: ['Business Analysis', 'Project Management', 'Strategic Planning', 'Excel', 'Presentation Skills'] },
  { topic: 'Journalism Fresher', field: 'journalism and media', roles: ['Journalist', 'Reporter', 'Content Creator'], skills: ['Research', 'Writing', 'Interviewing', 'Digital Media', 'Photography'] },
  { topic: 'Hospitality Fresher', field: 'hospitality and hotel management', roles: ['Front Office Executive', 'Food & Beverage Executive', 'Guest Relations Officer'], skills: ['Customer Service', 'Communication', 'Hotel Management', 'Event Planning'] },
];

const FRESHER_ANGLES = [
  { angle: 'career-guide', label: 'Career Guide: What to Expect & How to Succeed' },
  { angle: 'resume-for-freshers', label: 'Resume Guide for Freshers: Format, Tips & Samples' },
  { angle: 'interview-guide', label: 'Interview Preparation Guide for Freshers' },
  { angle: 'skills-required', label: 'Skills You Need to Get Your First Job' },
  { angle: 'first-job-roadmap', label: 'Your 90-Day Roadmap to Your First Job' },
];

function generateFresherGuides(): ContentItem[] {
  const items: ContentItem[] = [];
  FRESHER_TOPICS.forEach(({ topic, field, roles, skills }) => {
    const topicSlug = toSlug(topic);
    FRESHER_ANGLES.forEach(({ angle, label }) => {
      const slug = `${topicSlug}-${angle}`;
      items.push({
        id: `fresher-${topicSlug}-${angle}`,
        slug,
        title: `${topic}: ${label} | TalentXcel Career Guide`,
        description: `A complete ${angle.replace(/-/g, ' ')} for ${field} freshers. Covers resume tips, interview questions, required skills, and how to land your first ${topic.split(' ')[0].toLowerCase()} job.`,
        category: 'FresherGuide',
        author: AUTHOR_EDITORIAL,
        publishedDate: '2026-06-01',
        intro: `Starting your career in ${field} is both exciting and challenging. This guide is specifically designed for freshers, graduates, and career beginners who want practical, actionable guidance — not generic advice.`,
        bodySections: [
          {
            heading: `What Recruiters Look for in ${topic}s`,
            content: `Most ${field} employers hiring freshers look for foundational skills, learning ability, and a genuine interest in the domain — not years of experience. Demonstrating initiative through projects, internships, and certifications makes a significant difference.`,
            bulletPoints: [
              'Relevant internships or academic projects in the field.',
              'Core technical skills that match the job description.',
              'Communication skills and professional presentation.',
              'A portfolio or GitHub/work samples demonstrating practical ability.',
            ],
          },
          {
            heading: `Essential Skills for ${topic}`,
            content: `Before applying for your first ${field} role, build proficiency in the core skills employers consistently require. Use TalentXcel Skills Assessment to earn verified credentials that make your profile stand out.`,
            bulletPoints: skills,
          },
          {
            heading: `Your Career Path After Your First Role`,
            content: `Most ${field} freshers who build strong fundamentals and take initiative progress from entry-level to mid-level within 2–3 years. Focus on measurable impact, mentorship, and continuous upskilling.`,
            bulletPoints: [
              `Entry Level (0–2 years): Skill building, project execution, mentorship.`,
              `Junior/Mid-Level (2–4 years): Independent ownership, specialization.`,
              `Senior (4–7 years): Leadership, architecture, cross-team collaboration.`,
            ],
          },
        ],
        relatedSkills: skills,
        relatedRoles: roles,
        relatedIndustries: ['All Industries'],
        relatedLocations: ['Delhi NCR', 'Bangalore', 'Mumbai', 'Hyderabad', 'Pan-India'],
        relatedCompanies: ['TalentXcel'],
        canonicalUrl: `https://talentxcel.in/resources/${slug}`,
        schemaType: 'Article',
        indexable: true,
        ctaType: 'candidate',
      });
    });
  });
  return items;
}

// ─── AI Career / Career Passport / Networking / Rewards Guides ────────────────

const SPECIALTY_GUIDES: Array<{
  id: string; slug: string; title: string; description: string;
  category: ContentCategory; intro: string;
  bodySections: ContentItem['bodySections'];
  relatedSkills: string[]; relatedRoles: string[];
}> = [
  {
    id: 'ai-career-hub-guide', slug: 'ai-career-hub-guide',
    title: 'TalentXcel AI Career Hub: How AI Transforms Your Career Planning',
    description: 'Discover how TalentXcel\'s AI Career Hub uses artificial intelligence to create personalised career roadmaps, identify skill gaps, and match you with the right opportunities.',
    category: 'AICareerGuide',
    intro: 'Artificial intelligence is fundamentally changing how professionals plan their careers. The TalentXcel AI Career Hub combines your verified profile data with market intelligence to deliver personalised career guidance at scale.',
    bodySections: [
      { heading: 'How AI Career Planning Works', content: 'The AI Career Hub reads your verified Career Passport — education, experience, skills, assessments — and compares it with live market demand to create a personalised roadmap.', bulletPoints: ['Skill gap analysis against your target role.', 'Personalised learning path recommendations.', 'AI-powered job matching with explained scores.', 'Interview preparation tailored to your target role.'] },
      { heading: 'AI Resume Assistance', content: 'The AI Resume Assistant reviews your resume against specific job descriptions, identifies ATS keywords you are missing, and suggests improvements to increase your match score.' },
    ],
    relatedSkills: ['AI', 'Career Planning', 'Resume Writing', 'Interview Skills'],
    relatedRoles: ['Any Professional', 'Job Seeker', 'Fresher'],
  },
  {
    id: 'career-passport-complete-guide', slug: 'career-passport-complete-guide',
    title: 'TalentXcel Career Passport: Build Your Verified Professional Identity',
    description: 'Learn how to build, verify, and share your TalentXcel Career Passport — a tamper-proof professional identity that showcases your skills, experience, and credentials to employers.',
    category: 'CareerPassportGuide',
    intro: 'A Career Passport replaces the traditional resume with a dynamic, verified professional identity. Instead of unverifiable claims on paper, employers see a structured, credential-backed profile with proof for every major achievement.',
    bodySections: [
      { heading: 'What Is a Career Passport?', content: 'A Career Passport is a structured digital professional identity that contains verified education records, employment history, skills assessments, certifications, and career achievements — all with tamper-evident verification.', bulletPoints: ['Verified education and employment records.', 'Verified skills credentials from TalentXcel assessments.', 'One shareable link and QR code.', 'Granular privacy controls per section.'] },
      { heading: 'How to Build Your Career Passport', content: 'Creating your Career Passport takes 30–60 minutes. Start by adding your education and work history, then complete skills assessments to earn verified credentials, and finally set your visibility preferences.', bulletPoints: ['Add education with supporting documentation.', 'Add work experience with verifiable references.', 'Complete TalentXcel Skills Assessments.', 'Configure visibility per section.', 'Share via link or QR code.'] },
    ],
    relatedSkills: ['Personal Branding', 'Professional Networking', 'Career Planning'],
    relatedRoles: ['Any Professional', 'Job Seeker', 'Fresher'],
  },
  {
    id: 'professional-networking-guide', slug: 'professional-networking-guide',
    title: 'Professional Networking on TalentXcel: Build Meaningful Career Connections',
    description: 'A practical guide to building a professional network on TalentXcel. Learn how to connect with peers, mentors, recruiters, and industry leaders to accelerate your career.',
    category: 'NetworkingGuide',
    intro: 'Professional networking is one of the highest-ROI career activities available to any professional — regardless of level or industry. The TalentXcel Professional Network is built specifically for career-focused connections, not social media.',
    bodySections: [
      { heading: 'Why Professional Networking Matters for Your Career', content: 'Research consistently shows that 70–80% of professional roles are filled through networking and referrals. Building genuine professional relationships gives you access to opportunities that never appear on job boards.', bulletPoints: ['Access hidden job market opportunities.', 'Get warm introductions to hiring managers.', 'Build peer relationships for knowledge sharing.', 'Find mentors who have navigated your target career path.'] },
      { heading: 'Building Your Network on TalentXcel', content: 'Start by completing your TalentXcel profile with a professional headline, career summary, and verified skills. Connect with professionals in your industry, join relevant communities, and engage with content consistently.', bulletPoints: ['Complete your profile with a professional headline and summary.', 'Connect with alumni, colleagues, and industry professionals.', 'Engage meaningfully — comment, share insights, ask questions.', 'Use the QR networking feature at events and meetings.'] },
    ],
    relatedSkills: ['Networking', 'Personal Branding', 'Communication', 'LinkedIn'],
    relatedRoles: ['Any Professional', 'Job Seeker', 'Manager', 'Sales Executive'],
  },
  {
    id: 'txc-rewards-guide', slug: 'txc-rewards-guide',
    title: 'TalentXcel TXC Rewards: How to Earn & Use Career Rewards',
    description: 'Learn how the TalentXcel TXC reward system works. Earn rewards for career milestones, referrals, and platform activity.',
    category: 'RewardsGuide',
    intro: 'TalentXcel\'s TXC reward system recognises and rewards your career activity, professional development, and contributions to the TalentXcel community. This guide explains how to participate, earn points, and use your rewards.',
    bodySections: [
      { heading: 'How the TXC Reward System Works', content: 'TXC is TalentXcel\'s platform reward unit. Users earn TXC points through career activities such as completing their profile, passing skills assessments, referring friends, and achieving career milestones.', bulletPoints: ['Complete your Career Passport to earn profile completion rewards.', 'Pass TalentXcel Skills Assessments for skill verification rewards.', 'Refer a friend who joins TalentXcel to earn referral rewards.', 'Achieve career milestones to unlock milestone rewards.'] },
      { heading: 'Eligibility and Important Conditions', content: 'TXC rewards are subject to TalentXcel\'s Terms & Conditions. The TXC system is a platform engagement and loyalty programme. TXC does not represent guaranteed monetary value. Refer to the official TalentXcel Terms of Service for the complete eligibility criteria, redemption rules, and any applicable restrictions.' },
    ],
    relatedSkills: ['Career Planning', 'Professional Development'],
    relatedRoles: ['Any Professional', 'Fresher'],
  },
];

function generateSpecialtyGuides(): ContentItem[] {
  return SPECIALTY_GUIDES.map((g) => ({
    ...g,
    author: AUTHOR_EDITORIAL,
    publishedDate: '2026-05-01',
    relatedIndustries: ['All Industries'],
    relatedLocations: ['Pan-India'],
    relatedCompanies: ['TalentXcel'],
    canonicalUrl: `https://talentxcel.in/resources/${g.slug}`,
    schemaType: 'Article' as const,
    indexable: true,
    ctaType: 'candidate' as const,
  }));
}

// ─── Combine All Items ────────────────────────────────────────────────────────

const allItems: ContentItem[] = [
  ...HANDCRAFTED_GUIDES,
  ...generateEditorialArticles(),
  ...generateRoleGuides(),
  ...generateSkillGuides(),
  ...generateEmployerGuides(),
  ...generateFresherGuides(),
  ...generateSpecialtyGuides(),
];

const uniqueMap = new Map<string, ContentItem>();
allItems.forEach((item) => {
  if (!uniqueMap.has(item.slug)) {
    uniqueMap.set(item.slug, item);
  }
});

export const CONTENT_DATA: ContentItem[] = Array.from(uniqueMap.values());

export const CONTENT_SLUG_INDEX: Map<string, number> = new Map(
  CONTENT_DATA.map((item, idx) => [item.slug, idx]),
);
