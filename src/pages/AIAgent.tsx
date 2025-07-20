
import React from 'react';
import { TalentXcelAIAgent } from '@/components/ai-agent/TalentXcelAIAgent';

const AIAgent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            TalentXcel AI Agent
          </h1>
          <p className="text-gray-600">
            Your intelligent career assistant powered by advanced AI
          </p>
        </div>
        
        <div className="h-[calc(100vh-12rem)]">
          <TalentXcelAIAgent className="h-full" />
        </div>
      </div>
    </div>
  );
};

export default AIAgent;
