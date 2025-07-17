
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Wand2, Copy, Download, FileText, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

interface ChatGPTStyleInterfaceProps {
  extractedData: any;
  onEnhancementComplete: (enhancedData: any) => void;
}

const ChatGPTStyleInterface: React.FC<ChatGPTStyleInterfaceProps> = ({
  extractedData,
  onEnhancementComplete
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    setConnectionStatus('checking');
    try {
      const response = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/enhance-resume', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc'
        }
      });
      
      if (response.ok) {
        setConnectionStatus('connected');
        console.log('✅ Connection check successful');
      } else {
        setConnectionStatus('disconnected');
        console.log('❌ Connection check failed:', response.status);
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      console.log('❌ Connection check error:', error);
    }
  };

  const addMessage = (type: 'user' | 'ai' | 'system', content: string, status?: 'sending' | 'sent' | 'error') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      status
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  };

  const updateMessageStatus = (messageId: string, status: 'sending' | 'sent' | 'error') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, status } : msg
    ));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;
    
    if (connectionStatus === 'disconnected') {
      toast.error('Service is currently unavailable. Please try again later.');
      return;
    }

    const userMessageId = addMessage('user', inputValue, 'sent');
    const currentInput = inputValue;
    setInputValue('');
    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log('🚀 Starting enhancement request...');
      
      const requestPayload = {
        extractedData,
        userPrompt: currentInput,
        enhancementType: 'general',
        provider: 'deepseek',
        requestId
      };

      console.log('📤 Sending enhancement request with payload size:', JSON.stringify(requestPayload).length);

      const aiMessageId = addMessage('ai', 'Processing your request...', 'sending');

      // Make the request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

      try {
        const response = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/enhance-resume', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc`,
            'Content-Type': 'application/json',
            'X-Request-ID': requestId,
            'X-User-ID': user?.id || 'anonymous'
          },
          body: JSON.stringify(requestPayload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log('✅ Enhancement request successful');

        if (responseData.error) {
          throw new Error(responseData.error);
        }

        // Update the AI message with the response
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: responseData.enhancement || 'Enhancement completed successfully!', status: 'sent' }
            : msg
        ));

        // Call the completion handler with the enhanced data
        if (responseData.enhancement) {
          onEnhancementComplete(responseData);
          toast.success('Resume enhancement completed!');
        }

      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        console.error('❌ Enhancement request failed:', fetchError);
        
        let errorMessage = 'Enhancement failed. ';
        if (fetchError.name === 'AbortError') {
          errorMessage += 'Request timed out. Please try again.';
        } else if (fetchError.message?.includes('fetch')) {
          errorMessage += 'Unable to connect to AI service. Please check your connection.';
        } else {
          errorMessage += fetchError.message || 'Unknown error occurred.';
        }

        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: errorMessage, status: 'error' }
            : msg
        ));

        toast.error(errorMessage);
      }

    } catch (error: any) {
      console.error('❌ General error:', error);
      addMessage('system', `Error: ${error.message}`, 'error');
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';
    const isError = message.status === 'error';

    return (
      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[80%] rounded-lg p-3 ${
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : isSystem || isError
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-muted text-muted-foreground'
        }`}>
          <div className="flex items-start gap-2">
            {!isUser && (
              <div className="mt-1">
                {isError ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : message.status === 'sending' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
              </div>
            )}
            <div className="flex-1">
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </span>
                {message.status === 'sending' && (
                  <Badge variant="secondary" className="text-xs">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Processing
                  </Badge>
                )}
                {message.status === 'error' && (
                  <Badge variant="destructive" className="text-xs">
                    Failed
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Resume Enhancement
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={checkConnectionStatus}
              disabled={connectionStatus === 'checking'}
            >
              {connectionStatus === 'checking' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              {connectionStatus === 'checking' ? 'Checking...' : 'Check Status'}
            </Button>
            <Badge 
              variant={connectionStatus === 'connected' ? 'default' : 'destructive'}
              className="flex items-center gap-1"
            >
              {connectionStatus === 'connected' ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <AlertCircle className="h-3 w-3" />
              )}
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'disconnected' ? 'Offline' : 'Checking'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Ready to enhance your resume!</p>
              <p className="text-sm">
                Ask me to improve specific sections, adjust the tone, or make other enhancements.
              </p>
            </div>
          ) : (
            <div>
              {messages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me to enhance your resume... (e.g., 'Make my summary more professional' or 'Add action verbs to my experience')"
              className="flex-1 min-h-[60px] resize-none"
              disabled={isProcessing || connectionStatus === 'disconnected'}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isProcessing || connectionStatus === 'disconnected'}
              size="lg"
              className="px-6"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          {connectionStatus === 'disconnected' && (
            <p className="text-sm text-red-600 mt-2">
              Service is currently unavailable. Please check your connection and try again.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatGPTStyleInterface;
