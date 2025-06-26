
import { getNavigationItems } from "./components/navigation/NavigationConfig";

// Export navigation items using the centralized configuration
export const navItems = getNavigationItems();

// For backward compatibility, export individual routes if needed
export { jobRoutes } from "./navigation/jobRoutes";
export { networkRoutes } from "./navigation/networkRoutes";
export { learningRoutes } from "./navigation/learningRoutes";
export { toolsRoutes } from "./navigation/toolsRoutes";
export { aiRoutes } from "./navigation/aiRoutes";
export { careerMapRoutes } from "./navigation/careerMapRoutes";
export { marketplaceRoutes } from "./navigation/marketplaceRoutes";
export { employerRoutes } from "./navigation/employerRoutes";
export { collegesRoutes } from "./navigation/collegesRoutes";
export { companiesRoutes } from "./navigation/companiesRoutes";
export { profileRoutes } from "./navigation/profileRoutes";
export { authRoutes } from "./navigation/authRoutes";
export { coreRoutes } from "./navigation/coreRoutes";
