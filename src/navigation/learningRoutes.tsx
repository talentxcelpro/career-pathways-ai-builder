import { lazy } from "react";
import { BookOpen } from "lucide-react";

const Learning = lazy(() => import("../pages/Learning"));
const LearningHub = lazy(() => import("../pages/LearningHub"));
const CompleteLearningHub = lazy(() => import("../pages/learning/CompleteLearningHub"));
const AllCourses = lazy(() => import("../pages/learning/AllCourses"));
const CourseDetail = lazy(() => import("../pages/learning/CourseDetail"));
const CoursePlayer = lazy(() => import("../pages/learning/CoursePlayer"));
const MyCoursesPage = lazy(() => import("../pages/learning/MyCoursesPage"));
const MyProgress = lazy(() => import("../pages/learning/MyProgress"));
const LearningPathsPage = lazy(() => import("../pages/learning/LearningPathsPage"));
const LearningPathDetail = lazy(() => import("../pages/learning/LearningPathDetail"));
const Certificates = lazy(() => import("../pages/learning/Certificates"));
const EmploymentBridgePage = lazy(() => import("../pages/learning/EmploymentBridgePage"));
const JobFocusedCourses = lazy(() => import("../pages/learning/JobFocusedCourses"));
const SkillMarketTrends = lazy(() => import("../pages/learning/SkillMarketTrends"));
const CareerCareerAnalytics = lazy(() => import("../pages/learning/CareerAnalytics"));
const SkillAssessment = lazy(() => import("../pages/learning/SkillAssessment"));
const CareerRoadmap = lazy(() => import("../pages/learning/CareerRoadmap"));
const QuickLearningPage = lazy(() => import("../pages/learning/QuickLearningPage"));
const CommunityLearning = lazy(() => import("../pages/learning/CommunityLearning"));
const LearningSearch = lazy(() => import("../pages/learning/LearningSearch"));
const LearningCareerAnalyticsPage = lazy(() => import("../pages/learning/LearningAnalyticsPage"));
const LearningJobPipelineCommandCenter = lazy(() => import("../pages/LearningJobPipelineDashboard").then(m => ({ default: m.LearningJobPipelineCommandCenter })));
const SmartLearningSystem = lazy(() => import("../pages/SmartLearningSystem").then(m => ({ default: m.SmartLearningSystem })));
const CompanyPartnershipPortal = lazy(() => import("../pages/CompanyPartnershipPortal").then(m => ({ default: m.CompanyPartnershipPortal })));
const IndividualsPage = lazy(() => import("../pages/learning/IndividualsPage"));
const BusinessesPage = lazy(() => import("../pages/learning/BusinessesPage"));
const UniversitiesPage = lazy(() => import("../pages/learning/UniversitiesPage"));
const GovernmentsPage = lazy(() => import("../pages/learning/GovernmentsPage"));
const AIFeaturesPage = lazy(() => import("../pages/learning/AIFeaturesPage"));
const AdminCourses = lazy(() => import("../pages/admin/AdminCourses"));


