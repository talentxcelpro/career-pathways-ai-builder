
import { BookOpen } from "lucide-react";
import Learning from "../pages/Learning";
import CourseDetail from "../pages/learning/CourseDetail";
import MyCourses from "../pages/learning/MyCourses";
import LearningPaths from "../pages/learning/LearningPaths";

export const learningRoutes = [
  {
    title: "Learning",
    to: "/learning",
    icon: <BookOpen className="h-4 w-4" />,
    page: <Learning />,
  },
  {
    title: "Course Detail",
    to: "/learning/:id",
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
];
