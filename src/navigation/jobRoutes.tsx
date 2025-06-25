
import { Briefcase } from "lucide-react";
import Jobs from "../pages/Jobs";
import JobDetails from "../pages/jobs/JobDetails";
import JobApply from "../pages/jobs/JobApply";
import SavedJobs from "../pages/jobs/SavedJobs";
import JobPost from "../pages/jobs/JobPost";
import AppliedJobs from "../pages/jobs/AppliedJobs";
import JobCategories from "../pages/jobs/JobCategories";

export const jobRoutes = [
  {
    title: "Jobs",
    to: "/jobs",
    icon: <Briefcase className="h-4 w-4" />,
    page: <Jobs />,
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
    title: "Saved Jobs",
    to: "/jobs/saved",
    page: <SavedJobs />,
  },
  {
    title: "Post Job",
    to: "/jobs/post",
    page: <JobPost />,
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
];
