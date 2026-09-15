import { lazy } from "react";
import { Building2, Users, Share2, Briefcase, Globe } from "lucide-react";

// Company Profile & Promotion
const CompanyProfileEdit = lazy(() => import("../../pages/employer/profile/CompanyProfileEdit"));
const CompanyTeamManage = lazy(() => import("../../pages/employer/profile/CompanyTeamManage"));
const CompanySocials = lazy(() => import("../../pages/employer/profile/CompanySocials"));
const CompanyJobs = lazy(() => import("../../pages/employer/profile/CompanyJobs"));
const CompanyDetail = lazy(() => import("../../pages/companies/CompanyDetail"));


export const employerProfileRoutes = [
  // Company Profile & Promotion
  {
    title: "Company Profile Edit",
    to: "/employer/profile/edit",
    page: <CompanyProfileEdit />,
  },
  {
    title: "Company Team Manage",
    to: "/employer/profile/team",
    page: <CompanyTeamManage />,
  },
  {
    title: "Company Socials",
    to: "/employer/profile/socials",
    page: <CompanySocials />,
  },
  {
    title: "Company Jobs",
    to: "/employer/profile/jobs",
    page: <CompanyJobs />,
  },
  {
    title: "Company Public Profile",
    to: "/employer/profile/public/:id",
    page: <CompanyDetail />,
  },
];
