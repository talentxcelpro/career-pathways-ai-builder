import { lazy, Suspense } from "react";
import { NavItem } from "../types/nav-item";
import { Navigate } from "react-router-dom";

const PersonalizedReferral = lazy(() => import("../pages/PersonalizedReferral"));
const ReferAndEarn = lazy(() => import("../pages/ReferAndEarn"));

const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={null}>{children}</Suspense>
);

export const referralRoutes: NavItem[] = [
  {
    title: "Referrals & Rewards",
    to: "/referrals",
    page: <S><ReferAndEarn /></S>,
    requiresAuth: false,
  },
  {
    title: "Refer & Earn",
    to: "/refer-and-earn",
    page: <S><ReferAndEarn /></S>,
    requiresAuth: false,
  },
  {
    title: "Referral Center",
    to: "/referral",
    page: <S><ReferAndEarn /></S>,
    requiresAuth: false,
  },
  {
    title: "Referral",
    to: "/refer/:username",
    page: <S><PersonalizedReferral /></S>,
    requiresAuth: false,
  },
];