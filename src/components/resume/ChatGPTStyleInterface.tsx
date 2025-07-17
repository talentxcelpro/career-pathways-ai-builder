
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Send, Sparkles, AlertCircle, CheckCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAIResumeEnhancements } from '@/hooks/useAIResumeEnhancements';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  enhancement?: any;
}

interface ChatGPTStyleInterfaceProps {
  resumeData: any;
  onEnhancementApplied: (enhancement: any) => void;
}

export const ChatGPTStyleInterface: React.FC<ChatGPTStyleInterfaceProps> = ({
  resumeData,
  onEnhancementApplied
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI resume enhancement assistant. I can help you:\n\n• Generate smart resume titles\n• Adjust tone and style\n• Optimize keywords for ATS\n• Improve content clarity\n\nWhat would you like to work on today?",
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { generateSmartTitles, adjustTone, optimizeKeywords } = useAIResumeEnhancements();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Test connection to Supabase
  const testConnection = async () => {
    try {
      const response = await fetch('/api/health', { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      setIsConnected(response.ok);
      return response.ok;
    } catch (error) {
      setIsConnected(false);
      return false;
    }
  };

  useEffect(() => {
    testConnection();
    const interval = setInterval(testConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const addMessage = (content: string, type: 'user' | 'assistant', enhancement?: any) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      enhancement
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addTypingMessage = () => {
    const typingMessage: Message = {
      id: 'typing',
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);
  };

  const removeTypingMessage = () => {
    setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
  };

  const handleEnhancement = async (userMessage: string) => {
    if (!isConnected) {
      toast.error('No connection to AI service. Please check your internet connection.');
      return;
    }

    setIsLoading(true);
    addTypingMessage();

    try {
      const lowerMessage = userMessage.toLowerCase();
      
      // Determine enhancement type based on user input
      if (lowerMessage.includes('title') || lowerMessage.includes('headline')) {
        const result = await generateSmartTitles(resumeData);
        if (result) {
          removeTypingMessage();
          const response = `I've generated smart resume titles for you:\n\n${result.titles.map((t, i) => `${i + 1}. ${t.title} (ATS Score: ${t.atsScore}/100)`).join('\n')}\n\nBest recommendation: ${result.recommendations.bestTitle}`;
          addMessage(response, 'assistant', { type: 'titles', data: result });
        }
      } else if (lowerMessage.includes('tone') || lowerMessage.includes('style')) {
        const result = await adjustTone(
          resumeData.personalInfo?.summary || 'Professional summary section', 
          'professional', 
          'summary'
        );
        if (result) {
          removeTypingMessage();
          const response = `I've adjusted the tone of your content:\n\n**Adjusted Content:**\n${result.adjustedContent}\n\n**Impact Score:** ${result.impactScore}/100\n\n**Key Changes:**\n${result.changes.map(c => `• ${c.reason}`).join('\n')}`;
          addMessage(response, 'assistant', { type: 'tone', data: result });
        }
      } else if (lowerMessage.includes('keyword') || lowerMessage.includes('ats')) {
        const result = await optimizeKeywords(resumeData);
        if (result) {
          removeTypingMessage();
          const response = `I've analyzed your resume for ATS optimization:\n\n**ATS Score:** ${result.atsScore}/100\n\n**Keywords Analysis:**\n• Matched: ${result.keywordAnalysis.matched.join(', ')}\n• Missing: ${result.keywordAnalysis.missing.join(', ')}\n\n**Top Recommendations:**\n${result.recommendations.slice(0, 3).map(r => `• ${r.suggestion} (${r.priority} priority)`).join('\n')}`;
          addMessage(response, 'assistant', { type: 'keywords', data: result });
        }
      } else {
        removeTypingMessage();
        addMessage(
          "I can help you with:\n\n• **Resume titles** - Say 'generate titles' or 'create headline'\n• **Tone adjustment** - Say 'adjust tone' or 'improve style'\n• **Keyword optimization** - Say 'optimize keywords' or 'improve ATS score'\n\nWhat specific area would you like to focus on?",
          'assistant'
        );
      }
    } catch (error) {
      removeTypingMessage();
      console.error('Enhancement error:', error);
      
      let errorMessage = "I encountered an issue enhancing your resume.";
      
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('network')) {
          errorMessage = "Connection timeout. Please check your internet connection and try again.";
        } else if (error.message.includes('service')) {
          errorMessage = "AI service is temporarily unavailable. Please try again in a moment.";
        }
      }
      
      addMessage(`❌ **Enhancement Failed**\n\n${errorMessage}\n\n🔄 **You can try again** - this might be a temporary issue.`, 'assistant');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    addMessage(userMessage, 'user');
    setInputValue('');
    
    await handleEnhancement(userMessage);
  };

  const handleApplyEnhancement = (enhancement: any) => {
    onEnhancementApplied(enhancement);
    addMessage('✅ Enhancement applied to your resume!', 'assistant');
    toast.success('Enhancement applied successfully!');
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line.startsWith('**') && line.endsWith('**') ? (
          <strong className="font-semibold">{line.slice(2, -2)}</strong>
        ) : line.startsWith('• ') ? (
          <div className="ml-4">{line}</div>
        ) : (
          line
        )}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="flex flex-col h-[600px] bg-background border rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Resume Assistant</h3>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="secondary" className="gap-1">
              <Wifi className="h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <WifiOff className="h-3 w-3" />
              Disconnected
            </Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {message.isTyping ? (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
              ) : (
                <>
                  <div className="text-sm whitespace-pre-wrap">
                    {formatMessage(message.content)}
                  </div>
                  {message.enhancement && (
                    <div className="mt-3 pt-3 border-t border-border/20">
                      <Button
                        size="sm"
                        onClick={() => handleApplyEnhancement(message.enhancement)}
                        className="w-full"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Apply Enhancement
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me to improve your resume... (e.g., 'generate titles', 'optimize keywords')"
            className="min-h-[44px] max-h-32 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isLoading || !isConnected}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!inputValue.trim() || isLoading || !isConnected}
            className="shrink-0"
          >
            {isLoading ? (
              <Clock className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        
        {!isConnected && (
          <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Connection lost. Please check your internet connection.
          </div>
        )}
      </div>
    </div>
  );
};
