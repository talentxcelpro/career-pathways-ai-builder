import { NavItem } from "../types/nav-item";
import AssessmentsPage from "../pages/assessments/index";
import AssessmentTaking from "../pages/assessments/AssessmentTaking";
import AssessmentResults from "../pages/assessments/AssessmentResults";

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