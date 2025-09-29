
import React from "react";
import { Building2, Users, Share2, Briefcase, Globe } from "lucide-react";

// Company Profile & Promotion
import CompanyProfileEdit from "../../pages/employer/profile/CompanyProfileEdit";
import CompanyTeamManage from "../../pages/employer/profile/CompanyTeamManage";
import CompanySocials from "../../pages/employer/profile/CompanySocials";
import CompanyJobs from "../../pages/employer/profile/CompanyJobs";
// Remove duplicate import - use lazy loading instead

export const employerProfileRoutes = [
  // Company Profile & Promotion
  {
    title: "Company Profile Edit",
    to: "/employer/profile/edit",
    page: <CompanyProfileEdit />,
  },
  {
    title: "Company Team Manage",
    to: "/employer/profile/team",
    page: <CompanyTeamManage />,
  },
  {
    title: "Company Socials",
    to: "/employer/profile/socials",
    page: <CompanySocials />,
  },
  {
    title: "Company Jobs",
    to: "/employer/profile/jobs",
    page: <CompanyJobs />,
  },
  {
    title: "Company Public Profile", 
    to: "/employer/profile/public/:id",
    page: (
      <React.Suspense fallback={<div>Loading...</div>}>
        <div>Company Profile</div>
      </React.Suspense>
    ),
  },
];
