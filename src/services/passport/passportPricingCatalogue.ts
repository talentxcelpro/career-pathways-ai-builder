// src/services/passport/passportPricingCatalogue.ts
// TalentXcel Career Passport Commercial Model & Verification Entitlement Catalogue
// Free-to-Create, Pay-to-Upgrade Lifetime Model (No recurring subscription)

export type PassportEditionId = 'basic' | 'essential' | 'professional' | 'elite';

export interface PassportEdition {
  id: PassportEditionId;
  name: string;
  tagline: string;
  priceINR: number;
  priceFormatted: string;
  paymentType: 'Free forever' | 'one-time payment';
  popular?: boolean;
  badge?: string;
  description: string;
  verificationRequests: number; // Included credential verification requests
  employmentVerificationIncluded: boolean;
  skillsVerificationType: 'Self-declared' | 'Requests';
  verificationHistoryLevel: 'Basic' | 'Yes' | 'Advanced';
  qrVerificationChecks: 'Free'; // Free forever for anyone scanning
  qrIdentitySharing: true;
  features: string[];
  ctaLabel: string;
  ctaAction: 'register' | 'upgrade';
}

export const CAREER_PASSPORT_EDITIONS: Record<PassportEditionId, PassportEdition> = {
  basic: {
    id: 'basic',
    name: 'Career Passport Basic',
    tagline: 'Start building your identity',
    priceINR: 0,
    priceFormatted: '₹0',
    paymentType: 'Free forever',
    description: 'Create your verifiable career profile, upload credentials, and share your basic QR card.',
    verificationRequests: 0,
    employmentVerificationIncluded: false,
    skillsVerificationType: 'Self-declared',
    verificationHistoryLevel: 'Basic',
    qrVerificationChecks: 'Free',
    qrIdentitySharing: true,
    features: [
      'Create professional identity',
      'Basic career profile',
      'Add skills, education and experience',
      'Public passport URL (talentxcel.in/@yourname)',
      'Basic QR code sharing',
      'Upload certificates and documents',
      'Receive job and career recommendations',
      'Basic profile visibility'
    ],
    ctaLabel: 'Create Free Passport',
    ctaAction: 'register'
  },

  essential: {
    id: 'essential',
    name: 'Career Passport Essential',
    tagline: 'For growing professionals',
    priceINR: 399,
    priceFormatted: '₹399',
    paymentType: 'one-time payment',
    description: 'Lifetime professional presentation with downloadable vCard, PDF, and 2 verified credentials.',
    verificationRequests: 2,
    employmentVerificationIncluded: false,
    skillsVerificationType: 'Requests',
    verificationHistoryLevel: 'Yes',
    qrVerificationChecks: 'Free',
    qrIdentitySharing: true,
    features: [
      'Everything in Basic, plus:',
      'Premium digital passport design',
      'Downloadable professional vCard',
      'Downloadable passport PDF',
      'Enhanced QR verification page',
      'Up to 2 credential verification requests',
      'Professional career timeline',
      'Privacy and sharing controls'
    ],
    ctaLabel: 'Upgrade to Essential',
    ctaAction: 'upgrade'
  },

  professional: {
    id: 'professional',
    name: 'Career Passport Professional',
    tagline: 'For serious career growth',
    priceINR: 699,
    priceFormatted: '₹699',
    paymentType: 'one-time payment',
    popular: true,
    badge: 'MOST POPULAR',
    description: 'Comprehensive verified identity with employment validation, 5 credential checks, and analytics.',
    verificationRequests: 5,
    employmentVerificationIncluded: true,
    skillsVerificationType: 'Requests',
    verificationHistoryLevel: 'Advanced',
    qrVerificationChecks: 'Free',
    qrIdentitySharing: true,
    features: [
      'Everything in Essential, plus:',
      'Premium shareable digital passport',
      'Up to 5 credential verification requests',
      'Verified skills and competency portfolio',
      'Employment and experience verification requests',
      'Projects and achievements portfolio',
      'Advanced professional profile analytics',
      'Priority verification processing'
    ],
    ctaLabel: 'Upgrade to Professional',
    ctaAction: 'upgrade'
  },

  elite: {
    id: 'elite',
    name: 'Career Passport Elite',
    tagline: 'For established professionals',
    priceINR: 999,
    priceFormatted: '₹999',
    paymentType: 'one-time payment',
    badge: 'EXECUTIVE TIER',
    description: 'The highest standard of verifiable executive authority with 10 checks, career intelligence, and priority support.',
    verificationRequests: 10,
    employmentVerificationIncluded: true,
    skillsVerificationType: 'Requests',
    verificationHistoryLevel: 'Advanced',
    qrVerificationChecks: 'Free',
    qrIdentitySharing: true,
    features: [
      'Everything in Professional, plus:',
      'Up to 10 credential verification requests',
      'Advanced professional portfolio',
      'Multiple project and achievement showcases',
      'Enhanced passport presentation',
      'Detailed career intelligence report',
      'Advanced visibility and sharing controls',
      'Priority support'
    ],
    ctaLabel: 'Upgrade to Elite',
    ctaAction: 'upgrade'
  }
};

export interface VerificationPolicyRow {
  featureName: string;
  description: string;
  basic: string;
  essential: string;
  professional: string;
  elite: string;
}

