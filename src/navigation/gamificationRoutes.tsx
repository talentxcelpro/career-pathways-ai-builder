import { lazy, Suspense } from 'react';
import { Gamepad2, Trophy, Flame } from "lucide-react";
import { NavItem } from "../types/nav-item";

const CareerVersePage = lazy(() => import('../pages/CareerVersePage'));

const CareerVersePage = lazy(() => import('../pages/CareerVersePage'));

export const gamificationRoutes: NavItem[] = [
  {
    title: "CareerVerse RPG",
    to: "/play",
    icon: <Gamepad2 className="h-4 w-4 text-[#36D9F5]" />,
    page: <Suspense fallback={<div className="min-h-screen bg-[#071329] flex items-center justify-center text-white">Loading CareerVerse...</div>}><CareerVersePage /></Suspense>,
    isPublic: true,
  },
  {
    title: "Career RPG",
    to: "/careerverse",
    icon: <Gamepad2 className="h-4 w-4" />,
    page: <Suspense fallback={<div className="min-h-screen bg-[#071329] flex items-center justify-center text-white">Loading CareerVerse...</div>}><CareerVersePage /></Suspense>,
    isPublic: true,
  },
  {
    title: "Career RPG",
    to: "/rpg",
    icon: <Gamepad2 className="h-4 w-4" />,
    page: <Suspense fallback={<div className="min-h-screen bg-[#071329] flex items-center justify-center text-white">Loading CareerVerse...</div>}><CareerVersePage /></Suspense>,
    isPublic: true,
  },
  {
    title: "Gamification Center",
    to: "/gamification",
    icon: <Trophy className="h-4 w-4" />,
    page: <Suspense fallback={<div className="min-h-screen bg-[#071329] flex items-center justify-center text-white">Loading CareerVerse...</div>}><CareerVersePage /></Suspense>,
    isPublic: true,
  },
];
