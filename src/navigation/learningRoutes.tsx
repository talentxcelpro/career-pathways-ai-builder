
import { BookOpen } from "lucide-react";
import Learning from "../pages/Learning";
import CourseDetail from "../pages/learning/CourseDetail";
import MyCourses from "../pages/learning/MyCourses";
import LearningPaths from "../pages/learning/LearningPaths";
import LearningPathDetail from "../pages/learning/LearningPathDetail";
import Certificates from "../pages/learning/Certificates";

export const learningRoutes = [
  {
    title: "Learning",
    to: "/learning",
    icon: <BookOpen className="h-4 w-4" />,
    page: <Learning />,
  },
  {
    title: "Course Detail",
    to: "/learning/courses/:id",
    page: <CourseDetail />,
  },
  {
    title: "My Courses",
    to: "/learning/my-courses",
    page: <MyCourses />,
  },
  {
    title: "Learning Paths",
    to: "/learning/paths",
    page: <LearningPaths />,
  },
  {
    title: "Learning Path Detail",
    to: "/learning/paths/:id",
    page: <LearningPathDetail />,
  },
  {
    title: "Certificates",
    to: "/learning/certificates",
    page: <Certificates />,
  },
];
