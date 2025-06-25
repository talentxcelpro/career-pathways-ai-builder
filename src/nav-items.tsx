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

// Import auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Import network pages
import People from "./pages/network/People";
import Posts from "./pages/network/Posts";
import Groups from "./pages/network/Groups";
import Requests from "./pages/network/Requests";
import Events from "./pages/network/Events";

// Import profile pages
import ProfileEdit from "./pages/profile/ProfileEdit";
import ProfileResume from "./pages/profile/ProfileResume";
import ProfileCoverLetter from "./pages/profile/ProfileCoverLetter";
import ProfilePreferences from "./pages/profile/ProfilePreferences";
import ProfileSettings from "./pages/profile/ProfileSettings";
import ProfileMedia from "./pages/profile/ProfileMedia";
import ProfileAnalytics from "./pages/profile/ProfileAnalytics";
import ProfileDocuments from "./pages/profile/ProfileDocuments";

// Import route modules
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
  
  // Main navigation
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
  {
    title: "Login",
    to: "/login",
    page: <Login />,
  },
  {
    title: "Register",
    to: "/register",
    page: <Register />,
  },
  
  // Catch-all for 404
  {
    title: "Not Found",
    to: "*",
    page: <NotFound />,
  },
];
