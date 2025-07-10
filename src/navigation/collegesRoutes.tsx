
import EnhancedColleges from "../pages/enhanced/Colleges";
import CollegeDetail from "../pages/colleges/CollegeDetail";
import CollegeCreationRequest from "../pages/colleges/CollegeCreationRequest";
import CollegeAdminDashboard from "../pages/colleges/CollegeAdminDashboard";
import CollegeChatAI from "../pages/colleges/CollegeChatAI";
import CollegeCompare from "../pages/colleges/CollegeCompare";
import CollegeApply from "../pages/colleges/CollegeApply";
import EnhancedCollegeCreation from "../pages/colleges/EnhancedCollegeCreation";

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
    title: "College Chat AI",
    to: "/colleges/:id/chat",
    page: <CollegeChatAI />,
  },
  {
    title: "College Compare",
    to: "/colleges/compare",
    page: <CollegeCompare />,
  },
  {
    title: "College Apply",
    to: "/colleges/:id/apply",
    page: <CollegeApply />,
  },
  {
    title: "Create College Request",
    to: "/colleges/create-request",
    page: <CollegeCreationRequest />,
  },
  {
    title: "Enhanced College Creation",
    to: "/colleges/create",
    page: <EnhancedCollegeCreation />,
  },
  {
    title: "College Admin Dashboard",
    to: "/colleges/admin-dashboard",
    page: <CollegeAdminDashboard />,
  },
];
