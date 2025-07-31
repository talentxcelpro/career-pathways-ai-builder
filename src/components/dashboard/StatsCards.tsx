
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Eye, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface UserStats {
  coursesCompleted: number;
  resumeViews: number;
  appliedJobs: number;
  appliedJobsThisWeek?: number;
  profileViews: number;
}

interface StatsCardsProps {
  userStats: UserStats;
}

export const StatsCards = ({ userStats }: StatsCardsProps) => {
  const stats = [
    {
      title: "Applications",
      value: userStats.appliedJobs.toString(),
      icon: Briefcase,
      trend: userStats.appliedJobsThisWeek ? `+${userStats.appliedJobsThisWeek} this week` : "+0 this week",
      trendUp: true,
      color: "blue",
      bgGradient: "from-blue-500 to-cyan-500",
      description: "Jobs applied"
    },
    {
      title: "Profile Views",
      value: userStats.profileViews.toString(),
      icon: Eye,
      trend: "+12%",
      trendUp: true,
      color: "green",
      bgGradient: "from-green-500 to-emerald-500",
      description: "This month"
    },
    {
      title: "Resume Views",
      value: userStats.resumeViews.toString(),
      icon: Users,
      trend: "+5 new",
      trendUp: true,
      color: "purple",
      bgGradient: "from-purple-500 to-violet-500",
      description: "Downloads"
    },
    {
      title: "Courses",
      value: userStats.coursesCompleted.toString(),
      icon: Star,
      trend: "Completed",
      trendUp: true,
      color: "orange",
      bgGradient: "from-orange-500 to-red-500",
      description: "Skills gained"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const cardContent = (
          <CardContent className="p-3">
            {/* Header with icon and trend */}
            <div className="flex items-center justify-between mb-2">
              <div className={`p-1.5 rounded-md bg-gradient-to-r ${stat.bgGradient}`}>
                <Icon className="h-3 w-3 text-white" />
              </div>
              <Badge 
                variant="outline" 
                className={`text-xs font-medium border-0 px-1.5 py-0.5 ${
                  stat.trendUp 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {stat.trendUp ? (
                  <ArrowUpRight className="h-2 w-2 mr-0.5" />
                ) : (
                  <ArrowDownRight className="h-2 w-2 mr-0.5" />
                )}
                <span className="text-xs">{stat.trend.split(' ')[0]}</span>
              </Badge>
            </div>
            
            {/* Main content */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <h3 className="text-lg font-bold text-slate-900">{stat.value}</h3>
                <span className="text-xs font-medium text-slate-600">{stat.title}</span>
              </div>
              <p className="text-xs text-slate-500">{stat.description}</p>
            </div>
            
            {/* Mini progress indicator */}
            <div className="mt-2">
              <div className="w-full bg-slate-100 rounded-full h-1">
                <div 
                  className={`bg-gradient-to-r ${stat.bgGradient} h-1 rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min(parseInt(stat.value) * 15, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        );

        if (stat.title === "Applications") {
          return (
            <Link key={index} to="/my-applications">
              <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 bg-white/90 backdrop-blur-sm cursor-pointer">
                {cardContent}
              </Card>
            </Link>
          );
        }

        return (
          <Card 
            key={index} 
            className="border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 bg-white/90 backdrop-blur-sm"
          >
            {cardContent}
          </Card>
        );
      })}
    </div>
  );
};
