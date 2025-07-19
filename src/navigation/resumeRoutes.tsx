
import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

// Lazy load components for better performance
const ResumeDashboard = lazy(() => import('@/pages/resume/ResumeDashboard'));
const AppleResumeChecker = lazy(() => import('@/pages/resume/AppleResumeChecker'));
const EditResume = lazy(() => import('@/pages/resume/EditResume'));
const ResumeUpload = lazy(() => import('@/pages/resume/ResumeUpload'));
const NewResume = lazy(() => import('@/pages/resume/NewResume'));

export const resumeRoutes: RouteObject[] = [
  {
    path: '/resume-builder',
    element: <ResumeDashboard />,
  },
  {
    path: '/resume-builder/checker',
    element: <AppleResumeChecker />,
  },
  {
    path: '/resume-builder/edit/:id',
    element: <EditResume />,
  },
  {
    path: '/resume-builder/upload',
    element: <ResumeUpload />,
  },
  {
    path: '/resume-builder/new',
    element: <NewResume />,
  },
];
