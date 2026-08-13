import { lazy, Suspense } from 'react';
import { NavItem } from "../types/nav-item";

const AssessmentResults = lazy(() => import('../pages/assessments/AssessmentResults'));
const AssessmentTaking = lazy(() => import('../pages/assessments/AssessmentTaking'));
const AssessmentsPage = lazy(() => import('../pages/assessments/index'));

export const assessmentRoutes: NavItem[] = [
  {
    title: "Assessments",
    to: "/assessments",
    page: <Suspense fallback={null}><AssessmentsPage /></Suspense>,
    requiresAuth: false
  },
  {
    title: "Take Assessment",
    to: "/assessments/:assessmentId/take/:attemptId",
    page: <Suspense fallback={null}><AssessmentTaking /></Suspense>,
    isPublic: true
  },
  {
    title: "Assessment Results",
    to: "/assessments/:assessmentId/results/:attemptId",
    page: <Suspense fallback={null}><AssessmentResults /></Suspense>,
    isPublic: true
  }
];