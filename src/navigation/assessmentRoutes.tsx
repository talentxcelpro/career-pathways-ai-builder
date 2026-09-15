import { lazy } from "react";
import { NavItem } from "../types/nav-item";
const AssessmentsPage = lazy(() => import("../pages/assessments/index"));
const AssessmentTaking = lazy(() => import("../pages/assessments/AssessmentTaking"));
const AssessmentResults = lazy(() => import("../pages/assessments/AssessmentResults"));


export const assessmentRoutes: NavItem[] = [
  {
    title: "Assessments",
    to: "/assessments",
    page: <AssessmentsPage />,
    requiresAuth: false
  },
  {
    title: "Take Assessment",
    to: "/assessments/:assessmentId/take/:attemptId",
    page: <AssessmentTaking />,
    isPublic: true
  },
  {
    title: "Assessment Results",
    to: "/assessments/:assessmentId/results/:attemptId",
    page: <AssessmentResults />,
    isPublic: true
  }
];