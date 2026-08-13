import { lazy, Suspense } from 'react';

const CompanyDetailPage = lazy(() => import('../components/performance/LazyRoutes').then(m => ({ default: m.CompanyDetailPage })));
const Companies = lazy(() => import('../pages/Companies'));


export const companiesRoutes = [
  {
    title: "Companies",
    to: "/companies",
    page: <Suspense fallback={null}><Companies /></Suspense>,
    isPublic: true,
    requiresAdminAccess: false,
  },
  {
    title: "Company Detail by Slug",
    to: "/company/:slug",
    page: <Suspense fallback={null}><CompanyDetailPage /></Suspense>,
    isPublic: true,
    requiresAdminAccess: false,
  },
  {
    title: "Company Detail by ID", 
    to: "/companies/:id",
    page: <Suspense fallback={null}><CompanyDetailPage /></Suspense>,
    isPublic: true,
    requiresAdminAccess: false,
  },
];
