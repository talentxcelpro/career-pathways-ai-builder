
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, BookOpen, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CareerInsights = () => {
  const navigate = useNavigate();

  const insights = [
    {
      title: "Profile Strength",
      value: 85,
      description: "Add portfolio to reach 100%",
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      status: "good",
      action: () => navigate('/profile')
    },
    {
      title: "Skill Relevance",
      value: 92,
      description: "Skills match market demand",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
      status: "excellent",
      action: () => navigate('/tools/skill-assessor')
    },
    {
      title: "Learning Progress",
      value: 60,
      description: "2 courses in progress",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      status: "active",
      action: () => navigate('/learning')
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Excellent</Badge>;
      case 'good':
        return <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Good</Badge>;
      case 'active':
        return <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">Active</Badge>;
      default:
        return null;
    }
  };

  const handleAISuggestionClick = () => {
    navigate('/profile/media');
  };

  return (
    <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-600" />
            Career Insights
          </CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </div>
        <CardDescription className="text-xs">
          AI-powered career recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-1 rounded ${insight.bgColor}`}>
                    <Icon className={`h-3 w-3 ${insight.color}`} />
                  </div>
                  <button 
                    className="text-xs font-medium text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
                    onClick={insight.action}
                  >
                    {insight.title}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900">{insight.value}%</span>
                  {getStatusBadge(insight.status)}
                </div>
              </div>
              <Progress value={insight.value} className="w-full h-1.5 cursor-pointer" onClick={insight.action} />
              <p className="text-xs text-slate-500">{insight.description}</p>
            </div>
          );
        })}
        
        {/* Enhanced AI Recommendation */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
             onClick={handleAISuggestionClick}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <Zap className="h-3 w-3 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-900">AI Suggestion</p>
                <p className="text-xs text-blue-700">Add 2 portfolio projects to boost your profile by 15%</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-200"
              onClick={(e) => {
                e.stopPropagation();
                handleAISuggestionClick();
              }}
            >
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
