import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useSimpleAI } from '@/hooks/useSimpleAI';
import { useAI } from '@/contexts/AIContext';
import { 
  Bot, 
  Send, 
  Sparkles,
  Loader2,
  X,
  Minimize2,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  module: string;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose, className }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { callAI, isLoading, error, clearError } = useSimpleAI();
  const { currentModule } = useAI();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      module: currentModule
    };

    setMessages(prev => [...prev, userMessage]);
    const messageContent = inputMessage.trim();
    setInputMessage('');

    try {
      const result = await callAI({
        module: currentModule,
        task: 'chat',
        prompt: messageContent
      });

      if (result.success && result.response) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: result.response,
          timestamp: new Date().toISOString(),
          module: currentModule
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    clearError();
  };

  if (!isOpen) return null;

  return (
    <Card className={cn(
      "transition-all duration-300 shadow-xl border-0 bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden",
      isMinimized ? "w-80 h-16" : "w-[400px] h-[600px]",
      className
    )}>
      <CardHeader className="p-4 bg-gradient-to-r from-white/90 to-gray-50/90 border-b border-gray-100/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 text-sm">TalentXcel AI</span>
              <Badge variant="secondary" className="w-fit text-xs mt-0.5 bg-blue-50 text-blue-700">
                {currentModule.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-gray-600"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-gray-600"
              onClick={onClose}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[552px]">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                    <Bot className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">AI Assistant Ready</h3>
                  <p className="text-sm text-gray-600">
                    Ask me anything about {currentModule.replace('_', ' ')}
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                        message.type === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-800'
                      )}
                    >
                      {message.type === 'ai' && (
                        <div className="flex items-center mb-2">
                          <Bot className="h-3 w-3 text-blue-600 mr-1" />
                          <span className="text-xs font-medium text-blue-600">AI</span>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className={cn(
                        "text-xs mt-2 opacity-60",
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      )}>
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2 text-blue-600" />
                      <span className="text-gray-600 text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="border-t border-gray-100 p-4 bg-white/50">
            <div className="flex items-center gap-2">
              <Input
                placeholder={`Ask about ${currentModule.replace('_', ' ')}...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1 border-gray-200 bg-white/70 rounded-xl h-10"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600"
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-600">{error}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearError}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
            
            {messages.length > 0 && (
              <div className="mt-2 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearChat}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear Chat
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};