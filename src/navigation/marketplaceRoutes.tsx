
import Marketplace from "../pages/Marketplace";
import ServiceDetail from "../pages/marketplace/ServiceDetail";
import PostService from "../pages/marketplace/PostService";
import LearningHub from "../pages/LearningHub";
import ServiceMarketplace from "../components/marketplace/ServiceMarketplace";

export const marketplaceRoutes = [
  {
    title: "Marketplace",
    to: "/marketplace",
    page: <Marketplace />,
  },
  {
    title: "Services Directory",
    to: "/services",
    page: <ServiceMarketplace />,
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
];
