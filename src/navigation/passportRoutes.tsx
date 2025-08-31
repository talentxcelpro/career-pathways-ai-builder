import { Award } from "lucide-react";
import CareerPassportDashboard from "../pages/passport/CareerPassportDashboard";
import PassportRouteHandler from "@/components/passport/PassportRouteHandler";
export const passportRoutes = [
  {
    title: "Career Passport",
    to: "/passport",
    icon: <Award className="h-4 w-4" />,
    page: <CareerPassportDashboard />,
    isPublic: true,
    requiresAuth: true,
  },
  {
    title: "Career Passport",
    to: "/passport/user/:userId",
    page: <CareerPassportDashboard />,
  },
  {
    title: "Career Passport",
    to: "/passport/:username",
    page: <PassportRouteHandler />,
  },
];