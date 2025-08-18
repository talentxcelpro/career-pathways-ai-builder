import React from "react";
import { NavItem } from "../types/nav-item";
import { MobileJobs } from "../pages/mobile/MobileJobs";
import { MobileReels } from "../pages/mobile/MobileReels";
import { MobileNetwork } from "../pages/mobile/MobileNetwork";
import { MobileProfile } from "../pages/mobile/MobileProfile";
import { MobileNotifications } from "../components/mobile/MobileNotifications";
import { MobilePendingConnections } from "../pages/mobile/MobilePendingConnections";
import { MobileQRScanner } from "../pages/mobile/MobileQRScanner";
import { MobileSearch } from "../pages/mobile/MobileSearch";
import { MobilePassport } from "../pages/mobile/MobilePassport";

export const mobileRoutes: NavItem[] = [
  { title: "Mobile Jobs", to: "/mobile/jobs", page: <MobileJobs /> },
  { title: "Mobile Reels", to: "/mobile/reels", page: <MobileReels /> },
  { title: "TalentXcel", to: "/mobile/network", page: <MobileNetwork /> },
  { title: "Mobile Profile", to: "/mobile/profile", page: <MobileProfile /> },
  { title: "Mobile Notifications", to: "/mobile/notifications", page: <MobileNotifications /> },
  { title: "Pending Connections", to: "/mobile/pending-connections", page: <MobilePendingConnections /> },
  { title: "QR Scanner", to: "/mobile/qr-scanner", page: <MobileQRScanner /> },
  // Alias path to fix 404s reported at /mobile/qr-code
  { title: "QR Scanner (Alias)", to: "/mobile/qr-code", page: <MobileQRScanner /> },
  { title: "Mobile Search", to: "/mobile/search", page: <MobileSearch /> },
  { title: "Mobile Passport", to: "/mobile/passport", page: <MobilePassport /> },
  { title: "Mobile Passport", to: "/mobile/passport/:userId", page: <MobilePassport /> },
];
