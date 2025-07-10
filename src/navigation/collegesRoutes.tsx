
import EnhancedColleges from "../pages/enhanced/Colleges";
import CollegeDetail from "../pages/colleges/CollegeDetail";
import CollegeCreationRequest from "../pages/colleges/CollegeCreationRequest";
import CollegeAdminDashboard from "../pages/colleges/CollegeAdminDashboard";

export const collegesRoutes = [
  {
    title: "Colleges",
    to: "/colleges",
    page: <EnhancedColleges />,
  },
  {
    title: "College Detail",
    to: "/colleges/:id",
    page: <CollegeDetail />,
  },
  {
    title: "Create College Request",
    to: "/colleges/create-request",
    page: <CollegeCreationRequest />,
  },
  {
    title: "College Admin Dashboard",
    to: "/colleges/admin-dashboard",
    page: <CollegeAdminDashboard />,
  },
];
