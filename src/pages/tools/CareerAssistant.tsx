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
  type: 'user' | 'assistant';
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

export const CareerAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI Career Assistant. I can help you with career planning, job search strategies, interview preparation, salary negotiations, and professional development. What would you like to discuss today?",
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
      description: '5 new connections in your target companies this week',
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
        type: 'assistant',
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
      title: 'Get AI Insights',
      description: 'Receive personalized recommendations',
      component: <div>AI insights component</div>,
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
      title="AI Career Assistant"
      description="Get personalized career guidance, strategic advice, and actionable insights from your AI career coach"
      category="Career"
      estimatedTime="Ongoing"
      popularity={95}
      steps={steps}
      currentStep={0}
      onStepChange={() => {}}
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Career Assistant
                </span>
                <Button variant="outline" size="sm" onClick={handleSaveConversation}>
                  <Save className="h-4 w-4 mr-1" />
                  Save Chat
                </Button>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback>
                          {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={`rounded-lg p-3 ${
                        message.type === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        
                        {message.suggestions && (
                          <div className="mt-3 space-y-1">
                            {message.suggestions.map((suggestion, i) => (
                              <button
                                key={i}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="block w-full text-left text-xs p-2 rounded border border-border hover:bg-accent transition-colors"
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
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything about your career..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isTyping}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Career Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((insight, i) => {
                const IconComponent = getCategoryIcon(insight.category);
                return (
                  <div key={i} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-sm font-medium">{insight.title}</h4>
                      </div>
                      <Badge variant={getPriorityColor(insight.priority)} className="text-xs">
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Update my career goals",
                "Review job applications",
                "Plan networking strategy",
                "Analyze skill gaps"
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="w-full justify-start text-sm"
                  onClick={() => handleSuggestionClick(action)}
                >
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