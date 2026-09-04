import { lazy, Suspense } from "react";
const SocialHub = lazy(() => import("@/pages/SocialHub"));
const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={null}>{children}</Suspense>
);
import { NavItem } from "@/types/nav-item";

export const socialRoutes: NavItem[] = [
  {
    title: "Social",
    to: "/social",
    page: <S><SocialHub /></S>,
    requiresAuth: false,
  },
  {
    title: "Social Hub",
    to: "/social-hub",
    page: <SocialHub />,
    requiresAuth: false,
  },
];