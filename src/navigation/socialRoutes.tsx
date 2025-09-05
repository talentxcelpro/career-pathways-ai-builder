import SocialHub from "@/pages/SocialHub";
import { NavItem } from "@/types/nav-item";

export const socialRoutes: NavItem[] = [
  {
    title: "Social",
    to: "/social",
    page: <SocialHub />,
    requiresAuth: false,
  },
  {
    title: "Social Hub",
    to: "/social-hub",
    page: <SocialHub />,
    requiresAuth: false,
  },
];