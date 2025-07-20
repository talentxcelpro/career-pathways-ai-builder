
import { Bot } from "lucide-react";
import AIAgent from "../pages/AIAgent";

export const aiRoutes = [
  {
    title: "AI Agent",
    to: "/ai-agent",
    icon: <Bot className="h-4 w-4" />,
    page: <AIAgent />,
    requiresAuth: true,
  },
];
