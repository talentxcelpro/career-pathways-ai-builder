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

import { employerRoutes } from "./navigation/employerRoutes";
import { collegesRoutes } from "./navigation/collegesRoutes";
import { marketplaceRoutes } from "./navigation/marketplaceRoutes";
import { seoRoutes } from "./navigation/seoRoutes";
import { resumeRoutes } from "./navigation/resumeRoutes";
import { adminRoutes } from "./navigation/adminRoutes";
import { enterpriseRoutes } from "./navigation/enterpriseRoutes";
import { proRoutes } from "./navigation/proRoutes";
import { socialRoutes } from "./navigation/socialRoutes";
import { publicRoutes } from "./navigation/publicRoutes";

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
  ...socialRoutes,
  ...proRoutes,
  ...publicRoutes,
  
  ...seoRoutes,
  ...adminRoutes,
  ...enterpriseRoutes,
];
