import React from 'react';
import TalentXcelAIChat from '@/components/ai/TalentXcelAIChat';
import { ProactiveNotificationSystem } from '@/components/ai/ProactiveNotificationSystem';
import { updateMetaTags } from '@/utils/metaTags';

const AIAgentDashboard: React.FC = () => {
  React.useEffect(() => {
    updateMetaTags({
      title: 'TalentXcel AI - Your Career Companion | TalentXcel',
      description: 'ChatGPT-style AI assistant for career growth, job matching, resume optimization, interview prep, and professional networking.'
    });
  }, []);

  return (
    <div className="h-screen bg-background overflow-hidden">
      <TalentXcelAIChat />
      {/* Proactive notification system */}
      <ProactiveNotificationSystem />
    </div>
  );
};

export default AIAgentDashboard;