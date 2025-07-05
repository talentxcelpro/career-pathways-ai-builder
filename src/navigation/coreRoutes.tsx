import { HomeIcon, Settings, BarChart3 } from "lucide-react";
import { LandingPage } from "../components/landing/LandingPage";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Help from "../pages/Help";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import Terms from "../pages/Terms";
import Blog from "../pages/Blog";
import NotFound from "../pages/NotFound";
import Dashboard from "../pages/Dashboard";
import SEOAdmin from "../pages/admin/SEOAdmin";
import AdvancedSEOAdmin from "../pages/admin/AdvancedSEOAdmin";
import Phase5SEOAdmin from "../pages/admin/Phase5SEOAdmin";
import AdminDashboard from "../pages/admin/AdminDashboard";

export const coreRoutes = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <LandingPage />,
    exact: true,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <Dashboard />,
  },
  {
    title: "Admin Dashboard",
    to: "/admin",
    icon: <Settings className="h-4 w-4" />,
    page: <AdminDashboard />,
  },
  {
    title: "About",
    to: "/about",
    page: <About />,
  },
  {
    title: "Contact",
    to: "/contact",
    page: <Contact />,
  },
  {
    title: "Help",
    to: "/help",
    page: <Help />,
  },
  {
    title: "Privacy Policy",
    to: "/privacypolicy",
    page: <PrivacyPolicy />,
  },
  {
    title: "Terms of Service",
    to: "/terms",
    page: <Terms />,
  },
  {
    title: "Blog",
    to: "/blog",
    page: <Blog />,
  },
  {
    title: "SEO Admin",
    to: "/admin/seo",
    icon: <Settings className="h-4 w-4" />,
    page: <SEOAdmin />,
  },
  {
    title: "Advanced SEO Admin",
    to: "/admin/seo/advanced",
    icon: <Settings className="h-4 w-4" />,
    page: <AdvancedSEOAdmin />,
  },
  {
    title: "Phase 5 SEO Admin",
    to: "/admin/seo/phase5",
    icon: <Settings className="h-4 w-4" />,
    page: <Phase5SEOAdmin />,
  },
  {
    title: "Not Found",
    to: "*",
    page: <NotFound />,
  },
];
