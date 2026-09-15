export type AccessTier = 'free' | 'basic' | 'pro' | 'enterprise';

export interface TierLimits {
  dailyAIRequests: number;
  monthlyJobApplications: number;
  resumeTemplates: number;
  networkConnections: number;
  learningCourses: number;
  storageGB: number;
  supportLevel: 'email' | 'chat' | 'priority';
  customBranding: boolean;
  advancedAnalytics: boolean;
  apiAccess: boolean;
}

export const TIER_LIMITS: Record<AccessTier, TierLimits> = {
  free: {
    dailyAIRequests: 5,
    monthlyJobApplications: 10,
    resumeTemplates: 3,
    networkConnections: 50,
    learningCourses: 2,
    storageGB: 1,
    supportLevel: 'email',
    customBranding: false,
    advancedAnalytics: false,
    apiAccess: false,
  },
  basic: {
    dailyAIRequests: 25,
    monthlyJobApplications: 50,
    resumeTemplates: 8,
    networkConnections: 200,
    learningCourses: 5,
    storageGB: 5,
    supportLevel: 'email',
    customBranding: false,
    advancedAnalytics: true,
    apiAccess: false,
  },
  pro: {
    dailyAIRequests: 100,
    monthlyJobApplications: 200,
    resumeTemplates: 25,
    networkConnections: 1000,
    learningCourses: 15,
    storageGB: 25,
    supportLevel: 'chat',
    customBranding: true,
    advancedAnalytics: true,
    apiAccess: true,
  },
  enterprise: {
    dailyAIRequests: -1, // Unlimited
    monthlyJobApplications: -1,
    resumeTemplates: -1,
    networkConnections: -1,
    learningCourses: -1,
    storageGB: 100,
    supportLevel: 'priority',
    customBranding: true,
    advancedAnalytics: true,
    apiAccess: true,
  },
};

export interface FeatureAccess {
  tier: AccessTier;
  feature: string;
  requiresAuth: boolean;
  isPublic: boolean;
  description: string;
}

export const PUBLIC_FEATURES: FeatureAccess[] = [
  {
    tier: 'free',
    feature: 'resume_builder_basic',
    requiresAuth: false,
    isPublic: true,
    description: 'Basic resume builder with 3 templates'
  },
  {
    tier: 'free',
    feature: 'job_search',
    requiresAuth: false,
    isPublic: true,
    description: 'Search and view job listings'
  },
  {
    tier: 'free',
    feature: 'career_guidance',
    requiresAuth: false,
    isPublic: true,
    description: 'Basic career guidance and tips'
  },
  {
    tier: 'free',
    feature: 'company_insights',
    requiresAuth: false,
    isPublic: true,
    description: 'View company profiles and insights'
  },
  {
    tier: 'free',
    feature: 'interview_prep',
    requiresAuth: false,
    isPublic: true,
    description: 'Basic interview preparation resources'
  },
];