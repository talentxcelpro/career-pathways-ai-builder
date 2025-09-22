
import { BookOpen } from "lucide-react";
import Learning from "../pages/Learning";
import LearningHub from "../pages/LearningHub";
import AllCourses from "../pages/learning/AllCourses";
import CourseDetail from "../pages/learning/CourseDetail";
import CoursePlayer from "../pages/learning/CoursePlayer";
import MyCoursesPage from "../pages/learning/MyCoursesPage";
import MyProgress from "../pages/learning/MyProgress";
import LearningPathsPage from "../pages/learning/LearningPathsPage";
import LearningPathDetail from "../pages/learning/LearningPathDetail";
import Certificates from "../pages/learning/Certificates";
import EmploymentBridgePage from "../pages/learning/EmploymentBridgePage";
import JobFocusedCourses from "../pages/learning/JobFocusedCourses";
import SkillMarketTrends from "../pages/learning/SkillMarketTrends";
import CareerAnalytics from "../pages/learning/CareerAnalytics";
import SkillAssessment from "../pages/learning/SkillAssessment";
import CareerRoadmap from "../pages/learning/CareerRoadmap";
import QuickLearningPage from "../pages/learning/QuickLearningPage";
import CommunityLearning from "../pages/learning/CommunityLearning";
import LearningSearch from "../pages/learning/LearningSearch";
import LearningAnalyticsPage from "../pages/learning/LearningAnalyticsPage";
import { LearningJobPipelineDashboard } from "../pages/LearningJobPipelineDashboard";
import { SmartLearningSystem } from "../pages/SmartLearningSystem";
import { CompanyPartnershipPortal } from "../pages/CompanyPartnershipPortal";

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
    title: "Course Player",
    to: "/learning/courses/:id/player",
    page: <CoursePlayer />,
    isPublic: true,
  },
  {
    title: "My Courses",
    to: "/learning/my-courses",
    page: <MyCoursesPage />,
    isPublic: true,
  },
  {
    title: "My Progress",
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
    page: <CareerAnalytics />,
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
    title: "Learning Analytics",
    to: "/learning/analytics",
    page: <LearningAnalyticsPage />,
    isPublic: true,
  },
  {
    title: "Certificates",
    to: "/learning/certificates",
    page: <Certificates />,
    isPublic: true,
  },
  {
    title: "Pipeline Dashboard",
    to: "/learning/pipeline",
    page: <LearningJobPipelineDashboard />,
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
];
