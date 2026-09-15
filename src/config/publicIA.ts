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
  globalScope = false,
): IndustryHub => ({
  slug,
  name,
  metaTitle: globalScope
    ? `${name} Careers, Jobs & Hiring Guide | TalentXcel`
    : `${name} Jobs & Hiring in India | TalentXcel`,
  metaDescription: globalScope
    ? `Career guidance, in-demand roles, skills, and hiring trends for the ${name.toLowerCase()} industry worldwide.`
    : `Live ${name.toLowerCase()} jobs across India, in-demand roles and hiring support for ${name.toLowerCase()} employers — on TalentXcel.`,
  intro,
  keywords,
  roles,
});

export const INDUSTRY_HUBS: IndustryHub[] = [
  // ── Core Technology ──────────────────────────────────────────────────────
  industry('it', 'Information Technology', 'Software product and services hiring across India and globally, from platform engineering to enterprise IT support.', ['software', 'developer', 'engineer', 'devops', 'full stack', 'java', 'python'], ['Software Engineer', 'Full Stack Developer', 'DevOps Engineer', 'QA Engineer', 'Engineering Manager']),
  industry('artificial-intelligence', 'Artificial Intelligence & Machine Learning', 'AI/ML research, applied AI engineering, data science, NLP, and AI product development.', ['ai', 'machine learning', 'data science', 'nlp', 'deep learning', 'llm'], ['AI Engineer', 'Machine Learning Engineer', 'Data Scientist', 'NLP Engineer', 'AI Research Scientist'], true),
  industry('data-analytics', 'Data & Analytics', 'Data engineering, business intelligence, analytics, and data governance roles.', ['data analyst', 'bi', 'analytics', 'sql', 'power bi', 'tableau'], ['Data Analyst', 'Data Engineer', 'BI Developer', 'Analytics Manager', 'Data Architect'], true),
  industry('cybersecurity', 'Cybersecurity & Information Security', 'Network security, application security, SOC operations, and compliance roles.', ['cybersecurity', 'security analyst', 'infosec', 'penetration testing', 'siem'], ['Security Analyst', 'Penetration Tester', 'SOC Analyst', 'CISO', 'Cybersecurity Architect'], true),
  industry('cloud-computing', 'Cloud Computing & DevOps', 'Cloud infrastructure, platform engineering, site reliability, and DevOps roles across AWS, Azure, and GCP.', ['cloud', 'aws', 'azure', 'gcp', 'devops', 'kubernetes', 'terraform'], ['Cloud Architect', 'DevOps Engineer', 'Site Reliability Engineer', 'Platform Engineer', 'Cloud Solutions Architect'], true),
  industry('it-services', 'IT Services & Consulting', 'Global capability centres, consulting firms and system integrators.', ['consultant', 'sap', 'salesforce', 'implementation', 'support engineer'], ['Technology Consultant', 'SAP Consultant', 'Salesforce Developer', 'Delivery Manager', 'Support Engineer']),
  // ── Finance & Business ───────────────────────────────────────────────────
  industry('banking', 'Banking & Financial Services', 'Retail and corporate banking, NBFCs, insurance, and capital markets.', ['bank', 'finance', 'credit', 'audit', 'accounts', 'insurance'], ['Relationship Manager', 'Credit Analyst', 'Risk Analyst', 'Branch Manager', 'Financial Analyst']),
  industry('fintech', 'Fintech & Digital Finance', 'Digital payments, lending, insurtech, wealthtech, and blockchain finance.', ['fintech', 'payments', 'blockchain', 'digital lending', 'insurtech', 'wealthtech'], ['Fintech Product Manager', 'Blockchain Developer', 'Digital Payments Engineer', 'Compliance Manager', 'Risk Analyst'], true),
  industry('accounting-finance', 'Accounting & Taxation', 'Corporate finance, audit, taxation, statutory compliance, and financial reporting.', ['accountant', 'ca', 'cpa', 'tax', 'audit', 'finance manager'], ['Chartered Accountant', 'Financial Controller', 'Tax Consultant', 'Audit Manager', 'CFO']),
  // ── Healthcare & Life Sciences ──────────────────────────────────────────
  industry('healthcare', 'Healthcare & Hospitals', 'Hospitals, diagnostics, medical devices, and health-tech roles.', ['nurse', 'medical', 'healthcare', 'clinical', 'hospital', 'pharma'], ['Staff Nurse', 'Clinical Research Associate', 'Medical Coder', 'Hospital Administrator', 'Pharmacist']),
  industry('pharma', 'Pharmaceuticals & Life Sciences', 'Drug discovery, manufacturing, regulatory affairs, and clinical operations.', ['pharma', 'regulatory', 'clinical', 'formulation', 'qa qc'], ['Regulatory Affairs Executive', 'Formulation Scientist', 'QA Officer', 'Medical Representative', 'Clinical Data Manager']),
  industry('healthtech', 'Health Technology', 'Digital health platforms, telemedicine, hospital IT, and medical devices.', ['healthtech', 'telemedicine', 'health it', 'medical devices', 'digital health'], ['Health IT Specialist', 'Medical Device Engineer', 'Healthcare Data Analyst', 'Telemedicine Manager'], true),
  // ── Manufacturing & Engineering ─────────────────────────────────────────
  industry('manufacturing', 'Manufacturing', 'Plant operations, quality, maintenance and supply chain roles.', ['production', 'manufacturing', 'plant', 'quality', 'maintenance', 'mechanical'], ['Production Engineer', 'Quality Engineer', 'Maintenance Engineer', 'Plant Manager', 'CNC Programmer']),
  industry('automotive', 'Automotive & Electric Vehicles', 'Vehicle engineering, EV development, manufacturing, and automotive software.', ['automotive', 'ev', 'electric vehicle', 'mechanical', 'powertrain', 'adas'], ['Automotive Engineer', 'EV Engineer', 'Vehicle Dynamics Engineer', 'Embedded Systems Engineer', 'Manufacturing Engineer'], true),
  industry('aerospace-defense', 'Aerospace & Defence', 'Aircraft engineering, defence systems, avionics, and aerospace manufacturing.', ['aerospace', 'defence', 'avionics', 'aircraft', 'systems engineer'], ['Aerospace Engineer', 'Avionics Engineer', 'Systems Engineer', 'Defence Analyst', 'Project Manager']),
  // ── People, HR & Staffing ────────────────────────────────────────────────
  industry('human-resources', 'Human Resources & Talent', 'HR management, talent acquisition, L&D, HRIS, and people operations.', ['hr', 'human resources', 'talent acquisition', 'recruiter', 'payroll'], ['HR Manager', 'Talent Acquisition Manager', 'HR Business Partner', 'L&D Manager', 'CHRO']),
  industry('staffing-recruitment', 'Staffing & Recruitment', 'Staffing agencies, recruitment firms, RPO, and workforce solutions.', ['staffing', 'recruitment', 'rpo', 'placement', 'headhunting'], ['Staffing Manager', 'Recruiter', 'RPO Lead', 'Talent Acquisition Specialist', 'Placement Consultant']),
  // ── Consumer & Retail ────────────────────────────────────────────────────
  industry('retail-ecommerce', 'Retail & E-commerce', 'Store operations, category management, marketplace, and last-mile roles.', ['retail', 'store', 'category', 'ecommerce', 'merchandis'], ['Store Manager', 'Category Manager', 'Merchandiser', 'Operations Executive', 'Buyer']),
  industry('fmcg', 'FMCG & Consumer Goods', 'Sales, marketing, supply chain, and operations for fast-moving consumer goods.', ['fmcg', 'consumer goods', 'sales', 'trade marketing', 'distribution'], ['Area Sales Manager', 'Trade Marketing Executive', 'Supply Chain Manager', 'Brand Manager', 'Key Account Manager']),
  industry('food-beverage', 'Food & Beverage', 'QSR, food manufacturing, F&B operations, and food technology.', ['food', 'beverage', 'qsr', 'restaurant', 'chef', 'hospitality'], ['Restaurant Manager', 'Chef', 'Food Technologist', 'QC Manager', 'F&B Manager']),
  // ── Infrastructure & Energy ──────────────────────────────────────────────
  industry('construction', 'Construction & Real Estate', 'Infrastructure, residential and commercial development.', ['civil', 'construction', 'site engineer', 'architect', 'real estate'], ['Site Engineer', 'Project Manager', 'Quantity Surveyor', 'Architect', 'Safety Officer']),
  industry('energy', 'Energy & Utilities', 'Power generation, renewables, oil and gas, and utility operations.', ['electrical', 'power', 'solar', 'energy', 'utility'], ['Electrical Engineer', 'Solar Project Engineer', 'Plant Operator', 'EHS Manager', 'Energy Analyst']),
  industry('renewables', 'Renewable Energy & Cleantech', 'Solar, wind, green hydrogen, energy storage, and sustainability roles.', ['renewable', 'solar', 'wind', 'green energy', 'sustainability', 'esg'], ['Solar Project Engineer', 'Wind Energy Engineer', 'ESG Manager', 'Sustainability Consultant', 'Energy Analyst'], true),
  // ── Logistics & Supply Chain ─────────────────────────────────────────────
  industry('logistics', 'Logistics & Supply Chain', 'Warehousing, transportation, freight forwarding and last-mile delivery.', ['logistics', 'supply chain', 'warehouse', 'procurement', 'dispatch'], ['Supply Chain Analyst', 'Warehouse Manager', 'Procurement Executive', 'Logistics Coordinator', 'Fleet Manager']),
  // ── Telecom & Media ──────────────────────────────────────────────────────
  industry('telecom', 'Telecommunications', 'Network rollout, operations, and enterprise telecom sales.', ['telecom', 'network engineer', 'rf', '5g', 'bss'], ['Network Engineer', 'RF Engineer', 'NOC Engineer', 'Enterprise Sales Manager', 'Field Technician']),
  industry('media', 'Media & Entertainment', 'Broadcast, digital publishing, gaming, content, and creative production.', ['content', 'media', 'video', 'editor', 'creative', 'design'], ['Content Writer', 'Video Editor', 'Graphic Designer', 'Social Media Manager', 'Producer']),
  industry('gaming', 'Gaming & Interactive Media', 'Game development, esports, AR/VR, and interactive entertainment.', ['game developer', 'unity', 'unreal', 'gaming', 'vr', 'ar'], ['Game Developer', 'Unity Developer', 'Game Designer', 'Technical Artist', 'QA Engineer'], true),
  // ── Professional Services ────────────────────────────────────────────────
  industry('professional-services', 'Professional Services', 'Audit, tax, legal, HR and management consulting practices.', ['audit', 'tax', 'legal', 'consulting', 'human resources'], ['Audit Associate', 'Tax Consultant', 'Legal Counsel', 'HR Business Partner', 'Management Consultant']),
  industry('legal-compliance', 'Legal & Compliance', 'Corporate law, compliance management, intellectual property, and regulatory affairs.', ['legal', 'lawyer', 'compliance', 'contract', 'regulatory'], ['Legal Counsel', 'Compliance Officer', 'Contract Manager', 'Company Secretary', 'Regulatory Manager']),
  // ── Travel, Hospitality & Tourism ───────────────────────────────────────
  industry('hospitality', 'Hospitality & Travel', 'Hotels, restaurants, aviation and travel technology.', ['hospitality', 'hotel', 'chef', 'travel', 'guest'], ['Front Office Executive', 'Chef', 'Guest Relations Manager', 'Travel Consultant', 'F&B Manager']),
  // ── Education ────────────────────────────────────────────────────────────
  industry('education', 'Education & EdTech', 'Schools, universities, training providers and edtech platforms.', ['teacher', 'faculty', 'trainer', 'academic', 'education', 'counsellor'], ['Academic Counsellor', 'Subject Matter Expert', 'Faculty', 'Instructional Designer', 'Training Manager']),
  // ── Marketing & Growth ───────────────────────────────────────────────────
  industry('marketing', 'Marketing & Growth', 'Digital marketing, brand management, performance marketing, and growth.', ['marketing', 'digital marketing', 'brand', 'performance', 'growth', 'seo'], ['Digital Marketing Manager', 'SEO Specialist', 'Brand Manager', 'Performance Marketing Manager', 'Growth Hacker'], true),
  // ── Sales ────────────────────────────────────────────────────────────────
  industry('sales', 'Sales & Business Development', 'B2B and B2C sales, account management, and business development.', ['sales', 'account manager', 'business development', 'bd', 'crm'], ['Sales Manager', 'Account Manager', 'Business Development Manager', 'Sales Engineer', 'Regional Sales Manager']),
  // ── Government & Public Sector ───────────────────────────────────────────
  industry('government', 'Government & Public Sector', 'Public administration, policy, civil services, and government technology.', ['government', 'ias', 'civil services', 'public sector', 'policy', 'psu'], ['IAS Officer', 'Policy Analyst', 'Government Project Manager', 'PSU Engineer', 'Public Administrator']),
  // ── NGO & Nonprofit ──────────────────────────────────────────────────────
  industry('nonprofit', 'NGO & Social Impact', 'Development sector, social enterprises, international development, and CSR.', ['ngo', 'nonprofit', 'social impact', 'development', 'csr', 'sustainability'], ['Program Manager', 'Development Officer', 'CSR Manager', 'Social Researcher', 'Community Manager'], true),
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
  // ── India ────────────────────────────────────────────────────────────────
  { slug: 'india', name: 'India', aliases: [], state: 'India', intro: 'India is one of the world\'s largest and fastest-growing talent markets. With a technology sector anchored in Bangalore, a financial hub in Mumbai, and major enterprise hubs in Delhi NCR, Hyderabad, Pune and Chennai, India offers careers across every industry at every level.', sectors: ['Information Technology', 'Banking & Financial Services', 'Manufacturing', 'Healthcare', 'Consulting'] },
  { slug: 'delhi-ncr', name: 'Delhi NCR', aliases: ['delhi', 'noida', 'gurgaon', 'gurugram', 'ghaziabad', 'faridabad', 'ncr'], state: 'Delhi NCR', intro: 'Delhi NCR — spanning Delhi, Noida, Gurugram, Ghaziabad and Faridabad — is India\'s largest market for consulting, enterprise services, government, and startup hiring. Gurugram is home to the BFSI and IT services corridor, while Noida hosts major technology and BPO operations.', sectors: ['IT Services', 'Consulting', 'E-commerce', 'BFSI', 'Government'] },
  { slug: 'bangalore', name: 'Bangalore', aliases: ['bangalore', 'bengaluru'], state: 'Karnataka', intro: 'Bangalore (Bengaluru) is India\'s technology capital and a global hub for software product engineering, AI/ML, deep tech, and global capability centres. The city hosts thousands of technology companies from startups to Fortune 500 GCCs, making it the most competitive and rewarding market for software and data professionals.', sectors: ['Software Products', 'Global Capability Centres', 'Deep Tech', 'AI/ML', 'Startups'] },
  { slug: 'hyderabad', name: 'Hyderabad', aliases: ['hyderabad', 'secunderabad'], state: 'Telangana', intro: 'Hyderabad has emerged as India\'s second major technology hub, anchored by HITEC City and Genome Valley. Enterprise technology, pharmaceuticals, life sciences, and BPM are the dominant employers. Major global technology companies have established large engineering and operations centres in the city.', sectors: ['Enterprise Tech', 'Pharmaceuticals', 'BPM', 'Life Sciences', 'Cloud & Data'] },
  { slug: 'pune', name: 'Pune', aliases: ['pune', 'pimpri', 'chinchwad'], state: 'Maharashtra', intro: 'Pune combines a large automotive and manufacturing base with a substantial IT services and engineering R&D cluster. Pimpri-Chinchwad hosts major automotive manufacturers, while the Hinjewadi IT Park is home to hundreds of technology companies. Engineering, manufacturing, and technology professionals find strong career ecosystems here.', sectors: ['Automotive', 'IT Services', 'Manufacturing', 'Engineering R&D', 'Defence'] },
  { slug: 'mumbai', name: 'Mumbai', aliases: ['mumbai', 'navi mumbai', 'thane', 'bombay'], state: 'Maharashtra', intro: 'Mumbai is India\'s financial capital and home to the Bombay Stock Exchange, the Reserve Bank of India, and the headquarters of major BFSI institutions. Beyond finance, Mumbai hosts India\'s media, advertising, entertainment, and logistics industries. Navi Mumbai is a growing hub for IT services, pharma, and logistics.', sectors: ['BFSI', 'Media', 'Advertising', 'Logistics', 'Pharmaceuticals'] },
  { slug: 'chennai', name: 'Chennai', aliases: ['chennai', 'madras'], state: 'Tamil Nadu', intro: 'Chennai is a major centre for automotive manufacturing (home to the Indian operations of leading global auto brands), electronics, and a mature IT services corridor along the Old Mahabalipuram Road (OMR). The healthcare sector is also strong, anchored by large hospital groups and medical device companies.', sectors: ['Automotive', 'IT Services', 'Electronics', 'Healthcare', 'Logistics'] },
  { slug: 'kolkata', name: 'Kolkata', aliases: ['kolkata', 'calcutta', 'howrah'], state: 'West Bengal', intro: 'Kolkata is eastern India\'s commercial hub with growing IT services, BFSI operations, manufacturing, and retail sectors. Major technology parks in Salt Lake City and New Town house IT service companies, and the city is seeing increased investment in fintech and logistics.', sectors: ['IT Services', 'BFSI Operations', 'Manufacturing', 'Retail', 'Logistics'] },
  { slug: 'ahmedabad', name: 'Ahmedabad', aliases: ['ahmedabad', 'gandhinagar'], state: 'Gujarat', intro: 'Ahmedabad and Gandhinagar form Gujarat\'s commercial and government corridor. The city is strong in pharmaceuticals, chemicals, textiles, and the emerging GIFT City financial hub. Ahmedabad\'s manufacturing base and proximity to Surat and Rajkot make it a significant industrial employment market.', sectors: ['Pharmaceuticals', 'Chemicals', 'Textiles', 'Finance', 'Manufacturing'] },
  { slug: 'chandigarh', name: 'Chandigarh', aliases: ['chandigarh', 'mohali', 'panchkula'], state: 'Punjab & Haryana', intro: 'The Chandigarh tricity — Chandigarh, Mohali, and Panchkula — is a growing IT and services hub serving North India. Mohali hosts IT parks with major technology companies. The region is strong in education, healthcare, government, and BPM.', sectors: ['IT Services', 'Education', 'Healthcare', 'BPM', 'Government'] },
  { slug: 'jaipur', name: 'Jaipur', aliases: ['jaipur'], state: 'Rajasthan', intro: 'Jaipur is a growing market for IT services, BPM, tourism, and education. Several national and international technology companies have established operations in Jaipur, and the city is emerging as an alternative IT destination for Delhi NCR-adjacent talent.', sectors: ['IT Services', 'BPM', 'Tourism', 'Education', 'Retail'] },
  { slug: 'kochi', name: 'Kochi', aliases: ['kochi', 'cochin', 'ernakulam'], state: 'Kerala', intro: 'Kochi is Kerala\'s technology and logistics gateway. Infopark and Cochin Special Economic Zone host major IT companies, while the port economy drives logistics and trade. Kerala\'s high literacy and English proficiency make Kochi competitive for knowledge economy roles.', sectors: ['IT Services', 'Logistics', 'Healthcare', 'Tourism', 'Finance'] },
  { slug: 'indore', name: 'Indore', aliases: ['indore'], state: 'Madhya Pradesh', intro: 'Indore is central India\'s fastest-growing commercial city, with expanding IT services, pharmaceuticals, and manufacturing employers. Major IT parks and a growing startup ecosystem are making Indore increasingly visible to technology and business services employers.', sectors: ['IT Services', 'Pharmaceuticals', 'Manufacturing', 'Retail', 'Logistics'] },
  { slug: 'coimbatore', name: 'Coimbatore', aliases: ['coimbatore'], state: 'Tamil Nadu', intro: 'Coimbatore is a major industrial city known for engineering, textiles, and a maturing software product ecosystem. The TIDEL Park and nearby technology hubs are attracting IT companies, while engineering and manufacturing remain the dominant employment sectors.', sectors: ['Engineering', 'Textiles', 'IT Services', 'Manufacturing', 'Healthcare'] },
  { slug: 'nagpur', name: 'Nagpur', aliases: ['nagpur'], state: 'Maharashtra', intro: 'Nagpur is central India\'s commercial hub and a growing centre for logistics, government, healthcare, and IT services. Its position at the geographic centre of India and improving infrastructure make it an emerging employment market.', sectors: ['Logistics', 'Government', 'Healthcare', 'IT Services', 'Manufacturing'] },
  { slug: 'lucknow', name: 'Lucknow', aliases: ['lucknow'], state: 'Uttar Pradesh', intro: 'Lucknow is Uttar Pradesh\'s capital and a growing hub for government, IT services, healthcare, education, and BFSI. The city is seeing increased investment in IT parks and fintech, and is an important market for professionals serving North Indian state-level organisations.', sectors: ['Government', 'IT Services', 'Healthcare', 'Education', 'BFSI'] },
  { slug: 'visakhapatnam', name: 'Visakhapatnam', aliases: ['visakhapatnam', 'vizag'], state: 'Andhra Pradesh', intro: 'Visakhapatnam (Vizag) is a port city with strengths in steel, oil & gas, pharmaceuticals, and IT services. The planned greenfield capital nearby and port-driven economic activity are generating employment across multiple sectors.', sectors: ['Steel & Mining', 'Oil & Gas', 'Pharmaceuticals', 'IT Services', 'Port & Logistics'] },
  { slug: 'remote', name: 'Remote India', aliases: ['remote', 'work from home', 'anywhere', 'pan india'], state: 'India', intro: 'Fully remote and work-from-home roles open to candidates anywhere in India. Remote-first companies, technology roles, content, customer success, and sales roles are commonly available to candidates across all Indian cities and towns.', sectors: ['Software', 'Customer Success', 'Content', 'Sales', 'Consulting'] },
  // ── USA ──────────────────────────────────────────────────────────────────
  { slug: 'new-york-usa', name: 'New York', aliases: ['new york', 'nyc', 'manhattan', 'brooklyn'], state: 'New York, USA', intro: 'New York City is the world\'s financial capital and a global hub for finance, media, advertising, fashion, and technology. The city\'s diverse talent market spans Wall Street financial institutions to major technology companies, media giants, and a large startup ecosystem.', sectors: ['Finance & Banking', 'Technology', 'Media', 'Advertising', 'Consulting'] },
  { slug: 'san-francisco-usa', name: 'San Francisco Bay Area', aliases: ['san francisco', 'silicon valley', 'bay area', 'san jose', 'palo alto'], state: 'California, USA', intro: 'The San Francisco Bay Area and Silicon Valley are the global epicentre of technology innovation, venture capital, and startup culture. Home to the world\'s largest technology companies and thousands of startups, the Bay Area offers unparalleled career opportunities for software engineers, product managers, data scientists, and AI/ML professionals.', sectors: ['Software Products', 'AI & Machine Learning', 'Venture Capital', 'Semiconductors', 'Biotech'] },
  { slug: 'seattle-usa', name: 'Seattle', aliases: ['seattle', 'bellevue', 'redmond'], state: 'Washington, USA', intro: 'Seattle is home to Amazon, Microsoft, and a thriving cloud computing and technology ecosystem. The city\'s aerospace heritage (Boeing) and strong technology talent pool make it a major destination for software engineers, cloud architects, and product managers.', sectors: ['Cloud Computing', 'E-commerce Technology', 'Aerospace', 'Biotech', 'Gaming'] },
  { slug: 'austin-usa', name: 'Austin', aliases: ['austin', 'round rock'], state: 'Texas, USA', intro: 'Austin has emerged as a major technology and startup hub, attracting companies from California and globally. Tesla, Apple, Dell, and hundreds of technology companies have significant Austin operations. The city\'s lower cost of living compared to coastal cities makes it attractive for technology professionals.', sectors: ['Technology', 'Semiconductors', 'Electric Vehicles', 'Healthcare', 'Government'] },
  { slug: 'chicago-usa', name: 'Chicago', aliases: ['chicago'], state: 'Illinois, USA', intro: 'Chicago is a major centre for finance, consulting, healthcare, manufacturing, and technology. Home to major financial exchanges, consulting firms, and a growing technology sector, Chicago offers diverse career opportunities across industries including fintech, healthtech, and enterprise software.', sectors: ['Finance', 'Consulting', 'Healthcare', 'Manufacturing', 'Technology'] },
  { slug: 'boston-usa', name: 'Boston', aliases: ['boston', 'cambridge', 'massachusetts'], state: 'Massachusetts, USA', intro: 'Boston is the world\'s premier life sciences and biotech cluster, anchored by MIT, Harvard, and hundreds of pharmaceutical and biotech companies. The city is also strong in healthtech, edtech, consulting, and financial services.', sectors: ['Life Sciences', 'Biotech', 'Healthcare', 'Education', 'Consulting'] },
  // ── United Kingdom ───────────────────────────────────────────────────────
  { slug: 'london-uk', name: 'London', aliases: ['london', 'greater london', 'city of london', 'canary wharf'], state: 'England, UK', intro: 'London is Europe\'s leading global financial centre and a major hub for fintech, media, consulting, technology, and professional services. The city hosts the headquarters of major global banks, asset managers, insurance companies, and a vibrant technology ecosystem in areas like Tech City (Shoreditch) and the City of London.', sectors: ['Finance & Banking', 'Fintech', 'Technology', 'Consulting', 'Media'] },
  { slug: 'manchester-uk', name: 'Manchester', aliases: ['manchester', 'salford', 'greater manchester'], state: 'England, UK', intro: 'Manchester is the UK\'s second-largest city by economic output and a growing technology and digital hub outside London. Strong in digital media, healthcare, education, manufacturing, and logistics, Manchester is also home to a vibrant startup and fintech community.', sectors: ['Technology', 'Digital Media', 'Healthcare', 'Education', 'Manufacturing'] },
  { slug: 'edinburgh-uk', name: 'Edinburgh', aliases: ['edinburgh', 'scotland'], state: 'Scotland, UK', intro: 'Edinburgh is Scotland\'s capital and a major financial services, technology, and life sciences hub. The city\'s financial sector is second only to London in the UK, and its technology and fintech ecosystems are growing rapidly.', sectors: ['Financial Services', 'Technology', 'Life Sciences', 'Government', 'Tourism'] },
  // ── Canada ───────────────────────────────────────────────────────────────
  { slug: 'toronto-canada', name: 'Toronto', aliases: ['toronto', 'greater toronto area', 'gta', 'mississauga', 'brampton'], state: 'Ontario, Canada', intro: 'Toronto is Canada\'s financial and technology capital. The city hosts the Toronto Stock Exchange, major banks, and a thriving technology and AI ecosystem. Toronto is a major destination for skilled immigrants seeking careers in technology, finance, consulting, and healthcare.', sectors: ['Finance', 'Technology', 'AI & Machine Learning', 'Healthcare', 'Consulting'] },
  { slug: 'vancouver-canada', name: 'Vancouver', aliases: ['vancouver', 'british columbia', 'bc', 'burnaby', 'surrey'], state: 'British Columbia, Canada', intro: 'Vancouver is a major technology hub on Canada\'s West Coast, with strong connections to the Silicon Valley technology ecosystem. Film and entertainment, mining, and clean technology complement the growing software engineering and gaming industries.', sectors: ['Technology', 'Film & Media', 'Clean Technology', 'Mining', 'Healthcare'] },
  // ── Australia ────────────────────────────────────────────────────────────
  { slug: 'sydney-australia', name: 'Sydney', aliases: ['sydney', 'new south wales', 'nsw'], state: 'New South Wales, Australia', intro: 'Sydney is Australia\'s largest city and the primary hub for finance, technology, consulting, and media. Major banks, technology companies, and consulting firms are headquartered in Sydney, and the city hosts a growing fintech and startup ecosystem.', sectors: ['Finance', 'Technology', 'Consulting', 'Media', 'Healthcare'] },
  { slug: 'melbourne-australia', name: 'Melbourne', aliases: ['melbourne', 'victoria', 'vic'], state: 'Victoria, Australia', intro: 'Melbourne is Australia\'s cultural and education capital and a major hub for technology, healthcare, manufacturing, and professional services. The city is known for a strong startup ecosystem, a large healthcare and life sciences sector, and significant manufacturing operations.', sectors: ['Technology', 'Healthcare', 'Education', 'Manufacturing', 'Professional Services'] },
  // ── UAE ──────────────────────────────────────────────────────────────────
  { slug: 'dubai-uae', name: 'Dubai', aliases: ['dubai', 'uae', 'united arab emirates', 'sharjah', 'abu dhabi'], state: 'Dubai, UAE', intro: 'Dubai is the Middle East\'s commercial capital and a global hub for finance, real estate, logistics, technology, and hospitality. The city\'s strategic location and tax-free environment attract professionals from South Asia, Europe, and beyond. Technology, fintech, and real estate are the fastest-growing employment sectors.', sectors: ['Finance', 'Real Estate', 'Technology', 'Logistics', 'Hospitality'] },
  { slug: 'abu-dhabi-uae', name: 'Abu Dhabi', aliases: ['abu dhabi'], state: 'Abu Dhabi, UAE', intro: 'Abu Dhabi is the UAE\'s capital and a major centre for government, oil & gas, finance, and sovereign wealth fund-related activities. The city is investing heavily in technology, renewables, and diversified economic development through initiatives like ADGM and Masdar City.', sectors: ['Oil & Gas', 'Government', 'Finance', 'Renewables', 'Technology'] },
  // ── Singapore ────────────────────────────────────────────────────────────
  { slug: 'singapore', name: 'Singapore', aliases: ['singapore'], state: 'Singapore', intro: 'Singapore is Southeast Asia\'s financial hub and a major global centre for technology, fintech, logistics, and professional services. Its strategic location, stable regulatory environment, and highly skilled multilingual workforce make it a leading destination for professionals from South and Southeast Asia.', sectors: ['Finance & Banking', 'Technology', 'Logistics', 'Fintech', 'Consulting'] },
  // ── Germany ──────────────────────────────────────────────────────────────
  { slug: 'berlin-germany', name: 'Berlin', aliases: ['berlin', 'germany'], state: 'Berlin, Germany', intro: 'Berlin is Europe\'s startup capital and a major technology and creative hub. The city\'s large technology ecosystem spans fintech, e-commerce, SaaS, media, and deep tech. Lower costs compared to other European capitals attract both companies and talent from across Europe and globally.', sectors: ['Technology', 'Fintech', 'E-commerce', 'Media', 'Creative'] },
  { slug: 'munich-germany', name: 'Munich', aliases: ['munich', 'münchen', 'bavaria'], state: 'Bavaria, Germany', intro: 'Munich is Germany\'s economic powerhouse and home to BMW, Siemens, Allianz, and MAN. The city is strong in automotive, engineering, insurance, technology, and aerospace. Munich hosts a growing technology and AI ecosystem alongside its traditional industrial base.', sectors: ['Automotive', 'Engineering', 'Technology', 'Insurance', 'Aerospace'] },
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
