import { homeRoutes } from "./navigation/homeRoutes";
import { authRoutes } from "./navigation/authRoutes";
import { networkRoutes } from "./navigation/networkRoutes";
import { jobRoutes } from "./navigation/jobRoutes";
import { employerRoutes } from "./navigation/employerRoutes";
import { companyRoutes } from "./navigation/companyRoutes";
import { resumeRoutes } from "./navigation/resumeRoutes";
import { toolRoutes } from "./navigation/toolRoutes";
import { serviceRoutes } from "./navigation/serviceRoutes";
import { learningRoutes } from "./navigation/learningRoutes";
import { collegeRoutes } from "./navigation/collegeRoutes";
import { careerMapRoutes } from "./navigation/careerMapRoutes";
import { adminRoutes } from "./navigation/adminRoutes";
import { profileRoutes } from "./navigation/profileRoutes";
import { aiRoutes } from "./navigation/aiRoutes";

export const navItems = [
  ...homeRoutes,
  ...authRoutes,
  ...networkRoutes,
  ...jobRoutes,
  ...employerRoutes,
  ...companyRoutes,
  ...resumeRoutes,
  ...toolRoutes,
  ...serviceRoutes,  
  ...learningRoutes,
  ...collegeRoutes,
  ...careerMapRoutes,
  ...aiRoutes,
  ...adminRoutes,
  ...profileRoutes,
];
