
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileCheck, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  MessageSquare, 
  Brain, 
  Award 
} from 'lucide-react';

const ToolsNavigation = () => {
  const location = useLocation();
  
  const tools = [
    {
      id: 'resume-check',
      title: 'Resume Checker',
      icon: FileCheck,
      path: '/tools/resume-check',
      color: 'text-blue-600',
      popular: true
    },
    {
      id: 'cover-letter',
      title: 'Cover Letter',
      icon: FileText,
      path: '/tools/cover-letter',
      color: 'text-green-600',
      popular: true
    },
    {
      id: 'salary-analyzer',
      title: 'Salary Analyzer',
      icon: DollarSign,
      path: '/tools/salary-analyzer',
      color: 'text-yellow-600',
      popular: false
    },
    {
      id: 'market-insights',
      title: 'Market Insights',
      icon: TrendingUp,
      path: '/tools/market-insights',
      color: 'text-purple-600',
      popular: false
    },
    {
      id: 'interview-prep',
      title: 'Interview Prep',
      icon: MessageSquare,
      path: '/tools/interview-prep',
      color: 'text-orange-600',
      popular: true
    },
    {
      id: 'ai-assistant',
      title: 'AI Assistant',
      icon: Brain,
      path: '/tools/ai-assistant',
      color: 'text-indigo-600',
      popular: false
    },
    {
      id: 'profile-score',
      title: 'Profile Score',
      icon: Award,
      path: '/tools/profile-score',
      color: 'text-red-600',
      popular: false
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 py-4 overflow-x-auto">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = location.pathname === tool.path;
            
            return (
              <Link key={tool.id} to={tool.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`flex items-center space-x-2 whitespace-nowrap relative ${
                    isActive ? '' : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : tool.color}`} />
                  <span>{tool.title}</span>
                  {tool.popular && !isActive && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      Popular
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ToolsNavigation;
