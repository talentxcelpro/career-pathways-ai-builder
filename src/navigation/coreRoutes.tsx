
import { HomeIcon, Settings } from "lucide-react";
import { LandingPage } from "../components/landing/LandingPage";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Help from "../pages/Help";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import Terms from "../pages/Terms";
import Blog from "../pages/Blog";
import NotFound from "../pages/NotFound";
import SEOAdmin from "../pages/admin/SEOAdmin";

export const coreRoutes = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <LandingPage />,
    exact: true,
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
    to: "/privacy",
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
    title: "Not Found",
    to: "*",
    page: <NotFound />,
  },
];
