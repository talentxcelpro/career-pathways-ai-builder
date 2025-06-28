import { Briefcase } from "lucide-react";
import Jobs from "../pages/Jobs";
import SavedJobs from "../pages/jobs/SavedJobs";
import AppliedJobs from "../pages/jobs/AppliedJobs";
import JobDetails from "../pages/jobs/JobDetails";
import JobApply from "../pages/jobs/JobApply";
import JobPost from "../pages/jobs/JobPost";
import JobCategories from "../pages/jobs/JobCategories";
import Manage from "../pages/jobs/Manage";
import JobApplicants from "../pages/jobs/JobApplicants";
import ApplicantDetail from "../pages/jobs/ApplicantDetail";
import SmartApply from "../pages/jobs/SmartApply";
import Recommendations from "../pages/jobs/Recommendations";
import Alerts from "../pages/jobs/Alerts";
import Analytics from "../pages/jobs/Analytics";
import Companies from "../pages/jobs/Companies";
import MyApplications from "../pages/jobs/MyApplications";

export const jobRoutes = [
  {
    title: "Browse Jobs",
    to: "/jobs",
    page: <Jobs />,
  },
  {
    title: "My Applications",
    to: "/jobs/my-applications",
    page: <MyApplications />,
  },
  {
    title: "Saved Jobs",
    to: "/jobs/saved",
    page: <SavedJobs />,
  },
  {
    title: "Applied Jobs",
    to: "/jobs/applied",
    page: <AppliedJobs />,
  },
  {
    title: "Job Categories",
    to: "/jobs/categories",
    page: <JobCategories />,
  },
  {
    title: "Job Companies",
    to: "/jobs/companies",
    page: <Companies />,
  },
  {
    title: "Job Recommendations",
    to: "/jobs/recommendations",
    page: <Recommendations />,
  },
  {
    title: "Job Alerts",
    to: "/jobs/alerts",
    page: <Alerts />,
  },
  {
    title: "Job Analytics",
    to: "/jobs/analytics",
    page: <Analytics />,
  },
  {
    title: "Post Job",
    to: "/jobs/post",
    page: <JobPost />,
  },
  {
    title: "Manage Jobs",
    to: "/jobs/manage",
    page: <Manage />,
  },
  {
    title: "Job Details",
    to: "/jobs/:id",
    page: <JobDetails />,
  },
  {
    title: "Job Apply",
    to: "/jobs/:id/apply",
    page: <JobApply />,
  },
  {
    title: "Smart Apply",
    to: "/jobs/:id/smart-apply",
    page: <SmartApply />,
  },
  {
    title: "Job Applicants",
    to: "/jobs/:id/applicants",
    page: <JobApplicants />,
  },
  {
    title: "Applicant Detail",
    to: "/jobs/:jobId/applicants/:applicantId",
    page: <ApplicantDetail />,
  },
];
