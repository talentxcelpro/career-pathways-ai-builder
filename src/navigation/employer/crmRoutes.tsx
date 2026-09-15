import { lazy } from "react";
import { Users, User, FileText, Bell, Mail } from "lucide-react";

// CRM & Collaboration
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
    page: <CRMCandidates />,
  },
  {
    title: "CRM Candidate Detail",
    to: "/employer/crm/:candidateId",
    page: <CRMCandidateDetail />,
  },
  {
    title: "CRM Notes",
    to: "/employer/crm/notes",
    page: <CRMNotes />,
  },
  {
    title: "CRM Team",
    to: "/employer/crm/team",
    page: <CRMTeam />,
  },
  {
    title: "CRM Reminders",
    to: "/employer/crm/reminders",
    page: <CRMReminders />,
  },
  {
    title: "CRM Email Template",
    to: "/employer/crm/email-template",
    page: <CRMEmailTemplate />,
  },
];
