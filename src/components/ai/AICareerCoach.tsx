import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Bot, User, Send, Lightbulb, TrendingUp, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actionable?: boolean;
}

interface CoachingSession {
  sessionId: string;
  topic: string;
  messages: Message[];
  insights: string[];
}

const AICareerCoach: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "👋 Hi! I'm your AI Career Coach. I'm here to help you navigate your career journey with personalized insights and actionable advice. What career challenge can I help you with today?",
      timestamp: new Date(),
      suggestions: [
        "How to transition to a new industry?",
        "Negotiate a better salary",
        "Improve my leadership skills",
        "Plan my next career move"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentSession, setCurrentSession] = useState<CoachingSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-career-coach', {
        body: {
          message: inputMessage,
          userId: user.id,
          conversationHistory: messages.slice(-5) // Last 5 messages for context
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date(),
        suggestions: data.suggestions,
        actionable: data.actionable
      };

      setMessages(prev => [...prev, aiMessage]);

      if (data.insights) {
        toast.success('New career insights generated!');
      }

    } catch (error) {
      console.error('Error sending message to AI coach:', error);
      toast.error('Failed to get AI response');
      
      // Fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I apologize, but I'm having trouble connecting right now. Let me suggest some general career guidance: Focus on developing both technical and soft skills, network actively in your industry, and regularly review your career goals. How can I help you with a specific aspect of your career?",
        timestamp: new Date(),
        suggestions: [
          "Tell me about skill development",
          "Help with networking strategies",
          "Career goal setting",
          "Industry trends"
        ]
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI Career Coach</h2>
          <p className="text-muted-foreground">Get personalized career guidance powered by AI</p>
        </div>
      </div>

      {/* Coach Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <Lightbulb className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Personalized Insights</h3>
            <p className="text-sm text-muted-foreground">AI-driven career recommendations</p>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Growth Planning</h3>
            <p className="text-sm text-muted-foreground">Strategic career path development</p>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Goal Achievement</h3>
            <p className="text-sm text-muted-foreground">Actionable steps to reach objectives</p>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Career Coaching Session
            <Badge variant="secondary" className="ml-auto">Active</Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'ai' && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                    <div
                      className={`rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      
                      {message.actionable && (
                        <Badge variant="outline" className="mt-2" size="sm">
                          Actionable Advice
                        </Badge>
                      )}
                    </div>
                    
                    {/* Suggestions */}
                    {message.suggestions && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  
                  {message.type === 'user' && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-secondary">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your career..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AICareerCoach;