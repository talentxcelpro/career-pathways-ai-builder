import { lazy } from "react";

const EnhancedColleges = lazy(() => import("../pages/enhanced/Colleges"));
const CollegeDetail = lazy(() => import("../pages/colleges/CollegeDetail"));
const CollegeCreationRequest = lazy(() => import("../pages/colleges/CollegeCreationRequest"));
const CollegeAdminCommandCenter = lazy(() => import("../pages/colleges/CollegeAdminDashboard"));
const CollegeChatAI = lazy(() => import("../pages/colleges/CollegeChatAI"));
const CollegeCompare = lazy(() => import("../pages/colleges/CollegeCompare"));
const CollegeApply = lazy(() => import("../pages/colleges/CollegeApply"));
const EnhancedCollegeCreation = lazy(() => import("../pages/colleges/EnhancedCollegeCreation"));


export const collegesRoutes = [
  {
    title: "Colleges",
    to: "/colleges",
    page: <EnhancedColleges />,
    isPublic: true,
    requiresAuth: false,
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
    title: "College Admin CommandCenter",
    to: "/colleges/admin-CommandCenter",
    page: <CollegeAdminCommandCenter />,
  },
];


