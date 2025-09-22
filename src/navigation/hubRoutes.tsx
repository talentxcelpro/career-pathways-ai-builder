import React from "react";
import { NavItem } from "../types/nav-item";
import { HubsList } from "../components/hubs/HubsList";
import { TalentXcelHub } from "../components/hubs/TalentXcelHub";
import HubManagement from "../pages/admin/HubManagement";

export const hubRoutes: NavItem[] = [
  { title: "Hubs", to: "/hubs", page: <HubsList />, isPublic: true },
  { title: "Hub Detail", to: "/hubs/:slug", page: <TalentXcelHub />, isPublic: true },
  { title: "Hub Management", to: "/admin/hubs", page: <HubManagement />, isPublic: true },
];