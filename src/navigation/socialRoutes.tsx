import SocialHub from "@/pages/SocialHub";
import { NavItem } from "@/types/nav-item";

export const socialRoutes: NavItem[] = [
  {
    title: "Social",
    to: "/social",
    page: <SocialHub />,
    requiresAuth: false,
  },
];