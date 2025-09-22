
import Marketplace from "../pages/Marketplace";
import ServiceDetail from "../pages/marketplace/ServiceDetail";
import PostService from "../pages/marketplace/PostService";
import LearningHub from "../pages/LearningHub";
import ServicesMarketplace from "../pages/marketplace/ServicesMarketplace";
import ServicesIntegration from "../pages/marketplace/ServicesIntegration";
import TestingOptimization from "../pages/marketplace/TestingOptimization";
import ServiceBookingForm from "../pages/marketplace/ServiceBookingForm";

export const marketplaceRoutes = [
  {
    title: "Marketplace",
    to: "/marketplace",
    page: <Marketplace />,
    isPublic: true,
  },
  {
    title: "Services Directory",
    to: "/services",
    page: <Marketplace />,
    isPublic: true,
    requiresAdminAccess: false,
  },
  {
    title: "Service Detail",
    to: "/marketplace/:id",
    page: <ServiceDetail />,
    isPublic: true,
    requiresAdminAccess: false,
  },
  {
    title: "Service Detail by ID",
    to: "/services/:id",
    page: <ServiceDetail />,
    isPublic: true,
    requiresAdminAccess: false,
  },
  {
    title: "Service Booking",
    to: "/services/book/:id",
    page: <ServiceBookingForm />,
    isPublic: true,
    requiresAdminAccess: false,
  },
  {
    title: "Post Service",
    to: "/marketplace/post-service",
    page: <PostService />,
    isPublic: true,
  },
  {
    title: "Learning Hub",
    to: "/learning",
    page: <LearningHub />,
    isPublic: true,
    requiresAdminAccess: false,
  },
  {
    title: "Services Integration",
    to: "/services/integration",
    page: <ServicesIntegration />,
    isPublic: true,
  },
  {
    title: "Testing & Optimization",
    to: "/services/testing",
    page: <TestingOptimization />,
    isPublic: true,
  },
];
