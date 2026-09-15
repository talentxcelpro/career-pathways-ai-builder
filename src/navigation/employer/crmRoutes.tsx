
import { Users, User, FileText, Bell, Mail } from "lucide-react";

// CRM & Collaboration
import CRMCandidates from "../../pages/employer/crm/CRMCandidates";
import CRMCandidateDetail from "../../pages/employer/crm/CRMCandidateDetail";
import CRMNotes from "../../pages/employer/crm/CRMNotes";
import CRMTeam from "../../pages/employer/crm/CRMTeam";
import CRMReminders from "../../pages/employer/crm/CRMReminders";
import CRMEmailTemplate from "../../pages/employer/crm/CRMEmailTemplate";

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
