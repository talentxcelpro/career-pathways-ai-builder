
export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  
  // Protected routes
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  PROFILE_RESUME: '/profile/resume',
  PROFILE_COVER_LETTER: '/profile/cover-letter',
  PROFILE_PREFERENCES: '/profile/preferences',
  PROFILE_SETTINGS: '/profile/settings',
  PROFILE_MEDIA: '/profile/media',
  PROFILE_ANALYTICS: '/profile/analytics',
  PROFILE_DOCUMENTS: '/profile/documents',
  
  // Resume routes
  RESUME_BUILDER: '/resume-builder',
  
  // Job routes
  JOBS: '/jobs',
  JOBS_SAVED: '/jobs/saved',
  JOBS_APPLIED: '/jobs/applied',
  JOBS_CATEGORIES: '/jobs/categories',
  JOBS_COMPANIES: '/jobs/companies',
  JOBS_RECOMMENDATIONS: '/jobs/recommendations',
  JOBS_ALERTS: '/jobs/alerts',
  JOBS_ANALYTICS: '/jobs/analytics',
  JOBS_POST: '/jobs/post',
  JOBS_MANAGE: '/jobs/manage',
  JOB_DETAIL: '/jobs/:id',
  JOB_APPLY: '/jobs/:id/apply',
  JOB_SMART_APPLY: '/jobs/:id/smart-apply',
  JOB_APPLICANTS: '/jobs/:id/applicants',
  APPLICANT_DETAIL: '/jobs/:jobId/applicants/:applicantId',
  
  // Network routes
  NETWORK: '/network',
  NETWORK_PEOPLE: '/network/people',
  NETWORK_POSTS: '/network/posts',
  NETWORK_GROUPS: '/network/groups',
  NETWORK_REQUESTS: '/network/requests',
  NETWORK_EVENTS: '/network/events',
  NETWORK_MESSAGES: '/network/messages',
  NETWORK_NOTIFICATIONS: '/network/notifications',
  NETWORK_SUGGESTIONS: '/network/suggestions',
  USER_PROFILE: '/network/people/:id',
  POST_DETAIL: '/network/posts/:id',
  GROUP_DETAIL: '/network/groups/:id',
  EVENT_DETAIL: '/network/events/:id',
  MESSAGE_CONVERSATION: '/network/messages/:id',
  
  // Learning routes
  LEARNING: '/learning',
  LEARNING_MY_COURSES: '/learning/my-courses',
  LEARNING_PATHS: '/learning/paths',
  LEARNING_CERTIFICATES: '/learning/certificates',
  COURSE_DETAIL: '/learning/:id',
  LEARNING_PATH_DETAIL: '/learning/paths/:id',
  
  // Tools routes
  TOOLS: '/tools',
  TOOLS_DASHBOARD: '/tools/dashboard',
  TOOLS_RESUME_CHECK: '/tools/resume-check',
  TOOLS_COVER_LETTER: '/tools/cover-letter',
  TOOLS_SALARY_ANALYZER: '/tools/salary-analyzer',
  TOOLS_INTERVIEW_PREP: '/tools/interview-prep',
  TOOLS_AI_ASSISTANT: '/tools/ai-assistant',
  TOOLS_PROFILE_SCORE: '/tools/profile-score',
  TOOLS_MARKET_INSIGHTS: '/tools/market-insights',
  
  // AI routes
  AI_ASSISTANT: '/ai-assistant',
  AI_OPTIMIZER: '/ai-optimizer',
  AI_JOB_MATCH: '/ai/job-match',
  AI_MESSAGE_SUGGEST: '/ai/message-suggest',
  AI_PATHFINDER: '/ai/pathfinder',
  
  // Career Map routes
  CAREER_MAP: '/career-map',
  CAREER_MAP_GENERATE: '/career-map/generate',
  CAREER_MAP_AI_ROADMAP: '/career-map/ai-roadmap-builder',
  CAREER_MAP_MY_ROADMAPS: '/career-map/my-roadmaps',
  CAREER_MAP_SKILLS_GAP: '/career-map/skills-gap',
  CAREER_MAP_RECOMMENDATIONS: '/career-map/recommendations',
  CAREER_MAP_COMPARISON: '/career-map/comparison',
  CAREER_MAP_SWITCH: '/career-map/switch',
  ROADMAP_DETAIL: '/career-map/:id',
  
  // Marketplace routes
  MARKETPLACE: '/marketplace',
  MARKETPLACE_POST_SERVICE: '/marketplace/post-service',
  SERVICE_DETAIL: '/marketplace/:id',
  
  // Employer routes
  EMPLOYER_DASHBOARD: '/employer',
  EMPLOYER_PROFILE: '/employer/profile',
  
  // Companies & Colleges
  COMPANIES: '/companies',
  COMPANY_DETAIL: '/companies/:id',
  COLLEGES: '/colleges',
  COLLEGE_DETAIL: '/colleges/:id',
  
  // Catch all
  NOT_FOUND: '*'
} as const;
