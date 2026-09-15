import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Target, FileText, MessageSquare, TrendingUp } from "lucide-react";
import AICareerDashboard from '@/components/ai/AICareerDashboard';
import IntelligentJobMatching from '@/components/ai/IntelligentJobMatching';
import AIResumeAnalyzer from '@/components/ai/AIResumeAnalyzer';
import AICareerChat from '@/components/ai/AICareerChat';

const AICareerIntelligence = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Career Intelligence</h1>
            <p className="text-muted-foreground text-lg">
              Harness the power of AI to accelerate your career growth
            </p>
          </div>
        </div>

        {/* AI Tools Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden md:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="matching" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden md:inline">Job Matching</span>
            </TabsTrigger>
            <TabsTrigger value="resume" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">Resume AI</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden md:inline">Career Chat</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden md:inline">Insights</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            <AICareerDashboard />
          </TabsContent>
          
          <TabsContent value="matching" className="mt-6">
            <IntelligentJobMatching />
          </TabsContent>
          
          <TabsContent value="resume" className="mt-6">
            <AIResumeAnalyzer />
          </TabsContent>
          
          <TabsContent value="chat" className="mt-6">
            <AICareerChat />
          </TabsContent>
          
          <TabsContent value="insights" className="mt-6">
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Career Insights Coming Soon</h3>
              <p className="text-muted-foreground">
                Advanced market analytics and personalized career insights will be available here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AICareerIntelligence;