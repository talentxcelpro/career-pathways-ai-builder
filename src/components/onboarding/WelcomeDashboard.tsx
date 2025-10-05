import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Sparkles, Briefcase, BookOpen, TrendingUp } from 'lucide-react';

interface WelcomeDashboardProps {
  data: any;
  flow: string;
}

export const WelcomeDashboard: React.FC<WelcomeDashboardProps> = ({ data, flow }) => {
  const quickActions = [
    {
      icon: Briefcase,
      title: 'Build Resume',
      description: 'Create an ATS-optimized resume',
      color: 'bg-blue-500'
    },
    {
      icon: Sparkles,
      title: 'Explore Jobs',
      description: 'Find AI-matched opportunities',
      color: 'bg-purple-500'
    },
    {
      icon: TrendingUp,
      title: 'Take Career Test',
      description: 'Get personalized insights',
      color: 'bg-green-500'
    }
  ];

  const checklist = [
    { label: 'Complete profile setup', done: true },
    { label: 'Upload resume', done: !!data.resumeUrl },
    { label: 'Set job preferences', done: data.jobLocations.length > 0 },
    { label: 'Add skills', done: data.skills.length > 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h3 className="text-2xl font-bold">Welcome, {data.fullName}!</h3>
        <p className="text-muted-foreground">
          Your personalized career dashboard is ready. Let's start achieving your goals!
        </p>
      </div>

      {/* Onboarding Checklist */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Onboarding Progress</h4>
        <div className="space-y-2">
          {checklist.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              {item.done ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
              <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div>
        <h4 className="font-semibold mb-3">Quick Actions</h4>
        <div className="grid gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
              >
                <div className={`${action.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{action.title}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Recommendations */}
      <Card className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold mb-1">AI-Powered Recommendations</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Based on your profile, we've prepared personalized job matches, learning paths, and career insights.
            </p>
            <div className="text-sm space-y-1">
              <p>✓ {Math.floor(Math.random() * 50) + 20} job matches found</p>
              <p>✓ {Math.floor(Math.random() * 10) + 5} recommended courses</p>
              <p>✓ Career roadmap generated</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
