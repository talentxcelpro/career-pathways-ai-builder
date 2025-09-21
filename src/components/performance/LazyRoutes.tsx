import React, { Suspense } from 'react';
import { StableContainer } from "@/utils/layoutOptimizer";

// Lazy load major route components for code splitting
export const LazyJobs = React.lazy(() => import('@/pages/Jobs'));
export const LazyNetwork = React.lazy(() => import('@/pages/Network'));
export const LazyProfile = React.lazy(() => import('@/pages/Profile'));
export const LazyUserProfile = React.lazy(() => import('@/pages/UserProfile'));
export const LazyCompanyDetail = React.lazy(() => import('@/pages/companies/CompanyDetail'));

// Performance-optimized loading fallback
export const RouteLoadingFallback = ({ pageName }: { pageName: string }) => (
  <StableContainer minHeight="100vh" className="flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-muted-foreground">Loading {pageName}...</p>
    </div>
  </StableContainer>
);

// Wrapper components with optimized suspense
export const JobsPage = () => (
  <Suspense fallback={<RouteLoadingFallback pageName="Jobs" />}>
    <LazyJobs />
  </Suspense>
);

export const NetworkPage = () => (
  <Suspense fallback={<RouteLoadingFallback pageName="Network" />}>
    <LazyNetwork />
  </Suspense>
);

export const ProfilePage = () => (
  <Suspense fallback={<RouteLoadingFallback pageName="Profile" />}>
    <LazyProfile />
  </Suspense>
);

export const UserProfilePage = () => (
  <Suspense fallback={<RouteLoadingFallback pageName="User Profile" />}>
    <LazyUserProfile />
  </Suspense>
);

export const CompanyDetailPage = () => (
  <Suspense fallback={<RouteLoadingFallback pageName="Company Details" />}>
    <LazyCompanyDetail />
  </Suspense>
);