export const VERIFICATION_ENTITLEMENT_MATRIX: VerificationPolicyRow[] = [
  {
    featureName: 'QR Identity Sharing',
    description: 'Share your personal tamper-evident QR code',
    basic: 'Yes',
    essential: 'Yes',
    professional: 'Yes',
    elite: 'Yes'
  },
  {
    featureName: 'QR Verification Checks',
    description: 'Public scan & authenticity check by anyone',
    basic: 'Free forever',
    essential: 'Free forever',
    professional: 'Free forever',
    elite: 'Free forever'
  },
  {
    featureName: 'Credential Verification Requests',
    description: 'Submit certificates/degrees for independent verification',
    basic: '—',
    essential: '2 Requests',
    professional: '5 Requests',
    elite: '10 Requests'
  },
  {
    featureName: 'Employment Verification Requests',
    description: 'Independent HR / employer tenure verification',
    basic: '—',
    essential: '—',
    professional: 'Included',
    elite: 'Included'
  },
  {
    featureName: 'Skills Verification',
    description: 'Validating technical or business competency',
    basic: 'Self-declared',
    essential: 'Requests',
    professional: 'Requests',
    elite: 'Requests'
  },
  {
    featureName: 'Verification Status & Audit History',
    description: 'Tamper-evident verification audit trail',
    basic: 'Basic',
    essential: 'Yes',
    professional: 'Advanced',
    elite: 'Advanced'
  }
];

export const VERIFICATION_STATUS_TIERS = [
  {
    status: 'Self-declared',
    color: 'slate',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    title: 'Self-Declared Record',
    description: 'Candidate uploaded details or certificates. Awaiting submission or issuer confirmation. Clearly marked as unverified for 100% marketplace trust.'
  },
  {
    status: 'Pending verification',
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
    title: 'Evidence Submitted / Pending Verification',
    description: 'Evidence and institutional records submitted. Authoritative check with college registrar, employer HR, or authorized issuing body in progress.'
  },
  {
    status: 'Verified',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    title: 'Verified by Issuer or Authorised Source',
    description: 'Cryptographically confirmed by the issuing university, certified testing agency, or employer authority. Backed by tamper-evident timestamp.'
  }
];

export const B2B_REVENUE_MODELS = [
  {
    customer: 'Employers & Recruiters',
    revenueModel: 'Verification SaaS Subscriptions',
    description: 'Continuous background screening, instant candidate verification API, and fraud-free candidate search pipeline.',
    cta: 'Request Enterprise Demo'
  },
  {
    customer: 'Universities & Colleges',
    revenueModel: 'Institutional Licensing',
    description: 'Batch credential issuing for graduating cohorts, alumni verification portals, and placement analytics.',
    cta: 'Institutional Licensing'
  },
  {
    customer: 'Training Providers',
    revenueModel: 'Credential Issuance Services',
    description: 'Issue verifiable course badges, bootcamp certificates, and skill certifications directly into student passports.',
    cta: 'Partner With Us'
  },
  {
    customer: 'Enterprise HR Platforms',
    revenueModel: 'API & Integration Fees',
    description: 'Direct ATS and HRMS plugin integration to verify incoming applicant passports automatically at point of application.',
    cta: 'Explore API Docs'
  }
];

export const PASSPORT_FAQS = [
  {
    q: 'Is my Basic Career Passport really free forever?',
    a: 'Yes, 100%. Creating your professional identity, building your profile, adding skills and education, uploading certificates, generating your public passport URL, and sharing your QR code is completely free forever. No credit card is required.'
  },
  {
    q: 'What is the distinction between QR verification checks and verification requests?',
    a: 'QR scans and public authenticity checks are completely free for everyone. Anyone (a recruiter, client, or university) can scan your passport QR code to confirm its authenticity without paying anything. The paid entitlement covers submitting records to our authoritative network for independent verification.'
  },
  {
    q: 'How does credential and employment verification work?',
    a: 'When you submit a verification request, our system validates the record against authorized registrar databases, issuer public key infrastructure, or conducts secure institutional verification. We never automatically mark a credential as verified simply because a document was uploaded.'
  },
  {
    q: 'Is this a recurring subscription or a one-time payment?',
    a: 'Career Passport upgrades (Essential, Professional, and Elite) are one-time lifetime payments. There is zero recurring monthly subscription for your passport edition. Your passport remains your lifelong career asset.'
  },
  {
    q: 'What if a credential verification request cannot be confirmed?',
    a: 'If an issuing institution cannot confirm the credential or if the documentation is invalid, the request status is clearly shown as "Rejected" or "Unconfirmed" with detailed reasons. You do not lose your entitlement for genuine technical or administrative mismatches.'
  },
  {
    q: 'Can I upgrade to a higher edition later?',
    a: 'Yes! You can start on the Free Basic edition today, and seamlessly upgrade to Essential (₹399), Professional (₹699), or Elite (₹999) whenever you need more verified credentials, employment verification, or advanced portfolio features.'
  },
  {
    q: 'How portable is my Career Passport?',
    a: 'Your Career Passport can be shared via custom web link (e.g. talentxcel.in/@yourname), high-resolution QR code, downloadable vCard, exportable PDF dossier, or embedded live badge for your personal portfolio and email signature.'
  }
];
