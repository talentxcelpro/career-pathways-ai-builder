import { lazy } from "react";

const Marketplace = lazy(() => import("../pages/Marketplace"));
const ServiceDetail = lazy(() => import("../pages/marketplace/ServiceDetail"));
const PostService = lazy(() => import("../pages/marketplace/PostService"));
const LearningHub = lazy(() => import("../pages/LearningHub"));
const ServicesMarketplace = lazy(() => import("../pages/marketplace/ServicesMarketplace"));
const ServicesIntegration = lazy(() => import("../pages/marketplace/ServicesIntegration"));
const TestingOptimization = lazy(() => import("../pages/marketplace/TestingOptimization"));
const ServiceBookingForm = lazy(() => import("../pages/marketplace/ServiceBookingForm"));
const BusinessModelsHub = lazy(() => import("../components/business-models/BusinessModelsHub"));


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
  {
    title: "Business Models",
    to: "/business-models",
    page: <BusinessModelsHub />,
    isPublic: true,
  },
];
