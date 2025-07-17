
import Marketplace from "../pages/Marketplace";
import ServiceDetail from "../pages/marketplace/ServiceDetail";
import PostService from "../pages/marketplace/PostService";
import LearningHub from "../pages/LearningHub";
import ServicesMarketplace from "../pages/marketplace/ServicesMarketplace";
import ServicesIntegration from "../pages/marketplace/ServicesIntegration";
import TestingOptimization from "../pages/marketplace/TestingOptimization";

export const marketplaceRoutes = [
  {
    title: "Marketplace",
    to: "/marketplace",
    page: <Marketplace />,
  },
  {
    title: "Services Directory",
    to: "/services",
    page: <ServicesMarketplace />,
  },
  {
    title: "Service Detail",
    to: "/marketplace/:id",
    page: <ServiceDetail />,
  },
  {
    title: "Service Detail by ID",
    to: "/services/:id",
    page: <ServiceDetail />,
  },
  {
    title: "Post Service",
    to: "/marketplace/post-service",
    page: <PostService />,
  },
  {
    title: "Learning Hub",
    to: "/learning",
    page: <LearningHub />,
  },
  {
    title: "Services Integration",
    to: "/services/integration",
    page: <ServicesIntegration />,
  },
  {
    title: "Testing & Optimization",
    to: "/services/testing",
    page: <TestingOptimization />,
  },
];
