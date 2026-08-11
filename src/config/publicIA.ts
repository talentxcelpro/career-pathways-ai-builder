/**
 * Public information architecture for talentxcel.in.
 *
 * Single source of truth for the marketing/SEO surface:
 *   /<service>            candidate + employer service pages
 *   /industries/<slug>     industry hubs
 *   /locations/<slug>      location hubs
 *   /resources/<slug>      guide hubs
 *
 * Every entry here is rendered by a real, data-backed page and is added to
 * the sitemap via src/config/seo.ts.
 */

export interface FaqItem {
  q: string;
  a: string;
}

export interface ServicePage {
  slug: string;
  audience: 'candidate' | 'employer';
  title: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  /** Job-search keywords used to surface live roles on the page. */
  jobKeywords?: string[];
  bullets: { title: string; body: string }[];
  faqs: FaqItem[];
  ctaLabel: string;
  ctaHref: string;
}

export const CANDIDATE_SERVICES: ServicePage[] = [
  {
    slug: 'resume-builder',
    audience: 'candidate',
    title: 'Resume Builder',
    h1: 'ATS-ready resume builder',
    metaTitle: 'Free ATS Resume Builder — TalentXcel',
    metaDescription:
      'Build an ATS-ready resume in minutes with TalentXcel. Import your details, pick a recruiter-approved template and export a clean PDF for free.',
    intro:
      'Most applications are filtered by an applicant tracking system before a recruiter reads them. The TalentXcel resume builder produces clean, parseable resumes with the structure ATS software expects, then lets you tailor each version to a specific role.',
    bullets: [
      { title: 'ATS-safe structure', body: 'Single-column layouts, standard section headings and machine-readable dates so parsers extract every field correctly.' },
      { title: 'Role-specific tailoring', body: 'Rewrite bullets against a job description so your experience mirrors the language of the posting.' },
      { title: 'Export anywhere', body: 'Download as PDF or DOCX, or attach directly to an application on TalentXcel.' },
    ],
    faqs: [
      { q: 'Is the resume builder free?', a: 'Yes. Building, editing and exporting a resume is free. Advanced AI rewriting is part of the paid tiers.' },
      { q: 'Will my resume pass an ATS?', a: 'The templates avoid tables, text boxes, columns and graphics — the elements that most commonly break ATS parsing.' },
      { q: 'Can I import an existing resume?', a: 'Yes. Upload a PDF or DOCX and TalentXcel extracts your sections so you can edit rather than retype.' },
    ],
    ctaLabel: 'Build my resume',
    ctaHref: '/public/resume-builder',
  },
  {
    slug: 'ai-career-coach',
    audience: 'candidate',
    title: 'AI Career Coach',
    h1: 'AI career coach',
    metaTitle: 'AI Career Coach — Personalised Career Guidance | TalentXcel',
    metaDescription:
      'Get a personalised career roadmap from the TalentXcel AI career coach: skill gaps, next roles, salary benchmarks and a step-by-step plan.',
    intro:
      'The AI career coach reads your Career Passport — verified education, employment, skills and assessments — and turns it into a concrete plan: what to learn next, which roles you already qualify for, and what is holding your profile back.',
    bullets: [
      { title: 'Skill-gap analysis', body: 'Compares your profile against live postings for your target role and lists the specific skills missing.' },
      { title: 'Personalised roadmap', body: 'A sequenced plan of courses, projects and certifications rather than generic advice.' },
      { title: 'Grounded in your data', body: 'Every recommendation cites the passport fields it used, so you can check the reasoning.' },
    ],
    faqs: [
      { q: 'What data does the coach use?', a: 'Only your own TalentXcel profile and Career Passport records, plus live job market data on the platform.' },
      { q: 'Is it a replacement for a human coach?', a: 'No. It handles analysis and planning at scale; TalentXcel also offers human career coaching sessions.' },
    ],
    ctaLabel: 'Open the career coach',
    ctaHref: '/ai-agent',
  },
  {
    slug: 'job-matching',
    audience: 'candidate',
    title: 'AI Job Matching',
    h1: 'AI job matching',
    metaTitle: 'AI Job Matching — Roles That Fit Your Profile | TalentXcel',
    metaDescription:
      'TalentXcel matches your verified skills and experience against live openings and scores each role so you apply where you actually stand a chance.',
    intro:
      'Keyword search returns everything. Matching returns what fits. TalentXcel scores each live opening against your verified skills, experience band, location preference and salary expectation, and explains the score.',
    jobKeywords: [],
    bullets: [
      { title: 'Explained match scores', body: 'Every role shows which requirements you meet and which you miss.' },
      { title: 'Verified-profile weighting', body: 'Verified credentials in your Career Passport carry more weight than self-declared ones.' },
      { title: 'Alerts that stay relevant', body: 'Get notified only when a new posting clears your match threshold.' },
    ],
    faqs: [
      { q: 'How is the match score calculated?', a: 'Skills overlap, experience band, education, location and compensation fit are combined into a single 0-100 score.' },
      { q: 'Do employers see my score?', a: 'Employers see match strength only for roles you apply to.' },
    ],
    ctaLabel: 'See my matches',
    ctaHref: '/public/job-matcher',
  },
  {
    slug: 'reverse-job-search',
    audience: 'candidate',
    title: 'Reverse Job Search',
    h1: 'Reverse job search',
    metaTitle: 'Reverse Job Search — Let Employers Find You | TalentXcel',
    metaDescription:
      'Publish a verified Career Passport and let recruiters approach you. Control visibility, share proof of your credentials and skip the application queue.',
    intro:
      'Instead of applying into a queue, publish a verified profile and let hiring teams come to you. Your Career Passport carries tamper-proof proof of education, employment and certifications, so recruiters can qualify you before the first call.',
    bullets: [
      { title: 'Verified by default', body: 'Recruiters see which credentials are verified and can open the proof for each one.' },
      { title: 'You control visibility', body: 'Toggle education, experience, certificates, skills and contact details on or off per section.' },
      { title: 'One shareable link', body: 'A single public passport URL and QR code replaces the resume attachment.' },
    ],
    faqs: [
      { q: 'Can my current employer see my profile?', a: 'Your public passport is only visible when you publish it, and every section has its own visibility toggle.' },
      { q: 'What does verification mean?', a: 'Each credential is checked against its issuer or supporting document and stamped with a tamper-evident hash.' },
    ],
    ctaLabel: 'Create my passport',
    ctaHref: '/passport',
  },
  {
    slug: 'career-coaching',
    audience: 'candidate',
    title: 'Career Coaching',
    h1: 'Career coaching',
    metaTitle: 'Career Coaching for Professionals in India | TalentXcel',
    metaDescription:
      'One-to-one career coaching for professionals in India: role transitions, interview preparation, salary negotiation and long-term career planning.',
    intro:
      'Structured, one-to-one coaching for professionals navigating a transition — a first switch, a move into management, a change of industry, or a return after a break. Sessions combine your TalentXcel data with a coach who works in your field.',
    bullets: [
      { title: 'Role transition planning', body: 'Map the shortest credible path from your current title to your target one.' },
      { title: 'Interview preparation', body: 'Mock interviews against the actual competency framework used for the role.' },
      { title: 'Compensation strategy', body: 'Benchmark your band against live postings before you negotiate.' },
    ],
    faqs: [
      { q: 'How are sessions delivered?', a: 'Online, one to one, scheduled through the platform.' },
      { q: 'Do I need a paid plan?', a: 'Coaching is booked per engagement and does not require a subscription.' },
    ],
    ctaLabel: 'Talk to a coach',
    ctaHref: '/contact',
  },
];

