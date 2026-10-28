import { lazy, Suspense } from "react";

// CRM & Collaboration (Lazy loaded to reduce initial bundle)
const CRMCandidates = lazy(() => import("../../pages/employer/crm/CRMCandidates"));
const CRMCandidateDetail = lazy(() => import("../../pages/employer/crm/CRMCandidateDetail"));
const CRMNotes = lazy(() => import("../../pages/employer/crm/CRMNotes"));
const CRMTeam = lazy(() => import("../../pages/employer/crm/CRMTeam"));
const CRMReminders = lazy(() => import("../../pages/employer/crm/CRMReminders"));
const CRMEmailTemplate = lazy(() => import("../../pages/employer/crm/CRMEmailTemplate"));

export const employerCRMRoutes = [
  // CRM & Collaboration
  {
    title: "CRM Candidates",
    to: "/employer/crm/candidates",
    page: <Suspense fallback={null}><CRMCandidates /></Suspense>,
  },
  {
    title: "CRM Candidate Detail",
    to: "/employer/crm/:candidateId",
    page: <Suspense fallback={null}><CRMCandidateDetail /></Suspense>,
  },
  {
    title: "CRM Notes",
    to: "/employer/crm/notes",
    page: <Suspense fallback={null}><CRMNotes /></Suspense>,
  },
  {
    title: "CRM Team",
    to: "/employer/crm/team",
    page: <Suspense fallback={null}><CRMTeam /></Suspense>,
  },
  {
    title: "CRM Reminders",
    to: "/employer/crm/reminders",
    page: <Suspense fallback={null}><CRMReminders /></Suspense>,
  },
  {
    title: "CRM Email Template",
    to: "/employer/crm/email-template",
    page: <Suspense fallback={null}><CRMEmailTemplate /></Suspense>,
  },
];
