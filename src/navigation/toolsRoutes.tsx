
import Tools from "../pages/Tools";
import ResumeCheck from "../pages/tools/ResumeCheck";
import CoverLetter from "../pages/tools/CoverLetter";

export const toolsRoutes = [
  {
    title: "Tools",
    to: "/tools",
    page: <Tools />,
  },
  {
    title: "Resume Checker",
    to: "/tools/resume-check",
    page: <ResumeCheck />,
  },
  {
    title: "Cover Letter Generator",
    to: "/tools/cover-letter",
    page: <CoverLetter />,
  },
];