export const EMPLOYER_SERVICES: ServicePage[] = [
  {
    slug: 'staffing',
    audience: 'employer',
    title: 'Staffing',
    h1: 'Staffing services',
    metaTitle: 'Staffing Services in India — Contract & Permanent | TalentXcel',
    metaDescription:
      'Contract, contract-to-hire and permanent staffing across India. Pre-verified candidates, compliance handled, roles closed against agreed SLAs.',
    intro:
      'Contract, contract-to-hire and permanent staffing across India. Every candidate arrives with a verified Career Passport, so screening starts from evidence rather than claims.',
    bullets: [
      { title: 'Pre-verified candidates', body: 'Education, employment history and certifications are checked before shortlisting.' },
      { title: 'Compliance handled', body: 'Payroll, statutory compliance and onboarding for contract staff are managed end to end.' },
      { title: 'SLA-backed delivery', body: 'Agreed shortlist and closure timelines per requisition.' },
    ],
    faqs: [
      { q: 'Which locations do you cover?', a: 'Pan-India, with the deepest bench in Delhi NCR, Bangalore, Hyderabad, Pune, Mumbai and Chennai.' },
      { q: 'How fast is the first shortlist?', a: 'Typically within a week of an approved job brief, depending on seniority and niche.' },
    ],
    ctaLabel: 'Request staffing support',
    ctaHref: '/contact',
  },
  {
    slug: 'recruitment',
    audience: 'employer',
    title: 'Recruitment',
    h1: 'Recruitment services',
    metaTitle: 'Recruitment Services — Permanent Hiring Partner | TalentXcel',
    metaDescription:
      'End-to-end permanent recruitment: sourcing, verified screening, structured interviews and offer management, backed by TalentXcel matching.',
    intro:
      'End-to-end permanent hiring: intake, sourcing, verified screening, structured interviews and offer management. The same AI matching that powers the candidate side runs behind every shortlist.',
    bullets: [
      { title: 'Structured intake', body: 'A written scorecard per role so shortlists are measured, not intuited.' },
      { title: 'Verified screening', body: 'Credential checks completed before the first interview slot is spent.' },
      { title: 'Offer to joining', body: 'Follow-through until the candidate joins, including counter-offer management.' },
    ],
    faqs: [
      { q: 'Do you work on retained or contingent terms?', a: 'Both, depending on role seniority and volume.' },
      { q: 'What is the replacement guarantee?', a: 'A free replacement window applies to permanent placements; the term is set in the engagement letter.' },
    ],
    ctaLabel: 'Start hiring',
    ctaHref: '/contact',
  },
  {
    slug: 'rpo',
    audience: 'employer',
    title: 'RPO',
    h1: 'Recruitment process outsourcing (RPO)',
    metaTitle: 'RPO Services in India — Recruitment Process Outsourcing | TalentXcel',
    metaDescription:
      'Full or project RPO: an embedded TalentXcel recruiting team, your process and employer brand, reporting on funnel, cost per hire and time to fill.',
    intro:
      'An embedded recruiting team operating inside your process and under your employer brand. Suitable for sustained hiring volume where an internal team would take too long to build.',
    bullets: [
      { title: 'Embedded team', body: 'Recruiters, sourcers and coordinators working in your ATS and your rituals.' },
      { title: 'Full or project scope', body: 'Cover the whole funnel, a single business unit, or a defined hiring project.' },
      { title: 'Measured throughout', body: 'Funnel conversion, time to fill, cost per hire and offer-drop reporting every cycle.' },
    ],
    faqs: [
      { q: 'What hiring volume justifies RPO?', a: 'Usually sustained hiring of 25+ roles a year, or a burst project with a hard deadline.' },
      { q: 'Whose ATS is used?', a: 'Yours, if you have one. Otherwise the TalentXcel employer workspace.' },
    ],
    ctaLabel: 'Discuss an RPO engagement',
    ctaHref: '/contact',
  },
  {
    slug: 'staff-augmentation',
    audience: 'employer',
    title: 'Staff Augmentation',
    h1: 'Staff augmentation',
    metaTitle: 'IT Staff Augmentation Services in India | TalentXcel',
    metaDescription:
      'Add verified engineers, analysts and specialists to your team on a monthly basis. You direct the work; TalentXcel handles sourcing, payroll and compliance.',
    intro:
      'Add specialists to an existing team without adding headcount. You direct the work and own the roadmap; TalentXcel handles sourcing, contracting, payroll and compliance.',
    bullets: [
      { title: 'Skill-matched profiles', body: 'Shortlists built against your stack and delivery model, not a generic keyword search.' },
      { title: 'Monthly commercials', body: 'Predictable monthly rates with defined notice periods and no long lock-ins.' },
      { title: 'Scale either way', body: 'Ramp up for a delivery push and ramp down when it ends.' },
    ],
    faqs: [
      { q: 'How is this different from staffing?', a: 'Augmented staff work inside your team under your direction; staffing typically fills a defined open position.' },
      { q: 'Can engineers work onsite?', a: 'Yes — onsite, hybrid or fully remote, depending on the engagement.' },
    ],
    ctaLabel: 'Augment my team',
    ctaHref: '/contact',
  },
];

