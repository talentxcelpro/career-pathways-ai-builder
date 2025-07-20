import { coreRoutes } from "./navigation/coreRoutes";
import { authRoutes } from "./navigation/authRoutes";
import { networkRoutes } from "./navigation/networkRoutes";
import { jobRoutes } from "./navigation/jobRoutes";
import { employerRoutes } from "./navigation/employerRoutes";
import { companiesRoutes } from "./navigation/companiesRoutes";
import { resumeRoutes } from "./navigation/resumeRoutes";
import { toolsRoutes } from "./navigation/toolsRoutes";
import { marketplaceRoutes } from "./navigation/marketplaceRoutes";
import { learningRoutes } from "./navigation/learningRoutes";
import { collegesRoutes } from "./navigation/collegesRoutes";
import { careerMapRoutes } from "./navigation/careerMapRoutes";
import { adminRoutes } from "./navigation/adminRoutes";
import { profileRoutes } from "./navigation/profileRoutes";
import { aiRoutes } from "./navigation/aiRoutes";

export const navItems = [
  ...coreRoutes,
  ...authRoutes,
  ...networkRoutes,
  ...jobRoutes,
  ...employerRoutes,
  ...companiesRoutes,
  ...resumeRoutes,
  ...toolsRoutes,
  ...marketplaceRoutes,  
  ...learningRoutes,
  ...collegesRoutes,
  ...careerMapRoutes,
  ...aiRoutes,
  ...adminRoutes,
  ...profileRoutes,
];
