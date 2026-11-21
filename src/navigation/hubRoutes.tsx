import React, { lazy, Suspense } from "react";
import { NavItem } from "../types/nav-item";
const HubsList = lazy(() => import("../components/hubs/HubsList").then(m => ({ default: m.HubsList })));
const TalentXcelHub = lazy(() => import("../components/hubs/TalentXcelHub").then(m => ({ default: m.TalentXcelHub })));
const HubManagement = lazy(() => import("../pages/admin/HubManagement"));
const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={null}>{children}</Suspense>
);

export const hubRoutes: NavItem[] = [
  { title: "Hubs", to: "/hubs", page: <S><HubsList /></S>, isPublic: true },
  { title: "Hub Detail", to: "/hubs/:slug", page: <S><TalentXcelHub /></S>, isPublic: true },
  { title: "Hub Management", to: "/admin/hubs", page: <S><HubManagement /></S>, isPublic: true },
];