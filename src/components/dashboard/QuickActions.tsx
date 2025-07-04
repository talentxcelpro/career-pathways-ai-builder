
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Search, Users, BookOpen, ArrowRight, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Profile Views",
      description: "See who viewed your profile",
      icon: Eye,
      href: "/network/profile/analytics",
      color: "from-indigo-500 to-indigo-600",
      textColor: "text-indigo-700"
    },
    {
      title: "Build Resume",
      description: "Create professional resume",
      icon: FileText,
      href: "/tools/resume-builder",
      color: "from-blue-500 to-blue-600",
      textColor: "text-blue-700"
    },
    {
      title: "Find Jobs",
      description: "Browse opportunities",
      icon: Search,
      href: "/jobs",
      color: "from-green-500 to-green-600",
      textColor: "text-green-700"
    },
    {
      title: "Network",
      description: "Connect with peers",
      icon: Users,
      href: "/network",
      color: "from-purple-500 to-purple-600",
      textColor: "text-purple-700"
    },
    {
      title: "Learn",
      description: "Develop new skills",
      icon: BookOpen,
      href: "/learning",
      color: "from-orange-500 to-orange-600",
      textColor: "text-orange-700"
    }
  ];

  const handleActionClick = (href: string) => {
    navigate(href);
  };

  return (
    <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-800">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button 
              key={index}
              variant="ghost" 
              className="w-full justify-between p-2 h-auto hover:bg-slate-50 group"
              onClick={() => handleActionClick(action.href)}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md bg-gradient-to-r ${action.color}`}>
                  <Icon className="h-3 w-3 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-medium text-slate-800">{action.title}</div>
                  <div className="text-xs text-slate-500">{action.description}</div>
                </div>
              </div>
              <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};
