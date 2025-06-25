
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BookOpen, Briefcase, Users } from "lucide-react";

export const CareerInsights = () => {
  const insights = [
    {
      icon: BookOpen,
      title: "Skill Gaps",
      description: "Complete 2 more courses to match your target role",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      icon: Briefcase,
      title: "Job Matches",
      description: "5 new jobs match your profile this week",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      icon: Users,
      title: "Network Growth",
      description: "Connect with 3 professionals in your field",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Career Insights
        </CardTitle>
        <CardDescription>Personalized recommendations for your career growth</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div key={index} className={`text-center p-4 ${insight.bgColor} rounded-lg`}>
                <Icon className={`h-8 w-8 ${insight.iconColor} mx-auto mb-2`} />
                <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
