
import { HomeIcon, TrendingUp, FileText } from "lucide-react";
import Index from "../pages/Index";
import Dashboard from "../pages/Dashboard";
import ResumeBuilder from "../pages/ResumeBuilder";
import NotFound from "../pages/NotFound";

export const coreRoutes = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <TrendingUp className="h-4 w-4" />,
    page: <Dashboard />,
  },
  {
    title: "Resume Builder",
    to: "/resume-builder",
    icon: <FileText className="h-4 w-4" />,
    page: <ResumeBuilder />,
  },
  // Catch all 404
  {
    title: "Not Found",
    to: "*",
    page: <NotFound />,
  },
];