export const ALL_SERVICES: ServicePage[] = [...CANDIDATE_SERVICES, ...EMPLOYER_SERVICES];

export interface IndustryHub {
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  /** Keywords matched against live job titles and descriptions. */
  keywords: string[];
  roles: string[];
}

const industry = (
  slug: string,
  name: string,
  intro: string,
  keywords: string[],
  roles: string[],
): IndustryHub => ({
  slug,
  name,
  metaTitle: `${name} Jobs & Hiring in India | TalentXcel`,
  metaDescription: `Live ${name.toLowerCase()} jobs across India, in-demand roles and hiring support for ${name.toLowerCase()} employers — on TalentXcel.`,
  intro,
  keywords,
  roles,
});

export const INDUSTRY_HUBS: IndustryHub[] = [
  industry('it', 'Information Technology', 'Software product and services hiring across India, from platform engineering to enterprise IT support.', ['software', 'developer', 'engineer', 'devops', 'full stack', 'java', 'python'], ['Software Engineer', 'Full Stack Developer', 'DevOps Engineer', 'QA Engineer', 'Engineering Manager']),
  industry('healthcare', 'Healthcare', 'Hospitals, diagnostics, medical devices and health-tech roles across clinical and non-clinical functions.', ['nurse', 'medical', 'healthcare', 'clinical', 'hospital', 'pharma'], ['Staff Nurse', 'Clinical Research Associate', 'Medical Coder', 'Hospital Administrator', 'Pharmacist']),
  industry('banking', 'Banking & Financial Services', 'Retail and corporate banking, NBFCs, insurance and capital markets hiring.', ['bank', 'finance', 'credit', 'audit', 'accounts', 'insurance'], ['Relationship Manager', 'Credit Analyst', 'Risk Analyst', 'Branch Manager', 'Financial Analyst']),
  industry('manufacturing', 'Manufacturing', 'Plant operations, quality, maintenance and supply chain roles across industrial manufacturing.', ['production', 'manufacturing', 'plant', 'quality', 'maintenance', 'mechanical'], ['Production Engineer', 'Quality Engineer', 'Maintenance Engineer', 'Plant Manager', 'CNC Programmer']),
  industry('it-services', 'IT Services & Consulting', 'Global capability centres, consulting firms and system integrators hiring delivery and consulting talent.', ['consultant', 'sap', 'salesforce', 'implementation', 'support engineer'], ['Technology Consultant', 'SAP Consultant', 'Salesforce Developer', 'Delivery Manager', 'Support Engineer']),
  industry('retail-ecommerce', 'Retail & E-commerce', 'Store operations, category management, marketplace and last-mile roles.', ['retail', 'store', 'category', 'ecommerce', 'merchandis'], ['Store Manager', 'Category Manager', 'Merchandiser', 'Operations Executive', 'Buyer']),
  industry('education', 'Education & EdTech', 'Schools, universities, training providers and edtech platforms.', ['teacher', 'faculty', 'trainer', 'academic', 'education', 'counsellor'], ['Academic Counsellor', 'Subject Matter Expert', 'Faculty', 'Instructional Designer', 'Training Manager']),
  industry('telecom', 'Telecom', 'Network rollout, operations and enterprise telecom sales.', ['telecom', 'network engineer', 'rf', '5g', 'bss'], ['Network Engineer', 'RF Engineer', 'NOC Engineer', 'Enterprise Sales Manager', 'Field Technician']),
  industry('logistics', 'Logistics & Supply Chain', 'Warehousing, transportation, freight forwarding and last-mile delivery.', ['logistics', 'supply chain', 'warehouse', 'procurement', 'dispatch'], ['Supply Chain Analyst', 'Warehouse Manager', 'Procurement Executive', 'Logistics Coordinator', 'Fleet Manager']),
  industry('construction', 'Construction & Real Estate', 'Infrastructure, residential and commercial development, plus real estate services.', ['civil', 'construction', 'site engineer', 'architect', 'real estate'], ['Site Engineer', 'Project Manager', 'Quantity Surveyor', 'Architect', 'Safety Officer']),
  industry('energy', 'Energy & Utilities', 'Power generation, renewables, oil and gas, and utility operations.', ['electrical', 'power', 'solar', 'energy', 'utility'], ['Electrical Engineer', 'Solar Project Engineer', 'Plant Operator', 'EHS Manager', 'Energy Analyst']),
  industry('media', 'Media & Entertainment', 'Broadcast, digital publishing, gaming, content and creative production.', ['content', 'media', 'video', 'editor', 'creative', 'design'], ['Content Writer', 'Video Editor', 'Graphic Designer', 'Social Media Manager', 'Producer']),
  industry('hospitality', 'Hospitality & Travel', 'Hotels, restaurants, aviation and travel technology.', ['hospitality', 'hotel', 'chef', 'travel', 'guest'], ['Front Office Executive', 'Chef', 'Guest Relations Manager', 'Travel Consultant', 'F&B Manager']),
  industry('pharma', 'Pharmaceuticals & Life Sciences', 'Drug discovery, manufacturing, regulatory affairs and clinical operations.', ['pharma', 'regulatory', 'clinical', 'formulation', 'qa qc'], ['Regulatory Affairs Executive', 'Formulation Scientist', 'QA Officer', 'Medical Representative', 'Clinical Data Manager']),
  industry('professional-services', 'Professional Services', 'Audit, tax, legal, HR and management consulting practices.', ['audit', 'tax', 'legal', 'consulting', 'human resources'], ['Audit Associate', 'Tax Consultant', 'Legal Counsel', 'HR Business Partner', 'Management Consultant']),
];

