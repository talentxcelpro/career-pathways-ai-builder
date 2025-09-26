import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Bot, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const serviceTypes = [
  { value: 'career_coaching', label: 'Career Coaching', description: 'Get personalized career guidance' },
  { value: 'resume_optimization', label: 'Resume Optimization', description: 'Improve your resume for better results' },
  { value: 'interview_prep', label: 'Interview Preparation', description: 'Practice and prepare for interviews' },
  { value: 'salary_negotiation', label: 'Salary Negotiation', description: 'Learn to negotiate better compensation' },
  { value: 'skill_development', label: 'Skill Development', description: 'Identify and develop relevant skills' }
];

export const AIServiceMatcher = () => {
  const [selectedService, setSelectedService] = useState<string>('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(() => crypto.randomUUID());
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedService) {
      toast({
        title: "Missing Information",
        description: "Please select a service type and enter a message.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Add user message to chat
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('ai-service-matching', {
        body: {
          message: userMessage.content,
          serviceType: selectedService,
          conversationId
        }
      });

      if (error) throw error;

      // Add AI response to chat
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      toast({
        title: "AI Response",
        description: "Your question has been answered!"
      });

    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedServiceInfo = serviceTypes.find(s => s.value === selectedService);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          AI Career Services
        </h1>
        <p className="text-muted-foreground">
          Get personalized AI-powered assistance for your career growth
        </p>
      </div>

      {/* Service Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Service</CardTitle>
          <CardDescription>
            Select the type of career assistance you need
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger>
              <SelectValue placeholder="Select a service type" />
            </SelectTrigger>
            <SelectContent>
              {serviceTypes.map((service) => (
                <SelectItem key={service.value} value={service.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{service.label}</span>
                    <span className="text-sm text-muted-foreground">{service.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedServiceInfo && (
            <div className="mt-3">
              <Badge variant="secondary" className="text-sm">
                {selectedServiceInfo.label}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedServiceInfo.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle>AI Assistant</CardTitle>
          <CardDescription>
            Ask questions and get personalized advice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages */}
          {messages.length > 0 && (
            <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Message Input */}
          <div className="space-y-3">
            <Textarea
              placeholder={
                selectedService
                  ? "Ask your question about " + serviceTypes.find(s => s.value === selectedService)?.label.toLowerCase() + "..."
                  : "Please select a service type first..."
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!selectedService || isLoading}
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Press Enter to send, Shift+Enter for new line
              </p>
              
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || !selectedService || isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send
              </Button>
            </div>
          </div>

          {!selectedService && (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                Select a service type above to start chatting with the AI assistant
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};