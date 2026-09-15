import React, { lazy } from "react";
import { NavItem } from "../types/nav-item";

const MobileJobs = lazy(() => import("../pages/mobile/MobileJobs"));
const MobileReelsPage = lazy(() => import("../pages/MobileReelsPage"));
const MobileNetwork = lazy(() => import("../pages/mobile/MobileNetwork").then(m => ({ default: m.MobileNetwork })));
const MobileProfile = lazy(() => import("../pages/mobile/MobileProfile").then(m => ({ default: m.MobileProfile })));
const MobileNotifications = lazy(() => import("../components/mobile/MobileNotifications").then(m => ({ default: m.MobileNotifications })));
const MobilePendingTalentNetwork = lazy(() => import("../pages/mobile/MobilePendingConnections").then(m => ({ default: m.MobilePendingTalentNetwork })));
const MobileQRScanner = lazy(() => import("../pages/mobile/MobileQRScanner").then(m => ({ default: m.MobileQRScanner })));
const MobileSearch = lazy(() => import("../pages/mobile/MobileSearch").then(m => ({ default: m.MobileSearch })));
const MobilePassport = lazy(() => import("../pages/mobile/MobilePassport").then(m => ({ default: m.MobilePassport })));
const GamificationCenter = lazy(() => import("../pages/GamificationCenter"));
const ReferAndEarn = lazy(() => import("../pages/ReferAndEarn"));
const MobileHubs = lazy(() => import("../pages/mobile/MobileHubs").then(m => ({ default: m.MobileHubs })));
const MobileHub = lazy(() => import("../pages/mobile/MobileHub").then(m => ({ default: m.MobileHub })));
const MobileHome = lazy(() => import("../pages/mobile/MobileHome").then(m => ({ default: m.MobileHome })));
const MobileNearby = lazy(() => import("../pages/mobile/MobileNearby").then(m => ({ default: m.MobileNearby })));
const TrendingPage = lazy(() => import("../pages/TrendingPage").then(m => ({ default: m.TrendingPage })));
const ModulesShowcase = lazy(() => import("../pages/ModulesShowcase").then(m => ({ default: m.ModulesShowcase })));


export const mobileRoutes: NavItem[] = [
  { title: "Mobile Home", to: "/mobile", page: <MobileHome /> },
  { title: "Mobile Jobs", to: "/mobile/jobs", page: <MobileJobs /> },
  { title: "Mobile Reels", to: "/mobile/reels", page: <React.Suspense fallback={<div>Loading...</div>}><MobileReelsPage /></React.Suspense> },
  { title: "Mobile Network", to: "/network/people", page: <MobileNetwork /> },
  { title: "Mobile Profile", to: "/mobile/profile", page: <MobileProfile /> },
  { title: "Mobile Notifications", to: "/mobile/notifications", page: <MobileNotifications /> },
  { title: "Pending Talent Network", to: "/mobile/pending-talent-network", page: <MobilePendingTalentNetwork /> },
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


