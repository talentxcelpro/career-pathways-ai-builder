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
  faqs: { question: string; answer: string }[];
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
    faqs: [
    {
        "question": "How are learning pathways structured?",
        "answer": "Pathways group foundational concepts, intermediate projects, and advanced architectures into progressive milestones aligned with real-world job roles."
    },
    {
        "question": "Are course certificates verifiable?",
        "answer": "Yes. Certificates earned through verified partner programs can be linked directly to your digital Career Passport."
    },
    {
        "question": "Does TalentXcel offer free learning resources?",
        "answer": "Yes. Curated pathways incorporate open-access courses, documentation, and foundational assessments for self-paced study."
    }
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
    faqs: [
    {
        "question": "What is a Career Passport?",
        "answer": "A Career Passport is a verified professional profile uniting authenticated work history, demonstrated skills, assessments, and certifications in one secure place."
    },
    {
        "question": "How do recruiters view my passport?",
        "answer": "You can generate a secure share link or QR code allowing verified recruiters to review your authenticated credentials without exposing private contact info."
    },
    {
        "question": "What is the TalentScore assessment?",
        "answer": "TalentScore provides an objective evaluation of your technical and professional capabilities through verified assessments and project audits."
    }
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
    faqs: [
    {
        "question": "How are government recruitment notifications sourced?",
        "answer": "Notifications are compiled from official gazettes, public commission releases (.gov.in, .nic.in), and verified agency notices."
    },
    {
        "question": "Can I filter notifications by educational qualification?",
        "answer": "Yes. You can filter by graduate, diploma, 10th/12th pass, and specialized engineering or medical qualification criteria."
    },
    {
        "question": "Is there any fee to access government notification details?",
        "answer": "No. All notification summaries, eligibility criteria, and links to official commission portals are completely free."
    }
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
    faqs: [
    {
        "question": "What is Recruiter OS?",
        "answer": "Recruiter OS is an integrated hiring workspace enabling teams to publish jobs, review applicant submissions, and search verified talent profiles."
    },
    {
        "question": "How does candidate screening work?",
        "answer": "Recruiter OS surfaces verified skills, assessment results, and resume parsing insights to help recruiters quickly identify strong matches."
    },
    {
        "question": "Can recruiters manage team hiring pipelines?",
        "answer": "Yes. Multi-seat recruiter accounts support team collaboration, stage tracking, candidate shortlists, and direct messaging."
    }
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
    faqs: [
    {
        "question": "How many institutions are cataloged on TalentXcel Colleges?",
        "answer": "The directory includes accredited higher education institutions across India, indexed with official affiliation and location data."
    },
    {
        "question": "What information is available on individual college profiles?",
        "answer": "Profiles detail academic programs, entrance examination eligibility, cutoffs, NIRF rankings, campus facilities, and placement summaries."
    },
    {
        "question": "Can college placement cells manage their campus hiring profiles?",
        "answer": "Yes. Authorized placement cells can manage batch screening codes and connect graduating cohorts directly with recruiters via TalentXcel."
    }
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
    faqs: [
    {
        "question": "How do career roadmaps help plan progression?",
        "answer": "Roadmaps illustrate the required technical competencies, architecture skills, and project experience needed to advance to each career level."
    },
    {
        "question": "What does the Skill Gap Diagnostic evaluate?",
        "answer": "It compares your current skill profile against active employer requirements for your target role and generates prioritized learning recommendations."
    },
    {
        "question": "How does this differ from talentxcel.in/careers?",
        "answer": "careers.talentxcel.in is an interactive career planning tool for users. talentxcel.in/careers is the recruitment page for careers at TalentXcel."
    }
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
    headline: 'Know Your Market Value. Discover Your Next Career Move.',
    supportingCopy: 'Understand your compensation, explore career opportunities and make better-informed decisions about your earning potential with personalised salary intelligence.',
    primaryCta: 'Discover My Market Value',
    primaryCtaUrl: '/salary',
    secondaryCta: 'Explore Salary Insights',
    secondaryCtaUrl: '/salary/software-engineer/bangalore',
    title: 'TalentXcel Salary Intelligence — Know Your Market Value. Discover Your Next Career Move.',
    description: 'Understand your compensation, explore career opportunities and make better-informed decisions about your earning potential with personalised salary intelligence. Verified percentiles, location differentials and role insights.',
    h1: 'Know Your Market Value. Discover Your Next Career Move.',
    tagline: 'Market Percentiles (P10 - P90) • What-If Simulator • Negotiation Coach • Verified CTC Data',
    keywords: [
      'salary benchmarks india',
      'software engineer salary bangalore',
      'tech compensation percentiles',
      'salary negotiation tool',
      'it salary calculator',
      'ctc to in hand calculator india',
    ],
    canonical: 'https://salary.talentxcel.in/',
    disclaimer: 'Salary benchmarks and distributions are derived from verified employer filings, active job postings, self-reported compensation data, and statistical distributions. Figures represent statistical estimates.',
    schemaType: 'WebApplication',
    schemaJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'TalentXcel Salary Intelligence',
      'url': 'https://salary.talentxcel.in/',
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'All',
      'description': 'Understand your compensation, explore career opportunities and make better-informed decisions about your earning potential with personalised salary intelligence.',
      'parentOrganization': {
        '@type': 'Organization',
        'name': 'TalentXcel',
        'url': 'https://talentxcel.in'
      }
    },
    featuredInternalLinks: [
      { text: 'Salary Intelligence & Benchmarks', href: '/salary' },
      { text: 'Career What-If Simulator', href: '/salary/scenarios' },
      { text: 'Salary Negotiation Coach', href: '/salary/negotiation' },
      { text: 'Skills Gap Diagnostics', href: '/salary/skills-gap' },
      { text: 'Software Engineer Salary in Bangalore', href: '/salary/software-engineer/bangalore' },
      { text: 'Data Analyst Salary in Hyderabad', href: '/salary/data-analyst/hyderabad' },
    ],
    siblingDomainCrossLinks: [
      { text: 'Search Matching Jobs on TalentXcel Jobs', href: 'https://jobs.talentxcel.in/' },
      { text: 'Optimize Your Resume on TalentXcel Resume', href: 'https://resume.talentxcel.in/' },
      { text: 'Map Skills to Higher Pay on TalentXcel Careers', href: 'https://careers.talentxcel.in/' },
      { text: 'Learn In-Demand Skills on TalentXcel Learning', href: 'https://learning.talentxcel.in/' },
    ],
    faqs: [
    {
        "question": "How are salary benchmark percentiles calculated?",
        "answer": "Benchmarks are derived from employer job compensation disclosures, verified market research datasets, and user-reported compensation data calibrated across experience tiers."
    },
    {
        "question": "What does the What-If Scenario Simulator do?",
        "answer": "The simulator models potential compensation trajectories based on acquiring high-demand skills, transitioning between tech stacks, or relocating between metro hubs."
    },
    {
        "question": "How are location differentials accounted for?",
        "answer": "Compensation figures account for cost-of-living and market demand variance across major centers like Bangalore, Hyderabad, Pune, Mumbai, and Delhi NCR."
    }
],
    staticHeroHtml: `
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <span style="display:inline-block;padding:4px 12px;background:#0369a1;color:#e0f2fe;font-size:0.8rem;font-weight:700;border-radius:9999px;margin-bottom:14px;text-transform:uppercase;letter-spacing:0.05em;">For Professionals, Jobseekers & Compensation Researchers</span>
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">Know Your Market Value. Discover Your Next Career Move.</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Understand your compensation, explore career opportunities and make better-informed decisions about your earning potential with personalised salary intelligence.</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:20px;">
          <a href="/salary" style="background:#0284c7;color:#ffffff;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem;">Discover My Market Value</a>
          <a href="/salary/software-engineer/bangalore" style="background:#1e293b;color:#38bdf8;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">Explore Salary Insights</a>
          <a href="/salary/scenarios" style="background:#1e293b;color:#38bdf8;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:0.9rem;border:1px solid #334155;">What-If Simulator</a>
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
    faqs: [
    {
        "question": "What makes a resume ATS-friendly on TalentXcel?",
        "answer": "Templates use single-column, parseable structures with standard headers, clean typography, and zero parsing-inhibiting graphical elements."
    },
    {
        "question": "How does the ATS Scanner evaluate resumes?",
        "answer": "The scanner parses your uploaded resume against target job description keywords, highlighting missing skills, formatting issues, and section clarity."
    },
    {
        "question": "Can I export my resume in different formats?",
        "answer": "Yes. Completed resumes can be exported as cleanly formatted PDF documents ready for direct employer submission."
    }
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
    faqs: [
    {
        "question": "How are job listings verified on TalentXcel Jobs?",
        "answer": "Listings are published directly by verified employer accounts or aggregated with verified employer identity checks to ensure active, genuine vacancies."
    },
    {
        "question": "Can I apply directly without external redirects?",
        "answer": "Yes. For employers utilizing TalentXcel Recruiter OS, applications are submitted directly with your profile or uploaded resume without external redirects."
    },
    {
        "question": "Are fresher and entry-level tech roles supported?",
        "answer": "Yes. You can filter listings by experience tier, including fresher, entry-level, mid-level, and senior leadership positions."
    }
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
    faqs: [
    {
        "question": "What is TalentXcel?",
        "answer": "TalentXcel is a unified career ecosystem integrating a professional talent network, verified career credentials, and specialist career intelligence tools."
    },
    {
        "question": "How do the specialist subdomains connect with my account?",
        "answer": "Your single TalentXcel account provides seamless authentication across all specialist subdomains via cross-domain session cookies (.talentxcel.in)."
    },
    {
        "question": "What is the Skill Exchange Network?",
        "answer": "A peer-to-peer learning marketplace where members exchange professional skills, mentor peers, and earn platform recognition."
    }
],
    staticHeroHtml: `
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">The Intelligent Career & Hiring Platform</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Empowering ambitious talent with AI matching, transparent compensation, verified credentials, and direct employer connections.</p>
      </section>
    `,
  },
  ca: {
    id: 'CA_PRACTICE',
    subdomain: 'ca',
    hostname: 'ca.talentxcel.in',
    origin: 'https://ca.talentxcel.in',
    audience: 'Chartered Accountants, tax practitioners, audit firms, and finance professionals.',
    headline: 'Statutory Compliance Calendar & Practice Management OS for CAs',
    supportingCopy: 'Track GST, TDS, Income Tax, and ROC filing deadlines, compute advance tax, lookup HSN rates, and manage client dossiers effortlessly.',
    primaryCta: 'Open Compliance Calendar',
    primaryCtaUrl: '/ca',
    secondaryCta: 'Advance Tax Calculator',
    secondaryCtaUrl: '/ca#advance-tax',
    title: 'CA PracticeOS by TalentXcel — Compliance Calendar, Advance Tax & Practice Management for CAs',
    description: 'Statutory compliance due-date tracker, Section 115BAC advance tax calculator, GST HSN finder, and client dossier manager built for Indian Chartered Accountants.',
    h1: 'Statutory Compliance Calendar & Practice Management OS for CAs',
    tagline: 'Zero Missed Deadlines • Live HSN Engine • Secure Client Dossiers',
    keywords: [
      'ca practice management',
      'statutory compliance calendar 2026',
      'gst filing due dates',
      'advance tax calculator section 115bac',
      'hsn sac code finder',
      'chartered accountant tools india'
    ],
    canonical: 'https://ca.talentxcel.in/',
    schemaType: 'ProfessionalService',
    schemaJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      'name': 'CA PracticeOS by TalentXcel',
      'url': 'https://ca.talentxcel.in/',
      'description': 'Compliance calendar and practice management operating system for Chartered Accountants.',
      'parentOrganization': {
        '@type': 'Organization',
        'name': 'TalentXcel',
        'url': 'https://talentxcel.in'
      }
    },
    featuredInternalLinks: [
      { text: 'Statutory Due-Date Calendar', href: '/ca' },
      { text: 'Advance Tax Calculator', href: '/ca#advance-tax' },
      { text: 'GST HSN & SAC Code Finder', href: '/ca#hsn-finder' },
      { text: 'Client Master Dossier', href: '/ca#client-dossier' },
    ],
    siblingDomainCrossLinks: [
      { text: 'Legal Practice OS for Advocates', href: 'https://legal.talentxcel.in/' },
      { text: 'Professional Advisory Marketplace', href: 'https://services.talentxcel.in/' },
      { text: 'Salary & In-Hand Benchmarks', href: 'https://salary.talentxcel.in/' },
      { text: 'TalentXcel Core Network', href: 'https://talentxcel.in/' },
    ],
    faqs: [
      {
        question: 'Which statutory due dates are tracked in CA PracticeOS?',
        answer: 'CA PracticeOS tracks all monthly and quarterly GSTR-1, GSTR-3B, GSTR-9/9C filings, quarterly TDS payments and returns (24Q/26Q), advance tax installments, tax audit Form 3CD, and ROC filings.'
      },
      {
        question: 'Does the advance tax calculator support the New Tax Regime?',
        answer: 'Yes, it provides side-by-side computation under Section 115BAC (default) and the Old Tax Regime, accounting for standard deductions, rebate u/s 87A, and 4% health & education cess.'
      }
    ],
    staticHeroHtml: `
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">CA PracticeOS — Practice Management for Indian CAs</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Automate statutory due-date monitoring, advance tax estimations, and client filings.</p>
      </section>
    `
  },
  legal: {
    id: 'LEGAL_PRACTICE',
    subdomain: 'legal',
    hostname: 'legal.talentxcel.in',
    origin: 'https://legal.talentxcel.in',
    audience: 'Advocates, legal practitioners, corporate counsels, and law students.',
    headline: 'Indian Bare Acts Intelligence & Legal Practice Management',
    supportingCopy: 'Navigate BNS, BNSS, BSA, and commercial acts, generate standard legal agreements, and track court matter dossiers effortlessly.',
    primaryCta: 'Search Bare Acts',
    primaryCtaUrl: '/legal',
    secondaryCta: 'Draft Legal Agreement',
    secondaryCtaUrl: '/legal#drafting',
    title: 'Legal PracticeOS by TalentXcel — Indian Bare Acts, Legal Drafting & Matter Management',
    description: 'Instant searchable BNS, BNSS, BSA criminal laws, Companies Act, automated legal contract drafting templates, and court matter hearing tracker for Indian advocates.',
    h1: 'Indian Bare Acts Intelligence & Legal Practice Management',
    tagline: 'New Criminal Laws (BNS/BNSS/BSA) • Automated Legal Drafter • Hearing Tracker',
    keywords: [
      'legal practice management',
      'bharatiya nyaya sanhita bns bare act',
      'bnss bare act 2023',
      'legal notice generator',
      'advocate court case tracker',
      'nda drafting template india'
    ],
    canonical: 'https://legal.talentxcel.in/',
    schemaType: 'LegalService',
    schemaJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'LegalService',
      'name': 'Legal PracticeOS by TalentXcel',
      'url': 'https://legal.talentxcel.in/',
      'description': 'Bare acts search, legal agreement drafting, and court matter tracking for advocates.',
      'parentOrganization': {
        '@type': 'Organization',
        'name': 'TalentXcel',
        'url': 'https://talentxcel.in'
      }
    },
    featuredInternalLinks: [
      { text: 'Indian Bare Acts Navigator', href: '/legal' },
      { text: 'Legal Drafting Library (NDA, Retainer)', href: '/legal#drafting' },
      { text: 'Court Matter & Hearing Tracker', href: '/legal#case-tracker' },
      { text: 'Section 138 NI Act Notice Generator', href: '/legal#ni-notice' },
    ],
    siblingDomainCrossLinks: [
      { text: 'CA PracticeOS for Chartered Accountants', href: 'https://ca.talentxcel.in/' },
      { text: 'Professional Advisory Marketplace', href: 'https://services.talentxcel.in/' },
      { text: 'Job Opportunities for Legal Counsels', href: 'https://jobs.talentxcel.in/' },
      { text: 'TalentXcel Core Network', href: 'https://talentxcel.in/' },
    ],
    faqs: [
      {
        question: 'Are the new criminal laws (BNS, BNSS, BSA) covered?',
        answer: 'Yes. Legal PracticeOS includes searchable key sections for Bharatiya Nyaya Sanhita 2023, Bharatiya Nagarik Suraksha Sanhita 2023, and Bharatiya Sakshya Adhiniyam 2023, alongside older IPC/CrPC cross-references.'
      },
      {
        question: 'Can I draft legal agreements and export them?',
        answer: 'Yes. You can generate custom Non-Disclosure Agreements (NDAs), Legal Retainers, and Cheque Bounce Notices with instant in-browser copy and print.'
      }
    ],
    staticHeroHtml: `
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">Legal PracticeOS — Intelligence for Indian Advocates</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Access Indian bare acts, generate airtight legal drafts, and manage court hearings.</p>
      </section>
    `
  },
  services: {
    id: 'SERVICES',
    subdomain: 'services',
    hostname: 'services.talentxcel.in',
    origin: 'https://services.talentxcel.in',
    audience: 'Businesses, founders, SMBs, and independent certified professionals.',
    headline: 'Verified Professional Services & Advisory Platform',
    supportingCopy: 'Discover and book verified Chartered Accountants, Corporate Counsels, Fractional CFOs, and HR Advisers with upfront scopes of work.',
    primaryCta: 'Find Verified Experts',
    primaryCtaUrl: '/services',
    secondaryCta: 'Create Scope of Work',
    secondaryCtaUrl: '/services#sow-builder',
    title: 'Professional ServicesOS by TalentXcel — Verified CA, Legal & Executive Advisory Network',
    description: 'Book verified Indian Chartered Accountants, Legal Counsels, and Business Consultants. Transparent consultation fees, scheduled bookings, and automated SOW generator.',
    h1: 'Verified Professional Services & Advisory Platform',
    tagline: 'Vetted Practitioners • Transparent Scopes • Guaranteed Engagements',
    keywords: [
      'verified ca online',
      'legal counsel consultation india',
      'fractional cfo services',
      'business compliance advisory',
      'scope of work generator',
      'professional services marketplace'
    ],
    canonical: 'https://services.talentxcel.in/',
    schemaType: 'ProfessionalService',
    schemaJsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      'name': 'Professional ServicesOS by TalentXcel',
      'url': 'https://services.talentxcel.in/',
      'description': 'Verified professional advisory and consulting services platform.',
      'parentOrganization': {
        '@type': 'Organization',
        'name': 'TalentXcel',
        'url': 'https://talentxcel.in'
      }
    },
    featuredInternalLinks: [
      { text: 'Browse Verified Professionals', href: '/services' },
      { text: 'Book Consultation', href: '/services#booking' },
      { text: 'SOW Proposal Builder', href: '/services#sow-builder' },
      { text: 'Fee Benchmarks by Industry', href: '/services#fee-benchmarks' },
    ],
    siblingDomainCrossLinks: [
      { text: 'CA PracticeOS for Accountants', href: 'https://ca.talentxcel.in/' },
      { text: 'Legal PracticeOS for Advocates', href: 'https://legal.talentxcel.in/' },
      { text: 'TalentXcel JobMatch OS', href: 'https://jobs.talentxcel.in/' },
      { text: 'TalentXcel Core Network', href: 'https://talentxcel.in/' },
    ],
    faqs: [
      {
        question: 'How are professionals verified on TalentXcel Services?',
        answer: 'All practitioners undergo ICAI/Bar Council membership number verification, credential background checks, and client reference reviews.'
      },
      {
        question: 'Can I generate a Scope of Work (SOW) before hiring?',
        answer: 'Yes. The built-in SOW Proposal Builder allows both clients and consultants to specify milestones, deliverables, timelines, and payment terms.'
      }
    ],
    staticHeroHtml: `
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">Professional ServicesOS — Verified Advisory Network</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Connect with verified Chartered Accountants, Legal Counsels, and Fractional Executives.</p>
      </section>
    `
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


function escapeXml(unsafe: string): string {
  return (unsafe || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Builds the user-visible, accessible semantic initial HTML for a specialist subdomain.
 * Placed inside #root to be immediately visible to crawlers and users, then cleanly
 * replaced when React mounts.
 */
export function buildSpecialistInitialHtml(identity: SubdomainIdentity): string {
  const subdomainLabel = identity.subdomain ? identity.subdomain.charAt(0).toUpperCase() + identity.subdomain.slice(1) : 'Platform';

  const internalLinks = (identity.featuredInternalLinks || [])
    .map(link => `<a href="${escapeXml(link.href)}" style="background:#1e293b;color:#e2e8f0;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600;font-size:0.875rem;border:1px solid #334155;display:inline-block;">${escapeXml(link.text)}</a>`)
    .join('\n      ');

  const faqsHtml = (identity.faqs || [])
    .map(faq => `
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:20px 24px;">
          <h3 style="font-size:1.05rem;font-weight:700;color:#f8fafc;margin:0 0 8px 0;">${escapeXml(faq.question)}</h3>
          <p style="font-size:0.95rem;color:#94a3b8;line-height:1.6;margin:0;">${escapeXml(faq.answer)}</p>
        </div>`)
    .join('\n');

  const crossLinks = (identity.siblingDomainCrossLinks || [])
    .map(cross => `<a href="${escapeXml(cross.href)}" style="color:#38bdf8;font-size:0.875rem;text-decoration:none;font-weight:500;">${escapeXml(cross.text)} &rarr;</a>`)
    .join('\n        ');

  return `<div id="tx-initial-content" class="tx-initial-content" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;background:#090d16;min-height:100vh;padding:0;margin:0;">
  <header style="border-bottom:1px solid #1e293b;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;max-width:1200px;margin:0 auto;">
    <a href="/" style="font-size:1.25rem;font-weight:800;color:#ffffff;text-decoration:none;letter-spacing:-0.02em;">
      Talent<span style="color:#38bdf8;">Xcel</span> <span style="font-size:0.8rem;font-weight:600;color:#94a3b8;margin-left:6px;padding:2px 8px;background:#1e293b;border-radius:6px;">${escapeXml(subdomainLabel)}</span>
    </a>
    <nav style="display:flex;gap:16px;font-size:0.875rem;">
      <a href="https://talentxcel.in" style="color:#94a3b8;text-decoration:none;">Home</a>
      <a href="https://jobs.talentxcel.in" style="color:#94a3b8;text-decoration:none;">Jobs</a>
      <a href="https://salary.talentxcel.in" style="color:#94a3b8;text-decoration:none;">Salary</a>
      <a href="https://colleges.talentxcel.in" style="color:#94a3b8;text-decoration:none;">Colleges</a>
      <a href="https://resume.talentxcel.in" style="color:#94a3b8;text-decoration:none;">Resume</a>
    </nav>
  </header>

  <main style="max-width:1100px;margin:0 auto;padding:48px 24px;">
    <div style="margin-bottom:16px;">
      <span style="display:inline-block;padding:5px 14px;background:#1e293b;color:#38bdf8;font-size:0.75rem;font-weight:700;border-radius:9999px;border:1px solid #334155;text-transform:uppercase;letter-spacing:0.05em;">
        ${escapeXml(identity.audience)}
      </span>
    </div>

    <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;line-height:1.25;margin:0 0 16px 0;max-width:900px;">
      ${escapeXml(identity.h1)}
    </h1>

    <p style="font-size:1.125rem;color:#94a3b8;line-height:1.7;margin:0 0 28px 0;max-width:850px;">
      ${escapeXml(identity.supportingCopy)}
    </p>

    <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:40px;">
      <a href="${escapeXml(identity.primaryCtaUrl)}" style="background:#0284c7;color:#ffffff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:0.95rem;display:inline-block;">
        ${escapeXml(identity.primaryCta)}
      </a>
      ${internalLinks}
    </div>

    ${identity.faqs && identity.faqs.length > 0 ? `
    <section class="tx-domain-faqs" style="border-top:1px solid #1e293b;padding-top:40px;margin-top:40px;">
      <h2 style="font-size:1.5rem;font-weight:700;color:#f1f5f9;margin-bottom:24px;">
        Frequently Asked Questions
      </h2>
      <div style="display:grid;gap:16px;">
${faqsHtml}
      </div>
    </section>
    ` : ''}

    ${identity.siblingDomainCrossLinks && identity.siblingDomainCrossLinks.length > 0 ? `
    <section class="tx-cross-domains" style="border-top:1px solid #1e293b;padding-top:32px;margin-top:40px;">
      <h3 style="font-size:0.9rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px;">
        Explore the TalentXcel Platform
      </h3>
      <div style="display:flex;flex-wrap:wrap;gap:16px;">
        ${crossLinks}
      </div>
    </section>
    ` : ''}

    ${identity.disclaimer ? `
    <p style="font-size:0.8rem;color:#64748b;margin-top:32px;line-height:1.5;">
      ${escapeXml(identity.disclaimer)}
    </p>
    ` : ''}
  </main>

  <footer style="border-top:1px solid #1e293b;padding:32px 24px;text-align:center;font-size:0.8rem;color:#64748b;max-width:1200px;margin:40px auto 0 auto;">
    <p style="margin:0 0 8px 0;">&copy; 2026 TalentXcel Services Pvt Ltd. All rights reserved.</p>
    <div style="display:flex;justify-content:center;gap:16px;">
      <a href="https://talentxcel.in/about" style="color:#64748b;text-decoration:none;">About</a>
      <a href="https://talentxcel.in/privacypolicy" style="color:#64748b;text-decoration:none;">Privacy Policy</a>
      <a href="https://talentxcel.in/terms" style="color:#64748b;text-decoration:none;">Terms of Service</a>
      <a href="https://talentxcel.in/contact" style="color:#64748b;text-decoration:none;">Contact</a>
    </div>
  </footer>
</div>`;
}
