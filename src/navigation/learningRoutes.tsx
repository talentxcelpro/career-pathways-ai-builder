import { lazy, Suspense } from 'react';

import { BookOpen } from "lucide-react";
const Learning = lazy(() => import('../pages/Learning'));
const LearningHub = lazy(() => import('../pages/LearningHub'));
const CompleteLearningHub = lazy(() => import('../pages/learning/CompleteLearningHub'));
const AllCourses = lazy(() => import('../pages/learning/AllCourses'));
const CourseDetail = lazy(() => import('../pages/learning/CourseDetail'));
const CoursePlayer = lazy(() => import('../pages/learning/CoursePlayer'));
const MyCoursesPage = lazy(() => import('../pages/learning/MyCoursesPage'));
const MyProgress = lazy(() => import('../pages/learning/MyProgress'));
const LearningPathsPage = lazy(() => import('../pages/learning/LearningPathsPage'));
const LearningPathDetail = lazy(() => import('../pages/learning/LearningPathDetail'));
const Certificates = lazy(() => import('../pages/learning/Certificates'));
const EmploymentBridgePage = lazy(() => import('../pages/learning/EmploymentBridgePage'));
const JobFocusedCourses = lazy(() => import('../pages/learning/JobFocusedCourses'));
const SkillMarketTrends = lazy(() => import('../pages/learning/SkillMarketTrends'));
const CareerAnalytics = lazy(() => import('../pages/learning/CareerAnalytics'));
const SkillAssessment = lazy(() => import('../pages/learning/SkillAssessment'));
const CareerRoadmap = lazy(() => import('../pages/learning/CareerRoadmap'));
const QuickLearningPage = lazy(() => import('../pages/learning/QuickLearningPage'));
const CommunityLearning = lazy(() => import('../pages/learning/CommunityLearning'));
const LearningSearch = lazy(() => import('../pages/learning/LearningSearch'));
const LearningAnalyticsPage = lazy(() => import('../pages/learning/LearningAnalyticsPage'));
const LearningJobPipelineDashboard = lazy(() => import('../pages/LearningJobPipelineDashboard').then(m => ({ default: m.LearningJobPipelineDashboard })));
const SmartLearningSystem = lazy(() => import('../pages/SmartLearningSystem').then(m => ({ default: m.SmartLearningSystem })));
const CompanyPartnershipPortal = lazy(() => import('../pages/CompanyPartnershipPortal').then(m => ({ default: m.CompanyPartnershipPortal })));
const IndividualsPage = lazy(() => import('../pages/learning/IndividualsPage'));
const BusinessesPage = lazy(() => import('../pages/learning/BusinessesPage'));
const UniversitiesPage = lazy(() => import('../pages/learning/UniversitiesPage'));
const GovernmentsPage = lazy(() => import('../pages/learning/GovernmentsPage'));
const AIFeaturesPage = lazy(() => import('../pages/learning/AIFeaturesPage'));
const AdminCourses = lazy(() => import('../pages/admin/AdminCourses'));

