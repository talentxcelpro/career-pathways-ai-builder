
import { HomeIcon, Briefcase, Users, BookOpen, Network, Building2 } from "lucide-react";
import Index from "./pages/Index.jsx";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/jobs/JobDetails";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/companies/CompanyDetail";
import Learning from "./pages/Learning";
import NetworkPage from "./pages/Network";

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
    title: "Network",
    to: "/network",
    icon: <Network className="h-4 w-4" />,
    page: <NetworkPage />,
  },
];
