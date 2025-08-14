import { Award } from "lucide-react";
import CareerPassportDashboard from "../pages/passport/CareerPassportDashboard";

export const passportRoutes = [
  {
    title: "Career Passport",
    to: "/passport",
    icon: <Award className="h-4 w-4" />,
    page: <CareerPassportDashboard />,
  },
  {
    title: "Career Passport",
    to: "/passport/:userId",
    page: <CareerPassportDashboard />,
  },
];