
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Eye, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

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
      trend: "+2 this week",
      trendUp: true,
      color: "blue",
      bgGradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Profile Views",
      value: userStats.profileViews.toString(),
      icon: Eye,
      trend: "+12% from last month",
      trendUp: true,
      color: "green",
      bgGradient: "from-green-500 to-emerald-500"
    },
    {
      title: "Resume Views",
      value: userStats.resumeViews.toString(),
      icon: Users,
      trend: "+5 new views",
      trendUp: true,
      color: "purple",
      bgGradient: "from-purple-500 to-violet-500"
    },
    {
      title: "Courses Completed",
      value: userStats.coursesCompleted.toString(),
      icon: TrendingUp,
      trend: "+15% this month",
      trendUp: true,
      color: "orange",
      bgGradient: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.bgGradient}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs font-medium border-0 ${
                    stat.trendUp 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {stat.trendUp ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {stat.trend.includes('%') ? stat.trend.split(' ')[0] : stat.trend.split(' ')[0]}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500 font-medium">{stat.trend}</p>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3">
                <div className="w-full bg-slate-100 rounded-full h-1">
                  <div 
                    className={`bg-gradient-to-r ${stat.bgGradient} h-1 rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min(parseInt(stat.value) * 10, 100)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
