
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// Lazy load components for better performance
const ComprehensiveResumeBuilder = lazy(() => import('@/pages/resume/ComprehensiveResumeBuilder'));
const EditResume = lazy(() => import('@/pages/resume/EditResume'));

export const resumeRoutes = [
  {
    path: '/resume',
    element: <Navigate to="/resume/new" replace />
  },
  {
    path: '/resume/new',
    element: <ComprehensiveResumeBuilder />
  },
  {
    path: '/resume/edit/:id',
    element: <EditResume />
  },
  // Legacy route redirects
  {
    path: '/resume-builder',
    element: <Navigate to="/resume/new" replace />
  },
  {
    path: '/resume-builder/:id',
    element: <Navigate to="/resume/edit/$1" replace />
  }
];
