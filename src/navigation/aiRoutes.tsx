
import { Brain } from "lucide-react";
import AIAssistant from "../pages/ai/AIAssistant";
import AIOptimizer from "../pages/ai/AIOptimizer";
import JobMatch from "../pages/ai/JobMatch";
import MessageSuggest from "../pages/ai/MessageSuggest";
import Pathfinder from "../pages/ai/Pathfinder";

export const aiRoutes = [
  {
    title: "AI Assistant",
    to: "/ai-assistant",
    icon: <Brain className="h-4 w-4" />,
    page: <AIAssistant />,
  },
  {
    title: "AI Optimizer",
    to: "/ai-optimizer",
    page: <AIOptimizer />,
  },
  {
    title: "Job Match",
    to: "/ai/job-match",
    page: <JobMatch />,
  },
  {
    title: "Message Suggest",
    to: "/ai/message-suggest",
    page: <MessageSuggest />,
  },
  {
    title: "Pathfinder",
    to: "/ai/pathfinder",
    page: <Pathfinder />,
  },
];
