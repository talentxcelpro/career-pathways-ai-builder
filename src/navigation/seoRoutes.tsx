
import { Briefcase, MapPin, GraduationCap } from "lucide-react";
import JobsByLocation from "../pages/seo/JobsByLocation";
import JobsByRole from "../pages/seo/JobsByRole";
import CoursesByCategory from "../pages/seo/CoursesByCategory";

export const seoRoutes = [
  // Location-based job pages
  {
    title: "Jobs by Location",
    to: "/jobs/location/:location",
    icon: <MapPin className="h-4 w-4" />,
    page: <JobsByLocation />,
  },
  
  // Role-based job pages
  {
    title: "Jobs by Role",
    to: "/jobs/role/:role",
    icon: <Briefcase className="h-4 w-4" />,
    page: <JobsByRole />,
  },
  
  // Course category pages
  {
    title: "Courses by Category",
    to: "/courses/category/:category",
    icon: <GraduationCap className="h-4 w-4" />,
    page: <CoursesByCategory />,
  },
];
