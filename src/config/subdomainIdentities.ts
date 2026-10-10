/**
 * TalentXcel Subdomain Identities & Independent SEO Registry
 * 
 * Defines authoritative metadata, structured data, canonical hosts,
 * headings, messaging, and crawlable content contracts for all 9 production subdomains + core.
 */

export interface SubdomainIdentity {
  id: string;
  subdomain: string;
  hostname: string;
  origin: string;
  audience: string;
  headline: string;
  supportingCopy: string;
  primaryCta: string;
  primaryCtaUrl: string;
  secondaryCta: string;
  secondaryCtaUrl: string;
  title: string;
  description: string;
  h1: string;
  tagline: string;
  keywords: string[];
  canonical: string;
  schemaType: string;
  schemaJsonLd: object;
  disclaimer?: string;
  featuredInternalLinks: { text: string; href: string }[];
  siblingDomainCrossLinks: { text: string; href: string }[];
  staticHeroHtml: string;
}

export const SUBDOMAIN_IDENTITIES: Record<string, SubdomainIdentity> = {
  learning: {
    id: 'LEARNING',
    subdomain: 'learning',
    hostname: 'learning.talentxcel.in',
    origin: 'https://learning.talentxcel.in',
    audience: 'Students, fresh graduates, working professionals.',
    headline: 'Learn Skills That Move Your Career Forward',
    supportingCopy: 'Discover practical learning resources, industry-relevant skills and career-focused development opportunities.',
    primaryCta: 'Explore Learning',
    primaryCtaUrl: '/courses',
    secondaryCta: 'View Learning Paths',
    secondaryCtaUrl: '/learning/paths',
    title: 'TalentXcel Learning — Learn Skills That Move Your Career Forward',
    description: 'Discover practical learning resources, industry-relevant skills and career-focused development opportunities. High-impact tech courses, skill assessments and career pathways.',
    h1: 'Learn Skills That Move Your Career Forward',
    tagline: 'Practical Skills • Direct Job Bridges • Industry-Recognized Credentials',
    keywords: [
      'learn tech skills',
      'career learning pathways',
      'software development courses',
      'skill development',
      'employability certifications',
      'upskilling india',
    ],
    canonical: 'https://learning.talentxcel.in/',
    schemaType: 'EducationalOrganization',
    schemaJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      'name': 'TalentXcel Learning',
      'url': 'https://learning.talentxcel.in/',
      'description': 'Discover practical learning resources, industry-relevant skills and career-focused development opportunities.',
      'parentOrganization': {
        '@type': 'Organization',
        'name': 'TalentXcel',
        'url': 'https://talentxcel.in'
      }
    },
    featuredInternalLinks: [
      { text: 'Explore All Courses', href: '/courses' },
      { text: 'Structured Learning Pathways', href: '/learning/paths' },
      { text: 'Verified Certificates', href: '/learning/certificates' },
      { text: 'Job-Focused Skill Courses', href: '/learning/job-focused' },
      { text: 'Interactive Skill Assessment', href: '/learning/assessment' },
    ],
    siblingDomainCrossLinks: [
      { text: 'Search Matching Jobs on TalentXcel Jobs', href: 'https://jobs.talentxcel.in/' },
      { text: 'Build Your Verified Profile on TalentXcel Passport', href: 'https://passport.talentxcel.in/' },
      { text: 'Analyze Tech Compensation on TalentXcel Salary', href: 'https://salary.talentxcel.in/' },
      { text: 'Build an ATS Resume on TalentXcel Resume', href: 'https://resume.talentxcel.in/' },
    ],
    staticHeroHtml: `
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <span style="display:inline-block;padding:4px 12px;background:#0369a1;color:#e0f2fe;font-size:0.8rem;font-weight:700;border-radius:9999px;margin-bottom:14px;text-transform:uppercase;letter-spacing:0.05em;">For Students, Fresh Graduates & Working Professionals</span>
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">Learn Skills That Move Your Career Forward</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Discover practical learning resources, industry-relevant skills and career-focused development opportunities.</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:30px;">
          <a href="/courses" style="background:#0284c7;color:#ffffff;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem;">Explore Learning</a>
          <a href="/learning/paths" style="background:#1e293b;color:#38bdf8;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.95rem;border:1px solid #334155;">Learning Pathways</a>
          <a href="/learning/certificates" style="background:#1e293b;color:#38bdf8;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Verified Certificates</a>
        </div>
      </section>
    `,
  },

  passport: {
    id: 'PASSPORT',
    subdomain: 'passport',
    hostname: 'passport.talentxcel.in',
    origin: 'https://passport.talentxcel.in',
    audience: 'Jobseekers and professionals building a career profile.',
    headline: "Your Career. Verified. Ready for What's Next.",
    supportingCopy: 'Bring your professional profile, skills and career information together in one structured career passport.',
    primaryCta: 'Build Your Career Passport',
    primaryCtaUrl: '/passport',
    secondaryCta: 'Explore TalentScore',
    secondaryCtaUrl: '/passport',
    title: "TalentXcel Career Passport — Your Career. Verified. Ready for What's Next.",
    description: 'Bring your professional profile, skills and career information together in one structured career passport. Showcase verified credentials, achievements and capabilities.',
    h1: "Your Career. Verified. Ready for What's Next.",
    tagline: 'Structured Career Profile • Capability Mapping • Portable Identity',
    keywords: [
      'career passport',
      'verified professional profile',
      'skill verification',
      'work identity',
      'talentscore',
      'shareable portfolio',
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
      'description': 'Bring your professional profile, skills and career information together in one structured career passport.',
      'parentOrganization': {
        '@type': 'Organization',
        'name': 'TalentXcel',
        'url': 'https://talentxcel.in'
      }
    },
    featuredInternalLinks: [
      { text: 'Career Passport Dashboard', href: '/passport' },
      { text: 'Instant QR Networking', href: '/qr-networking' },
      { text: 'Skills Verification', href: '/passport' },
    ],
    siblingDomainCrossLinks: [
      { text: 'Discover Matching Jobs on TalentXcel Jobs', href: 'https://jobs.talentxcel.in/' },
      { text: 'Optimize Your Resume on TalentXcel Resume', href: 'https://resume.talentxcel.in/' },
      { text: 'Benchmark Market Salary on TalentXcel Salary', href: 'https://salary.talentxcel.in/' },
      { text: 'Plan Career Trajectory on TalentXcel Careers', href: 'https://careers.talentxcel.in/' },
    ],
    staticHeroHtml: `
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <span style="display:inline-block;padding:4px 12px;background:#047857;color:#d1fae5;font-size:0.8rem;font-weight:700;border-radius:9999px;margin-bottom:14px;text-transform:uppercase;letter-spacing:0.05em;">For Jobseekers & Working Professionals</span>
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">Your Career. Verified. Ready for What's Next.</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Bring your professional profile, skills and career information together in one structured career passport.</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:30px;">
          <a href="/passport" style="background:#0284c7;color:#ffffff;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem;">Build Your Career Passport</a>
          <a href="/qr-networking" style="background:#1e293b;color:#38bdf8;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">QR Networking</a>
        </div>
      </section>
    `,
  },

  government: {
    id: 'GOVERNMENT',
    subdomain: 'government',
    hostname: 'government.talentxcel.in',
    origin: 'https://government.talentxcel.in',
    audience: 'Government-job aspirants and public-sector jobseekers.',
    headline: 'Find Government Career Opportunities in One Place',
    supportingCopy: 'Explore public-sector vacancies, eligibility criteria, recruitment updates and application deadlines using available, appropriately sourced information.',
    primaryCta: 'Explore Government Jobs',
    primaryCtaUrl: '/government-jobs',
    secondaryCta: 'Fresher Vacancies',
    secondaryCtaUrl: '/government-jobs/freshers',
    title: 'TalentXcel Government — Find Government Career Opportunities in One Place',
    description: 'Explore public-sector vacancies, eligibility criteria, recruitment updates and application deadlines using available, appropriately sourced information.',
    h1: 'Find Government Career Opportunities in One Place',
    tagline: 'Public-Sector Vacancies • Eligibility Criteria • Official Application Deadlines',
    keywords: [
      'government jobs india',
      'sarkari naukri 2026',
      'upsc recruitment',
      'ssc cgl notification',
      'bank po exams',
      'public sector vacancies',
    ],
    canonical: 'https://government.talentxcel.in/',
    disclaimer: 'TalentXcel is an independent platform and is not affiliated with, authorized by, or endorsed by any government entity or recruitment agency. All job information is aggregated from publicly available government gazettes and notifications.',
    schemaType: 'WebSite',
    schemaJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'TalentXcel Government Careers',
      'url': 'https://government.talentxcel.in/',
      'description': 'Explore public-sector vacancies, eligibility criteria, recruitment updates and application deadlines using available, appropriately sourced information.',
      'parentOrganization': {
        '@type': 'Organization',
        'name': 'TalentXcel',
        'url': 'https://talentxcel.in'
      }
    },
    featuredInternalLinks: [
      { text: 'All Government Job Notifications', href: '/government-jobs' },
      { text: 'Public Sector Jobs for Freshers', href: '/government-jobs/freshers' },
      { text: 'UPSC Civil Services 2026', href: '/government-jobs/exams/upsc-2026' },
      { text: 'SSC CGL 2026 Notifications', href: '/government-jobs/exams/ssc-cgl-2026' },
      { text: 'IBPS PO Bank Exams', href: '/government-jobs/exams/ibps-po-2026' },
    ],
    siblingDomainCrossLinks: [
      { text: 'Explore Private Sector Openings on TalentXcel Jobs', href: 'https://jobs.talentxcel.in/' },
      { text: 'Prepare Your ATS Resume on TalentXcel Resume', href: 'https://resume.talentxcel.in/' },
      { text: 'Verify Educational Degree on TalentXcel Colleges', href: 'https://colleges.talentxcel.in/' },
      { text: 'Learn New Tech Skills on TalentXcel Learning', href: 'https://learning.talentxcel.in/' },
    ],
    staticHeroHtml: `
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <span style="display:inline-block;padding:4px 12px;background:#b45309;color:#fef3c7;font-size:0.8rem;font-weight:700;border-radius:9999px;margin-bottom:14px;text-transform:uppercase;letter-spacing:0.05em;">For Government-Job Aspirants & Public-Sector Jobseekers</span>
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">Find Government Career Opportunities in One Place</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Explore public-sector vacancies, eligibility criteria, recruitment updates and application deadlines using available, appropriately sourced information.</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:20px;">
          <a href="/government-jobs" style="background:#0284c7;color:#ffffff;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem;">Explore Government Jobs</a>
          <a href="/government-jobs/freshers" style="background:#1e293b;color:#38bdf8;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Fresher Openings</a>
          <a href="/government-jobs/exams/upsc-2026" style="background:#1e293b;color:#38bdf8;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">UPSC 2026</a>
        </div>
        <p style="font-size:0.8rem;color:#64748b;margin-top:16px;">Notice: TalentXcel is an independent platform and is not affiliated with, authorized by, or endorsed by any government entity or recruitment agency.</p>
      </section>
    `,
  },

  employers: {
    id: 'EMPLOYERS',
    subdomain: 'employers',
    hostname: 'employers.talentxcel.in',
    origin: 'https://employers.talentxcel.in',
    audience: 'Employers, recruitment teams, HR professionals and staffing agencies.',
    headline: 'Find the Right Talent. Hire with Confidence.',
    supportingCopy: 'Discover relevant candidates, connect with talent and streamline your recruitment workflow with TalentXcel.',
    primaryCta: 'Find Talent',
    primaryCtaUrl: '/talent',
    secondaryCta: 'Post a Job',
    secondaryCtaUrl: '/hire',
    title: 'TalentXcel Employers — Find the Right Talent. Hire with Confidence.',
    description: 'Discover relevant candidates, connect with talent and streamline your recruitment workflow with TalentXcel. Autonomous candidate discovery, job posting and recruiter tooling.',
    h1: 'Find the Right Talent. Hire with Confidence.',
    tagline: 'Pre-Screened Candidates • Streamlined Recruitment • Direct Outreach',
    keywords: [
      'hire tech talent',
      'recruiter operating system',
      'post jobs',
      'candidate discovery',
      'talent acquisition india',
      'staffing solutions',
    ],
    canonical: 'https://employers.talentxcel.in/',
    schemaType: 'WebSite',
    schemaJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'TalentXcel Employers',
      'url': 'https://employers.talentxcel.in/',
      'description': 'Discover relevant candidates, connect with talent and streamline your recruitment workflow with TalentXcel.',
      'parentOrganization': {
        '@type': 'Organization',
        'name': 'TalentXcel',
        'url': 'https://talentxcel.in'
      }
    },
    featuredInternalLinks: [
      { text: 'Search Verified Candidates', href: '/talent' },
      { text: 'Post an Active Opening', href: '/hire' },
      { text: 'Explore Recruiter OS', href: '/recruiters' },
      { text: 'Hiring Companies Directory', href: '/companies' },
    ],
    siblingDomainCrossLinks: [
      { text: 'Candidate Search Experience on TalentXcel Jobs', href: 'https://jobs.talentxcel.in/' },
      { text: 'Compensation Benchmarks on TalentXcel Salary', href: 'https://salary.talentxcel.in/' },
      { text: 'Verify Work Passports on TalentXcel Passport', href: 'https://passport.talentxcel.in/' },
      { text: 'Campus Talent on TalentXcel Colleges', href: 'https://colleges.talentxcel.in/' },
    ],
    staticHeroHtml: `
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <span style="display:inline-block;padding:4px 12px;background:#6b21a8;color:#f3e8ff;font-size:0.8rem;font-weight:700;border-radius:9999px;margin-bottom:14px;text-transform:uppercase;letter-spacing:0.05em;">For Employers, Recruitment Teams & Staffing Agencies</span>
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">Find the Right Talent. Hire with Confidence.</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Discover relevant candidates, connect with talent and streamline your recruitment workflow with TalentXcel.</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:30px;">
          <a href="/talent" style="background:#0284c7;color:#ffffff;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem;">Find Talent</a>
          <a href="/hire" style="background:#1e293b;color:#38bdf8;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.95rem;border:1px solid #334155;">Post a Job</a>
          <a href="/recruiters" style="background:#1e293b;color:#38bdf8;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Recruiter OS</a>
        </div>
      </section>
    `,
  },

  colleges: {
    id: 'COLLEGES',
    subdomain: 'colleges',
    hostname: 'colleges.talentxcel.in',
    origin: 'https://colleges.talentxcel.in',
    audience: 'Colleges, universities, students and placement cells.',
    headline: 'Connect Campus Talent with Career Opportunities',
    supportingCopy: 'Help students build career readiness and connect educational institutions with relevant employment and recruitment opportunities.',
    primaryCta: 'Explore Campus Opportunities',
    primaryCtaUrl: '/colleges',
    secondaryCta: 'For Placement Cells',
    secondaryCtaUrl: '/recruiters',
    title: 'TalentXcel Colleges — Connect Campus Talent with Career Opportunities',
    description: 'Help students build career readiness and connect educational institutions with relevant employment and recruitment opportunities. Explore 10,250+ institutions, rankings and placement insights.',
    h1: 'Connect Campus Talent with Career Opportunities',
    tagline: 'Higher Education Directory • Placement Insights • Career Readiness',
    keywords: [
      'college placements',
      'engineering colleges india',
      'nirf rankings 2026',
      'campus recruitment',
      'higher education directory',
      'placement cell portal',
    ],
    canonical: 'https://colleges.talentxcel.in/',
    disclaimer: 'Placement statistics, NIRF ranks, and fees are compiled from institutional disclosures and public data. TalentXcel does not provide placement guarantees.',
    schemaType: 'EducationalOrganization',
    schemaJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      'name': 'TalentXcel Colleges',
      'url': 'https://colleges.talentxcel.in/',
      'description': 'Help students build career readiness and connect educational institutions with relevant employment and recruitment opportunities.',
      'parentOrganization': {
        '@type': 'Organization',
        'name': 'TalentXcel',
        'url': 'https://talentxcel.in'
      }
    },
    featuredInternalLinks: [
      { text: 'Browse 10,250+ Institutions', href: '/colleges' },
      { text: 'Global Degree Programs', href: '/global-programs' },
      { text: 'Scholarships Directory', href: '/scholarships' },
      { text: 'Degree to Career Pathways', href: '/career-pathway/software-engineer' },
    ],
    siblingDomainCrossLinks: [
      { text: 'Find Fresher Jobs on TalentXcel Jobs', href: 'https://jobs.talentxcel.in/' },
      { text: 'Check Starting Salaries on TalentXcel Salary', href: 'https://salary.talentxcel.in/' },
      { text: 'Build an ATS Resume on TalentXcel Resume', href: 'https://resume.talentxcel.in/' },
      { text: 'Learn Job-Ready Skills on TalentXcel Learning', href: 'https://learning.talentxcel.in/' },
    ],
    staticHeroHtml: `
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <span style="display:inline-block;padding:4px 12px;background:#0f766e;color:#ccfbf1;font-size:0.8rem;font-weight:700;border-radius:9999px;margin-bottom:14px;text-transform:uppercase;letter-spacing:0.05em;">For Colleges, Universities, Students & Placement Cells</span>
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">Connect Campus Talent with Career Opportunities</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Help students build career readiness and connect educational institutions with relevant employment and recruitment opportunities.</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:20px;">
          <a href="/colleges" style="background:#0284c7;color:#ffffff;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem;">Explore Campus Opportunities</a>
          <a href="/recruiters" style="background:#1e293b;color:#38bdf8;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.95rem;border:1px solid #334155;">For Placement Cells</a>
          <a href="/scholarships" style="background:#1e293b;color:#38bdf8;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Scholarships</a>
        </div>
        <p style="font-size:0.8rem;color:#64748b;margin-top:16px;">Notice: Placement statistics and institutional data are compiled from official disclosures. TalentXcel provides objective intelligence and does not offer placement guarantees.</p>
      </section>
    `,
  },

  careers: {
    id: 'CAREERS',
    subdomain: 'careers',
    hostname: 'careers.talentxcel.in',
    origin: 'https://careers.talentxcel.in',
    audience: 'Jobseekers, working professionals and career changers.',
    headline: 'Build a Career That Moves You Forward',
    supportingCopy: 'Explore career paths, identify opportunities, strengthen your professional profile and plan your next career move.',
    primaryCta: 'Plan Your Career',
    primaryCtaUrl: '/career-map',
    secondaryCta: 'Career Roadmaps',
    secondaryCtaUrl: '/career-map/software-engineer',
    title: 'TalentXcel Careers — Build a Career That Moves You Forward',
    description: 'Explore career paths, identify opportunities, strengthen your professional profile and plan your next career move with interactive career maps and skill guidance.',
    h1: 'Build a Career That Moves You Forward',
    tagline: 'Interactive Career Maps • Skill Gap Diagnostics • Step-by-Step Trajectories',
    keywords: [
      'career planning',
      'career roadmap software engineer',
      'career transition',
      'skill gap analysis',
      'tech career pathways',
      'career coaching',
    ],
    canonical: 'https://careers.talentxcel.in/',
    schemaType: 'WebSite',
    schemaJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'TalentXcel Careers',
      'url': 'https://careers.talentxcel.in/',
      'description': 'Explore career paths, identify opportunities, strengthen your professional profile and plan your next career move.',
      'parentOrganization': {
        '@type': 'Organization',
        'name': 'TalentXcel',
        'url': 'https://talentxcel.in'
      }
    },
    featuredInternalLinks: [
      { text: 'Interactive Career Maps', href: '/career-map' },
      { text: 'Software Engineer Trajectory', href: '/career-map/software-engineer' },
      { text: 'Data Analyst Career Roadmap', href: '/career-map/data-analyst' },
      { text: 'How to Become a Cloud Architect', href: '/how-to-become/cloud-architect' },
      { text: 'Career Intelligence Engine', href: '/career-intelligence' },
    ],
    siblingDomainCrossLinks: [
      { text: 'View Live Openings on TalentXcel Jobs', href: 'https://jobs.talentxcel.in/' },
      { text: 'Verify Salary Potential on TalentXcel Salary', href: 'https://salary.talentxcel.in/' },
      { text: 'Learn Bridging Skills on TalentXcel Learning', href: 'https://learning.talentxcel.in/' },
      { text: 'Create an ATS Resume on TalentXcel Resume', href: 'https://resume.talentxcel.in/' },
    ],
    staticHeroHtml: `
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <span style="display:inline-block;padding:4px 12px;background:#4338ca;color:#e0e7ff;font-size:0.8rem;font-weight:700;border-radius:9999px;margin-bottom:14px;text-transform:uppercase;letter-spacing:0.05em;">For Jobseekers, Working Professionals & Career Changers</span>
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">Build a Career That Moves You Forward</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Explore career paths, identify opportunities, strengthen your professional profile and plan your next career move.</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:30px;">
          <a href="/career-map" style="background:#0284c7;color:#ffffff;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem;">Plan Your Career</a>
          <a href="/career-map/software-engineer" style="background:#1e293b;color:#38bdf8;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.95rem;border:1px solid #334155;">Software Engineer Pathway</a>
          <a href="/career-intelligence" style="background:#1e293b;color:#38bdf8;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Career Intelligence</a>
        </div>
      </section>
    `,
  },

  salary: {
    id: 'SALARY',
    subdomain: 'salary',
    hostname: 'salary.talentxcel.in',
    origin: 'https://salary.talentxcel.in',
    audience: 'Professionals, jobseekers and people researching compensation.',
    headline: 'Know Your Worth. Negotiate with Confidence.',
    supportingCopy: 'Explore salary benchmarks, compare compensation and prepare for your next career or salary negotiation.',
    primaryCta: 'Explore Salary Insights',
    primaryCtaUrl: '/tools/salary-analyzer',
    secondaryCta: 'Software Engineer Pay',
    secondaryCtaUrl: '/salary/software-engineer/bangalore',
    title: 'TalentXcel Salary — Know Your Worth. Negotiate with Confidence.',
    description: 'Explore salary benchmarks, compare compensation and prepare for your next career or salary negotiation. Transparent percentiles, location differentials and role insights.',
    h1: 'Know Your Worth. Negotiate with Confidence.',
    tagline: 'Market Percentiles (P25 - P90) • Location Differentials • Verified Offer Data',
    keywords: [
      'salary benchmarks india',
      'software engineer salary bangalore',
      'tech compensation percentiles',
      'salary negotiation tool',
      'it salary calculator',
    ],
    canonical: 'https://salary.talentxcel.in/',
    disclaimer: 'Salary benchmarks and distributions are derived from verified employer filings, self-reported compensation data, and market statistics. Figures represent statistical estimates.',
    schemaType: 'WebApplication',
    schemaJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'TalentXcel Salary Intelligence',
      'url': 'https://salary.talentxcel.in/',
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'All',
      'description': 'Explore salary benchmarks, compare compensation and prepare for your next career or salary negotiation.',
      'parentOrganization': {
        '@type': 'Organization',
        'name': 'TalentXcel',
        'url': 'https://talentxcel.in'
      }
    },
    featuredInternalLinks: [
      { text: 'Interactive Salary Analyzer', href: '/tools/salary-analyzer' },
      { text: 'Software Engineer Salary in Bangalore', href: '/salary/software-engineer/bangalore' },
      { text: 'Data Analyst Salary in Hyderabad', href: '/salary/data-analyst/hyderabad' },
      { text: 'DevOps Engineer Salary in India', href: '/salary/devops-engineer/india' },
      { text: 'Cloud Architect Pay Scale', href: '/salary/devops-engineer/pune' },
    ],
    siblingDomainCrossLinks: [
      { text: 'Search Matching Jobs on TalentXcel Jobs', href: 'https://jobs.talentxcel.in/' },
      { text: 'Optimize Your Resume on TalentXcel Resume', href: 'https://resume.talentxcel.in/' },
      { text: 'Map Skills to Higher Pay on TalentXcel Careers', href: 'https://careers.talentxcel.in/' },
    ],
    staticHeroHtml: `
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <span style="display:inline-block;padding:4px 12px;background:#0369a1;color:#e0f2fe;font-size:0.8rem;font-weight:700;border-radius:9999px;margin-bottom:14px;text-transform:uppercase;letter-spacing:0.05em;">For Professionals, Jobseekers & Compensation Researchers</span>
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">Know Your Worth. Negotiate with Confidence.</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Explore salary benchmarks, compare compensation and prepare for your next career or salary negotiation.</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:20px;">
          <a href="/tools/salary-analyzer" style="background:#0284c7;color:#ffffff;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem;">Explore Salary Insights</a>
          <a href="/salary/software-engineer/bangalore" style="background:#1e293b;color:#38bdf8;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Software Engineer (Bangalore)</a>
          <a href="/salary/data-analyst/hyderabad" style="background:#1e293b;color:#38bdf8;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Data Analyst (Hyderabad)</a>
        </div>
        <p style="font-size:0.8rem;color:#64748b;margin-top:16px;">Notice: Benchmarks are based on verified market distributions, employer filings, and statistical estimates.</p>
      </section>
    `,
  },

  resume: {
    id: 'RESUME',
    subdomain: 'resume',
    hostname: 'resume.talentxcel.in',
    origin: 'https://resume.talentxcel.in',
    audience: 'Freshers, experienced professionals and jobseekers.',
    headline: 'Create a Resume That Gets You Noticed',
    supportingCopy: 'Build ATS-friendly resumes, strengthen your professional profile and prepare tailored applications for your next opportunity.',
    primaryCta: 'Build My Resume',
    primaryCtaUrl: '/resume-builder',
    secondaryCta: 'Check ATS Score',
    secondaryCtaUrl: '/tools/ats-checker',
    title: 'TalentXcel Resume — Create a Resume That Gets You Noticed',
    description: 'Build ATS-friendly resumes, strengthen your professional profile and prepare tailored applications for your next opportunity. 100% recruiter-tested templates and instant ATS scoring.',
    h1: 'Create a Resume That Gets You Noticed',
    tagline: 'ATS-Friendly Formatting • Instant ATS Scoring • Recruiter-Tested Templates',
    keywords: [
      'ats resume builder',
      'free ats resume score',
      'resume checker',
      'tech resume templates',
      'naukri resume format',
      'linkedin profile optimization',
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
      'description': 'Build ATS-friendly resumes, strengthen your professional profile and prepare tailored applications for your next opportunity.',
      'parentOrganization': {
        '@type': 'Organization',
        'name': 'TalentXcel',
        'url': 'https://talentxcel.in'
      }
    },
    featuredInternalLinks: [
      { text: 'AI Resume Builder', href: '/resume-builder' },
      { text: 'Instant ATS Checker', href: '/tools/ats-checker' },
      { text: 'Professional Resume Templates', href: '/resume-templates' },
      { text: 'Cover Letter Studio', href: '/resume/cover-letter' },
      { text: 'Resume Optimizer Tool', href: '/tools/resume-optimizer' },
    ],
    siblingDomainCrossLinks: [
      { text: 'Apply to Jobs with 1-Click on TalentXcel Jobs', href: 'https://jobs.talentxcel.in/' },
      { text: 'Compare Market Pay on TalentXcel Salary', href: 'https://salary.talentxcel.in/' },
      { text: 'Create Digital Credential on TalentXcel Passport', href: 'https://passport.talentxcel.in/' },
    ],
    staticHeroHtml: `
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <span style="display:inline-block;padding:4px 12px;background:#1d4ed8;color:#dbeafe;font-size:0.8rem;font-weight:700;border-radius:9999px;margin-bottom:14px;text-transform:uppercase;letter-spacing:0.05em;">For Freshers, Experienced Professionals & Jobseekers</span>
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">Create a Resume That Gets You Noticed</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Build ATS-friendly resumes, strengthen your professional profile and prepare tailored applications for your next opportunity.</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:30px;">
          <a href="/resume-builder" style="background:#0284c7;color:#ffffff;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem;">Build My Resume</a>
          <a href="/tools/ats-checker" style="background:#1e293b;color:#38bdf8;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.95rem;border:1px solid #334155;">Check ATS Score</a>
          <a href="/resume-templates" style="background:#1e293b;color:#38bdf8;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">View Templates</a>
        </div>
      </section>
    `,
  },

  jobs: {
    id: 'JOBS',
    subdomain: 'jobs',
    hostname: 'jobs.talentxcel.in',
    origin: 'https://jobs.talentxcel.in',
    audience: 'Active jobseekers, passive candidates, freshers and experienced professionals.',
    headline: 'Discover Jobs That Match Your Ambition',
    supportingCopy: 'Search relevant jobs by role, skills, location, experience and salary, and take the next step in your career.',
    primaryCta: 'Search Jobs',
    primaryCtaUrl: '/jobs',
    secondaryCta: 'Remote Opportunities',
    secondaryCtaUrl: '/jobs?is_remote=true',
    title: 'TalentXcel Jobs — Discover Jobs That Match Your Ambition',
    description: 'Search relevant jobs by role, skills, location, experience and salary, and take the next step in your career. Verified employers and direct 1-click ATS applications.',
    h1: 'Discover Jobs That Match Your Ambition',
    tagline: '500+ Verified Vacancies • Direct Employer Hiring • Instant ATS Match',
    keywords: [
      'search jobs india',
      'tech jobs bangalore',
      'software developer openings',
      'remote tech jobs',
      'fresher it jobs',
      '1-click job apply',
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
      'description': 'Search relevant jobs by role, skills, location, experience and salary, and take the next step in your career.',
      'parentOrganization': {
        '@type': 'Organization',
        'name': 'TalentXcel',
        'url': 'https://talentxcel.in'
      }
    },
    featuredInternalLinks: [
      { text: 'Bangalore Tech Jobs', href: '/bangalore' },
      { text: 'Hyderabad IT Openings', href: '/hyderabad' },
      { text: 'Pune Software Engineer Jobs', href: '/pune' },
      { text: 'Mumbai Data & Tech Vacancies', href: '/mumbai' },
      { text: 'Delhi NCR Developer Roles', href: '/delhi' },
      { text: 'Explore All Active Jobs', href: '/jobs' },
    ],
    siblingDomainCrossLinks: [
      { text: 'Analyze Compensation on TalentXcel Salary', href: 'https://salary.talentxcel.in/' },
      { text: 'Build an ATS Resume on TalentXcel Resume', href: 'https://resume.talentxcel.in/' },
      { text: 'Plan Your Pathway on TalentXcel Careers', href: 'https://careers.talentxcel.in/' },
      { text: 'Hire Verified Talent on TalentXcel Employers', href: 'https://employers.talentxcel.in/' },
    ],
    staticHeroHtml: `
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <span style="display:inline-block;padding:4px 12px;background:#0369a1;color:#e0f2fe;font-size:0.8rem;font-weight:700;border-radius:9999px;margin-bottom:14px;text-transform:uppercase;letter-spacing:0.05em;">For Active Jobseekers, Passive Candidates & Professionals</span>
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">Discover Jobs That Match Your Ambition</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Search relevant jobs by role, skills, location, experience and salary, and take the next step in your career.</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:30px;">
          <a href="/jobs" style="background:#0284c7;color:#ffffff;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem;">Search Jobs</a>
          <a href="/bangalore" style="background:#1e293b;color:#38bdf8;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Bangalore Jobs</a>
          <a href="/hyderabad" style="background:#1e293b;color:#38bdf8;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Hyderabad Jobs</a>
          <a href="/delhi" style="background:#1e293b;color:#38bdf8;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Delhi NCR Jobs</a>
        </div>
      </section>
    `,
  },

  core: {
    id: 'CORE',
    subdomain: '',
    hostname: 'talentxcel.in',
    origin: 'https://talentxcel.in',
    audience: 'Global Tech & Leadership Professionals, Employers, Institutions',
    headline: 'The Intelligent Career & Hiring Platform',
    supportingCopy: 'Connect with Tech & Leadership Professionals worldwide. Build your Career Passport, verify skills with TalentScore, discover jobs and connect with hiring teams.',
    primaryCta: 'Explore Jobs',
    primaryCtaUrl: '/jobs',
    secondaryCta: 'Build Passport',
    secondaryCtaUrl: '/passport',
    title: 'TalentXcel — The Global Professional Talent Network',
    description: 'Connect with Tech & Leadership Professionals worldwide across UAE, Europe, the Americas, and Asia. Build your Career Passport, get verified by TalentScore, discover global opportunities, and let top hiring teams discover you.',
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
      'description': 'Connect with Tech & Leadership Professionals worldwide. Build your Career Passport, verify skills with TalentScore, discover jobs and connect with hiring teams.',
      'potentialAction': [
        {
          '@type': 'SearchAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': 'https://talentxcel.in/jobs?search={search_term_string}'
          },
          'query-input': 'required name=search_term_string'
        }
      ]
    },
    featuredInternalLinks: [
      { text: 'Explore Verified Jobs', href: '/jobs' },
      { text: 'Career Passport', href: '/passport' },
      { text: 'Salary Intelligence', href: '/salary' },
      { text: 'Higher Education', href: '/colleges' },
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
