
import { BookOpen } from "lucide-react";
import Learning from "../pages/Learning";
import LearningHub from "../pages/learning/LearningHub";
import AllCourses from "../pages/learning/AllCourses";
import CourseDetail from "../pages/learning/CourseDetail";
import MyCoursesPage from "../pages/learning/MyCoursesPage";
import LearningPathsPage from "../pages/learning/LearningPathsPage";
import LearningPathDetail from "../pages/learning/LearningPathDetail";
import Certificates from "../pages/learning/Certificates";
import EmploymentBridgePage from "../pages/learning/EmploymentBridgePage";
import QuickLearningPage from "../pages/learning/QuickLearningPage";
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
    title: "My Courses",
    to: "/learning/my-courses",
    page: <MyCoursesPage />,
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
    title: "Quick Learning",
    to: "/learning/quick-learn",
    page: <QuickLearningPage />,
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
