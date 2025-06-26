
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, BookOpen } from "lucide-react";

export const CareerInsights = () => {
  const insights = [
    {
      title: "Profile Completeness",
      value: 75,
      description: "Add more skills to reach 100%",
      icon: Target,
      color: "text-blue-600"
    },
    {
      title: "Skill Development",
      value: 60,
      description: "Complete 2 more courses",
      icon: BookOpen,
      color: "text-green-600"
    },
    {
      title: "Market Demand",
      value: 85,
      description: "Your skills are in high demand",
      icon: TrendingUp,
      color: "text-purple-600"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Career Insights</CardTitle>
        <CardDescription>
          Track your professional growth
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-4 w-4 ${insight.color}`} />
                    <span className="font-medium">{insight.title}</span>
                  </div>
                  <span className="text-sm font-semibold">{insight.value}%</span>
                </div>
                <Progress value={insight.value} className="w-full" />
                <p className="text-xs text-muted-foreground">{insight.description}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
