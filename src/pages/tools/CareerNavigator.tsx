import React, { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, Bot, User, Sparkles, FileText, TrendingUp, Save } from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  type: 'user' | 'TalentXcel';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actionable?: boolean;
}

interface CareerInsight {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'skills' | 'networking' | 'applications' | 'personal_brand';
}

export const CareerNavigator: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'TalentXcel',
      content: "Hello! I'm your TalentXcel AI Navigator. I can help you with career planning, job search strategies, interview preparation, salary negotiations, and professional development. What would you like to discuss today?",
      timestamp: new Date(),
      suggestions: [
        "Help me plan my career path",
        "Review my job search strategy",
        "Prepare for interviews",
        "Negotiate my salary"
      ]
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [insights] = useState<CareerInsight[]>([
    {
      title: 'Update LinkedIn Profile',
      description: 'Your profile views have increased 40% - optimize your headline now',
      priority: 'high',
      category: 'personal_brand'
    },
    {
      title: 'Network Expansion',
      description: '5 new talent matches in your target companies this week',
      priority: 'medium',
      category: 'networking'
    },
    {
      title: 'Skill Gap Alert',
      description: 'Python skills trending +20% for your target roles',
      priority: 'high',
      category: 'skills'
    }
  ]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'TalentXcel',
        content: generateAIResponse(currentMessage),
        timestamp: new Date(),
        actionable: true,
        suggestions: [
          "Tell me more about this",
          "Create an action plan",
          "Show me examples"
        ]
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const generateAIResponse = (message: string): string => {
    const responses = {
      career: "Based on your profile, I recommend focusing on these key areas: 1) Develop leadership skills through cross-functional projects, 2) Build expertise in emerging technologies like AI/ML, 3) Expand your professional network in target companies. Would you like me to create a detailed 6-month action plan?",
      job: "Your job search strategy looks good! I notice you could improve in these areas: 1) Optimize your LinkedIn for recruiters, 2) Target 5-7 companies specifically, 3) Build relationships before applying. Your current application-to-response rate is 12% - let's get it to 20%+",
      interview: "Great question! For your target roles, focus on: 1) STAR method for behavioral questions, 2) Technical skills demonstration, 3) Leadership examples. I can create mock interview questions based on your recent applications. Would that help?",
      salary: "Salary negotiation is crucial! Based on your experience and location, the market range is $85K-$120K. Key strategies: 1) Research company-specific data, 2) Highlight unique value, 3) Negotiate total compensation. Want me to draft negotiation talking points?"
    };

    const key = Object.keys(responses).find(k => message.toLowerCase().includes(k));
    return key ? responses[key as keyof typeof responses] : "I understand you're looking for career guidance. Could you be more specific about what aspect you'd like help with? I can assist with career planning, job search, interviews, or professional development.";
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
  };

  const handleSaveConversation = () => {
    toast.success('Conversation saved to your career journal');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'skills': return TrendingUp;
      case 'networking': return MessageSquare;
      case 'applications': return FileText;
      case 'personal_brand': return User;
      default: return Sparkles;
    }
  };

  const steps = [
    {
      id: 'conversation',
      title: 'Start Conversation',
      description: 'Ask any career-related question',
      component: <div>Chat interface component</div>,
      isCompleted: messages.length > 1
    },
    {
      id: 'insights',
      title: 'Get Intelligence Signals',
      description: 'Receive personalized recommendations',
      component: <div>Intelligence Signals component</div>,
      isCompleted: messages.length > 2
    },
    {
      id: 'action',
      title: 'Take Action',
      description: 'Implement suggested strategies',
      component: <div>Action plan component</div>,
      isCompleted: false
    }
  ];

  return (
    <ToolLayout
      title="TalentXcel AI Navigator"
      description="Get personalized career guidance, strategic advice, and actionable insights from your AI career coach"
      category="Intelligence"
      estimatedTime="Ongoing"
      popularity={95}
      steps={steps}
      currentStep={0}
      onStepChange={() => {}}
    >
      <div className="grid lg:grid-cols-3 gap-6 edge-to-edge">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col rounded-[32px] border-slate-200 overflow-hidden shadow-xl">
            <CardHeader className="flex-shrink-0 bg-slate-950 text-white">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-apple-heavy">
                  <Bot className="h-5 w-5 text-blue-400" />
                  TalentXcel Navigator
                </span>
                <Button variant="outline" size="sm" onClick={handleSaveConversation} className="border-white/20 text-white hover:bg-white/10 rounded-xl">
                  <Save className="h-4 w-4 mr-1" />
                  Save Session
                </Button>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-6 bg-slate-50/50">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-6 mb-4 px-2">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-4 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="w-10 h-10 flex-shrink-0 border-2 border-white shadow-sm">
                        <AvatarFallback className={message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-950 text-white'}>
                          {message.type === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={`rounded-2xl p-4 shadow-sm ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-white border border-slate-100 text-slate-900 rounded-tl-none'
                      }`}>
                        <p className="text-sm font-apple-medium whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        
                        {message.suggestions && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, i) => (
                              <button
                                key={i}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-4 py-2 rounded-xl text-xs font-apple-bold border border-slate-200 hover:bg-slate-50 transition-all bg-white text-slate-700 shadow-sm"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-slate-950 text-white">
                          <Bot className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4 shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input */}
              <div className="flex gap-3 bg-white p-3 rounded-[24px] border border-slate-200 shadow-lg">
                <Input
                  placeholder="Ask your AI Navigator about your career path..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 border-0 focus-visible:ring-0 text-sm font-apple-medium bg-transparent"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isTyping}
                  size="icon"
                  className="rounded-xl bg-slate-950 hover:bg-slate-900 shadow-lg"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights Panel */}
        <div className="space-y-6">
          <Card className="rounded-[32px] border-slate-200 overflow-hidden shadow-xl">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-lg font-apple-heavy">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Intelligence Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {insights.map((insight, i) => {
                const IconComponent = getCategoryIcon(insight.category);
                return (
                  <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl space-y-3 hover:border-blue-200 transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                          <IconComponent className="h-4 w-4 text-slate-500 group-hover:text-blue-600" />
                        </div>
                        <h4 className="text-sm font-apple-bold text-slate-900">{insight.title}</h4>
                      </div>
                      <Badge className={`text-[9px] font-apple-heavy uppercase tracking-widest rounded-lg ${
                        insight.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-xs font-apple-medium text-slate-500 leading-relaxed">{insight.description}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-slate-200 overflow-hidden shadow-xl">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-lg font-apple-heavy">Strategic Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              {[
                "Update my career roadmap",
                "Review active opportunities",
                "Optimize network strategy",
                "Analyze technical skill gaps"
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="w-full justify-start text-xs font-apple-bold h-12 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-950 transition-all"
                  onClick={() => handleSuggestionClick(action)}
                >
                  <Plus className="mr-3 h-4 w-4 text-slate-400" />
                  {action}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolLayout>
  );
};
