
import { lazy, Suspense } from "react";

const Marketplace = lazy(() => import("../pages/Marketplace"));
const ServiceDetail = lazy(() => import("../pages/marketplace/ServiceDetail"));
const PostService = lazy(() => import("../pages/marketplace/PostService"));
const LearningHub = lazy(() => import("../pages/LearningHub"));
const ServicesMarketplace = lazy(() => import("../pages/marketplace/ServicesMarketplace"));
const ServicesIntegration = lazy(() => import("../pages/marketplace/ServicesIntegration"));
const TestingOptimization = lazy(() => import("../pages/marketplace/TestingOptimization"));
const ServiceBookingForm = lazy(() => import("../pages/marketplace/ServiceBookingForm"));
const BusinessModelsHub = lazy(() => import("../components/business-models/BusinessModelsHub"));

const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={null}>{children}</Suspense>
);

export const marketplaceRoutes = [
  {
    title: "Marketplace",
    to: "/marketplace",
    page: <S><Marketplace /></S>,
    isPublic: true,
  },
  {
    title: "Services Directory",
    to: "/services",
    page: <S><Marketplace /></S>,
    isPublic: true,
    requiresAdminAccess: false,
  },
  {
    title: "Service Detail",
    to: "/marketplace/:id",
    page: <S><ServiceDetail /></S>,
    isPublic: true,
    requiresAdminAccess: false,
  },
  {
    title: "Service Detail by ID",
    to: "/services/:id",
    page: <S><ServiceDetail /></S>,
    isPublic: true,
    requiresAdminAccess: false,
  },
  {
    title: "Service Booking",
    to: "/services/book/:id",
    page: <S><ServiceBookingForm /></S>,
    isPublic: true,
    requiresAdminAccess: false,
  },
  {
    title: "Post Service",
    to: "/marketplace/post-service",
    page: <S><PostService /></S>,
    isPublic: true,
  },
  {
    title: "Learning Hub",
    to: "/learning",
    page: <S><LearningHub /></S>,
    isPublic: true,
    requiresAdminAccess: false,
  },
  {
    title: "Services Integration",
    to: "/services/integration",
    page: <S><ServicesIntegration /></S>,
    isPublic: true,
  },
  {
    title: "Testing & Optimization",
    to: "/services/testing",
    page: <S><TestingOptimization /></S>,
    isPublic: true,
  },
  {
    title: "Business Models",
    to: "/business-models",
    page: <S><BusinessModelsHub /></S>,
    isPublic: true,
  },
];
