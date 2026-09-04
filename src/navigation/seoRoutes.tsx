
import { lazy, Suspense } from "react";
import { Briefcase, MapPin, GraduationCap, Building, Code, DollarSign, Users, FileText } from "lucide-react";

const JobsByLocation = lazy(() => import("../pages/seo/JobsByLocation"));
const JobsByRole = lazy(() => import("../pages/seo/JobsByRole"));
const JobsBySkill = lazy(() => import("../pages/seo/JobsBySkill"));
const CoursesByCategory = lazy(() => import("../pages/seo/CoursesByCategory"));
const CompaniesByLocation = lazy(() => import("../pages/seo/CompaniesByLocation"));
const SalaryGuide = lazy(() => import("../pages/seo/SalaryGuide"));
const SalaryGuidePage = lazy(() => import("../pages/seo/SalaryGuidePage"));
const IndustryJobs = lazy(() => import("../pages/seo/IndustryJobs"));
const ComprehensiveSEOGenerator = lazy(() => import("../components/seo/ComprehensiveSEOGenerator").then(m => ({ default: m.ComprehensiveSEOGenerator })));

const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={null}>{children}</Suspense>
);

export const seoRoutes = [
  // Location-based job pages
  {
    title: "Jobs by Location",
    to: "/jobs/location/:location",
    icon: <MapPin className="h-4 w-4" />,
    page: <S><JobsByLocation /></S>,
  },
  
  // Role-based job pages
  {
    title: "Jobs by Role",
    to: "/jobs/role/:role",
    icon: <Briefcase className="h-4 w-4" />,
    page: <S><JobsByRole /></S>,
  },

  // Skill-based job pages
  {
    title: "Jobs by Skill",
    to: "/jobs/skill/:skill",
    icon: <Code className="h-4 w-4" />,
    page: <S><JobsBySkill /></S>,
  },
  
  // Course category pages
  {
    title: "Courses by Category",
    to: "/courses/category/:category",
    icon: <GraduationCap className="h-4 w-4" />,
    page: <S><CoursesByCategory /></S>,
  },

  // Companies by location
  {
    title: "Companies by Location",
    to: "/companies/location/:location",
    icon: <Building className="h-4 w-4" />,
    page: <S><CompaniesByLocation /></S>,
  },

  // Salary guides
  {
    title: "Salary Guide",
    to: "/salary/:role",
    icon: <DollarSign className="h-4 w-4" />,
    page: <S><SalaryGuide /></S>,
  },
  
  // Advanced salary guides with location
  {
    title: "Salary Guide by Location",
    to: "/salary/:role/:location",
    icon: <DollarSign className="h-4 w-4" />,
    page: <S><SalaryGuidePage /></S>,
  },
  
  // Industry-based job pages
  {
    title: "Jobs by Industry",
    to: "/industry/:industry",
    icon: <Building className="h-4 w-4" />,
    page: <S><IndustryJobs /></S>,
  },
  
  // Combined job pages (role + location)
  {
    title: "Jobs by Role and Location",
    to: "/jobs/:role/in/:location",
    icon: <Briefcase className="h-4 w-4" />,
    page: <S><JobsByRole /></S>,
  },
  
  // Skill-based jobs by location
  {
    title: "Skill Jobs by Location",
    to: "/jobs/:skill/jobs/in/:location",
    icon: <Code className="h-4 w-4" />,
    page: <S><JobsBySkill /></S>,
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
