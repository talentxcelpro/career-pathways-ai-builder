
import Marketplace from "../pages/Marketplace";
import ServiceDetail from "../pages/marketplace/ServiceDetail";
import PostService from "../pages/marketplace/PostService";

export const marketplaceRoutes = [
  {
    title: "Marketplace",
    to: "/marketplace",
    page: <Marketplace />,
  },
  {
    title: "Service Detail",
    to: "/marketplace/:id",
    page: <ServiceDetail />,
  },
  {
    title: "Post Service",
    to: "/marketplace/post-service",
    page: <PostService />,
  },
];