export const learningRoutes = [
  {
    title: "Learning Hub",
    to: "/learning",
    icon: <BookOpen className="h-4 w-4" />,
    page: <LearningHub />,
    isPublic: true,
    requiresAuth: false,
    requiresAdminAccess: false,
  },
  {
    title: "Complete Learning Hub",
    to: "/learning/comprehensive-courses",
    page: <CompleteLearningHub />,
    isPublic: true,
    requiresAuth: false,
    requiresAdminAccess: false,
  },
  {
    title: "All Courses",
    to: "/learning/courses",
    page: <AllCourses />,
    isPublic: true,
  },
  {
    title: "Course Detail",
    to: "/learning/courses/:id",
    page: <CourseDetail />,
    isPublic: true,
  },
  {
    title: "Course Detail (Direct)",
    to: "/learning/:id",
    page: <CourseDetail />,
    isPublic: true,
  },
  {
    title: "Course Player",
    to: "/learning/courses/:id/player",
    page: <CoursePlayer />,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Course Player (Direct)",
    to: "/learning/:id/player",
    page: <CoursePlayer />,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "My Courses",
    to: "/learning/my-courses",
    page: <MyCoursesPage />,
    isPublic: true,
  },
  {
    title: "My Growth Path",
    to: "/learning/my-progress",
    page: <MyProgress />,
    isPublic: true,
  },
  {
    title: "Learning Paths",
    to: "/learning/paths",
    page: <LearningPathsPage />,
    isPublic: true,
  },
  {
    title: "Learning Path Detail",
    to: "/learning/paths/:id",
    page: <LearningPathDetail />,
    isPublic: true,
  },
  {
    title: "Employment Bridge",
    to: "/learning/employment-bridge",
    page: <EmploymentBridgePage />,
    isPublic: true,
  },
  {
    title: "Employment Bridge Overview",
    to: "/learning/employment-bridge/overview",
    page: <EmploymentBridgePage />,
    isPublic: true,
  },
  {
    title: "Employment Bridge Modules",
    to: "/learning/employment-bridge/modules",
    page: <EmploymentBridgePage />,
    isPublic: true,
  },
  {
    title: "Employment Bridge Certificate",
    to: "/learning/employment-bridge/certificate",
    page: <EmploymentBridgePage />,
    isPublic: true,
  },
  {
    title: "Job-Focused Courses",
    to: "/learning/job-focused-courses",
    page: <JobFocusedCourses />,
    isPublic: true,
  },
  {
    title: "Skill Market Trends",
    to: "/learning/skill-market-trends",
    page: <SkillMarketTrends />,
    isPublic: true,
  },
  {
    title: "Career Analytics",
    to: "/learning/career-analytics",
    page: <CareerCareerAnalytics />,
    isPublic: true,
  },
  {
    title: "Skill Assessment",
    to: "/learning/skill-assessment",
    page: <SkillAssessment />,
    isPublic: true,
  },
  {
    title: "Career Roadmap",
    to: "/learning/career-roadmap",
    page: <CareerRoadmap />,
    isPublic: true,
  },
  {
    title: "Quick Learning",
    to: "/learning/quick-learn",
    page: <QuickLearningPage />,
    isPublic: true,
  },
  {
    title: "Community Learning",
    to: "/learning/community",
    page: <CommunityLearning />,
    isPublic: true,
  },
  {
    title: "Learning Search",
    to: "/learning/search",
    page: <LearningSearch />,
    isPublic: true,
  },
  {
    title: "Learning Career Analytics",
    to: "/learning/career-analytics",
    page: <LearningCareerAnalyticsPage />,
    isPublic: true,
  },
  {
    title: "Certificates",
    to: "/learning/certificates",
    page: <Certificates />,
    isPublic: true,
  },
  {
    title: "Pipeline Command Center",
    to: "/learning/pipeline",
    page: <LearningJobPipelineCommandCenter />,
    isPublic: true,
  },
  {
    title: "Learning System",
    to: "/learning/system",
    page: <SmartLearningSystem />,
    isPublic: true,
  },
  {
    title: "Company Portal",
    to: "/learning/company-portal",
    page: <CompanyPartnershipPortal />,
    isPublic: true,
  },
  {
    title: "For Individuals",
    to: "/learning/individuals",
    page: <IndividualsPage />,
    isPublic: true,
  },
  {
    title: "For Businesses",
    to: "/learning/businesses",
    page: <BusinessesPage />,
    isPublic: true,
  },
  {
    title: "For Universities",
    to: "/learning/universities",
    page: <UniversitiesPage />,
    isPublic: true,
  },
  {
    title: "For Governments",
    to: "/learning/governments",
    page: <GovernmentsPage />,
    isPublic: true,
  },
  {
    title: "Talent Engine Features",
    to: "/learning/ai-features",
    page: <AIFeaturesPage />,
    isPublic: true,
  },
  {
    title: "Admin - Courses",
    to: "/admin/courses",
    page: <AdminCourses />,
    isPublic: false,
    requiresAuth: true,
    requiresAdminAccess: true,
  },
];




