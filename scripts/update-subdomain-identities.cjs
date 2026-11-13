// scripts/update-subdomain-identities.cjs
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'config', 'subdomainIdentities.ts');
let content = fs.readFileSync(filePath, 'utf8');

const newIdentities = `  ca: {
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
    staticHeroHtml: \`
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">CA PracticeOS — Practice Management for Indian CAs</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Automate statutory due-date monitoring, advance tax estimations, and client filings.</p>
      </section>
    \`
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
    staticHeroHtml: \`
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">Legal PracticeOS — Intelligence for Indian Advocates</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Access Indian bare acts, generate airtight legal drafts, and manage court hearings.</p>
      </section>
    \`
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
    staticHeroHtml: \`
      <section class="tx-subdomain-hero" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2e8f0;">
        <h1 style="font-size:2.25rem;font-weight:800;color:#f8fafc;margin-bottom:12px;line-height:1.2;">Professional ServicesOS — Verified Advisory Network</h1>
        <p style="font-size:1.1rem;color:#94a3b8;margin-bottom:24px;line-height:1.6;">Connect with verified Chartered Accountants, Legal Counsels, and Fractional Executives.</p>
      </section>
    \`
  },
`;

// Insert before the closing `};` of SUBDOMAIN_IDENTITIES
content = content.replace(/\n\s*staticHeroHtml: `[\s\S]*?`,\s*\n\s*},\s*\n\s*};/, (match) => {
  return match.replace(/};\s*$/, newIdentities + '};\n');
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated subdomainIdentities.ts with ca, legal, and services');
