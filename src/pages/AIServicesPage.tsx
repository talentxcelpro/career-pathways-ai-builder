import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIServiceMatcher } from '@/components/ai/AIServiceMatcher';
import { AIServiceDashboard } from '@/components/ai/AIServiceDashboard';
import { AIServiceHistory } from '@/components/ai/AIServiceHistory';
import { Brain, MessageSquare, History } from 'lucide-react';

const AIServicesPage = () => {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            AI Career Services
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get personalized AI-powered assistance for career coaching, resume optimization, 
            interview preparation, and more.
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-6">
            <AIServiceMatcher />
          </TabsContent>

          <TabsContent value="dashboard" className="mt-6">
            <AIServiceDashboard />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <AIServiceHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIServicesPage;