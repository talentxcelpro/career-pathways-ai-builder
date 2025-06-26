
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Eye, Users, TrendingUp } from "lucide-react";

export const StatsCards = () => {
  const stats = [
    {
      title: "Job Applications",
      value: "12",
      icon: Briefcase,
      trend: "+2 this week"
    },
    {
      title: "Profile Views",
      value: "134",
      icon: Eye,
      trend: "+12% from last month"
    },
    {
      title: "Network Connections",
      value: "48",
      icon: Users,
      trend: "+5 new connections"
    },
    {
      title: "Skill Progress",
      value: "78%",
      icon: TrendingUp,
      trend: "+15% this month"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.trend}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
