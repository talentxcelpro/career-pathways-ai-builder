
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Bot, 
  Send, 
  FileText, 
  Briefcase, 
  MessageSquare, 
  TrendingUp,
  Users,
  Calendar,
  Sparkles,
  Loader2
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  data?: any;
}

interface AIFeature {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
}

export const ComprehensiveAI = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your TalentXcel AI Assistant. I can help you with career guidance, resume analysis, job matching, interview preparation, and much more. What would you like to work on today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('chat');

  const aiFeatures: AIFeature[] = [
    {
      id: 'resume-analyze',
      title: 'Resume Analysis',
      description: 'Get detailed feedback on your resume with ATS scoring',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'job-match',
      title: 'Job Matching',
      description: 'Find jobs that match your skills and preferences',
      icon: Briefcase,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'cover-letter',
      title: 'Cover Letter',
      description: 'Generate personalized cover letters for any job',
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'interview-prep',
      title: 'Interview Prep',
      description: 'Practice with mock interviews and get feedback',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'career-guide',
      title: 'Career Guidance',
      description: 'Get personalized career path recommendations',
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      id: 'event-assist',
      title: 'Event Planning',
      description: 'Plan professional networking events',
      icon: Calendar,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    }
  ];

  const callAI = async (type: string, data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: response, error } = await supabase.functions.invoke('ai-comprehensive', {
        body: {
          type,
          data,
          userId: user?.id
        }
      });

      if (error) throw error;
      return response;
    } catch (error) {
      console.error('AI call error:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await callAI('chat', {
        message: inputMessage,
        history: messages.slice(-5) // Last 5 messages for context
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.response,
        timestamp: new Date().toISOString(),
        data: response
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error('Failed to get AI response');
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeatureAction = async (feature: AIFeature) => {
    setCurrentTab('chat');
    
    const featureMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: `I'd like help with ${feature.title.toLowerCase()}`,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, featureMessage]);
    setIsLoading(true);

    try {
      let response;
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get user profile for context
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      switch (feature.id) {
        case 'resume-analyze':
          response = await callAI('resume-analyze', {
            resumeText: "Please upload your resume or paste its content for analysis",
            targetRole: profile?.title
          });
          break;
        case 'job-match':
          response = await callAI('job-match', {
            userProfile: profile,
            preferences: profile?.preferences
          });
          break;
        case 'cover-letter':
          response = await callAI('cover-letter', {
            userProfile: profile,
            jobDetails: "Please provide job details for a personalized cover letter"
          });
          break;
        case 'interview-prep':
          response = await callAI('interview-prep', {
            jobRole: profile?.title || 'Software Engineer',
            experienceLevel: profile?.experience_years ? 
              (profile.experience_years < 2 ? 'Entry' : 
               profile.experience_years < 5 ? 'Mid' : 'Senior') : 'Mid'
          });
          break;
        case 'career-guide':
          response = await callAI('career-guide', {
            currentRole: profile?.title,
            skills: profile?.skills,
            experience: profile?.experience_years
          });
          break;
        case 'event-assist':
          response = await callAI('event-assist', {
            eventType: 'Professional Networking',
            audience: 'Tech Professionals'
          });
          break;
        default:
          response = { response: `Let me help you with ${feature.title}. What specific assistance do you need?` };
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: typeof response.response === 'string' ? response.response : JSON.stringify(response, null, 2),
        timestamp: new Date().toISOString(),
        data: response
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error(`Failed to get ${feature.title} assistance`);
      console.error('Feature error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Bot className="h-8 w-8 text-blue-600" />
          TalentXcel AI Assistant
        </h1>
        <p className="text-gray-600 mt-2">
          Your comprehensive AI-powered career companion
        </p>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="features">AI Features</TabsTrigger>
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiFeatures.map((feature) => (
              <Card key={feature.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${feature.bgColor}`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <Button
                    onClick={() => handleFeatureAction(feature)}
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chat">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center">
                <Bot className="h-5 w-5 mr-2 text-blue-600" />
                AI Chat Assistant
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[450px] p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-3 ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.type === 'ai' && (
                          <div className="flex items-center mb-2">
                            <Bot className="h-4 w-4 mr-2 text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">AI Assistant</span>
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        <div className={`text-xs mt-2 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-4 py-3">
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span className="text-gray-600">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="border-t p-4">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Ask me anything about your career..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    size="sm"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  AI responses are powered by advanced language models and current industry data
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
