import React, { lazy, Suspense } from "react";
import { NavItem } from "../types/nav-item";
import { Navigate, useSearchParams } from "react-router-dom";

const PersonalizedReferral = lazy(() => import("../pages/PersonalizedReferral"));

const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={null}>{children}</Suspense>
);

export const ReferAndEarnRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const nextParams = new URLSearchParams(searchParams);
  if (!nextParams.has('tab')) {
    nextParams.set('tab', 'refer-and-earn');
  }
  return <Navigate to={`/network?${nextParams.toString()}`} replace />;
};

export const referralRoutes: NavItem[] = [
  {
    title: "Referrals & Rewards",
    to: "/referrals",
    page: <ReferAndEarnRedirect />,
    requiresAuth: false,
  },
  {
    title: "Refer & Earn",
    to: "/refer-and-earn",
    page: <ReferAndEarnRedirect />,
    requiresAuth: false,
  },
  {
    title: "Referral Center",
    to: "/referral",
    page: <ReferAndEarnRedirect />,
    requiresAuth: false,
  },
  {
    title: "Referral",
    to: "/refer/:username",
    page: <S><PersonalizedReferral /></S>,
    requiresAuth: false,
  },
];
