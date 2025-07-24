import { NavItem } from "../types/nav-item";
import ReferAndEarn from "../pages/ReferAndEarn";
import PersonalizedReferral from "../pages/PersonalizedReferral";

export const referralRoutes: NavItem[] = [
  {
    title: "Refer & Earn",
    to: "/refer-and-earn",
    page: <ReferAndEarn />,
  },
  {
    title: "Referral",
    to: "/refer/:username",
    page: <PersonalizedReferral />,
    requiresAuth: false,
  },
];