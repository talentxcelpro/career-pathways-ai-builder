
import { Button } from "@/components/ui/button";
import { FileText, Users, BookOpen, Target } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: FileText,
      label: "Build Resume",
      onClick: () => navigate('/tools/resume-builder'),
      primary: true
    },
    {
      icon: Users,
      label: "Edit Profile",
      onClick: () => navigate('/profile')
    },
    {
      icon: BookOpen,
      label: "Learning Hub",
      onClick: () => navigate('/learning')
    },
    {
      icon: Target,
      label: "Career Map",
      onClick: () => {}
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button 
              key={index}
              className={`h-24 ${action.primary 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' 
                : ''}`}
              variant={action.primary ? 'default' : 'outline'}
              onClick={action.onClick}
            >
              <div className="text-center">
                <Icon className="h-6 w-6 mx-auto mb-2" />
                <span>{action.label}</span>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
