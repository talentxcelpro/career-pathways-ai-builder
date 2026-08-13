import { lazy, Suspense } from 'react';

const JobMatchGPTPage = lazy(() => import('../pages/JobMatchGPTPage'));
const AIServicesPage = lazy(() => import('../pages/AIServicesPage'));

export const aiRoutes = [
  {
    title: "AI Services",
    to: "/ai-services",
    page: <Suspense fallback={null}><AIServicesPage /></Suspense>,
    isPublic: false
  },
  {
    title: "Job Match GPT",
    to: "/job-match-gpt",
    page: <Suspense fallback={null}><JobMatchGPTPage /></Suspense>,
    isPublic: true,
    icon: "brain",
    description: "AI-powered resume analysis and job matching"
  }
];