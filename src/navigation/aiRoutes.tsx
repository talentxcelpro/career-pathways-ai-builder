
import { Brain } from "lucide-react";
import AIAssistant from "../pages/ai/AIAssistant";
import AIOptimizer from "../pages/ai/AIOptimizer";
import JobMatch from "../pages/ai/JobMatch";
import MessageSuggest from "../pages/ai/MessageSuggest";
import Pathfinder from "../pages/ai/Pathfinder";
import { AICareerAnalytics } from "../components/ai/AICareerAnalytics";
import { PredictiveJobRecommendations } from "../components/ai/PredictiveJobRecommendations";
import { SmartNetworkAnalytics } from "../components/ai/SmartNetworkAnalytics";

export const aiRoutes = [
  {
    title: "AI Assistant",
    to: "/ai-assistant",
    icon: <Brain className="h-4 w-4" />,
    page: <AIAssistant />,
  },
  {
    title: "AI Assistant Alt",
    to: "/ai/assistant",
    page: <AIAssistant />,
  },
  {
    title: "AI Optimizer",
    to: "/ai-optimizer",
    page: <AIOptimizer />,
  },
  {
    title: "AI Job Match",
    to: "/ai/job-match",
    page: <JobMatch />,
  },
  {
    title: "AI Message Suggest",
    to: "/ai/message-suggest",
    page: <MessageSuggest />,
  },
  {
    title: "AI Pathfinder",
    to: "/ai/pathfinder",
    page: <Pathfinder />,
  },
  {
    title: "Career Analytics",
    to: "/ai/career-analytics",
    page: <AICareerAnalytics />,
  },
  {
    title: "Job Predictions",
    to: "/ai/job-predictions",
    page: <PredictiveJobRecommendations />,
  },
  {
    title: "Network Analytics",
    to: "/ai/network-analytics",
    page: <SmartNetworkAnalytics />,
  },
];
