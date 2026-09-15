import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Settings, DollarSign, Zap } from 'lucide-react';
import { AICareerAssistantDialog } from './AICareerAssistantDialog';
import { JobPreferencesDialog } from './JobPreferencesDialog';
import { SalaryInsightsDialog } from './SalaryInsightsDialog';

interface QuickActionsProps {
  currentUser?: any;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ currentUser }) => {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showSalaryInsights, setShowSalaryInsights] = useState(false);

  const quickActions = [
    {
      title: 'Ask AI Career Assistant',
      description: 'Get personalized career advice',
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      onClick: () => setShowAIAssistant(true)
    },
    {
      title: 'Update Job Preferences',
      description: 'Customize your job search',
      icon: Settings,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      onClick: () => setShowPreferences(true)
    },
    {
      title: 'View Salary Insights',
      description: 'Market salary data',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      onClick: () => setShowSalaryInsights(true)
    }
  ];

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className={`h-auto p-4 flex flex-col items-center text-center gap-3 ${action.bgColor} border border-gray-200 hover:border-gray-300 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <Icon className={`h-8 w-8 ${action.color}`} />
                  <div>
                    <div className="font-semibold text-gray-900">{action.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{action.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AICareerAssistantDialog 
        open={showAIAssistant} 
        onOpenChange={setShowAIAssistant}
        currentUser={currentUser}
      />
      
      <JobPreferencesDialog 
        open={showPreferences} 
        onOpenChange={setShowPreferences}
        currentUser={currentUser}
      />
      
      <SalaryInsightsDialog 
        open={showSalaryInsights} 
        onOpenChange={setShowSalaryInsights}
      />
    </>
  );
};