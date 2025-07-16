
import React, { useState } from 'react';
import { AIChat } from '@/components/ai/AIChat';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, Sparkles, FileText, Briefcase, TrendingUp } from "lucide-react";

const AIAssistant = () => {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bot className="h-8 w-8 text-blue-600" />
            AI Assistant
          </h1>
          <p className="text-gray-600 mt-2">
            Your comprehensive AI-powered career companion
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-blue-50">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">AI Chat</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Chat with our AI assistant for personalized career advice
              </p>
              <Button
                onClick={() => setShowChat(true)}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Start Chat
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-green-50">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Resume Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Get detailed feedback on your resume with ATS scoring
              </p>
              <Button
                onClick={() => setShowChat(true)}
                className="w-full"
                variant="outline"
              >
                <FileText className="h-4 w-4 mr-2" />
                Analyze Resume
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-purple-50">
                  <Briefcase className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Job Matching</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Find jobs that match your skills and preferences
              </p>
              <Button
                onClick={() => setShowChat(true)}
                className="w-full"
                variant="outline"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Find Jobs
              </Button>
            </CardContent>
          </Card>
        </div>

        {showChat && (
          <div className="flex justify-center">
            <AIChat 
              isOpen={showChat} 
              onClose={() => setShowChat(false)}
              className="relative"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
