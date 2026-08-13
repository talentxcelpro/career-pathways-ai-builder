import { lazy, Suspense } from 'react';

const EnhancedCollegeCreation = lazy(() => import('../pages/colleges/EnhancedCollegeCreation'));
const CollegeApply = lazy(() => import('../pages/colleges/CollegeApply'));
const CollegeCompare = lazy(() => import('../pages/colleges/CollegeCompare'));
const CollegeChatAI = lazy(() => import('../pages/colleges/CollegeChatAI'));
const CollegeAdminDashboard = lazy(() => import('../pages/colleges/CollegeAdminDashboard'));
const CollegeCreationRequest = lazy(() => import('../pages/colleges/CollegeCreationRequest'));
const CollegeDetail = lazy(() => import('../pages/colleges/CollegeDetail'));
const EnhancedColleges = lazy(() => import('../pages/enhanced/Colleges'));


export const collegesRoutes = [
  {
    title: "Colleges",
    to: "/colleges",
    page: <Suspense fallback={null}><EnhancedColleges /></Suspense>,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "College Detail",
    to: "/colleges/:id",
    page: <Suspense fallback={null}><CollegeDetail /></Suspense>,
  },
  {
    title: "College Chat AI",
    to: "/colleges/:id/chat",
    page: <Suspense fallback={null}><CollegeChatAI /></Suspense>,
  },
  {
    title: "College Compare",
    to: "/colleges/compare",
    page: <Suspense fallback={null}><CollegeCompare /></Suspense>,
  },
  {
    title: "College Apply",
    to: "/colleges/:id/apply",
    page: <Suspense fallback={null}><CollegeApply /></Suspense>,
  },
  {
    title: "Create College Request",
    to: "/colleges/create-request",
    page: <Suspense fallback={null}><CollegeCreationRequest /></Suspense>,
  },
  {
    title: "Enhanced College Creation",
    to: "/colleges/create",
    page: <Suspense fallback={null}><EnhancedCollegeCreation /></Suspense>,
  },
  {
    title: "College Admin Dashboard",
    to: "/colleges/admin-dashboard",
    page: <Suspense fallback={null}><CollegeAdminDashboard /></Suspense>,
  },
];
