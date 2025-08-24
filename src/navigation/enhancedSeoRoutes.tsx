import React from 'react';
import { 
  Briefcase, MapPin, Code, Building, GraduationCap, 
  Wrench, HelpCircle, BookOpen, School, Route 
} from "lucide-react";

// Enhanced hierarchical SEO route components
import { HierarchicalJobsPage } from "@/pages/seo/hierarchical/HierarchicalJobsPage";
import { HierarchicalNetworkPage } from "@/pages/seo/hierarchical/HierarchicalNetworkPage";
import { HierarchicalToolsPage } from "@/pages/seo/hierarchical/HierarchicalToolsPage";
import { HierarchicalServicesPage } from "@/pages/seo/hierarchical/HierarchicalServicesPage";
import { HierarchicalLearningPage } from "@/pages/seo/hierarchical/HierarchicalLearningPage";
import { HierarchicalCollegesPage } from "@/pages/seo/hierarchical/HierarchicalCollegesPage";
import { HierarchicalCareerMapPage } from "@/pages/seo/hierarchical/HierarchicalCareerMapPage";
import { HierarchicalCompaniesPage } from "@/pages/seo/hierarchical/HierarchicalCompaniesPage";

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
    page: <HierarchicalJobsPage />,
    seoPattern: "jobs-type-location"
  },
  
  // Jobs with role specification
  {
    title: "Jobs by Type, Location and Role", 
    to: "/jobs/:type/:location/:role",
    icon: <Briefcase className="h-4 w-4" />,
    page: <HierarchicalJobsPage />,
    seoPattern: "jobs-type-location-role"
  },
  
  // Remote jobs by role
  {
    title: "Remote Jobs by Role",
    to: "/jobs/remote/:role",
    icon: <Briefcase className="h-4 w-4" />,
    page: <HierarchicalJobsPage />,
    seoPattern: "jobs-remote-role"
  },
  
  // Jobs by skill and location
  {
    title: "Jobs by Skill and Location",
    to: "/jobs/skill/:skill/:location",
    icon: <Code className="h-4 w-4" />,
    page: <HierarchicalJobsPage />,
    seoPattern: "jobs-skill-location"
  },

  // ============= NETWORK ROUTES (200K+ pages) =============
  
  // Network posts by category
  {
    title: "Network Posts by Category",
    to: "/network/:category",
    icon: <MapPin className="h-4 w-4" />,
    page: <HierarchicalNetworkPage />,
    seoPattern: "network-category"
  },
  
  // Network posts by category and topic
  {
    title: "Network Posts by Category and Topic",
    to: "/network/:category/:topic",
    icon: <MapPin className="h-4 w-4" />,
    page: <HierarchicalNetworkPage />,
    seoPattern: "network-category-topic"
  },

  // ============= TOOLS ROUTES (200K+ pages) =============
  
  // Tools by category
  {
    title: "Tools by Category",
    to: "/tools/:category",
    icon: <Wrench className="h-4 w-4" />,
    page: <HierarchicalToolsPage />,
    seoPattern: "tools-category"
  },
  
  // Specific tools
  {
    title: "Specific Tool Pages",
    to: "/tools/:category/:toolName",
    icon: <Wrench className="h-4 w-4" />,
    page: <HierarchicalToolsPage />,
    seoPattern: "tools-category-tool"
  },
  
  // Resume builder templates
  {
    title: "Resume Builder Templates",
    to: "/tools/resume-builder/:template",
    icon: <Wrench className="h-4 w-4" />,
    page: <HierarchicalToolsPage />,
    seoPattern: "tools-resume-template"
  },

  // ============= SERVICES ROUTES (200K+ pages) =============
  
  // Services by type
  {
    title: "Services by Type",
    to: "/services/:type",
    icon: <HelpCircle className="h-4 w-4" />,
    page: <HierarchicalServicesPage />,
    seoPattern: "services-type"
  },
  
  // Specific service pages
  {
    title: "Specific Service Pages",
    to: "/services/:type/:serviceName",
    icon: <HelpCircle className="h-4 w-4" />,
    page: <HierarchicalServicesPage />,
    seoPattern: "services-type-service"
  },
  
  // Resume writing services with templates
  {
    title: "Resume Writing Service Templates",
    to: "/services/resume-writing/:template",
    icon: <HelpCircle className="h-4 w-4" />,
    page: <HierarchicalServicesPage />,
    seoPattern: "services-resume-template"
  },

  // ============= LEARNING ROUTES (200K+ pages) =============
  
  // Learning by category
  {
    title: "Learning by Category",
    to: "/learning/:category",
    icon: <BookOpen className="h-4 w-4" />,
    page: <HierarchicalLearningPage />,
    seoPattern: "learning-category"
  },
  
  // Specific courses
  {
    title: "Specific Course Pages",
    to: "/learning/:category/:courseName",
    icon: <BookOpen className="h-4 w-4" />,
    page: <HierarchicalLearningPage />,
    seoPattern: "learning-category-course"
  },
  
  // Learning paths by skill
  {
    title: "Learning Paths by Skill",
    to: "/learning/paths/:skill",
    icon: <BookOpen className="h-4 w-4" />,
    page: <HierarchicalLearningPage />,
    seoPattern: "learning-paths-skill"
  },

  // ============= COLLEGES ROUTES (200K+ pages) =============
  
  // Colleges by location
  {
    title: "Colleges by Location",
    to: "/colleges/:location",
    icon: <School className="h-4 w-4" />,
    page: <HierarchicalCollegesPage />,
    seoPattern: "colleges-location"
  },
  
  // Specific college pages
  {
    title: "Specific College Pages",
    to: "/colleges/:location/:collegeName",
    icon: <School className="h-4 w-4" />,
    page: <HierarchicalCollegesPage />,
    seoPattern: "colleges-location-college"
  },
  
  // College courses by field
  {
    title: "College Courses by Field",
    to: "/colleges/:location/:field",
    icon: <School className="h-4 w-4" />,
    page: <HierarchicalCollegesPage />,
    seoPattern: "colleges-location-field"
  },

  // ============= CAREER MAP ROUTES (200K+ pages) =============
  
  // Career paths by industry
  {
    title: "Career Paths by Industry",
    to: "/career-map/:industry",
    icon: <Route className="h-4 w-4" />,
    page: <HierarchicalCareerMapPage />,
    seoPattern: "career-map-industry"
  },
  
  // Specific career paths
  {
    title: "Specific Career Path Pages",
    to: "/career-map/:industry/:path",
    icon: <Route className="h-4 w-4" />,
    page: <HierarchicalCareerMapPage />,
    seoPattern: "career-map-industry-path"
  },
  
  // Career progression by role
  {
    title: "Career Progression by Role",
    to: "/career-map/progression/:role",
    icon: <Route className="h-4 w-4" />,
    page: <HierarchicalCareerMapPage />,
    seoPattern: "career-map-progression-role"
  },

  // ============= COMPANIES ROUTES (Enhanced) =============
  
  // Companies by location and industry
  {
    title: "Companies by Location and Industry",
    to: "/companies/:location/:industry",
    icon: <Building className="h-4 w-4" />,
    page: <HierarchicalCompaniesPage />,
    seoPattern: "companies-location-industry"
  },
  
  // Companies by size and location
  {
    title: "Companies by Size and Location",
    to: "/companies/size/:size/:location",
    icon: <Building className="h-4 w-4" />,
    page: <HierarchicalCompaniesPage />,
    seoPattern: "companies-size-location"
  },

  // ============= EMPLOYER ROUTES (Enhanced) =============
  
  // Employer resources by topic
  {
    title: "Employer Resources by Topic",
    to: "/employer/resources/:topic",
    icon: <Building className="h-4 w-4" />,
    page: <HierarchicalJobsPage />, // Reuse with employer context
    seoPattern: "employer-resources-topic"
  },
];