import { NavItem } from "./types/nav-item";
import { coreRoutes } from "./navigation/coreRoutes";
import { authRoutes } from "./navigation/authRoutes";
import { jobRoutes } from "./navigation/jobRoutes";
import { companiesRoutes } from "./navigation/companiesRoutes";
import { learningRoutes } from "./navigation/learningRoutes";
import { networkRoutes } from "./navigation/networkRoutes";
import { profileRoutes } from "./navigation/profileRoutes";
import { careerMapRoutes } from "./navigation/careerMapRoutes";
import { toolsRoutes } from "./navigation/toolsRoutes";
import { aiRoutes } from "./navigation/aiRoutes";
import { employerRoutes } from "./navigation/employerRoutes";
import { collegesRoutes } from "./navigation/collegesRoutes";
import { marketplaceRoutes } from "./navigation/marketplaceRoutes";
import { seoRoutes } from "./navigation/seoRoutes";
import { resumeRoutes } from "./navigation/resumeRoutes";
import { adminRoutes } from "./navigation/adminRoutes";

export const navItems = [
  ...coreRoutes,
  ...authRoutes,
  ...profileRoutes,
  ...jobRoutes,
  ...learningRoutes,
  ...toolsRoutes,
  ...resumeRoutes,
  ...networkRoutes,
  ...companiesRoutes,
  ...collegesRoutes,
  ...careerMapRoutes,
  ...employerRoutes,
  ...marketplaceRoutes,
  ...aiRoutes,
  ...seoRoutes,
  ...adminRoutes,
];
