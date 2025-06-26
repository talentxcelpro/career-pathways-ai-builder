
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Eye, Users, TrendingUp } from "lucide-react";

interface UserStats {
  coursesCompleted: number;
  resumeViews: number;
  appliedJobs: number;
  profileViews: number;
}

interface StatsCardsProps {
  userStats: UserStats;
}

export const StatsCards = ({ userStats }: StatsCardsProps) => {
  const stats = [
    {
      title: "Job Applications",
      value: userStats.appliedJobs.toString(),
      icon: Briefcase,
      trend: "+2 this week"
    },
    {
      title: "Profile Views",
      value: userStats.profileViews.toString(),
      icon: Eye,
      trend: "+12% from last month"
    },
    {
      title: "Resume Views",
      value: userStats.resumeViews.toString(),
      icon: Users,
      trend: "+5 new views"
    },
    {
      title: "Courses Completed",
      value: userStats.coursesCompleted.toString(),
      icon: TrendingUp,
      trend: "+15% this month"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
