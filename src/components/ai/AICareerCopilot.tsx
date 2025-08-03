import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  Target,
  FileText,
  Briefcase,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { useEnhancedAIService } from '@/hooks/useEnhancedAIService';
import { useCareerPassport } from '@/hooks/useCareerPassport';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AICareerCopilotProps {
  context?: string;
  onClose?: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export function AICareerCopilot({ 
  context = 'dashboard',
  onClose,
  isMinimized = false,
  onToggleMinimize
}: AICareerCopilotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { invokeWithFeedback, isProcessing } = useEnhancedAIService();
  const { careerPassport } = useCareerPassport();

  // Initial welcome message based on context
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'assistant',
      content: getWelcomeMessage(context),
      timestamp: new Date(),
      suggestions: getContextualSuggestions(context)
    };
    setMessages([welcomeMessage]);
  }, [context]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getWelcomeMessage = (context: string) => {
    switch (context) {
      case 'dashboard':
        return `Hi! I'm your AI Career Copilot. I can help you navigate your career journey, find opportunities, and optimize your profile. Your career completion is at ${careerPassport?.completion_percentage || 0}% - great progress!`;
      case 'resume':
        return "I'm here to help you create an outstanding resume! I can analyze your content, suggest improvements, and help you tailor it for specific roles.";
      case 'jobs':
        return "Looking for the perfect job? I can help you find roles that match your skills, prepare applications, and even practice interview questions!";
      default:
        return "Hello! I'm your AI Career Copilot. How can I help you advance your career today?";
    }
  };

  const getContextualSuggestions = (context: string) => {
    switch (context) {
      case 'dashboard':
        return [
          "What should I work on next?",
          "Analyze my career progress",
          "Find job opportunities for me",
          "Help me improve my profile"
        ];
      case 'resume':
        return [
          "Review my resume",
          "How can I improve my skills section?",
          "Help me write a better summary",
          "Make my resume ATS-friendly"
        ];
      case 'jobs':
        return [
          "Find jobs matching my skills",
          "Help me write a cover letter",
          "Prepare me for interviews",
          "What skills should I learn?"
        ];
      default:
        return [
          "What career advice do you have?",
          "Help me plan my next steps",
          "Analyze my strengths",
          "Find growth opportunities"
        ];
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await invokeWithFeedback({
        toolSlug: 'career-advisor',
        inputData: {
          userMessage: content,
          context,
          careerPassport,
          conversationHistory: messages.slice(-5) // Last 5 messages for context
        },
        category: 'copilot'
      });

      if (result.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: result.data?.response || "I understand your question. Let me help you with that based on your career profile.",
          timestamp: new Date(),
          suggestions: result.data?.suggestions
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Copilot error:', error);
      toast.error('Sorry, I encountered an issue. Please try again.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 w-16 h-16 bg-primary text-primary-foreground shadow-lg cursor-pointer hover:scale-105 transition-transform z-50">
        <CardContent className="p-0 flex items-center justify-center h-full" onClick={onToggleMinimize}>
          <Bot className="h-8 w-8" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] shadow-xl z-50 flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-5 w-5 text-primary" />
            AI Career Copilot
            <Badge variant="secondary" className="text-xs">Beta</Badge>
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
              className="h-6 w-6 p-0"
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-3 gap-3">
        <ScrollArea className="flex-1 pr-3">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'assistant' && (
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p>{message.content}</p>
                  {message.suggestions && (
                    <div className="mt-2 space-y-1">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full text-xs h-auto py-1 px-2"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                {message.type === 'user' && (
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your career..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(input)}
            disabled={isProcessing}
            className="text-sm"
          />
          <Button
            onClick={() => handleSendMessage(input)}
            disabled={!input.trim() || isProcessing}
            size="sm"
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-1">
          <Button
            variant="outline"
            size="sm"
            className="text-xs p-2 h-auto flex flex-col gap-1"
            onClick={() => handleSuggestionClick("Help me optimize my profile")}
          >
            <Target className="h-3 w-3" />
            Optimize
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs p-2 h-auto flex flex-col gap-1"
            onClick={() => handleSuggestionClick("Find job recommendations")}
          >
            <Briefcase className="h-3 w-3" />
            Jobs
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs p-2 h-auto flex flex-col gap-1"
            onClick={() => handleSuggestionClick("Review my resume")}
          >
            <FileText className="h-3 w-3" />
            Resume
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}