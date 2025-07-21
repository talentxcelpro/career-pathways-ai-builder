import { PublicPostDetail } from "@/components/posts/PublicPostDetail";
import { NavItem } from "@/types/nav-item";

export const publicRoutes: NavItem[] = [
  {
    title: "Public Post",
    to: "/p/post/:postId",
    icon: "share",
    page: <PublicPostDetail />,
    requiresAuth: false
  }
];