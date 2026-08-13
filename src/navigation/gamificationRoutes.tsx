import { lazy, Suspense } from 'react';
import { Trophy } from "lucide-react";
import { NavItem } from "../types/nav-item";

const Navigate = lazy(() => import('react-router-dom').then(m => ({ default: m.Navigate })));

export const gamificationRoutes: NavItem[] = [
  {
    title: "Gamification Center",
    to: "/gamification",
    icon: <Trophy className="h-4 w-4" />,
    page: <Suspense fallback={null}><Navigate to="/txc/mining" replace /></Suspense>,
    isPublic: true,
  },
];