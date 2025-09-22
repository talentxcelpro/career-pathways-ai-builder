
// DEPRECATED: This file has been replaced by specialized services
// Please use the following services instead:
// - src/services/dashboardService.ts for dashboard data
// - src/services/jobService.ts for job data
// - src/services/courseService.ts for course data
// - src/services/analyticsService.ts for analytics

import { 
  getDashboardStats,
  getFeaturedJobs,
  getPopularCourses,
  getAllCourses,
  getAllLearningPaths,
  getJobFocusedCourses,
  getSkillDemandTrends,
  getUserCourseProgress
} from '@/services/dashboardService';

export const realDataService = {
  // Redirect to new service methods
  getDashboardStats: (userId?: string) => getDashboardStats(userId),
  getFeaturedJobs: () => getFeaturedJobs(),
  getPopularCourses: () => getPopularCourses(),
  getAllCourses: () => getAllCourses(),
  getAllLearningPaths: () => getAllLearningPaths(),
  getJobFocusedCourses: (filters?: any) => getJobFocusedCourses(filters),
  getSkillDemandTrends: (location?: string) => getSkillDemandTrends(location),
  getUserCourseProgress: (userId?: string) => getUserCourseProgress(userId)
};
