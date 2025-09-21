import { Award, QrCode, BarChart3 } from "lucide-react";
import CareerPassportDashboard from "../pages/passport/CareerPassportDashboard";
import PassportRouteHandler from "@/components/passport/PassportRouteHandler";
import PublicPassportView from "../pages/PublicPassportView";
import QRNetworking from "../pages/QRNetworking";
import CareerIntelligenceDashboard from "../pages/CareerIntelligenceDashboard";
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
  {
    title: "Public Career Passport",
    to: "/passport/public/:identifier",
    page: <PublicPassportView />,
    isPublic: true,
    requiresAuth: false,
  },
  {
    title: "QR Networking",
    to: "/qr-networking",
    icon: <QrCode className="h-4 w-4" />,
    page: <QRNetworking />,
    requiresAuth: true,
  },
  {
    title: "Career Intelligence",
    to: "/career-intelligence-dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <CareerIntelligenceDashboard />,
    requiresAuth: true,
  },
];