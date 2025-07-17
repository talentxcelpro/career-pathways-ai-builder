
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, Upload, FileText, Target, Lightbulb, Wifi, WifiOff } from 'lucide-react';
import { useAIResumeEnhancements } from '@/hooks/useAIResumeEnhancements';
import { toast } from 'sonner';

interface ChatGPTStyleInterfaceProps {
  resumeData: any;
  onEnhancementApplied: (enhancedData: any) => void;
}

export const ChatGPTStyleInterface: React.FC<ChatGPTStyleInterfaceProps> = ({
  resumeData,
  onEnhancementApplied
}) => {
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Array<{id: string, text: string, type: 'user' | 'ai', timestamp: Date}>>([
    {
      id: '1',
      text: "Hello! I'm your AI resume assistant. I can help you create headlines, optimize keywords for ATS systems, and enhance your resume content. What would you like to focus on?",
      type: 'ai',
      timestamp: new Date()
    }
  ]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const { generateSmartTitles, isGeneratingTitles, optimizeKeywords, isOptimizingKeywords } = useAIResumeEnhancements();

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Connection lost. Please check your internet connection.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addMessage = (text: string, type: 'user' | 'ai') => {
    const newMessage = {
      id: Date.now().toString(),
      text,
      type,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleQuickAction = async (action: string) => {
    if (!isOnline) {
      toast.error('No internet connection. Please check your network.');
      return;
    }

    setIsProcessing(true);
    addMessage(`${action}`, 'user');

    try {
      switch (action) {
        case 'create headline':
          addMessage('🎯 Generating smart resume headlines...', 'ai');
          const titleResult = await generateSmartTitles(resumeData);
          
          if (titleResult) {
            const titlesText = titleResult.titles.map((title, index) => 
              `${index + 1}. ${title.title} (ATS Score: ${title.atsScore})`
            ).join('\n');
            
            addMessage(`✅ **Smart Headlines Generated:**\n\n${titlesText}\n\n💡 **Best Choice:** ${titleResult.recommendations.bestTitle}\n\n**Tips:**\n${titleResult.recommendations.tips.join('\n')}`, 'ai');
          } else {
            addMessage('❌ **Enhancement Failed**\n\nI encountered an issue generating headlines.\n\n🔄 **You can try again** - this might be a temporary issue.\n\n**Issue:** Unable to connect to AI service\n**Solution:** Please check your internet connection. If the problem persists, the service may be restarting.', 'ai');
          }
          break;

        case 'optimize keywords':
          addMessage('📈 Optimizing keywords for ATS compatibility...', 'ai');
          const keywordResult = await optimizeKeywords(resumeData);
          
          if (keywordResult) {
            const keywordText = `✅ **ATS Optimization Complete**\n\n📊 **ATS Score:** ${keywordResult.atsScore}/100\n\n🎯 **Keywords Found:** ${keywordResult.keywordAnalysis.matched.length}\n**Missing Keywords:** ${keywordResult.keywordAnalysis.missing.length}\n\n💡 **Top Recommendations:**\n${keywordResult.recommendations.slice(0, 3).map(rec => `• ${rec.keyword} - ${rec.suggestion}`).join('\n')}\n\n🚀 **Quick Tips:**\n${keywordResult.improvementTips.slice(0, 3).join('\n')}`;
            
            addMessage(keywordText, 'ai');
          } else {
            addMessage('❌ **Keyword Optimization Failed**\n\nI encountered an issue optimizing keywords.\n\n🔄 **You can try again** - this might be a temporary issue.\n\n**Issue:** Unable to connect to AI service\n**Solution:** Please check your internet connection. If the problem persists, the service may be restarting.', 'ai');
          }
          break;

        default:
          addMessage('I can help you with creating headlines, optimizing keywords, or enhancing your resume. What would you like to work on?', 'ai');
      }
    } catch (error) {
      console.error('Quick action error:', error);
      addMessage(`❌ **Enhancement Failed**\n\nI encountered an issue enhancing your resume.\n\n🔄 **You can try again** - this might be a temporary issue.\n\n**Issue:** ${error.message || 'Unable to connect to AI service'}\n**Solution:** Please check your internet connection. If the problem persists, the service may be restarting.`, 'ai');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || !isOnline) {
      if (!isOnline) {
        toast.error('No internet connection. Please check your network.');
      }
      return;
    }

    const message = userInput.trim();
    setUserInput('');
    addMessage(message, 'user');
    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      addMessage('I understand you want to enhance your resume. You can use the quick action buttons above or tell me specifically what you\'d like to improve!', 'ai');
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Connection Status */}
      <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${isOnline ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
        {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
        {isOnline ? 'Connected to AI services' : 'No internet connection - Features unavailable'}
      </div>

      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-blue-600" />
            AI Resume Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleQuickAction('create headline')}
              disabled={isProcessing || !isOnline}
              variant="outline"
              size="sm"
            >
              {isGeneratingTitles ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  create headline
                </>
              )}
            </Button>
            
            <Button
              onClick={() => handleQuickAction('optimize keywords')}
              disabled={isProcessing || !isOnline}
              variant="outline"
              size="sm"
            >
              {isOptimizingKeywords ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  optimize keywords
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{message.text}</div>
                  <div className={`text-xs mt-1 opacity-70`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask me to improve your resume... (e.g., 'generate titles', 'optimize keywords')"
                className="flex-1 min-h-[40px] max-h-[120px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={!isOnline}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isProcessing || !isOnline}
                size="sm"
              >
                Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resume Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText className="h-4 w-4" />
            {resumeData ? (
              <span className="text-green-600">Resume data loaded ✓</span>
            ) : (
              <span className="text-orange-600">No resume data - Upload a resume for better results</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
