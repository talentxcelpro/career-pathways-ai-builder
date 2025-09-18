import { Trophy } from "lucide-react";
import { NavItem } from "../types/nav-item";
import GamificationCenter from "../pages/GamificationCenter";

export const gamificationRoutes: NavItem[] = [
  {
    title: "Gamification Center",
    to: "/gamification",
    icon: <Trophy className="h-4 w-4" />,
    page: <GamificationCenter />,
    requiresAuth: true,
  },
];