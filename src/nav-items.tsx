
import { HomeIcon, Briefcase, Users, BookOpen, Network, Building2, BarChart3, FileText, Wrench, Map, Building, Shield } from "lucide-react";
import Index from "./pages/Index.jsx";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/jobs/JobDetails";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/companies/CompanyDetail";
import Learning from "./pages/Learning";
import NetworkPage from "./pages/Network";
import Dashboard from "./pages/Dashboard";
import Resume from "./pages/Resume";
import Tools from "./pages/Tools";
import CareerMap from "./pages/CareerMap";
import Employer from "./pages/Employer";
import Admin from "./pages/Admin";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
    exact: true,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <Dashboard />,
  },
  {
    title: "Network",
    to: "/network",
    icon: <Network className="h-4 w-4" />,
    page: <NetworkPage />,
  },
  {
    title: "Jobs",
    to: "/jobs",
    icon: <Briefcase className="h-4 w-4" />,
    page: <Jobs />,
  },
  {
    title: "Job Details",
    to: "/jobs/:id",
    page: <JobDetails />,
    hideFromNav: true,
  },
  {
    title: "Resume",
    to: "/resume",
    icon: <FileText className="h-4 w-4" />,
    page: <Resume />,
  },
  {
    title: "Tools",
    to: "/tools",
    icon: <Wrench className="h-4 w-4" />,
    page: <Tools />,
  },
  {
    title: "Companies",
    to: "/companies",
    icon: <Building2 className="h-4 w-4" />,
    page: <Companies />,
  },
  {
    title: "Company Detail",
    to: "/companies/:id",
    page: <CompanyDetail />,
    hideFromNav: true,
  },
  {
    title: "Learning",
    to: "/learning",
    icon: <BookOpen className="h-4 w-4" />,
    page: <Learning />,
  },
  {
    title: "Career Map",
    to: "/career-map",
    icon: <Map className="h-4 w-4" />,
    page: <CareerMap />,
  },
  {
    title: "Employer",
    to: "/employer",
    icon: <Building className="h-4 w-4" />,
    page: <Employer />,
  },
  {
    title: "Admin",
    to: "/admin",
    icon: <Shield className="h-4 w-4" />,
    page: <Admin />,
  },
];
