import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Target, FileText, MessageSquare } from 'lucide-react';

const AITools = () => {
  const tools = [
    {
      title: 'AI Resume Builder',
      description: 'Create ATS-optimized resumes with AI assistance',
      icon: <FileText className="h-6 w-6" />,
      href: '/resumes'
    },
    {
      title: 'Job Matching AI',
      description: 'Find jobs that match your skills and preferences',
      icon: <Target className="h-6 w-6" />,
      href: '/jobs'
    },
    {
      title: 'Career Advisor',
      description: 'Get personalized career guidance from AI',
      icon: <Brain className="h-6 w-6" />,
      href: '/career-map'
    },
    {
      title: 'Interview Prep AI',
      description: 'Practice interviews with AI-powered mock sessions',
      icon: <MessageSquare className="h-6 w-6" />,
      href: '/learning'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            AI-Powered Career Tools
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Leverage artificial intelligence to accelerate your career growth.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {tools.map((tool, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {tool.icon}
                  <CardTitle>{tool.title}</CardTitle>
                </div>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <a href={tool.href}>Try Now</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AITools;