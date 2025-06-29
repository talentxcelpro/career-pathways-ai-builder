
import { Briefcase, MapPin, GraduationCap, Building, Code, DollarSign } from "lucide-react";
import JobsByLocation from "../pages/seo/JobsByLocation";
import JobsByRole from "../pages/seo/JobsByRole";
import JobsBySkill from "../pages/seo/JobsBySkill";
import CoursesByCategory from "../pages/seo/CoursesByCategory";
import CompaniesByLocation from "../pages/seo/CompaniesByLocation";
import SalaryGuide from "../pages/seo/SalaryGuide";

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

  // Skill-based job pages
  {
    title: "Jobs by Skill",
    to: "/jobs/skill/:skill",
    icon: <Code className="h-4 w-4" />,
    page: <JobsBySkill />,
  },
  
  // Course category pages
  {
    title: "Courses by Category",
    to: "/courses/category/:category",
    icon: <GraduationCap className="h-4 w-4" />,
    page: <CoursesByCategory />,
  },

  // Companies by location
  {
    title: "Companies by Location",
    to: "/companies/location/:location",
    icon: <Building className="h-4 w-4" />,
    page: <CompaniesByLocation />,
  },

  // Salary guides
  {
    title: "Salary Guide",
    to: "/salary/:role",
    icon: <DollarSign className="h-4 w-4" />,
    page: <SalaryGuide />,
  },
];
