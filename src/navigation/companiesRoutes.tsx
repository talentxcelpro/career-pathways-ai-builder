
import Companies from "../pages/Companies";
import CompanyDetail from "../pages/companies/CompanyDetail";

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
    page: <CompanyDetail />,
    isPublic: true,
    requiresAdminAccess: false,
  },
  {
    title: "Company Detail by ID", 
    to: "/companies/:id",
    page: <CompanyDetail />,
    isPublic: true,
    requiresAdminAccess: false,
  },
];
