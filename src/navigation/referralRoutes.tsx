import { lazy, Suspense } from "react";
import { NavItem } from "../types/nav-item";
import { Navigate } from "react-router-dom";

const PersonalizedReferral = lazy(() => import("../pages/PersonalizedReferral"));
const ReferralCenter = lazy(() => import("../pages/ReferralCenter"));

const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={null}>{children}</Suspense>
);

export const referralRoutes: NavItem[] = [
  {
    title: "Refer & Earn",
    to: "/refer-and-earn",
    page: <Navigate to="/passport" replace />,
  },
  {
    title: "Referral Center",
    to: "/referral",
    page: <S><ReferralCenter /></S>,
    requiresAuth: true,
  },
  {
    title: "Referral",
    to: "/refer/:username",
    page: <S><PersonalizedReferral /></S>,
    requiresAuth: false,
  },
];