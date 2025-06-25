
import { Briefcase } from "lucide-react";
import Jobs from "../pages/Jobs";
import JobDetails from "../pages/jobs/JobDetails";
import JobApply from "../pages/jobs/JobApply";
import SavedJobs from "../pages/jobs/SavedJobs";

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
];
