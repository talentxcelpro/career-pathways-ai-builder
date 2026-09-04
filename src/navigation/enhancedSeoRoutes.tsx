import React from 'react';
import { 
  Briefcase, MapPin, Code, Building, GraduationCap, 
  Wrench, HelpCircle, BookOpen, School, Route 
} from "lucide-react";

// Enhanced hierarchical SEO route components
const HierarchicalJobsPage = React.lazy(() => import("@/pages/seo/hierarchical/HierarchicalJobsPage").then(m => ({ default: m.HierarchicalJobsPage })));
const HierarchicalNetworkPage = React.lazy(() => import("@/pages/seo/hierarchical/HierarchicalNetworkPage").then(m => ({ default: m.HierarchicalNetworkPage })));
const HierarchicalToolsPage = React.lazy(() => import("@/pages/seo/hierarchical/HierarchicalToolsPage").then(m => ({ default: m.HierarchicalToolsPage })));
const HierarchicalServicesPage = React.lazy(() => import("@/pages/seo/hierarchical/HierarchicalServicesPage").then(m => ({ default: m.HierarchicalServicesPage })));
const HierarchicalLearningPage = React.lazy(() => import("@/pages/seo/hierarchical/HierarchicalLearningPage").then(m => ({ default: m.HierarchicalLearningPage })));
const HierarchicalCollegesPage = React.lazy(() => import("@/pages/seo/hierarchical/HierarchicalCollegesPage").then(m => ({ default: m.HierarchicalCollegesPage })));
const HierarchicalCareerMapPage = React.lazy(() => import("@/pages/seo/hierarchical/HierarchicalCareerMapPage").then(m => ({ default: m.HierarchicalCareerMapPage })));
const HierarchicalCompaniesPage = React.lazy(() => import("@/pages/seo/hierarchical/HierarchicalCompaniesPage").then(m => ({ default: m.HierarchicalCompaniesPage })));

const S = ({ children }: { children: React.ReactNode }) => (
  <React.Suspense fallback={null}>{children}</React.Suspense>
);

/**
 * Enhanced SEO Routes for 2M Pages
 * Implementing hierarchical URL structure:
 * - /jobs/{type}/{location}/{role}
 * - /network/{category}/{topic}
 * - /tools/{category}/{tool-name}
 * - /services/{type}/{service-name}
 * - /learning/{category}/{course-name}
 * - /colleges/{location}/{college-name}
 * - /career-map/{industry}/{path}
 * - /companies/{location}/{industry}
 */

