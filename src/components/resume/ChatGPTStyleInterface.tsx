
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MessageCircle, 
  Send, 
  Sparkles, 
  Target, 
  User, 
  Bot, 
  Upload, 
  FileText,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAIResumeEnhancements } from '@/hooks/useAIResumeEnhancements';
import { toast } from 'sonner';

interface ChatGPTStyleInterfaceProps {
  resumeData: any;
  onEnhancementApplied: (enhancedData: any) => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'failed';
  data?: any;
}

export const ChatGPTStyleInterface: React.FC<ChatGPTStyleInterfaceProps> = ({
  resumeData,
  onEnhancementApplied
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "👋 Hi! I'm your AI Resume Assistant. I can help you create headlines and optimize keywords for your resume. What would you like to work on today?",
      timestamp: new Date(),
      status: 'sent'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { generateSmartTitles, optimizeKeywords, isGeneratingTitles, isOptimizingKeywords } = useAIResumeEnhancements();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  };

  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  };

  const handleQuickAction = async (action: string) => {
    if (!isOnline) {
      toast.error('You appear to be offline. Please check your internet connection.');
      return;
    }

    const userMessageId = addMessage({
      type: 'user',
      content: action,
      status: 'sent'
    });

    let aiMessageId = '';
    
    if (action === 'create headline') {
      aiMessageId = addMessage({
        type: 'ai',
        content: '✨ Generating smart resume titles for you...',
        status: 'sending'
      });

      try {
        const result = await generateSmartTitles(resumeData);
        
        if (result && result.titles && result.titles.length > 0) {
          const titlesList = result.titles.map((title, index) => 
            `${index + 1}. **${title.title}** (ATS Score: ${title.atsScore})\n   *${title.reasoning}*`
          ).join('\n\n');

          const content = `🎯 **Generated Resume Titles:**\n\n${titlesList}\n\n**💡 Recommendation:** ${result.recommendations.bestTitle}\n\n**📋 Tips:**\n${result.recommendations.tips.map(tip => `• ${tip}`).join('\n')}`;
          
          updateMessage(aiMessageId, {
            content,
            status: 'sent',
            data: result
          });
        } else {
          throw new Error('No titles generated');
        }
      } catch (error) {
        console.error('Title generation error:', error);
        updateMessage(aiMessageId, {
          content: `❌ **Enhancement Failed**\n\nI encountered an issue generating headlines.\n\n🔄 **You can try again** - this might be a temporary issue.\n\n**Issue:** ${error instanceof Error ? error.message : 'Title generation failed'}\n**Solution:** ${!isOnline ? 'Please check your internet connection.' : 'Please try again. If the problem persists, the service may be restarting.'}`,
          status: 'failed'
        });
      }
    } else if (action === 'optimize keywords') {
      aiMessageId = addMessage({
        type: 'ai',
        content: '📈 Optimizing keywords for ATS compatibility...',
        status: 'sending'
      });

      try {
        const result = await optimizeKeywords(resumeData);
        
        if (result) {
          const content = `📊 **Keyword Optimization Complete**\n\n**ATS Score:** ${result.atsScore}/100\n\n**🎯 Key Recommendations:**\n${result.recommendations.slice(0, 3).map((rec, index) => `${index + 1}. Add **${rec.keyword}** to your ${rec.section} section\n   *${rec.suggestion}*`).join('\n\n')}\n\n**📈 Improvement Tips:**\n${result.improvementTips.slice(0, 3).map(tip => `• ${tip}`).join('\n')}`;
          
          updateMessage(aiMessageId, {
            content,
            status: 'sent',
            data: result
          });
        } else {
          throw new Error('Keyword optimization failed');
        }
      } catch (error) {
        console.error('Keyword optimization error:', error);
        updateMessage(aiMessageId, {
          content: `❌ **Keyword Optimization Failed**\n\nI encountered an issue optimizing keywords.\n\n🔄 **You can try again** - this might be a temporary issue.\n\n**Issue:** ${error instanceof Error ? error.message : 'Unable to connect to AI service'}\n**Solution:** ${!isOnline ? 'Please check your internet connection.' : 'Please try again. If the problem persists, the service may be restarting.'}`,
          status: 'failed'
        });
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !isOnline) {
      if (!isOnline) {
        toast.error('You appear to be offline. Please check your internet connection.');
      }
      return;
    }

    const userMessageId = addMessage({
      type: 'user',
      content: inputMessage,
      status: 'sent'
    });

    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      addMessage({
        type: 'ai',
        content: "I understand you'd like help with your resume. You can use the quick action buttons above to generate headlines or optimize keywords, or feel free to ask me any specific questions about your resume!",
        status: 'sent'
      });
      setIsTyping(false);
    }, 1000);
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <div key={index} className="mb-1">
        {line.startsWith('**') && line.endsWith('**') ? (
          <strong className="text-gray-900">{line.slice(2, -2)}</strong>
        ) : line.startsWith('*') && line.endsWith('*') ? (
          <em className="text-gray-600">{line.slice(1, -1)}</em>
        ) : (
          line
        )}
      </div>
    ));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Bot className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">AI Resume Assistant</h1>
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Connected to AI services</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">Offline - Check your connection</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            Pro Features
          </Badge>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('create headline')}
            disabled={isGeneratingTitles || !isOnline}
            className="flex items-center space-x-2"
          >
            {isGeneratingTitles ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Target className="h-4 w-4" />
            )}
            <span>create headline</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('optimize keywords')}
            disabled={isOptimizingKeywords || !isOnline}
            className="flex items-center space-x-2"
          >
            {isOptimizingKeywords ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>optimize keywords</span>
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <Card className={`max-w-[80%] ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-white'}`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  {message.type === 'ai' && (
                    <div className="bg-blue-100 p-1 rounded-full flex-shrink-0">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className={`text-sm ${message.type === 'user' ? 'text-white' : 'text-gray-900'}`}>
                      {formatMessage(message.content)}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {message.status && (
                        <div className="flex items-center space-x-1">
                          {message.status === 'sending' && (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          )}
                          {message.status === 'sent' && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                          {message.status === 'failed' && (
                            <AlertCircle className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-1 rounded-full">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <Input
              placeholder={isOnline ? "Ask me anything about your resume..." : "You appear to be offline..."}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={!isOnline}
              className="border-gray-300 focus:border-blue-500"
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || !isOnline}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {!isOnline && (
          <div className="mt-2 text-sm text-red-600 flex items-center">
            <WifiOff className="h-4 w-4 mr-1" />
            Please check your internet connection to use AI features.
          </div>
        )}
      </div>
    </div>
  );
};
