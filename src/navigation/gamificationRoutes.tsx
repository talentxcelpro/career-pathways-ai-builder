import { Trophy } from "lucide-react";
import { NavItem } from "../types/nav-item";
import { Navigate } from "react-router-dom";

export const gamificationRoutes: NavItem[] = [
  {
    title: "Gamification Center",
    to: "/gamification",
    icon: <Trophy className="h-4 w-4" />,
    page: <Navigate to="/txc/mining" replace />,
    isPublic: true,
  },
];