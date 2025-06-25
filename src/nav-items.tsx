
import { authRoutes } from "./navigation/authRoutes";
import { networkRoutes } from "./navigation/networkRoutes";
import { profileRoutes } from "./navigation/profileRoutes";
import { jobRoutes } from "./navigation/jobRoutes";
import { learningRoutes } from "./navigation/learningRoutes";
import { careerMapRoutes } from "./navigation/careerMapRoutes";
import { toolsRoutes } from "./navigation/toolsRoutes";
import { companiesRoutes } from "./navigation/companiesRoutes";
import { collegesRoutes } from "./navigation/collegesRoutes";
import { marketplaceRoutes } from "./navigation/marketplaceRoutes";
import { coreRoutes } from "./navigation/coreRoutes";

export const navItems = [
  ...coreRoutes,
  ...jobRoutes,
  ...networkRoutes,
  ...learningRoutes,
  ...careerMapRoutes,
  ...profileRoutes,
  ...authRoutes,
  ...toolsRoutes,
  ...companiesRoutes,
  ...collegesRoutes,
  ...marketplaceRoutes,
];
