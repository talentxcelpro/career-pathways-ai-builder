
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Search, Users, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export const QuickActions = () => {
  const actions = [
    {
      title: "Build Resume",
      description: "Create or update your professional resume",
      icon: FileText,
      href: "/resume-builder",
      color: "bg-blue-500"
    },
    {
      title: "Find Jobs",
      description: "Search for your next opportunity",
      icon: Search,
      href: "/jobs",
      color: "bg-green-500"
    },
    {
      title: "Connect",
      description: "Expand your professional network",
      icon: Users,
      href: "/network",
      color: "bg-purple-500"
    },
    {
      title: "Learn Skills",
      description: "Enhance your expertise with courses",
      icon: BookOpen,
      href: "/learning",
      color: "bg-orange-500"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks to boost your career
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} to={action.href}>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 w-full">
                  <div className={`p-2 rounded-full ${action.color} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
