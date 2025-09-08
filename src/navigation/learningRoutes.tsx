
import { BookOpen } from "lucide-react";
import Learning from "../pages/Learning";
import CourseDetail from "../pages/learning/CourseDetail";
import MyCourses from "../pages/learning/MyCourses";
import LearningPaths from "../pages/learning/LearningPaths";
import LearningPathDetail from "../pages/learning/LearningPathDetail";
import Certificates from "../pages/learning/Certificates";
import { LearningEmploymentBridge } from "../components/learning/LearningEmploymentBridge";

export const learningRoutes = [
  {
    title: "Learning",
    to: "/learning",
    icon: <BookOpen className="h-4 w-4" />,
    page: <Learning />,
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
    page: <MyCourses />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Learning Paths",
    to: "/learning/paths",
    page: <LearningPaths />,
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
    title: "Certificates",
    to: "/learning/certificates",
    page: <Certificates />,
    isPublic: false,
    requiresAdminAccess: true,
  },
  {
    title: "Learning-Employment Bridge",
    to: "/learning/employment-bridge",
    page: <LearningEmploymentBridge />,
    isPublic: false,
    requiresAdminAccess: true,
  },
];
