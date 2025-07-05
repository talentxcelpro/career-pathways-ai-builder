
import Companies from "../pages/Companies";
import CompanyDetail from "../pages/companies/CompanyDetail";

export const companiesRoutes = [
  {
    title: "Companies",
    to: "/companies",
    page: <Companies />,
  },
  {
    title: "Company Detail by Slug",
    to: "/:slug",
    page: <CompanyDetail />,
  },
  {
    title: "Company Detail by ID",
    to: "/companies/:id",
    page: <CompanyDetail />,
  },
];
