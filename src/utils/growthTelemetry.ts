/**
 * TalentXcel — Growth Telemetry & Event Tracking System
 *
 * Provides typed, zero-PII event logging for Google Analytics 4 (GA4).
 *
 * 🔒 ZERO PII GUARANTEE:
 *   - NEVER logs user ID, email, phone number, full name, or resume contents.
 *   - ONLY logs anonymous, contextual parameters (page_type, role_slug, city_slug, cta_type, destination).
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// ─── Event Parameter Interfaces ─────────────────────────────────────────────

export interface DiscoveryPageViewParams {
  page_type: string;
  role_slug?: string;
  city_slug?: string;
  category?: string;
}

export interface CtaClickParams {
  cta_type: string;
  page_type: string;
  destination: string;
  source_page: string;
  role_slug?: string;
  city_slug?: string;
}

export interface GenericGrowthEventParams {
  source_page?: string;
  user_type?: 'candidate' | 'employer' | 'anonymous';
  role_slug?: string;
  city_slug?: string;
  skill_slug?: string;
  course_id?: string;
  format?: string;
  industry?: string;
  platform?: string;
  has_skills?: boolean;
  has_title?: boolean;
  completion_pct?: number;
}

// ─── Safe Event Dispatcher ──────────────────────────────────────────────────

function safeLogEvent(eventName: string, params: Record<string, any>) {
  // Strip any accidental PII fields as a fail-safe
  const piiBlacklist = ['email', 'phone', 'name', 'userId', 'user_id', 'resumeText', 'password', 'token', 'bio'];
  const safeParams: Record<string, any> = {};

  Object.keys(params).forEach((key) => {
    if (!piiBlacklist.includes(key.toLowerCase()) && params[key] !== undefined) {
      safeParams[key] = params[key];
    }
  });

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, safeParams);
  }

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`📈 [Growth Telemetry] ${eventName}`, safeParams);
  }
}

// ─── Telemetry Functions ────────────────────────────────────────────────────

/** Log when a public discovery page is viewed */
export function trackDiscoveryPageView(params: DiscoveryPageViewParams) {
  safeLogEvent('discovery_page_view', params);
}

/** Log when any conversion CTA button is clicked */
export function trackCtaClick(params: CtaClickParams) {
  safeLogEvent('cta_click', params);
}

/** Log when registration process begins */
export function trackRegistrationStarted(sourcePage: string, userType: 'candidate' | 'employer' = 'candidate') {
  safeLogEvent('registration_started', { source_page: sourcePage, user_type: userType });
}

/** Log when candidate registration completes */
export function trackCandidateSignupCompleted(sourcePage: string) {
  safeLogEvent('candidate_signup_completed', { source_page: sourcePage });
}

/** Log when employer registration completes */
export function trackEmployerSignupCompleted(sourcePage: string) {
  safeLogEvent('employer_signup_completed', { source_page: sourcePage });
}

/** Log when user completes initial onboarding */
export function trackOnboardingCompleted(userType: 'candidate' | 'employer') {
  safeLogEvent('onboarding_completed', { user_type: userType });
}

/** Log when profile completion reaches key milestones */
export function trackProfileCompleted(completionPct: number) {
  safeLogEvent('profile_completed', { completion_pct: completionPct });
}

/** Log when user opts in to make their profile public */
export function trackProfilePublicEnabled(hasSkills: boolean, hasTitle: boolean) {
  safeLogEvent('profile_public_enabled', { has_skills: hasSkills, has_title: hasTitle });
}

/** Log when candidate claims their Career Passport */
export function trackPassportCreated(sourcePage: string) {
  safeLogEvent('passport_created', { source_page: sourcePage });
}

/** Log when user starts building/tailoring a resume */
export function trackResumeBuildStarted(sourcePage: string, roleSlug?: string) {
  safeLogEvent('resume_build_started', { source_page: sourcePage, role_slug: roleSlug });
}

/** Log when resume is exported */
export function trackResumeExported(format: string = 'pdf') {
  safeLogEvent('resume_exported', { format });
}

/** Log when user begins a skill assessment */
export function trackSkillAssessmentStarted(skillSlug: string) {
  safeLogEvent('skill_assessment_started', { skill_slug: skillSlug });
}

/** Log when user starts a learning course */
export function trackLearningStarted(courseId: string) {
  safeLogEvent('learning_started', { course_id: courseId });
}

/** Log when employer starts creating a job posting */
export function trackEmployerJobStarted(sourcePage: string) {
  safeLogEvent('employer_job_started', { source_page: sourcePage });
}

/** Log when employer publishes a real vacancy */
export function trackEmployerJobPublished(industry?: string) {
  safeLogEvent('employer_job_published', { industry });
}

/** Log when an employer or visitor views a candidate profile */
export function trackCandidateProfileViewed(roleSlug?: string, citySlug?: string) {
  safeLogEvent('candidate_profile_viewed', { role_slug: roleSlug, city_slug: citySlug });
}

/** Log when a referral or passport share button is clicked */
export function trackReferralShareClicked(platform: 'linkedin' | 'twitter' | 'whatsapp' | 'copy_link') {
  safeLogEvent('referral_share_clicked', { platform });
}
