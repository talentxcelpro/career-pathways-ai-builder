
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

export const learningRoutes = [
  {
    title: "Learning Hub",
    to: "/learning",
    icon: <BookOpen className="h-4 w-4" />,
    page: <LearningHub />,
    isPublic: true,
    requiresAdminAccess: false,
  },
  {
    title: "All Courses",
    to: "/learning/courses",
    page: <AllCourses />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Course Detail",
    to: "/learning/courses/:id",
    page: <CourseDetail />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Course Player",
    to: "/learning/courses/:id/player",
    page: <CoursePlayer />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "My Courses",
    to: "/learning/my-courses",
    page: <MyCoursesPage />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "My Progress",
    to: "/learning/my-progress",
    page: <MyProgress />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Learning Paths",
    to: "/learning/paths",
    page: <LearningPathsPage />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Learning Path Detail",
    to: "/learning/paths/:id",
    page: <LearningPathDetail />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Employment Bridge",
    to: "/learning/employment-bridge",
    page: <EmploymentBridgePage />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Job-Focused Courses",
    to: "/learning/job-focused-courses",
    page: <JobFocusedCourses />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Skill Market Trends",
    to: "/learning/skill-market-trends",
    page: <SkillMarketTrends />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Career Analytics",
    to: "/learning/career-analytics",
    page: <CareerAnalytics />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Skill Assessment",
    to: "/learning/skill-assessment",
    page: <SkillAssessment />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Career Roadmap",
    to: "/learning/career-roadmap",
    page: <CareerRoadmap />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Quick Learning",
    to: "/learning/quick-learn",
    page: <QuickLearningPage />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Community Learning",
    to: "/learning/community",
    page: <CommunityLearning />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Learning Search",
    to: "/learning/search",
    page: <LearningSearch />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Learning Analytics",
    to: "/learning/analytics",
    page: <LearningAnalyticsPage />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Certificates",
    to: "/learning/certificates",
    page: <Certificates />,
    isPublic: false,
    requiresAdminAccess: true,
  },
];