export interface LocationHub {
  slug: string;
  name: string;
  /** Matched against the job location fields. */
  aliases: string[];
  state: string;
  intro: string;
  sectors: string[];
}

export const LOCATION_HUBS: LocationHub[] = [
  { slug: 'india', name: 'India', aliases: [], state: 'India', intro: 'Every live opening on TalentXcel, across all Indian cities and remote roles.', sectors: ['Information Technology', 'Banking & Financial Services', 'Manufacturing', 'Healthcare'] },
  { slug: 'delhi-ncr', name: 'Delhi NCR', aliases: ['delhi', 'noida', 'gurgaon', 'gurugram', 'ghaziabad', 'faridabad', 'ncr'], state: 'Delhi NCR', intro: 'Delhi, Noida, Gurugram, Ghaziabad and Faridabad — India\u2019s largest cluster for services, consulting and startup hiring.', sectors: ['IT Services', 'Consulting', 'E-commerce', 'BFSI'] },
  { slug: 'bangalore', name: 'Bangalore', aliases: ['bangalore', 'bengaluru'], state: 'Karnataka', intro: 'India\u2019s product engineering capital, with the deepest concentration of software, deep-tech and GCC roles.', sectors: ['Software Products', 'Global Capability Centres', 'Deep Tech', 'Startups'] },
  { slug: 'hyderabad', name: 'Hyderabad', aliases: ['hyderabad', 'secunderabad'], state: 'Telangana', intro: 'Enterprise technology, pharmaceuticals and life sciences hiring across HITEC City and Genome Valley.', sectors: ['Enterprise Tech', 'Pharmaceuticals', 'BPM', 'Life Sciences'] },
  { slug: 'pune', name: 'Pune', aliases: ['pune', 'pimpri', 'chinchwad'], state: 'Maharashtra', intro: 'Automotive and industrial manufacturing alongside a large IT services and engineering base.', sectors: ['Automotive', 'IT Services', 'Manufacturing', 'Engineering R&D'] },
  { slug: 'mumbai', name: 'Mumbai', aliases: ['mumbai', 'navi mumbai', 'thane', 'bombay'], state: 'Maharashtra', intro: 'India\u2019s financial capital — banking, insurance, capital markets, media and advertising.', sectors: ['BFSI', 'Media', 'Advertising', 'Logistics'] },
  { slug: 'chennai', name: 'Chennai', aliases: ['chennai', 'madras'], state: 'Tamil Nadu', intro: 'Automotive manufacturing, electronics and a mature IT services corridor along OMR.', sectors: ['Automotive', 'IT Services', 'Electronics', 'Healthcare'] },
  { slug: 'kolkata', name: 'Kolkata', aliases: ['kolkata', 'calcutta', 'howrah'], state: 'West Bengal', intro: 'Eastern India\u2019s commercial hub, with IT services, BFSI operations and manufacturing.', sectors: ['IT Services', 'BFSI Operations', 'Manufacturing', 'Retail'] },
  { slug: 'ahmedabad', name: 'Ahmedabad', aliases: ['ahmedabad', 'gandhinagar'], state: 'Gujarat', intro: 'Pharmaceuticals, chemicals, textiles and the GIFT City financial corridor.', sectors: ['Pharmaceuticals', 'Chemicals', 'Textiles', 'Finance'] },
  { slug: 'chandigarh', name: 'Chandigarh', aliases: ['chandigarh', 'mohali', 'panchkula'], state: 'Punjab & Haryana', intro: 'The tricity IT and services cluster serving North India.', sectors: ['IT Services', 'Education', 'Healthcare', 'BPM'] },
  { slug: 'jaipur', name: 'Jaipur', aliases: ['jaipur'], state: 'Rajasthan', intro: 'A growing IT, BPM and tourism-services market with a strong education base.', sectors: ['IT Services', 'BPM', 'Tourism', 'Education'] },
  { slug: 'kochi', name: 'Kochi', aliases: ['kochi', 'cochin', 'ernakulam'], state: 'Kerala', intro: 'Kerala\u2019s technology and logistics gateway, anchored by Infopark and the port economy.', sectors: ['IT Services', 'Logistics', 'Healthcare', 'Tourism'] },
  { slug: 'indore', name: 'Indore', aliases: ['indore'], state: 'Madhya Pradesh', intro: 'Central India\u2019s commercial centre with fast-growing IT and pharma employers.', sectors: ['IT Services', 'Pharmaceuticals', 'Manufacturing', 'Retail'] },
  { slug: 'coimbatore', name: 'Coimbatore', aliases: ['coimbatore'], state: 'Tamil Nadu', intro: 'Engineering, textiles and a maturing software product ecosystem.', sectors: ['Engineering', 'Textiles', 'IT Services', 'Manufacturing'] },
  { slug: 'remote', name: 'Remote', aliases: ['remote', 'work from home', 'anywhere'], state: 'India', intro: 'Fully remote and work-from-home roles open to candidates anywhere in India.', sectors: ['Software', 'Customer Success', 'Content', 'Sales'] },
];

