import { lazy, Suspense } from "react";
import { CompanyDetailPage } from "../../components/performance/LazyRoutes";

// Company Profile & Promotion (Lazy loaded to reduce initial bundle)
const CompanyProfileEdit = lazy(() => import("../../pages/employer/profile/CompanyProfileEdit"));
const CompanyTeamManage = lazy(() => import("../../pages/employer/profile/CompanyTeamManage"));
const CompanySocials = lazy(() => import("../../pages/employer/profile/CompanySocials"));
const CompanyJobs = lazy(() => import("../../pages/employer/profile/CompanyJobs"));

export const employerProfileRoutes = [
  // Company Profile & Promotion
  {
    title: "Company Profile Edit",
    to: "/employer/profile/edit",
    page: <Suspense fallback={null}><CompanyProfileEdit /></Suspense>,
  },
  {
    title: "Company Team Manage",
    to: "/employer/profile/team",
    page: <Suspense fallback={null}><CompanyTeamManage /></Suspense>,
  },
  {
    title: "Company Socials",
    to: "/employer/profile/socials",
    page: <Suspense fallback={null}><CompanySocials /></Suspense>,
  },
  {
    title: "Company Jobs",
    to: "/employer/profile/jobs",
    page: <Suspense fallback={null}><CompanyJobs /></Suspense>,
  },
  {
    title: "Company Public Profile",
    to: "/employer/profile/public/:id",
    page: <Suspense fallback={null}><CompanyDetailPage /></Suspense>,
  },
];
