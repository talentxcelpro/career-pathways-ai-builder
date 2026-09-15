
import { Card, CardContent } from "@/components/ui/card";
import { Eye, TrendingUp, Users, MessageSquare, Download, BarChart3 } from "lucide-react";

interface MetricsCardsProps {
  analyticsData: {
    totalViews: number;
    weeklyViews: number;
    connectionRequests: number;
    messagesSent: number;
    resumeDownloads: number;
    searchAppearances: number;
  };
}

export const MetricsCards = ({ analyticsData }: MetricsCardsProps) => {
  const metrics = [
    {
      icon: Eye,
      value: analyticsData.totalViews,
      label: "Total Views",
      change: "+12% this month",
      color: "text-blue-600"
    },
    {
      icon: TrendingUp,
      value: analyticsData.weeklyViews,
      label: "Weekly Views",
      change: "+8% vs last week",
      color: "text-green-600"
    },
    {
      icon: Users,
      value: analyticsData.connectionRequests,
      label: "Connection Requests",
      change: "+15% this month",
      color: "text-purple-600"
    },
    {
      icon: MessageSquare,
      value: analyticsData.messagesSent,
      label: "Messages Received",
      change: "+3% this month",
      color: "text-orange-600"
    },
    {
      icon: Download,
      value: analyticsData.resumeDownloads,
      label: "Resume Downloads",
      change: "+22% this month",
      color: "text-red-600"
    },
    {
      icon: BarChart3,
      value: analyticsData.searchAppearances,
      label: "Search Appearances",
      change: "+18% this month",
      color: "text-indigo-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Icon className={`h-8 w-8 ${metric.color} mx-auto mb-2`} />
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <div className="text-sm text-gray-600">{metric.label}</div>
              <div className="text-xs text-green-600 mt-1">{metric.change}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
