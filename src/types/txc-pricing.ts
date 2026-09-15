export interface TXCPricingTier {
  id: string;
  name: string;
  cost: number; // Cost in TXC tokens
  duration: 'one-time' | 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
}

export interface TXCFeaturePricing {
  feature: string;
  cost: number;
  description: string;
  category: 'profile' | 'jobs' | 'tools' | 'premium' | 'verification';
}

// TXC Pricing Configuration
export const TXC_PROFILE_UPGRADES: TXCPricingTier[] = [
  {
    id: 'profile_premium',
    name: 'Premium Profile',
    cost: 10000,
    duration: 'monthly',
    features: [
      'Premium badge',
      'Enhanced visibility',
      'Advanced analytics',
      'Priority in search results',
      'Custom profile themes'
    ],
    popular: true
  },
  {
    id: 'profile_elite',
    name: 'Elite Profile',
    cost: 25000,
    duration: 'monthly',
    features: [
      'Elite badge',
      'Top search positioning',
      'Detailed analytics dashboard',
      'Personal branding tools',
      'Direct recruiter messaging',
      'Portfolio showcase'
    ]
  },
  {
    id: 'profile_verification',
    name: 'Profile Verification',
    cost: 5000,
    duration: 'one-time',
    features: [
      'Verified badge',
      'Identity confirmation',
      'Increased trust score',
      'Priority support'
    ]
  }
];

export const TXC_JOB_POSTING: TXCPricingTier[] = [
  {
    id: 'job_standard',
    name: 'Standard Job Post',
    cost: 3000,
    duration: 'one-time',
    features: [
      '30-day listing',
      'Basic visibility',
      'Standard applicant tracking'
    ]
  },
  {
    id: 'job_featured',
    name: 'Featured Job Post',
    cost: 8000,
    duration: 'one-time',
    features: [
      '45-day listing',
      'Featured placement',
      'Enhanced visibility',
      'Priority in search',
      'Advanced analytics'
    ],
    popular: true
  },
  {
    id: 'job_premium',
    name: 'Premium Job Post',
    cost: 15000,
    duration: 'one-time',
    features: [
      '60-day listing',
      'Top placement',
      'Maximum visibility',
      'AI-powered candidate matching',
      'Detailed analytics',
      'Direct messaging to candidates'
    ]
  }
];

export const TXC_TOOLS_PRICING: TXCFeaturePricing[] = [
  // AI Tools
  {
    feature: 'ai_resume_builder',
    cost: 2000,
    description: 'AI-powered resume generation',
    category: 'tools'
  },
  {
    feature: 'ai_cover_letter',
    cost: 1000,
    description: 'AI-generated cover letters',
    category: 'tools'
  },
  {
    feature: 'ai_interview_prep',
    cost: 1500,
    description: 'AI interview simulation and preparation',
    category: 'tools'
  },
  {
    feature: 'ai_career_coach',
    cost: 2500,
    description: 'Personalized AI career coaching session',
    category: 'tools'
  },
  {
    feature: 'ai_skill_assessment',
    cost: 3000,
    description: 'Comprehensive AI skill evaluation',
    category: 'tools'
  },
  
  // Premium Features
  {
    feature: 'premium_analytics',
    cost: 5000,
    description: 'Advanced profile and job analytics',
    category: 'premium'
  },
  {
    feature: 'bulk_applications',
    cost: 10000,
    description: 'Bulk job application system (monthly)',
    category: 'premium'
  },
  {
    feature: 'direct_messaging',
    cost: 7500,
    description: 'Direct messaging with recruiters (monthly)',
    category: 'premium'
  },
  {
    feature: 'priority_support',
    cost: 5000,
    description: 'Priority customer support (monthly)',
    category: 'premium'
  },
  
  // Verification Services
  {
    feature: 'skill_verification',
    cost: 2000,
    description: 'Professional skill verification',
    category: 'verification'
  },
  {
    feature: 'education_verification',
    cost: 3000,
    description: 'Educational background verification',
    category: 'verification'
  },
  {
    feature: 'experience_verification',
    cost: 4000,
    description: 'Work experience verification',
    category: 'verification'
  }
];

export const TXC_SUBSCRIPTION_TIERS: TXCPricingTier[] = [
  {
    id: 'pro_starter',
    name: 'Pro Starter',
    cost: 25000,
    duration: 'monthly',
    features: [
      'AI Resume Builder',
      'Basic Analytics',
      'Standard Support',
      'Profile Enhancement',
      'Community Access'
    ]
  },
  {
    id: 'pro_business',
    name: 'Pro Business',
    cost: 35000,
    duration: 'monthly',
    features: [
      'Everything in Pro Starter',
      'AI Cover Letter Generator',
      'Advanced Analytics',
      'Priority Support',
      'Direct Recruiter Messaging',
      'Premium Profile Features',
      'Skill Verification'
    ],
    popular: true
  },
  {
    id: 'pro_elite',
    name: 'Pro Elite',
    cost: 50000,
    duration: 'monthly',
    features: [
      'Everything in Pro Business',
      'AI Interview Prep',
      'Custom Branding',
      'API Access',
      'Dedicated Account Manager',
      'White-label Solutions',
      'Advanced Integrations'
    ]
  }
];

// Helper functions
export const getTXCPrice = (featureId: string): number => {
  // Check profile upgrades
  const profileUpgrade = TXC_PROFILE_UPGRADES.find(tier => tier.id === featureId);
  if (profileUpgrade) return profileUpgrade.cost;
  
  // Check job posting
  const jobPosting = TXC_JOB_POSTING.find(tier => tier.id === featureId);
  if (jobPosting) return jobPosting.cost;
  
  // Check tools pricing
  const toolPricing = TXC_TOOLS_PRICING.find(tool => tool.feature === featureId);
  if (toolPricing) return toolPricing.cost;
  
  // Check subscription tiers
  const subscription = TXC_SUBSCRIPTION_TIERS.find(tier => tier.id === featureId);
  if (subscription) return subscription.cost;
  
  return 0;
};

export const formatTXC = (amount: number): string => {
  return `${amount.toLocaleString()} TXC`;
};

export const getAllPricingOptions = () => {
  return {
    profileUpgrades: TXC_PROFILE_UPGRADES,
    jobPosting: TXC_JOB_POSTING,
    tools: TXC_TOOLS_PRICING,
    subscriptions: TXC_SUBSCRIPTION_TIERS
  };
};