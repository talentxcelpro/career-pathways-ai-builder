import { NavItem } from "../types/nav-item";
import TalentXcelAgent from "../pages/ai-agent/TalentXcelAgent";

export const aiAgentRoutes: NavItem[] = [
  {
    title: "AI Agent",
    to: "/ai-agent",
    page: <TalentXcelAgent />,
    requiresAuth: true,
  },
];