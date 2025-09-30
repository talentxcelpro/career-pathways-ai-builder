import React from "react";
import { NavItem } from "../types/nav-item";
import MobileJobs from "../pages/mobile/MobileJobs";
import MobileReelsPage from "../pages/MobileReelsPage";
import { MobileNetwork } from "../pages/mobile/MobileNetwork";
import { MobileProfile } from "../pages/mobile/MobileProfile";
import { MobileNotifications } from "../components/mobile/MobileNotifications";
import { MobilePendingConnections } from "../pages/mobile/MobilePendingConnections";
import { MobileQRScanner } from "../pages/mobile/MobileQRScanner";
import { MobileSearch } from "../pages/mobile/MobileSearch";
import { MobilePassport } from "../pages/mobile/MobilePassport";
import GamificationCenter from "../pages/GamificationCenter";
import ReferAndEarn from "../pages/ReferAndEarn";
import { MobileHubs } from "../pages/mobile/MobileHubs";
import { MobileHub } from "../pages/mobile/MobileHub";
import { MobileHome } from "../pages/mobile/MobileHome";
import { MobileNearby } from "../pages/mobile/MobileNearby";
import { TrendingPage } from "../pages/TrendingPage";
import { ModulesShowcase } from "../pages/ModulesShowcase";

export const mobileRoutes: NavItem[] = [
  { title: "Mobile Home", to: "/mobile", page: <MobileHome /> },
  { title: "Mobile Jobs", to: "/mobile/jobs", page: <MobileJobs /> },
  { title: "Mobile Reels", to: "/mobile/reels", page: <React.Suspense fallback={<div>Loading...</div>}><MobileReelsPage /></React.Suspense> },
  { title: "Mobile Network", to: "/network/people", page: <MobileNetwork /> },
  { title: "Mobile Profile", to: "/mobile/profile", page: <MobileProfile /> },
  { title: "Mobile Notifications", to: "/mobile/notifications", page: <MobileNotifications /> },
  { title: "Pending Connections", to: "/mobile/pending-connections", page: <MobilePendingConnections /> },
  { title: "QR Scanner", to: "/mobile/qr-scanner", page: <MobileQRScanner /> },
  // Alias path to fix 404s reported at /mobile/qr-code
  { title: "QR Scanner (Alias)", to: "/mobile/qr-code", page: <MobileQRScanner /> },
  { title: "Mobile Search", to: "/mobile/search", page: <MobileSearch /> },
  { title: "Mobile Passport", to: "/mobile/passport", page: <MobilePassport /> },
  { title: "Mobile Passport", to: "/mobile/passport/:userId", page: <MobilePassport /> },
  { title: "Mobile Gamification", to: "/mobile/gamification", page: <GamificationCenter /> },
  { title: "Mobile Referral", to: "/mobile/refer-and-earn", page: <ReferAndEarn /> },
  { title: "Mobile Hubs", to: "/mobile/hubs", page: <MobileHubs /> },
  { title: "Mobile Hub Detail", to: "/mobile/hubs/:slug", page: <MobileHub /> },
  { title: "Mobile Nearby", to: "/mobile/nearby", page: <MobileNearby /> },
  { title: "Trending", to: "/trending", page: <TrendingPage /> },
  { title: "Modules Showcase", to: "/modules", page: <ModulesShowcase /> },
];