export const learningRoutes = [
  {
    title: "Learning Hub",
    to: "/learning",
    icon: <BookOpen className="h-4 w-4" />,
    page: <Suspense fallback={null}><LearningHub /></Suspense>,
    isPublic: true,
    requiresAuth: false,
    requiresAdminAccess: false,
  },
  {
    title: "Complete Learning Hub",
    to: "/learning/comprehensive-courses",
    page: <Suspense fallback={null}><CompleteLearningHub /></Suspense>,
    isPublic: true,
    requiresAuth: false,
    requiresAdminAccess: false,
  },
  {
    title: "All Courses",
    to: "/learning/courses",
    page: <Suspense fallback={null}><AllCourses /></Suspense>,
    isPublic: true,
  },
  {
    title: "Course Detail",
    to: "/learning/courses/:id",
    page: <Suspense fallback={null}><CourseDetail /></Suspense>,
    isPublic: true,
  },
  {
    title: "Course Detail (Direct)",
    to: "/learning/:id",
    page: <Suspense fallback={null}><CourseDetail /></Suspense>,
    isPublic: true,
  },
  {
    title: "Course Player",
    to: "/learning/courses/:id/player",
    page: <Suspense fallback={null}><CoursePlayer /></Suspense>,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Course Player (Direct)",
    to: "/learning/:id/player",
    page: <Suspense fallback={null}><CoursePlayer /></Suspense>,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "My Courses",
    to: "/learning/my-courses",
    page: <Suspense fallback={null}><MyCoursesPage /></Suspense>,
    isPublic: true,
  },
  {
    title: "My Progress",
    to: "/learning/my-progress",
    page: <Suspense fallback={null}><MyProgress /></Suspense>,
    isPublic: true,
  },
  {
    title: "Learning Paths",
    to: "/learning/paths",
    page: <Suspense fallback={null}><LearningPathsPage /></Suspense>,
    isPublic: true,
  },
  {
    title: "Learning Path Detail",
    to: "/learning/paths/:id",
    page: <Suspense fallback={null}><LearningPathDetail /></Suspense>,
    isPublic: true,
  },
  {
    title: "Employment Bridge",
    to: "/learning/employment-bridge",
    page: <Suspense fallback={null}><EmploymentBridgePage /></Suspense>,
    isPublic: true,
  },
  {
    title: "Employment Bridge Overview",
    to: "/learning/employment-bridge/overview",
    page: <Suspense fallback={null}><EmploymentBridgePage /></Suspense>,
    isPublic: true,
  },
  {
    title: "Employment Bridge Modules",
    to: "/learning/employment-bridge/modules",
    page: <Suspense fallback={null}><EmploymentBridgePage /></Suspense>,
    isPublic: true,
  },
  {
    title: "Employment Bridge Certificate",
    to: "/learning/employment-bridge/certificate",
    page: <Suspense fallback={null}><EmploymentBridgePage /></Suspense>,
    isPublic: true,
  },
  {
    title: "Job-Focused Courses",
    to: "/learning/job-focused-courses",
    page: <Suspense fallback={null}><JobFocusedCourses /></Suspense>,
    isPublic: true,
  },
  {
    title: "Skill Market Trends",
    to: "/learning/skill-market-trends",
    page: <Suspense fallback={null}><SkillMarketTrends /></Suspense>,
    isPublic: true,
  },
  {
    title: "Career Analytics",
    to: "/learning/career-analytics",
    page: <Suspense fallback={null}><CareerAnalytics /></Suspense>,
    isPublic: true,
  },
  {
    title: "Skill Assessment",
    to: "/learning/skill-assessment",
    page: <Suspense fallback={null}><SkillAssessment /></Suspense>,
    isPublic: true,
  },
  {
    title: "Career Roadmap",
    to: "/learning/career-roadmap",
    page: <Suspense fallback={null}><CareerRoadmap /></Suspense>,
    isPublic: true,
  },
  {
    title: "Quick Learning",
    to: "/learning/quick-learn",
    page: <Suspense fallback={null}><QuickLearningPage /></Suspense>,
    isPublic: true,
  },
  {
    title: "Community Learning",
    to: "/learning/community",
    page: <Suspense fallback={null}><CommunityLearning /></Suspense>,
    isPublic: true,
  },
  {
    title: "Learning Search",
    to: "/learning/search",
    page: <Suspense fallback={null}><LearningSearch /></Suspense>,
    isPublic: true,
  },
  {
    title: "Learning Analytics",
    to: "/learning/analytics",
    page: <Suspense fallback={null}><LearningAnalyticsPage /></Suspense>,
    isPublic: true,
  },
  {
    title: "Certificates",
    to: "/learning/certificates",
    page: <Suspense fallback={null}><Certificates /></Suspense>,
    isPublic: true,
  },
  {
    title: "Pipeline Dashboard",
    to: "/learning/pipeline",
    page: <Suspense fallback={null}><LearningJobPipelineDashboard /></Suspense>,
    isPublic: true,
  },
  {
    title: "Learning System",
    to: "/learning/system",
    page: <Suspense fallback={null}><SmartLearningSystem /></Suspense>,
    isPublic: true,
  },
  {
    title: "Company Portal",
    to: "/learning/company-portal",
    page: <Suspense fallback={null}><CompanyPartnershipPortal /></Suspense>,
    isPublic: true,
  },
  {
    title: "For Individuals",
    to: "/learning/individuals",
    page: <Suspense fallback={null}><IndividualsPage /></Suspense>,
    isPublic: true,
  },
  {
    title: "For Businesses",
    to: "/learning/businesses",
    page: <Suspense fallback={null}><BusinessesPage /></Suspense>,
    isPublic: true,
  },
  {
    title: "For Universities",
    to: "/learning/universities",
    page: <Suspense fallback={null}><UniversitiesPage /></Suspense>,
    isPublic: true,
  },
  {
    title: "For Governments",
    to: "/learning/governments",
    page: <Suspense fallback={null}><GovernmentsPage /></Suspense>,
    isPublic: true,
  },
  {
    title: "AI Features",
    to: "/learning/ai-features",
    page: <Suspense fallback={null}><AIFeaturesPage /></Suspense>,
    isPublic: true,
  },
  {
    title: "Admin - Courses",
    to: "/admin/courses",
    page: <Suspense fallback={null}><AdminCourses /></Suspense>,
    isPublic: false,
    requiresAuth: true,
    requiresAdminAccess: true,
  },
];
