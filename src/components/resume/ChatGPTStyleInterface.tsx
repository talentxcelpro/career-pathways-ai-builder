
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bot, User, Wand2, Target, RefreshCw, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useAIResumeEnhancements } from '@/hooks/useAIResumeEnhancements';
import { toast } from 'sonner';

interface ChatGPTStyleInterfaceProps {
  resumeData: any;
  onEnhancementApplied: (enhancedData: any) => void;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'success' | 'error';
  action?: string;
}

const QUICK_ACTIONS = [
  { id: 'create-headline', label: 'create headline', icon: Target },
  { id: 'optimize-keywords', label: 'optimize keywords', icon: Wand2 },
];

export const ChatGPTStyleInterface: React.FC<ChatGPTStyleInterfaceProps> = ({
  resumeData,
  onEnhancementApplied
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(navigator.onLine);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    generateSmartTitles,
    isGeneratingTitles,
    optimizeKeywords,
    isOptimizingKeywords,
  } = useAIResumeEnhancements();

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsConnected(true);
      toast.success('Connection restored!');
    };
    
    const handleOffline = () => {
      setIsConnected(false);
      toast.error('Connection lost. Please check your internet connection.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    setMessages(prev => 
      prev.map(msg => msg.id === id ? { ...msg, ...updates } : msg)
    );
  };

  const handleQuickAction = async (actionId: string) => {
    if (!isConnected) {
      toast.error('No internet connection. Please check your connection and try again.');
      return;
    }

    const userMessageId = addMessage({
      type: 'user',
      content: QUICK_ACTIONS.find(a => a.id === actionId)?.label || actionId,
      action: actionId
    });

    let assistantMessageId: string;

    try {
      if (actionId === 'create-headline') {
        assistantMessageId = addMessage({
          type: 'assistant',
          content: '🎯 Generating smart resume headlines...',
          status: 'sending'
        });

        const result = await generateSmartTitles(resumeData);
        
        if (result && result.titles) {
          const titles = result.titles.slice(0, 3);
          const content = `✨ **Generated Resume Headlines**

${titles.map((title, index) => `**${index + 1}. ${title.title}**
*ATS Score: ${title.atsScore}% | Keywords: ${title.keywords.join(', ')}*
${title.reasoning}
`).join('\n')}

💡 **Recommendation:** ${result.recommendations.bestTitle}

${result.recommendations.tips.map(tip => `• ${tip}`).join('\n')}`;

          updateMessage(assistantMessageId, { 
            content, 
            status: 'success' 
          });
        } else {
          throw new Error('No titles generated');
        }
        
      } else if (actionId === 'optimize-keywords') {
        assistantMessageId = addMessage({
          type: 'assistant',
          content: '📈 Optimizing keywords for ATS compatibility...',
          status: 'sending'
        });

        const result = await optimizeKeywords(resumeData);
        
        if (result) {
          const content = `📊 **ATS Keyword Analysis**

**Overall ATS Score: ${result.atsScore}%**

**Matched Keywords:** ${result.keywordAnalysis.matched.length > 0 ? result.keywordAnalysis.matched.join(', ') : 'Upload resume for analysis'}

**Missing Keywords:** ${result.keywordAnalysis.missing.length > 0 ? result.keywordAnalysis.missing.slice(0, 5).join(', ') : 'Add resume content for recommendations'}

**Top Recommendations:**
${result.recommendations.slice(0, 3).map((rec, index) => `${index + 1}. **${rec.keyword}** (${rec.priority} priority)
   ${rec.suggestion}`).join('\n')}

**Improvement Tips:**
${result.improvementTips.slice(0, 3).map(tip => `• ${tip}`).join('\n')}`;

          updateMessage(assistantMessageId, { 
            content, 
            status: 'success' 
          });
        } else {
          throw new Error('Failed to optimize keywords');
        }
      }
    } catch (error) {
      console.error('Action failed:', error);
      
      let errorMessage = '❌ **Enhancement Failed**\n\nI encountered an issue ';
      let solution = '';
      
      if (!isConnected) {
        errorMessage += 'due to connection issues.';
        solution = 'Please check your internet connection and try again.';
      } else if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
        errorMessage += 'connecting to AI services.';
        solution = 'Please check your internet connection. If the problem persists, the service may be restarting.';
      } else if (error.message.includes('API key')) {
        errorMessage += 'with AI service configuration.';
        solution = 'The AI service needs to be configured. Please contact support.';
      } else {
        errorMessage += `processing your request.`;
        solution = 'Please try again. If the problem continues, this might be a temporary service issue.';
      }

      const fullErrorMessage = `${errorMessage}

🔄 **You can try again** - this might be a temporary issue.

**Issue:** ${error.message.includes('Unable to connect') ? 'Unable to connect to AI service' : error.message}
**Solution:** ${solution}`;

      if (assistantMessageId!) {
        updateMessage(assistantMessageId, { 
          content: fullErrorMessage, 
          status: 'error' 
        });
      } else {
        addMessage({
          type: 'assistant',
          content: fullErrorMessage,
          status: 'error'
        });
      }
    }
  };

  const ConnectionStatus = () => (
    <div className="flex items-center gap-2 text-sm">
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-green-600">Connected to AI services</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span className="text-red-600">No internet connection</span>
        </>
      )}
    </div>
  );

  const MessageComponent = ({ message }: { message: Message }) => (
    <div className={`flex gap-3 p-4 ${message.type === 'user' ? 'bg-blue-50' : 'bg-white'}`}>
      <div className="flex-shrink-0">
        {message.type === 'user' ? (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">
            {message.type === 'user' ? 'You' : 'AI Resume Assistant'}
          </span>
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {message.status === 'sending' && (
            <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
          )}
          {message.status === 'error' && (
            <AlertCircle className="h-3 w-3 text-red-500" />
          )}
        </div>
        
        <div className="prose prose-sm max-w-none">
          {message.content.split('\n').map((line, index) => {
            if (line.startsWith('**') && line.endsWith('**')) {
              return <div key={index} className="font-semibold mt-2 mb-1">{line.slice(2, -2)}</div>;
            }
            if (line.startsWith('*') && line.endsWith('*')) {
              return <div key={index} className="text-sm text-gray-600 italic">{line.slice(1, -1)}</div>;
            }
            if (line.startsWith('•')) {
              return <div key={index} className="text-sm ml-4">{line}</div>;
            }
            return line ? <div key={index} className="text-sm">{line}</div> : <br key={index} />;
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold">AI Resume Assistant</h2>
              <ConnectionStatus />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex gap-2 flex-wrap">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            const isLoading = (action.id === 'create-headline' && isGeneratingTitles) || 
                             (action.id === 'optimize-keywords' && isOptimizingKeywords);
            
            return (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.id)}
                disabled={isLoading || !isConnected}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to AI Resume Assistant</h3>
              <p className="text-gray-600 mb-4">
                I can help you create compelling headlines and optimize your resume for ATS systems. 
                Choose a quick action above to get started!
              </p>
              {!resumeData && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    💡 Upload your resume for personalized AI recommendations
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {messages.map((message) => (
              <MessageComponent key={message.id} message={message} />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
