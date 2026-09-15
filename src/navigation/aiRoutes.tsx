import { lazy } from 'react';

const AIServicesPage = lazy(() => import('../pages/AIServicesPage'));
const JobMatchGPTPage = lazy(() => import('../pages/JobMatchGPTPage'));
const NavigatorPage = lazy(() => import('../pages/ai/NavigatorPage'));


export const aiRoutes = [
  {
    title: "Core Services",
    to: "/core-services",
    page: <AIServicesPage />,
    isPublic: false
  },
  {
    title: "Precision Match",
    to: "/precision-match",
    page: <JobMatchGPTPage />,
    isPublic: true,
    icon: "sparkles",
    description: "Advanced resume synthesis and alignment"
  },
  {
    title: "TalentXcel Navigator",
    to: "/navigator",
    page: <NavigatorPage />,
    isPublic: false
  },
  {
    title: "TalentXcel Navigator",
    to: "/intelligence-navigator",
    page: <NavigatorPage />,
    isPublic: false
  }
];