export interface ResourceArticle {
  title: string;
  summary: string;
  href: string;
}

export interface ResourceHub {
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  articles: ResourceArticle[];
}

export const RESOURCE_HUBS: ResourceHub[] = [
  {
    slug: 'career-guides',
    name: 'Career Guides',
    metaTitle: 'Career Guides for Professionals in India | TalentXcel',
    metaDescription: 'Practical career guides: choosing a career path, switching industries, salary benchmarks and planning your next five years.',
    intro: 'Guides for deciding what to do next — choosing between offers, changing industry, moving into management, or restarting after a break.',
    articles: [
      { title: 'Career paths by industry', summary: 'How progression actually works in IT, BFSI, manufacturing and healthcare, level by level.', href: '/industries' },
      { title: 'Salary benchmarks by role', summary: 'What live postings on TalentXcel pay for your role and experience band.', href: '/public/market-insights' },
      { title: 'Build a verified career record', summary: 'Why verified credentials shorten hiring cycles, and how to assemble yours.', href: '/passport' },
    ],
  },
  {
    slug: 'resume-guides',
    name: 'Resume Guides',
    metaTitle: 'Resume Guides & ATS Tips | TalentXcel',
    metaDescription: 'How to write an ATS-friendly resume: structure, keywords, formatting mistakes to avoid and role-specific examples.',
    intro: 'Everything on getting a resume past the parser and in front of a person — structure, keywords, formatting and tailoring.',
    articles: [
      { title: 'ATS-friendly resume structure', summary: 'The section order and formatting rules that keep parsers from dropping your experience.', href: '/public/resume-builder' },
      { title: 'Tailoring a resume to a job description', summary: 'How to mirror the language of a posting without keyword stuffing.', href: '/resume-builder' },
      { title: 'Resume templates', summary: 'Recruiter-tested templates you can fill in and export.', href: '/resume-templates' },
    ],
  },
  {
    slug: 'interview-guides',
    name: 'Interview Guides',
    metaTitle: 'Interview Preparation Guides | TalentXcel',
    metaDescription: 'Prepare for technical, behavioural and HR rounds with structured interview guides and role-specific question banks.',
    intro: 'Round-by-round preparation: screening calls, technical assessments, behavioural interviews, and the final HR and offer conversation.',
    articles: [
      { title: 'Interview prep by role', summary: 'Question banks and evaluation criteria for the role you are targeting.', href: '/public/interview-prep' },
      { title: 'Answering behavioural questions', summary: 'A repeatable structure for situation-based questions that interviewers score against.', href: '/public/interview-prep' },
      { title: 'Negotiating an offer', summary: 'Benchmark your band first, then negotiate on evidence.', href: '/public/market-insights' },
    ],
  },
  {
    slug: 'hiring-guides',
    name: 'Hiring Guides',
    metaTitle: 'Hiring Guides for Employers & Recruiters | TalentXcel',
    metaDescription: 'Guides for hiring teams: writing job descriptions that convert, structured interviews, scorecards and reducing time to fill.',
    intro: 'For hiring managers and talent teams — writing job briefs that attract the right applicants, running structured interviews, and cutting time to fill.',
    articles: [
      { title: 'Writing a job description that converts', summary: 'What to include, what to cut, and how posting language changes applicant quality.', href: '/employers' },
      { title: 'Structured interviews and scorecards', summary: 'Reduce interviewer variance with written criteria agreed before sourcing starts.', href: '/recruitment' },
      { title: 'When to use RPO vs in-house', summary: 'Volume, urgency and cost signals that point to each model.', href: '/rpo' },
    ],
  },
];
