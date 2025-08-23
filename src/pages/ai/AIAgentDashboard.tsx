import React from 'react';
import { PersonalizedAIAgent } from '@/components/ai/PersonalizedAIAgent';
import { ProactiveNotificationSystem } from '@/components/ai/ProactiveNotificationSystem';
import { updateMetaTags } from '@/utils/metaTags';

const AIAgentDashboard: React.FC = () => {
  React.useEffect(() => {
    updateMetaTags({
      title: 'AI Career Agent | TalentXcel',
      description: 'Your personalized AI career companion providing daily briefings, job matches, and proactive career guidance.'
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">AI Career Agent</h1>
            <p className="text-muted-foreground mt-2">
              Your personalized AI companion for career growth and opportunities
            </p>
          </div>
          
          <PersonalizedAIAgent />
        </div>
      </div>
      
      {/* Proactive notification system */}
      <ProactiveNotificationSystem />
    </div>
  );
};

export default AIAgentDashboard;