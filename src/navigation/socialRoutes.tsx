import SocialPage from "@/pages/social/SocialPage";
import { NavItem } from "@/types/nav-item";

export const socialRoutes: NavItem[] = [
  {
    title: "Social",
    to: "/social",
    page: <SocialPage />,
    requiresAuth: false,
  },
];