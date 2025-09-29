import AIServicesPage from '../pages/AIServicesPage';
import JobMatchGPTPage from '../pages/JobMatchGPTPage';

export const aiRoutes = [
  {
    title: "AI Services",
    to: "/ai-services",
    page: <AIServicesPage />,
    isPublic: false
  },
  {
    title: "Job Match GPT",
    to: "/job-match-gpt",
    page: <JobMatchGPTPage />,
    isPublic: true,
    icon: "brain",
    description: "AI-powered resume analysis and job matching"
  }
];