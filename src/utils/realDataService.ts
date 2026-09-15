
// DEPRECATED: This file has been replaced by specialized services
// Please use the following services instead:
// - src/services/dashboardService.ts for command center data
// - src/services/jobService.ts for job data
// - src/services/courseService.ts for course data
// - src/services/analyticsService.ts for Career Analytics

import { 
  getCommandCenterStats,
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
  getCommandCenterStats: (userId?: string) => getCommandCenterStats(userId),
  getFeaturedJobs: () => getFeaturedJobs(),
  getPopularCourses: () => getPopularCourses(),
  getAllCourses: () => getAllCourses(),
  getAllLearningPaths: () => getAllLearningPaths(),
  getJobFocusedCourses: (filters?: any) => getJobFocusedCourses(filters),
  getSkillDemandTrends: (location?: string) => getSkillDemandTrends(location),
  getUserCourseProgress: (userId?: string) => getUserCourseProgress(userId)
};




