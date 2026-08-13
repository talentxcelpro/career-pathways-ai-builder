import React, { lazy, Suspense } from "react";
import { NavItem } from "../types/nav-item";
const MobileJobs = lazy(() => import('../pages/mobile/MobileJobs'));
const MobileReelsPage = lazy(() => import('../pages/MobileReelsPage'));
const MobileNetwork = lazy(() => import('../pages/mobile/MobileNetwork').then(m => ({ default: m.MobileNetwork })));
const MobileProfile = lazy(() => import('../pages/mobile/MobileProfile').then(m => ({ default: m.MobileProfile })));
const MobileNotifications = lazy(() => import('../components/mobile/MobileNotifications').then(m => ({ default: m.MobileNotifications })));
const MobilePendingConnections = lazy(() => import('../pages/mobile/MobilePendingConnections').then(m => ({ default: m.MobilePendingConnections })));
const MobileQRScanner = lazy(() => import('../pages/mobile/MobileQRScanner').then(m => ({ default: m.MobileQRScanner })));
const MobileSearch = lazy(() => import('../pages/mobile/MobileSearch').then(m => ({ default: m.MobileSearch })));
const MobilePassport = lazy(() => import('../pages/mobile/MobilePassport').then(m => ({ default: m.MobilePassport })));
const GamificationCenter = lazy(() => import('../pages/GamificationCenter'));
const ReferAndEarn = lazy(() => import('../pages/ReferAndEarn'));
const MobileHubs = lazy(() => import('../pages/mobile/MobileHubs').then(m => ({ default: m.MobileHubs })));
const MobileHub = lazy(() => import('../pages/mobile/MobileHub').then(m => ({ default: m.MobileHub })));
const MobileHome = lazy(() => import('../pages/mobile/MobileHome').then(m => ({ default: m.MobileHome })));
const MobileNearby = lazy(() => import('../pages/mobile/MobileNearby').then(m => ({ default: m.MobileNearby })));
const TrendingPage = lazy(() => import('../pages/TrendingPage').then(m => ({ default: m.TrendingPage })));
const ModulesShowcase = lazy(() => import('../pages/ModulesShowcase').then(m => ({ default: m.ModulesShowcase })));

export const mobileRoutes: NavItem[] = [
  { title: "Mobile Home", to: "/mobile", page: <Suspense fallback={null}><MobileHome /></Suspense>, },
  { title: "Mobile Jobs", to: "/mobile/jobs", page: <Suspense fallback={null}><MobileJobs /></Suspense>, },
  { title: "Mobile Reels", to: "/mobile/reels", page: <React.Suspense fallback={<div>Loading...</div>}><MobileReelsPage /></React.Suspense> },
  { title: "Mobile Network", to: "/network/people", page: <Suspense fallback={null}><MobileNetwork /></Suspense>, },
  { title: "Mobile Profile", to: "/mobile/profile", page: <Suspense fallback={null}><MobileProfile /></Suspense>, },
  { title: "Mobile Notifications", to: "/mobile/notifications", page: <Suspense fallback={null}><MobileNotifications /></Suspense>, },
  { title: "Pending Connections", to: "/mobile/pending-connections", page: <Suspense fallback={null}><MobilePendingConnections /></Suspense>, },
  { title: "QR Scanner", to: "/mobile/qr-scanner", page: <Suspense fallback={null}><MobileQRScanner /></Suspense>, },
  // Alias path to fix 404s reported at /mobile/qr-code
  { title: "QR Scanner (Alias)", to: "/mobile/qr-code", page: <Suspense fallback={null}><MobileQRScanner /></Suspense>, },
  { title: "Mobile Search", to: "/mobile/search", page: <Suspense fallback={null}><MobileSearch /></Suspense>, },
  { title: "Mobile Passport", to: "/mobile/passport", page: <Suspense fallback={null}><MobilePassport /></Suspense>, },
  { title: "Mobile Passport", to: "/mobile/passport/:userId", page: <Suspense fallback={null}><MobilePassport /></Suspense>, },
  { title: "Mobile Gamification", to: "/mobile/gamification", page: <Suspense fallback={null}><GamificationCenter /></Suspense>, },
  { title: "Mobile Referral", to: "/mobile/refer-and-earn", page: <Suspense fallback={null}><ReferAndEarn /></Suspense>, },
  { title: "Mobile Hubs", to: "/mobile/hubs", page: <Suspense fallback={null}><MobileHubs /></Suspense>, },
  { title: "Mobile Hub Detail", to: "/mobile/hubs/:slug", page: <Suspense fallback={null}><MobileHub /></Suspense>, },
  { title: "Mobile Nearby", to: "/mobile/nearby", page: <Suspense fallback={null}><MobileNearby /></Suspense>, },
  { title: "Trending", to: "/trending", page: <Suspense fallback={null}><TrendingPage /></Suspense>, },
  { title: "Modules Showcase", to: "/modules", page: <Suspense fallback={null}><ModulesShowcase /></Suspense>, },
];
