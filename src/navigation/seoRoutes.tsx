
import { Briefcase, MapPin, GraduationCap, Building, Code, DollarSign, Users, FileText } from "lucide-react";
import JobsByLocation from "../pages/seo/JobsByLocation";
import JobsByRole from "../pages/seo/JobsByRole";
import JobsBySkill from "../pages/seo/JobsBySkill";
import CoursesByCategory from "../pages/seo/CoursesByCategory";
import CompaniesByLocation from "../pages/seo/CompaniesByLocation";
import SalaryGuide from "../pages/seo/SalaryGuide";
import SalaryGuidePage from "../pages/seo/SalaryGuidePage";
import IndustryJobs from "../pages/seo/IndustryJobs";
import { ComprehensiveSEOGenerator } from "../components/seo/ComprehensiveSEOGenerator";

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
  
  // Advanced salary guides with location
  {
    title: "Salary Guide by Location",
    to: "/salary/:role/:location",
    icon: <DollarSign className="h-4 w-4" />,
    page: <SalaryGuidePage />,
  },
  
  // Industry-based job pages
  {
    title: "Jobs by Industry",
    to: "/industry/:industry",
    icon: <Building className="h-4 w-4" />,
    page: <IndustryJobs />,
  },
  
  // Combined job pages (role + location)
  {
    title: "Jobs by Role and Location",
    to: "/jobs/:role/in/:location",
    icon: <Briefcase className="h-4 w-4" />,
    page: <JobsByRole />,
  },
  
  // Skill-based jobs by location
  {
    title: "Skill Jobs by Location",
    to: "/jobs/:skill/jobs/in/:location",
    icon: <Code className="h-4 w-4" />,
    page: <JobsBySkill />,
  },

  // User/Profile SEO Pages
  {
    title: "User Profiles",
    to: "/users/:userId",
    icon: <Users className="h-4 w-4" />,
    page: <ComprehensiveSEOGenerator pageType="user" />,
  },
  {
    title: "Professional Profiles",
    to: "/professionals/:name",
    icon: <Users className="h-4 w-4" />,
    page: <ComprehensiveSEOGenerator pageType="user" />,
  },
  {
    title: "Expert Profiles",
    to: "/experts/:name",
    icon: <Users className="h-4 w-4" />,
    page: <ComprehensiveSEOGenerator pageType="user" />,
  },

  // Job SEO Pages with multiple patterns
  {
    title: "Career Opportunities",
    to: "/careers/:slug",
    icon: <Briefcase className="h-4 w-4" />,
    page: <ComprehensiveSEOGenerator pageType="job" />,
  },
  {
    title: "Job Opportunities",
    to: "/opportunities/:slug",
    icon: <Briefcase className="h-4 w-4" />,
    page: <ComprehensiveSEOGenerator pageType="job" />,
  },
  {
    title: "Job Positions",
    to: "/positions/:slug",
    icon: <Briefcase className="h-4 w-4" />,
    page: <ComprehensiveSEOGenerator pageType="job" />,
  },

  // Company SEO Pages
  {
    title: "Employers",
    to: "/employers/:name",
    icon: <Building className="h-4 w-4" />,
    page: <ComprehensiveSEOGenerator pageType="company" />,
  },
  {
    title: "Organizations",
    to: "/organizations/:name",
    icon: <Building className="h-4 w-4" />,
    page: <ComprehensiveSEOGenerator pageType="company" />,
  },

  // Content SEO Pages
  {
    title: "Articles",
    to: "/articles/:slug",
    icon: <FileText className="h-4 w-4" />,
    page: <ComprehensiveSEOGenerator pageType="post" />,
  },
  {
    title: "Content",
    to: "/content/:postId",
    icon: <FileText className="h-4 w-4" />,
    page: <ComprehensiveSEOGenerator pageType="post" />,
  },

  // Additional skill and location combinations
  {
    title: "Skill Experts",
    to: "/experts/skill/:skill",
    icon: <Code className="h-4 w-4" />,
    page: <ComprehensiveSEOGenerator pageType="skill" />,
  },
  {
    title: "Skill Professionals",
    to: "/professionals/skill/:skill",
    icon: <Code className="h-4 w-4" />,
    page: <ComprehensiveSEOGenerator pageType="skill" />,
  },

  // Learning and training
  {
    title: "Learning Categories",
    to: "/learning/category/:category",
    icon: <GraduationCap className="h-4 w-4" />,
    page: <ComprehensiveSEOGenerator pageType="category" />,
  },
  {
    title: "Training Categories",
    to: "/training/category/:category",
    icon: <GraduationCap className="h-4 w-4" />,
    page: <ComprehensiveSEOGenerator pageType="category" />,
  },

  // Tool and resource pages
  {
    title: "Career Tools",
    to: "/tools/:tool",
    icon: <Code className="h-4 w-4" />,
    page: <ComprehensiveSEOGenerator pageType="tool" />,
  },
];
