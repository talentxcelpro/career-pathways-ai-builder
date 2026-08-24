// src/navigation/claim1Routes.tsx
// Claim #1 route definitions — all lazy loaded, same pattern as all other route modules.

import { lazy } from 'react';

const LeaderboardPage      = lazy(() => import('@/pages/claim1/LeaderboardPage'));
const RankingsHub          = lazy(() => import('@/pages/claim1/RankingsHub'));
const CompanyRankingProfile = lazy(() => import('@/pages/claim1/CompanyRankingProfile'));
const EnterLeaderboard     = lazy(() => import('@/pages/claim1/EnterLeaderboard'));
const BidPage              = lazy(() => import('@/pages/claim1/BidPage'));
const ParticipantDashboard = lazy(() => import('@/pages/claim1/ParticipantDashboard'));
const WatchPage            = lazy(() => import('@/pages/claim1/WatchPage'));
const Claim1Admin          = lazy(() => import('@/pages/admin/Claim1Admin'));

export const claim1Routes = [
  // ── Public (no auth required) ──────────────────────────────────────────────
  { path: '/rankings',                             element: <RankingsHub />,           requiresAuth: false },
  { path: '/rankings/:categorySlug',               element: <LeaderboardPage />,        requiresAuth: false },
  { path: '/rankings/:categorySlug/:scopeSlug',    element: <LeaderboardPage />,        requiresAuth: false },
  { path: '/company/:slug',                        element: <CompanyRankingProfile />,  requiresAuth: false },
  { path: '/claim1/watch',                         element: <WatchPage />,              requiresAuth: false },

  // ── Authenticated ──────────────────────────────────────────────────────────
  { path: '/claim1/enter',                         element: <EnterLeaderboard />,       requiresAuth: true },
  { path: '/claim1/bid/:listingId',                element: <BidPage />,                requiresAuth: true },
  { path: '/claim1/dashboard',                     element: <ParticipantDashboard />,   requiresAuth: true },

  // ── Admin ──────────────────────────────────────────────────────────────────
  { path: '/admin/claim1',                         element: <Claim1Admin />,            requiresAdmin: true },
];
