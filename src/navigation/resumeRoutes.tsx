
import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

// Lazy load components for better performance
const AppleResumeDashboard = lazy(() => import('@/pages/resume/AppleResumeDashboard'));
const AppleTemplateSelection = lazy(() => import('@/pages/resume/AppleTemplateSelection'));
const AppleResumeEditor = lazy(() => import('@/pages/resume/AppleResumeEditor'));
const AppleResumeChecker = lazy(() => import('@/pages/resume/AppleResumeChecker'));

export const resumeRoutes: RouteObject[] = [
  {
    path: '/resume-builder',
    element: <AppleResumeDashboard />,
  },
  {
    path: '/resume-builder/templates',
    element: <AppleTemplateSelection />,
  },
  {
    path: '/resume-builder/edit/:id',
    element: <AppleResumeEditor />,
  },
  {
    path: '/resume-builder/checker',
    element: <AppleResumeChecker />,
  },
];
