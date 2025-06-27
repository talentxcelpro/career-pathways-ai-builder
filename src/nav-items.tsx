import { HomeIcon, User, Briefcase, GraduationCap, Users, Building2, Wrench, BrainCircuit, MapPin, School, Building } from "lucide-react";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Jobs from "./pages/Jobs";
import Learning from "./pages/Learning";
import Network from "./pages/Network";
import Tools from "./pages/Tools";
import Dashboard from "./pages/Dashboard";
import ResumeBuilder from "./pages/ResumeBuilder";
import NotFound from "./pages/NotFound";
import CareerMap from "./pages/CareerMap";
import Marketplace from "./pages/Marketplace";
import Colleges from "./pages/Colleges";
import Companies from "./pages/Companies";

// Import route modules
import { authRoutes } from "./navigation/authRoutes";
import { profileRoutes } from "./navigation/profileRoutes";
import { networkRoutes } from "./navigation/networkRoutes";
import { jobRoutes } from "./navigation/jobRoutes";
import { learningRoutes } from "./navigation/learningRoutes";
import { toolsRoutes } from "./navigation/toolsRoutes";
import { aiRoutes } from "./navigation/aiRoutes";
import { careerMapRoutes } from "./navigation/careerMapRoutes";
import { marketplaceRoutes } from "./navigation/marketplaceRoutes";
import { collegesRoutes } from "./navigation/collegesRoutes";
import { companiesRoutes } from "./navigation/companiesRoutes";
import { employerRoutes } from "./navigation/employerRoutes";

export const navItems = [
  // Core routes
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <User className="h-4 w-4" />,
    page: <Dashboard />,
  },
  {
    title: "Resume Builder",
    to: "/resume-builder",
    icon: <BrainCircuit className="h-4 w-4" />,
    page: <ResumeBuilder />,
  },
  
  // Main navigation modules
  ...jobRoutes,
  ...networkRoutes,
  ...learningRoutes,
  ...toolsRoutes,
  ...aiRoutes,
  ...careerMapRoutes,
  ...marketplaceRoutes,
  
  // Employer routes
  ...employerRoutes,
  
  // Other main routes
  {
    title: "Colleges",
    to: "/colleges",
    icon: <School className="h-4 w-4" />,
    page: <Colleges />,
  },
  ...collegesRoutes,
  
  {
    title: "Companies",
    to: "/companies",
    icon: <Building className="h-4 w-4" />,
    page: <Companies />,
  },
  ...companiesRoutes,
  
  // Profile routes
  {
    title: "Profile",
    to: "/profile",
    icon: <User className="h-4 w-4" />,
    page: <Profile />,
  },
  ...profileRoutes,
  
  // Auth routes
  ...authRoutes,
  
  // Catch-all for 404
  {
    title: "Not Found",
    to: "*",
    page: <NotFound />,
  },
];
