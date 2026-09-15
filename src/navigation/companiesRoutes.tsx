import { lazy } from "react";
const Companies = lazy(() => import("../pages/Companies"));
import { CompanyDetailPage } from "../components/performance/LazyRoutes";


export const companiesRoutes = [
  {
    title: "Companies",
    to: "/companies",
    page: <Companies />,
    isPublic: true,
    requiresAdminAccess: false,
  },
  {
    title: "Company Detail by Slug",
    to: "/company/:slug",
    page: <CompanyDetailPage />,
    isPublic: true,
    requiresAdminAccess: false,
  },
  {
    title: "Company Detail by ID", 
    to: "/companies/:id",
    page: <CompanyDetailPage />,
    isPublic: true,
    requiresAdminAccess: false,
  },
];
