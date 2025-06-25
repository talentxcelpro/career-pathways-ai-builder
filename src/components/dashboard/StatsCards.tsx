
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, FileText, Briefcase, Users } from "lucide-react";

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
      label: "Courses Completed",
      value: userStats.coursesCompleted,
      icon: GraduationCap,
      gradient: "from-blue-500 to-blue-600",
      textColor: "text-blue-100"
    },
    {
      label: "Resume Views",
      value: userStats.resumeViews,
      icon: FileText,
      gradient: "from-green-500 to-green-600",
      textColor: "text-green-100"
    },
    {
      label: "Jobs Applied",
      value: userStats.appliedJobs,
      icon: Briefcase,
      gradient: "from-purple-500 to-purple-600",
      textColor: "text-purple-100"
    },
    {
      label: "Profile Views",
      value: userStats.profileViews,
      icon: Users,
      gradient: "from-orange-500 to-orange-600",
      textColor: "text-orange-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className={`bg-gradient-to-r ${stat.gradient} text-white border-0`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={stat.textColor}>{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${stat.textColor.replace('100', '200')}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
