import { lazy, Suspense } from 'react';
import { BookOpen, Layers } from "lucide-react";

const LearningHub = lazy(() => import('../pages/LearningHub'));
const AggregatedCourseDetail = lazy(() => import('../pages/learning/AggregatedCourseDetail').then(m => ({ default: m.AggregatedCourseDetail })));
const CareerPathwayDetail = lazy(() => import('../pages/learning/CareerPathwayDetail').then(m => ({ default: m.CareerPathwayDetail })));
const AdminLearningAggregator = lazy(() => import('../pages/admin/AdminLearningAggregator').then(m => ({ default: m.AdminLearningAggregator })));

const CompleteLearningHub = lazy(() => import('../pages/learning/CompleteLearningHub'));
const AllCourses = lazy(() => import('../pages/learning/AllCourses'));
const CoursePlayer = lazy(() => import('../pages/learning/CoursePlayer'));
const MyCoursesPage = lazy(() => import('../pages/learning/MyCoursesPage'));
const MyProgress = lazy(() => import('../pages/learning/MyProgress'));
const LearningPathsPage = lazy(() => import('../pages/learning/LearningPathsPage'));
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

export const learningRoutes = [
  {
    title: "TalentXcel Learning Hub",
    to: "/learning",
    icon: <BookOpen className="h-4 w-4" />,
    page: <Suspense fallback={null}><LearningHub /></Suspense>,
    isPublic: true,
    requiresAuth: false,
    requiresAdminAccess: false,
  },
  {
    title: "Aggregated Course Detail",
    to: "/learning/courses/:id",
    page: <Suspense fallback={null}><AggregatedCourseDetail /></Suspense>,
    isPublic: true,
  },
  {
    title: "Aggregated Course Detail (Slug)",
    to: "/learning/course/:slug",
    page: <Suspense fallback={null}><AggregatedCourseDetail /></Suspense>,
    isPublic: true,
  },
  {
    title: "Career Pathway Detail",
    to: "/learning/careers/:slug",
    page: <Suspense fallback={null}><CareerPathwayDetail /></Suspense>,
    isPublic: true,
  },
  {
    title: "Learning Path Detail",
    to: "/learning/paths/:id",
    page: <Suspense fallback={null}><CareerPathwayDetail /></Suspense>,
    isPublic: true,
  },
  {
    title: "Admin Learning Aggregator",
    to: "/admin/learning-aggregator",
    page: <Suspense fallback={null}><AdminLearningAggregator /></Suspense>,
    isPublic: false,
    requiresAuth: true,
    requiresAdminAccess: true,
  },
  {
    title: "Admin Courses",
    to: "/admin/courses",
    page: <Suspense fallback={null}><AdminLearningAggregator /></Suspense>,
    isPublic: false,
    requiresAuth: true,
    requiresAdminAccess: true,
  },
  {
    title: "Complete Learning Hub",
    to: "/learning/comprehensive-courses",
    page: <Suspense fallback={null}><CompleteLearningHub /></Suspense>,
    isPublic: true,
  },
  {
    title: "All Courses",
    to: "/learning/courses",
    page: <Suspense fallback={null}><AllCourses /></Suspense>,
    isPublic: true,
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
    title: "Learning Search",
    to: "/learning/search",
    page: <Suspense fallback={null}><LearningSearch /></Suspense>,
    isPublic: true,
  },
  {
    title: "Certificates",
    to: "/learning/certificates",
    page: <Suspense fallback={null}><Certificates /></Suspense>,
    isPublic: true,
  }
];