export const enhancedSeoRoutes = [
  // ============= JOBS ROUTES (400K+ pages) =============
  
  // Basic job category pages
  {
    title: "Jobs by Type and Location",
    to: "/jobs/:type/:location",
    icon: <Briefcase className="h-4 w-4" />,
    page: <S><HierarchicalJobsPage /></S>,
    seoPattern: "jobs-type-location"
  },
  
  // Jobs with role specification
  {
    title: "Jobs by Type, Location and Role", 
    to: "/jobs/:type/:location/:role",
    icon: <Briefcase className="h-4 w-4" />,
    page: <S><HierarchicalJobsPage /></S>,
    seoPattern: "jobs-type-location-role"
  },
  
  // Remote jobs by role
  {
    title: "Remote Jobs by Role",
    to: "/jobs/remote/:role",
    icon: <Briefcase className="h-4 w-4" />,
    page: <S><HierarchicalJobsPage /></S>,
    seoPattern: "jobs-remote-role"
  },
  
  // Jobs by skill and location
  {
    title: "Jobs by Skill and Location",
    to: "/jobs/skill/:skill/:location",
    icon: <Code className="h-4 w-4" />,
    page: <S><HierarchicalJobsPage /></S>,
    seoPattern: "jobs-skill-location"
  },

  // ============= NETWORK ROUTES (200K+ pages) =============
  
  // Network posts by category
  {
    title: "Network Posts by Category",
    to: "/network/:category",
    icon: <MapPin className="h-4 w-4" />,
    page: <S><HierarchicalNetworkPage /></S>,
    seoPattern: "network-category"
  },
  
  // Network posts by category and topic
  {
    title: "Network Posts by Category and Topic",
    to: "/network/:category/:topic",
    icon: <MapPin className="h-4 w-4" />,
    page: <S><HierarchicalNetworkPage /></S>,
    seoPattern: "network-category-topic"
  },

  // ============= TOOLS ROUTES (200K+ pages) =============
  
  // Tools by category
  {
    title: "Tools by Category",
    to: "/tools/:category",
    icon: <Wrench className="h-4 w-4" />,
    page: <S><HierarchicalToolsPage /></S>,
    seoPattern: "tools-category"
  },
  
  // Specific tools
  {
    title: "Specific Tool Pages",
    to: "/tools/:category/:toolName",
    icon: <Wrench className="h-4 w-4" />,
    page: <S><HierarchicalToolsPage /></S>,
    seoPattern: "tools-category-tool"
  },
  
  // Resume builder templates
  {
    title: "Resume Builder Templates",
    to: "/tools/resume-builder/:template",
    icon: <Wrench className="h-4 w-4" />,
    page: <S><HierarchicalToolsPage /></S>,
    seoPattern: "tools-resume-template"
  },

  // ============= SERVICES ROUTES (200K+ pages) =============
  
  // Services by type
  {
    title: "Services by Type",
    to: "/services/:type",
    icon: <HelpCircle className="h-4 w-4" />,
    page: <S><HierarchicalServicesPage /></S>,
    seoPattern: "services-type"
  },
  
  // Specific service pages
  {
    title: "Specific Service Pages",
    to: "/services/:type/:serviceName",
    icon: <HelpCircle className="h-4 w-4" />,
    page: <S><HierarchicalServicesPage /></S>,
    seoPattern: "services-type-service"
  },
  
  // Resume writing services with templates
  {
    title: "Resume Writing Service Templates",
    to: "/services/resume-writing/:template",
    icon: <HelpCircle className="h-4 w-4" />,
    page: <S><HierarchicalServicesPage /></S>,
    seoPattern: "services-resume-template"
  },

  // ============= LEARNING ROUTES (200K+ pages) =============
  
  // Learning by category
  {
    title: "Learning by Category",
    to: "/learning/:category",
    icon: <BookOpen className="h-4 w-4" />,
    page: <S><HierarchicalLearningPage /></S>,
    seoPattern: "learning-category"
  },
  
  // Specific courses
  {
    title: "Specific Course Pages",
    to: "/learning/:category/:courseName",
    icon: <BookOpen className="h-4 w-4" />,
    page: <S><HierarchicalLearningPage /></S>,
    seoPattern: "learning-category-course"
  },
  
  // Learning paths by skill
  {
    title: "Learning Paths by Skill",
    to: "/learning/paths/:skill",
    icon: <BookOpen className="h-4 w-4" />,
    page: <S><HierarchicalLearningPage /></S>,
    seoPattern: "learning-paths-skill"
  },

  // ============= COLLEGES ROUTES (200K+ pages) =============
  
  // Colleges by location
  {
    title: "Colleges by Location",
    to: "/colleges/:location",
    icon: <School className="h-4 w-4" />,
    page: <S><HierarchicalCollegesPage /></S>,
    seoPattern: "colleges-location"
  },
  
  // Specific college pages
  {
    title: "Specific College Pages",
    to: "/colleges/:location/:collegeName",
    icon: <School className="h-4 w-4" />,
    page: <S><HierarchicalCollegesPage /></S>,
    seoPattern: "colleges-location-college"
  },
  
  // College courses by field
  {
    title: "College Courses by Field",
    to: "/colleges/:location/:field",
    icon: <School className="h-4 w-4" />,
    page: <S><HierarchicalCollegesPage /></S>,
    seoPattern: "colleges-location-field"
  },

  // ============= CAREER MAP ROUTES (200K+ pages) =============
  
  // Career paths by industry
  {
    title: "Career Paths by Industry",
    to: "/career-map/:industry",
    icon: <Route className="h-4 w-4" />,
    page: <S><HierarchicalCareerMapPage /></S>,
    seoPattern: "career-map-industry"
  },
  
  // Specific career paths
  {
    title: "Specific Career Path Pages",
    to: "/career-map/:industry/:path",
    icon: <Route className="h-4 w-4" />,
    page: <S><HierarchicalCareerMapPage /></S>,
    seoPattern: "career-map-industry-path"
  },
  
  // Career progression by role
  {
    title: "Career Progression by Role",
    to: "/career-map/progression/:role",
    icon: <Route className="h-4 w-4" />,
    page: <S><HierarchicalCareerMapPage /></S>,
    seoPattern: "career-map-progression-role"
  },

  // ============= COMPANIES ROUTES (Enhanced) =============
  
  // Companies by location and industry
  {
    title: "Companies by Location and Industry",
    to: "/companies/:location/:industry",
    icon: <Building className="h-4 w-4" />,
    page: <S><HierarchicalCompaniesPage /></S>,
    seoPattern: "companies-location-industry"
  },
  
  // Companies by size and location
  {
    title: "Companies by Size and Location",
    to: "/companies/size/:size/:location",
    icon: <Building className="h-4 w-4" />,
    page: <S><HierarchicalCompaniesPage /></S>,
    seoPattern: "companies-size-location"
  },

  // ============= EMPLOYER ROUTES (Enhanced) =============
  
  // Employer resources by topic
  {
    title: "Employer Resources by Topic",
    to: "/employer/resources/:topic",
    icon: <Building className="h-4 w-4" />,
    page: <S><HierarchicalJobsPage /></S>, // Reuse with employer context
    seoPattern: "employer-resources-topic"
  },
];