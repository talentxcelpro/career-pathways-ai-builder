import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Bot, Sparkles, Zap } from "lucide-react";

const ProAITools: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/pro')} 
            className="mr-4 hover:bg-white/80"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              AI Tools
            </h1>
            <p className="text-gray-600 text-lg">
              Powered AI tools for business automation
            </p>
          </div>
        </div>

        {/* AI Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-blue-600" />
                <CardTitle>AI Assistant</CardTitle>
              </div>
              <CardDescription>
                Get help with business tasks using AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Sparkles className="h-4 w-4 mr-2" />
                Launch AI Assistant
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-purple-600" />
                <CardTitle>Content Generator</CardTitle>
              </div>
              <CardDescription>
                Generate professional content for your services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Content
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-green-600" />
                <CardTitle>Smart Analytics</CardTitle>
              </div>
              <CardDescription>
                AI-powered insights for your business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Feature Description */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>AI-Powered Business Growth</CardTitle>
            <CardDescription>
              Leverage artificial intelligence to streamline your business operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bot className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Automated Workflows</h4>
                <p className="text-sm text-gray-600">Set up intelligent automation for repetitive tasks</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">Smart Insights</h4>
                <p className="text-sm text-gray-600">Get AI-powered recommendations for business growth</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Zap className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Efficiency Boost</h4>
                <p className="text-sm text-gray-600">Increase productivity with intelligent automation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProAITools;