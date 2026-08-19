import { lazy, Suspense } from 'react';

// Main Education Command Center
const Colleges = lazy(() => import('../pages/Colleges'));
const CollegeDetail = lazy(() => import('../pages/colleges/CollegeDetail'));
const CollegeCompare = lazy(() => import('../pages/colleges/CollegeCompare'));
const CollegeChatAI = lazy(() => import('../pages/colleges/CollegeChatAI'));
const CollegeApply = lazy(() => import('../pages/colleges/CollegeApply'));
const CollegeAdminDashboard = lazy(() => import('../pages/colleges/CollegeAdminDashboard'));
const CollegeCreationRequest = lazy(() => import('../pages/colleges/CollegeCreationRequest'));
const EnhancedCollegeCreation = lazy(() => import('../pages/colleges/EnhancedCollegeCreation'));

// Global Education Intelligence Layer
const CareerPathway = lazy(() => import('../pages/colleges/CareerPathway'));
const GlobalPrograms = lazy(() => import('../pages/colleges/GlobalPrograms'));
const Scholarships = lazy(() => import('../pages/colleges/Scholarships'));

export const collegesRoutes = [
  {
    title: "Global Programs",
    to: "/colleges/global-programs",
    page: <Suspense fallback={null}><GlobalPrograms /></Suspense>,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Global Program Detail",
    to: "/colleges/global-programs/:slug",
    page: <Suspense fallback={null}><GlobalPrograms /></Suspense>,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Scholarships",
    to: "/colleges/scholarships",
    page: <Suspense fallback={null}><Scholarships /></Suspense>,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "Career Pathway",
    to: "/colleges/pathway",
    page: <Suspense fallback={null}><CareerPathway /></Suspense>,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "College Compare",
    to: "/colleges/compare",
    page: <Suspense fallback={null}><CollegeCompare /></Suspense>,
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

  // ── Main Colleges Page ──
  {
    title: "Colleges",
    to: "/colleges",
    page: <Suspense fallback={null}><Colleges /></Suspense>,
    isPublic: true,
    requiresAuth: false,
  },

  // ── Parametric Routes ──
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
    title: "College Apply",
    to: "/colleges/:id/apply",
    page: <Suspense fallback={null}><CollegeApply /></Suspense>,
  },
];
