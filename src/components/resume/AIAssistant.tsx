import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, Send, Wand2, CheckCircle, 
  Lightbulb, Target, Zap, Copy, ThumbsUp, ThumbsDown 
} from "lucide-react";
import { useResumeEnhancement } from "@/hooks/useResumeEnhancement";

interface AIAssistantProps {
  resumeContent: any;
  onSuggestionApply: (suggestion: any) => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: any[];
}

export const AIAssistant = ({ resumeContent, onSuggestionApply }: AIAssistantProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI Resume Assistant. I can help you improve your resume content, suggest better wording, or answer questions about best practices. What would you like to work on?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const { enhanceSingleSection, isEnhancing } = useResumeEnhancement();

  // Quick action suggestions
  const quickActions = [
    {
      id: 'improve-summary',
      title: 'Improve Summary',
      description: 'Make your professional summary more compelling',
      icon: Target,
      action: () => handleQuickAction('summary', 'Please help me improve my professional summary to be more compelling and ATS-friendly.')
    },
    {
      id: 'enhance-experience',
      title: 'Enhance Experience',
      description: 'Add metrics and impact to your work experience',
      icon: Zap,
      action: () => handleQuickAction('experience', 'Help me rewrite my work experience with more quantifiable achievements and impact metrics.')
    },
    {
      id: 'optimize-keywords',
      title: 'Optimize Keywords',
      description: 'Suggest relevant keywords for your industry',
      icon: Lightbulb,
      action: () => handleQuickAction('keywords', 'What keywords should I include in my resume for better ATS optimization?')
    },
    {
      id: 'format-tips',
      title: 'Formatting Tips',
      description: 'Get advice on resume formatting and structure',
      icon: CheckCircle,
      action: () => handleQuickAction('formatting', 'Give me tips on how to format my resume for better readability and ATS compatibility.')
    }
  ];

  const handleQuickAction = async (type: string, message: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response based on action type
    setTimeout(() => {
      let aiResponse = '';
      let suggestions = [];

      switch (type) {
        case 'summary':
          aiResponse = "I'd be happy to help improve your professional summary! Here are some suggestions based on your current content:";
          suggestions = [
            {
              type: 'summary_improvement',
              title: 'Enhanced Professional Summary',
              content: 'Experienced professional with 5+ years of expertise in [your field], specializing in [key skills]. Proven track record of [specific achievement] and driving [measurable results]. Seeking to leverage [relevant skills] to contribute to [target role/company type].',
              explanation: 'This version is more specific, includes quantifiable experience, and shows clear value proposition.'
            }
          ];
          break;
        
        case 'experience':
          aiResponse = "Let's make your work experience more impactful with specific metrics and achievements:";
          suggestions = [
            {
              type: 'experience_enhancement',
              title: 'Action-Oriented Descriptions',
              content: '• Led a team of [X] members to achieve [specific goal], resulting in [measurable outcome]\n• Implemented [specific solution/process] that improved [metric] by [percentage/amount]\n• Collaborated with [stakeholders] to deliver [project/result] ahead of schedule',
              explanation: 'Using action verbs, specific numbers, and measurable outcomes makes your experience more compelling.'
            }
          ];
          break;
        
        case 'keywords':
          aiResponse = "Here are some industry-relevant keywords you should consider including:";
          suggestions = [
            {
              type: 'keyword_suggestions',
              title: 'ATS-Friendly Keywords',
              content: 'Technical Skills: [relevant technologies]\nSoft Skills: Leadership, Project Management, Cross-functional Collaboration\nIndustry Terms: [field-specific terminology]\nCertifications: [relevant certifications]',
              explanation: 'These keywords will help your resume pass through ATS systems and match job descriptions.'
            }
          ];
          break;
        
        case 'formatting':
          aiResponse = "Here are key formatting tips for a professional, ATS-friendly resume:";
          suggestions = [
            {
              type: 'formatting_tips',
              title: 'Resume Formatting Best Practices',
              content: '✓ Use standard fonts (Arial, Calibri, Times New Roman)\n✓ Keep font size between 10-12pt\n✓ Use consistent formatting for dates and headings\n✓ Include white space for readability\n✓ Save as both .pdf and .docx\n✓ Use standard section headers\n✓ Avoid images, tables, and text boxes',
              explanation: 'These formatting guidelines ensure your resume is both human-readable and ATS-compatible.'
            }
          ];
          break;
        
        default:
          aiResponse = "I'm here to help with any resume-related questions you have!";
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        suggestions
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "That's a great question! Let me help you with that.",
        "I can definitely assist with that. Here's what I recommend:",
        "Good point! Let me provide some specific suggestions for that.",
        "I'd be happy to help you improve that section."
      ];

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleApplySuggestion = (suggestion: any) => {
    onSuggestionApply(suggestion);
    // You could also add a success message to the chat
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Quick Actions */}
      <div className="p-4 border-b">
        <h4 className="font-medium mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={action.action}
                className="flex items-center space-x-2 h-auto p-3 text-left"
              >
                <Icon className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-medium text-xs">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map(message => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] space-y-2 ${message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
                <p className="text-sm">{message.content}</p>
                
                {message.suggestions && (
                  <div className="space-y-2 mt-3">
                    {message.suggestions.map((suggestion, index) => (
                      <Card key={index} className="bg-background">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">{suggestion.title}</CardTitle>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(suggestion.content)}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="text-xs whitespace-pre-line bg-gray-50 p-2 rounded border">
                            {suggestion.content}
                          </div>
                          {suggestion.explanation && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {suggestion.explanation}
                            </p>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleApplySuggestion(suggestion)}
                            className="mt-2 w-full"
                          >
                            <Wand2 className="h-3 w-3 mr-1" />
                            Apply Suggestion
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                <div className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            placeholder="Ask me anything about your resume..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};