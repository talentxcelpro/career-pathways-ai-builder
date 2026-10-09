/**
 * TalentXcel Subdomain Identities & Independent SEO Registry
 * 
 * Defines authoritative metadata, structured data, canonical hosts,
 * headings, and crawlable content contracts for all 9 production subdomains + core.
 */

export interface SubdomainIdentity {
  id: string;
  subdomain: string;
  hostname: string;
  origin: string;
  title: string;
  description: string;
  h1: string;
  tagline: string;
  keywords: string[];
  canonical: string;
  schemaType: string;
  schemaJsonLd: object;
  featuredInternalLinks: { text: string; href: string }[];
  siblingDomainCrossLinks: { text: string; href: string }[];
  staticHeroHtml: string;
}

export const SUBDOMAIN_IDENTITIES: Record<string, SubdomainIdentity> = {
  jobs: {
    id: 'JOBS',
    subdomain: 'jobs',
    hostname: 'jobs.talentxcel.in',
    origin: 'https://jobs.talentxcel.in',
    title: 'TalentXcel Jobs — Search 500+ Verified Tech & Enterprise Jobs',
    description: 'Explore 500+ active software engineering, data science, AI, DevOps, and enterprise job openings across Bangalore, Mumbai, Delhi, Hyderabad, and Pune. Direct 1-click ATS applications with verified employer transparency.',
    h1: 'Verified Tech & Enterprise Jobs in India',
    tagline: '500+ Verified Vacancies • Direct Employer Hiring • Instant ATS Match',
    keywords: [
      'software engineer jobs bangalore',
      'tech jobs hyderabad',
      'fresher it jobs pune',
      'remote developer jobs india',
      'data analyst jobs mumbai',
      'devops openings noida',
    ],
    canonical: 'https://jobs.talentxcel.in/',
    schemaType: 'WebSite',
    schemaJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'TalentXcel Jobs',
      'url': 'https://jobs.talentxcel.in/',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://jobs.talentxcel.in/jobs?search={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
      'description': 'Verified tech and enterprise employment opportunities across India with direct applications and ATS scoring.',
    },
    featuredInternalLinks: [
      { text: 'Bangalore Tech Jobs', href: '/bangalore' },
      { text: 'Hyderabad IT Openings', href: '/hyderabad' },
      { text: 'Pune Software Engineer Jobs', href: '/pune' },
      { text: 'Mumbai Data & Tech Vacancies', href: '/mumbai' },
      { text: 'Delhi NCR Developer Roles', href: '/delhi' },
      { text: 'Explore All 500+ Jobs', href: '/jobs' },
    ],
    siblingDomainCrossLinks: [
      { text: 'Analyze Compensation on TalentXcel Salary', href: 'https://salary.talentxcel.in/' },
      { text: 'Build an ATS Resume on TalentXcel Resume', href: 'https://resume.talentxcel.in/' },
      { text: 'Plan Your Pathway on TalentXcel Careers', href: 'https://careers.talentxcel.in/' },
      { text: 'Hire Verified Talent on TalentXcel Employers', href: 'https://employers.talentxcel.in/' },
    ],
    staticHeroHtml: `
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">Verified Tech & Enterprise Jobs in India</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Browse over 500+ verified active openings for software engineers, data analysts, cloud architects, and product leaders in Bangalore, Hyderabad, Pune, Mumbai, and Delhi NCR.</p>
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:30px;">
          <a href="/bangalore" style="background:#1e293b;color:#38bdf8;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Bangalore Jobs</a>
          <a href="/hyderabad" style="background:#1e293b;color:#38bdf8;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Hyderabad Jobs</a>
          <a href="/pune" style="background:#1e293b;color:#38bdf8;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Pune Jobs</a>
          <a href="/mumbai" style="background:#1e293b;color:#38bdf8;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Mumbai Jobs</a>
          <a href="/delhi" style="background:#1e293b;color:#38bdf8;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Delhi NCR Jobs</a>
        </div>
      </section>
    `,
  },

  salary: {
    id: 'SALARY',
    subdomain: 'salary',
    hostname: 'salary.talentxcel.in',
    origin: 'https://salary.talentxcel.in',
    title: 'TalentXcel Salary Intelligence — Verified Tech & Executive Compensation Data',
    description: 'Explore verified compensation data, percentiles (P25, P50, P75, P90), and real-time market salary benchmarks for software engineers, data analysts, DevOps, and cloud architects in India.',
    h1: 'Tech & Professional Salary Intelligence in India',
    tagline: 'Transparent Market Percentiles • Verified Offers • Location Pay Differentials',
    keywords: [
      'software engineer salary bangalore',
      'data analyst salary hyderabad',
      'devops engineer salary india',
      'fresher developer salary pune',
      'it salary benchmarks india 2026',
    ],
    canonical: 'https://salary.talentxcel.in/',
    schemaType: 'WebApplication',
    schemaJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'TalentXcel Salary Intelligence',
      'url': 'https://salary.talentxcel.in/',
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'All',
      'description': 'Real-time compensation benchmarks, salary percentile breakdowns, and market offer comparisons for tech roles.',
    },
    featuredInternalLinks: [
      { text: 'Interactive Salary Analyzer', href: '/tools/salary-analyzer' },
      { text: 'Software Engineer Salary in Bangalore', href: '/salary/software-engineer/bangalore' },
      { text: 'Data Analyst Salary in Hyderabad', href: '/salary/data-analyst/hyderabad' },
      { text: 'DevOps Engineer Salary in India', href: '/salary/devops-engineer/india' },
      { text: 'DevOps Compensation in Pune', href: '/salary/devops-engineer/pune' },
    ],
    siblingDomainCrossLinks: [
      { text: 'Search Matching Jobs on TalentXcel Jobs', href: 'https://jobs.talentxcel.in/' },
      { text: 'Optimize Your Resume on TalentXcel Resume', href: 'https://resume.talentxcel.in/' },
      { text: 'Map Skills to Higher Pay on TalentXcel Careers', href: 'https://careers.talentxcel.in/' },
    ],
    staticHeroHtml: `
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">Tech & Professional Salary Intelligence in India</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Compare your compensation against verified market distributions. View 25th, 50th (median), 75th, and 90th percentile salary bands backed by verified employer filings.</p>
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:30px;">
          <a href="/tools/salary-analyzer" style="background:#0284c7;color:#ffffff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.95rem;">Launch Salary Analyzer</a>
          <a href="/salary/software-engineer/bangalore" style="background:#1e293b;color:#38bdf8;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Software Engineer (Bangalore)</a>
          <a href="/salary/data-analyst/hyderabad" style="background:#1e293b;color:#38bdf8;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Data Analyst (Hyderabad)</a>
          <a href="/salary/devops-engineer/india" style="background:#1e293b;color:#38bdf8;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">DevOps Engineer (India)</a>
        </div>
      </section>
    `,
  },

  careers: {
    id: 'CAREERS',
    subdomain: 'careers',
    hostname: 'careers.talentxcel.in',
    origin: 'https://careers.talentxcel.in',
    title: 'TalentXcel Careers — Interactive Career Maps, Skill Pathways & Pathways',
    description: 'Plan your professional trajectory with AI career intelligence. Interactive roadmap tools, skill gap analysis, interview preparation, and step-by-step guides for tech and management careers.',
    h1: 'Career Intelligence, Trajectory Maps & Skill Pathways',
    tagline: 'Visual Career Roadmaps • Skill Gap Diagnostics • Step-by-Step Transition Guides',
    keywords: [
      'career roadmap software engineer',
      'how to become cloud architect',
      'product manager career path',
      'skill gap analysis tool',
      'tech career pathways 2026',
    ],
    canonical: 'https://careers.talentxcel.in/',
    schemaType: 'EducationalOccupationalCredential',
    schemaJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'TalentXcel Career Intelligence',
      'url': 'https://careers.talentxcel.in/',
      'description': 'Interactive career mapping, step-by-step role guides, and skill gap intelligence for professionals.',
    },
    featuredInternalLinks: [
      { text: 'Interactive Career Map', href: '/career-map' },
      { text: 'Software Engineer Trajectory', href: '/career-map/software-engineer' },
      { text: 'Data Analyst Career Roadmap', href: '/career-map/data-analyst' },
      { text: 'How to Become a Cloud Architect', href: '/how-to-become/cloud-architect' },
      { text: 'How to Become a Product Manager', href: '/how-to-become/product-manager' },
      { text: 'Career Intelligence Engine', href: '/career-intelligence' },
    ],
    siblingDomainCrossLinks: [
      { text: 'View Live Openings on TalentXcel Jobs', href: 'https://jobs.talentxcel.in/' },
      { text: 'Verify Salary Potential on TalentXcel Salary', href: 'https://salary.talentxcel.in/' },
      { text: 'Enroll in Bridging Courses on TalentXcel Learning', href: 'https://learning.talentxcel.in/' },
    ],
    staticHeroHtml: `
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">Career Intelligence, Trajectory Maps & Skill Pathways</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Navigate your career with data-driven milestone roadmaps. Identify high-impact skills required to transition from junior to staff engineer, architect, or engineering manager.</p>
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:30px;">
          <a href="/career-map" style="background:#0284c7;color:#ffffff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.95rem;">Explore Career Maps</a>
          <a href="/career-map/software-engineer" style="background:#1e293b;color:#38bdf8;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Software Engineer Pathway</a>
          <a href="/how-to-become/cloud-architect" style="background:#1e293b;color:#38bdf8;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Cloud Architect Guide</a>
        </div>
      </section>
    `,
  },

  resume: {
    id: 'RESUME',
    subdomain: 'resume',
    hostname: 'resume.talentxcel.in',
    origin: 'https://resume.talentxcel.in',
    title: 'TalentXcel Resume Studio — AI ATS Resume Builder & Checker',
    description: 'Build recruiter-approved, ATS-optimized resumes in minutes. Free real-time ATS scoring, keyword optimization, modern templates, and job-tailored bullet points.',
    h1: 'AI-Powered ATS Resume Builder & Checker',
    tagline: '100% Free ATS Scoring • Recruiter-Tested Formats • Job-Tailored Bullet Improvement',
    keywords: [
      'ats resume checker free',
      'ai resume builder india',
      'software engineer resume keywords',
      'free ats resume templates',
      'naukri ats resume format',
    ],
    canonical: 'https://resume.talentxcel.in/',
    schemaType: 'WebApplication',
    schemaJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'TalentXcel Resume Studio',
      'url': 'https://resume.talentxcel.in/',
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'All',
      'description': 'AI-powered ATS resume builder, instant keyword matcher, and recruiter-tested templates.',
    },
    featuredInternalLinks: [
      { text: 'AI Resume Builder', href: '/resume/build' },
      { text: 'Instant ATS Checker', href: '/resume/ats-check' },
      { text: 'Professional Resume Templates', href: '/resume/templates' },
      { text: 'Cover Letter Studio', href: '/resume/cover-letter' },
      { text: 'Software Engineer ATS Keywords', href: '/resume/software-engineer/ats-keywords' },
      { text: 'Data Analyst ATS Keywords', href: '/resume/data-analyst/ats-keywords' },
    ],
    siblingDomainCrossLinks: [
      { text: 'Apply to Jobs with 1-Click on TalentXcel Jobs', href: 'https://jobs.talentxcel.in/' },
      { text: 'Compare Market Pay on TalentXcel Salary', href: 'https://salary.talentxcel.in/' },
      { text: 'Create Digital Credential on TalentXcel Passport', href: 'https://passport.talentxcel.in/' },
    ],
    staticHeroHtml: `
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">AI-Powered ATS Resume Builder & Checker</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Score your resume against applicant tracking systems before applying. Optimize job-tailored keywords, format structure, and measurable bullet achievements.</p>
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:30px;">
          <a href="/resume/build" style="background:#0284c7;color:#ffffff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.95rem;">Build Resume Now</a>
          <a href="/resume/ats-check" style="background:#1e293b;color:#38bdf8;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Test ATS Score (Free)</a>
          <a href="/resume/templates" style="background:#1e293b;color:#38bdf8;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">View Templates</a>
        </div>
      </section>
    `,
  },

  learning: {
    id: 'LEARNING',
    subdomain: 'learning',
    hostname: 'learning.talentxcel.in',
    origin: 'https://learning.talentxcel.in',
    title: 'TalentXcel Learning — Master High-Demand Tech Skills & Certifications',
    description: 'Explore verified skill certifications, expert-curated courses, and career transition pathways across full-stack development, AI/ML, cloud architecture, and cybersecurity.',
    h1: 'Career-Aligned Tech Courses & Verified Certifications',
    tagline: 'Practical Skills • Direct Job Bridges • Industry-Recognized Credentials',
    keywords: [
      'full stack developer course india',
      'ai machine learning certification',
      'devops certification course',
      'cloud architect learning path',
      'tech courses with job placement',
    ],
    canonical: 'https://learning.talentxcel.in/',
    schemaType: 'EducationalOrganization',
    schemaJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      'name': 'TalentXcel Learning Intelligence',
      'url': 'https://learning.talentxcel.in/',
      'description': 'Career-aligned technology education, skill certification pathways, and job transition programs.',
    },
    featuredInternalLinks: [
      { text: 'Browse All Courses', href: '/courses' },
      { text: 'Structured Learning Paths', href: '/paths' },
      { text: 'Verified Certificates', href: '/certificates' },
      { text: 'Education Providers', href: '/providers' },
    ],
    siblingDomainCrossLinks: [
      { text: 'Match Skills to Jobs on TalentXcel Jobs', href: 'https://jobs.talentxcel.in/' },
      { text: 'Check College Degrees on TalentXcel Colleges', href: 'https://colleges.talentxcel.in/' },
      { text: 'Store Completed Certificates in TalentXcel Passport', href: 'https://passport.talentxcel.in/' },
    ],
    staticHeroHtml: `
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">Career-Aligned Tech Courses & Verified Certifications</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Bridge the gap between curriculum and industry expectations with hands-on projects, verified assessments, and direct recruiter visibility.</p>
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:30px;">
          <a href="/courses" style="background:#0284c7;color:#ffffff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.95rem;">Explore 30+ Courses</a>
          <a href="/paths" style="background:#1e293b;color:#38bdf8;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Learning Pathways</a>
          <a href="/certificates" style="background:#1e293b;color:#38bdf8;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Certificates</a>
        </div>
      </section>
    `,
  },

  colleges: {
    id: 'COLLEGES',
    subdomain: 'colleges',
    hostname: 'colleges.talentxcel.in',
    origin: 'https://colleges.talentxcel.in',
    title: 'TalentXcel Colleges — 10,250+ Higher Education Institutions & Placement Analytics',
    description: 'Explore comprehensive profiles for 10,250+ verified Indian engineering, management, and medical colleges. Real placement metrics, NIRF rankings, fee structures, cutoff scores, and alumni trajectories.',
    h1: '10,250+ Verified Colleges, Cutoffs & Placement Intelligence',
    tagline: 'NIRF Ranking Data • Verified Placement CTCs • Course Admissions & Fees',
    keywords: [
      'engineering colleges bangalore',
      'iit cutoff placements 2026',
      'top mba colleges india fees',
      'nirf ranking engineering 2026',
      'campus placement statistics',
    ],
    canonical: 'https://colleges.talentxcel.in/',
    schemaType: 'CollegeOrUniversity',
    schemaJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      'name': 'TalentXcel Higher Education Intelligence',
      'url': 'https://colleges.talentxcel.in/',
      'description': 'Authoritative institution profiles, NIRF rankings, and placement analytics for 10,250+ colleges in India.',
    },
    featuredInternalLinks: [
      { text: 'Browse 10,250+ Institutions', href: '/colleges' },
      { text: 'Global Education Programs', href: '/global-programs' },
      { text: 'Scholarship Directory', href: '/scholarships' },
      { text: 'Career Pathways from Degree', href: '/career-pathway/software-engineer' },
    ],
    siblingDomainCrossLinks: [
      { text: 'Find Fresher Jobs on TalentXcel Jobs', href: 'https://jobs.talentxcel.in/' },
      { text: 'Check Starting Salaries on TalentXcel Salary', href: 'https://salary.talentxcel.in/' },
      { text: 'Prepare ATS Resume on TalentXcel Resume', href: 'https://resume.talentxcel.in/' },
    ],
    staticHeroHtml: `
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">10,250+ Verified Colleges, Cutoffs & Placement Intelligence</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Make informed higher education decisions. Access transparent data on course fees, admissions criteria, NIRF ranks, and verified median campus placement CTCs.</p>
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:30px;">
          <a href="/colleges" style="background:#0284c7;color:#ffffff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.95rem;">Search All Institutions</a>
          <a href="/global-programs" style="background:#1e293b;color:#38bdf8;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Global Degree Programs</a>
          <a href="/scholarships" style="background:#1e293b;color:#38bdf8;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Scholarships</a>
        </div>
      </section>
    `,
  },

  employers: {
    id: 'EMPLOYERS',
    subdomain: 'employers',
    hostname: 'employers.talentxcel.in',
    origin: 'https://employers.talentxcel.in',
    title: 'TalentXcel Employers — Recruiter OS & Global Candidate Acquisition',
    description: 'Autonomous recruiter operating system. Source pre-verified candidates, post job openings, manage applications, and accelerate hiring with AI talent intelligence.',
    h1: 'Recruiter OS & Global Candidate Acquisition',
    tagline: 'Autonomous Sourcing • Pre-Verified Talent Pool • 1-Click Job Syndication',
    keywords: [
      'hire software engineers india',
      'recruiter operating system',
      'post tech jobs free',
      'talent acquisition platform',
      'candidate sourcing software',
    ],
    canonical: 'https://employers.talentxcel.in/',
    schemaType: 'Organization',
    schemaJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'TalentXcel Employer Solutions',
      'url': 'https://employers.talentxcel.in/',
      'description': 'Enterprise recruiter platform for candidate sourcing, verified credentials, and hiring management.',
    },
    featuredInternalLinks: [
      { text: 'Post a Job Opening', href: '/hire' },
      { text: 'Recruiter Operating System', href: '/recruiters' },
      { text: 'Featured Hiring Employers', href: '/companies' },
      { text: 'Staffing & RPO Solutions', href: '/staffing' },
    ],
    siblingDomainCrossLinks: [
      { text: 'Explore Candidate View on TalentXcel Jobs', href: 'https://jobs.talentxcel.in/' },
      { text: 'Market Benchmarks on TalentXcel Salary', href: 'https://salary.talentxcel.in/' },
      { text: 'Verify Work Passports on TalentXcel Passport', href: 'https://passport.talentxcel.in/' },
    ],
    staticHeroHtml: `
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">Recruiter OS & Global Candidate Acquisition</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Hire with confidence using verified proof-of-work profiles. Post openings, automate screening, and connect with motivated professionals ready to contribute on day one.</p>
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:30px;">
          <a href="/hire" style="background:#0284c7;color:#ffffff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.95rem;">Post a Free Job</a>
          <a href="/recruiters" style="background:#1e293b;color:#38bdf8;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Explore Recruiter OS</a>
          <a href="/companies" style="background:#1e293b;color:#38bdf8;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Verified Companies</a>
        </div>
      </section>
    `,
  },

  government: {
    id: 'GOVERNMENT',
    subdomain: 'government',
    hostname: 'government.talentxcel.in',
    origin: 'https://government.talentxcel.in',
    title: 'TalentXcel Government Careers — Verified Public Sector Notifications & Exams',
    description: 'Track verified government jobs, recruitment notifications, exam schedules (UPSC, SSC CGL, IBPS, Railways, State PSCs), eligibility rules, and official application deadlines.',
    h1: 'Verified Government Jobs & Public Sector Recruitment',
    tagline: 'Authentic Official Notices • Timely Deadline Alerts • Exam Syllabus & Eligibility',
    keywords: [
      'sarkari naukri 2026',
      'government jobs india freshers',
      'upsc 2026 exam notification',
      'ssc cgl recruitment eligibility',
      'bank po exam dates 2026',
    ],
    canonical: 'https://government.talentxcel.in/',
    schemaType: 'GovernmentOrganization',
    schemaJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'GovernmentOrganization',
      'name': 'TalentXcel Government Jobs Intelligence',
      'url': 'https://government.talentxcel.in/',
      'description': 'Verified public sector job notifications, exam dates, eligibility criteria, and official application links.',
    },
    featuredInternalLinks: [
      { text: 'All Government Job Notifications', href: '/government-jobs' },
      { text: 'Public Sector Jobs for Freshers', href: '/freshers' },
      { text: 'UPSC Civil Services 2026', href: '/government-jobs/exams/upsc-2026' },
      { text: 'SSC CGL 2026 Notifications', href: '/government-jobs/exams/ssc-cgl-2026' },
      { text: 'IBPS PO Bank Exams', href: '/government-jobs/exams/ibps-po-2026' },
    ],
    siblingDomainCrossLinks: [
      { text: 'Explore Private Sector Openings on TalentXcel Jobs', href: 'https://jobs.talentxcel.in/' },
      { text: 'Prepare Your ATS Resume on TalentXcel Resume', href: 'https://resume.talentxcel.in/' },
      { text: 'Verify Educational Degree on TalentXcel Colleges', href: 'https://colleges.talentxcel.in/' },
    ],
    staticHeroHtml: `
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">Verified Government Jobs & Public Sector Recruitment</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Stay informed with accurate, authentic public sector vacancy announcements. Never miss application deadlines for UPSC, SSC, Banking, Railways, and Defence openings.</p>
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:30px;">
          <a href="/government-jobs" style="background:#0284c7;color:#ffffff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.95rem;">Browse All Notifications</a>
          <a href="/freshers" style="background:#1e293b;color:#38bdf8;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Fresher Openings</a>
          <a href="/government-jobs/exams/upsc-2026" style="background:#1e293b;color:#38bdf8;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">UPSC 2026</a>
        </div>
      </section>
    `,
  },

  passport: {
    id: 'PASSPORT',
    subdomain: 'passport',
    hostname: 'passport.talentxcel.in',
    origin: 'https://passport.talentxcel.in',
    title: 'TalentXcel Career Passport — Verified Professional Credentials & Work Identity',
    description: 'Your portable, cryptographically verifiable career passport. Showcase validated skills, project artifacts, career milestones, and endorsements with total privacy control.',
    h1: 'Verified Professional Career Passport & Work Identity',
    tagline: 'Cryptographic Credential Verification • Proof of Work • Shareable Professional Identity',
    keywords: [
      'digital career passport',
      'verified professional identity',
      'skill verification credential',
      'proof of work developer portfolio',
      'shareable career profile',
    ],
    canonical: 'https://passport.talentxcel.in/',
    schemaType: 'WebApplication',
    schemaJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'TalentXcel Career Passport',
      'url': 'https://passport.talentxcel.in/',
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'All',
      'description': 'Portable, verified professional identity featuring authenticated skills and project milestones.',
    },
    featuredInternalLinks: [
      { text: 'Career Passport Dashboard', href: '/passport' },
      { text: 'Public Credential Verification', href: '/passport' },
    ],
    siblingDomainCrossLinks: [
      { text: 'Apply for Verified Roles on TalentXcel Jobs', href: 'https://jobs.talentxcel.in/' },
      { text: 'Build an ATS Resume on TalentXcel Resume', href: 'https://resume.talentxcel.in/' },
      { text: 'Benchmark Compensation on TalentXcel Salary', href: 'https://salary.talentxcel.in/' },
    ],
    staticHeroHtml: `
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">Verified Professional Career Passport & Work Identity</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Build trust with top employers through verifiable evidence of capability. Your career accomplishments, degrees, and skill assessments authenticated in a single link.</p>
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:30px;">
          <a href="/passport" style="background:#0284c7;color:#ffffff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.95rem;">View Career Passport</a>
        </div>
      </section>
    `,
  },

  core: {
    id: 'CORE',
    subdomain: '',
    hostname: 'talentxcel.in',
    origin: 'https://talentxcel.in',
    title: 'TalentXcel — AI Career Platform for Jobs, Skills, Resumes & Hiring',
    description: 'Comprehensive AI career ecosystem. Find high-paying tech jobs, analyze market salaries, build ATS resumes, explore college degrees, and network with industry peers.',
    h1: 'The Intelligent Career & Hiring Platform',
    tagline: 'Jobs • Compensation • Resumes • Higher Education • Verified Hiring',
    keywords: [
      'ai career platform',
      'jobs in india',
      'ats resume builder',
      'salary intelligence',
      'higher education directory',
    ],
    canonical: 'https://talentxcel.in/',
    schemaType: 'WebSite',
    schemaJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'TalentXcel',
      'url': 'https://talentxcel.in/',
      'description': 'AI career ecosystem integrating jobs, compensation, resumes, learning, and enterprise hiring.',
    },
    featuredInternalLinks: [
      { text: 'Professional Network Feed', href: '/network' },
      { text: 'Global AI Leaderboard', href: '/rankings' },
      { text: 'Career Advice Blog', href: '/blog' },
      { text: 'Industry PR & News', href: '/news' },
    ],
    siblingDomainCrossLinks: [
      { text: 'Jobs Universe', href: 'https://jobs.talentxcel.in/' },
      { text: 'Salary Intelligence', href: 'https://salary.talentxcel.in/' },
      { text: 'Resume Studio', href: 'https://resume.talentxcel.in/' },
      { text: 'Career Pathways', href: 'https://careers.talentxcel.in/' },
      { text: 'Learning Hub', href: 'https://learning.talentxcel.in/' },
      { text: 'College Intelligence', href: 'https://colleges.talentxcel.in/' },
      { text: 'Employer Solutions', href: 'https://employers.talentxcel.in/' },
      { text: 'Government Careers', href: 'https://government.talentxcel.in/' },
      { text: 'Career Passport', href: 'https://passport.talentxcel.in/' },
    ],
    staticHeroHtml: `
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">The Intelligent Career & Hiring Platform</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Empowering ambitious talent with AI matching, transparent compensation, verified credentials, and direct employer connections.</p>
      </section>
    `,
  },
};

/**
 * Returns the SubdomainIdentity for a given host or subdomain key.
 */
export function getSubdomainIdentity(hostOrSubdomain: string): SubdomainIdentity {
  const clean = hostOrSubdomain.toLowerCase().trim();
  const sub = clean.includes('.') ? clean.split('.')[0] : clean;
  return SUBDOMAIN_IDENTITIES[sub] || SUBDOMAIN_IDENTITIES.core;
}
