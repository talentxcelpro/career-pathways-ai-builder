import { NavItem } from "../types/nav-item";
import { Navigate } from "react-router-dom";
import PersonalizedReferral from "../pages/PersonalizedReferral";
import ReferralCenter from "../pages/ReferralCenter";

export const referralRoutes: NavItem[] = [
  {
    title: "Refer & Earn",
    to: "/refer-and-earn",
    page: <Navigate to="/passport" replace />,
  },
  {
    title: "Referral Center",
    to: "/referral",
    page: <ReferralCenter />,
  },
  {
    title: "Referral",
    to: "/refer/:username",
    page: <PersonalizedReferral />,
    requiresAuth: false,
  },
];