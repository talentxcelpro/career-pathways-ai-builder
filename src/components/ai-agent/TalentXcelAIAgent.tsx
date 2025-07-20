
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Send, 
  Sparkles, 
  MessageSquare, 
  RefreshCw,
  Zap,
  User
} from 'lucide-react';
import { useTalentXcelAI, AIMessage, AI_MODULES } from '@/hooks/useTalentXcelAI';
import { cn } from '@/lib/utils';

interface TalentXcelAIAgentProps {
  className?: string;
  onClose?: () => void;
  defaultModule?: string;
}

export const TalentXcelAIAgent: React.FC<TalentXcelAIAgentProps> = ({
  className,
  onClose,
  defaultModule
}) => {
  const {
    messages,
    isProcessing,
    currentModule,
    sendMessage,
    clearConversation,
    switchModule,
    getQuickPrompts,
    modules
  } = useTalentXcelAI();

  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Set default module on mount
  useEffect(() => {
    if (defaultModule && !currentModule) {
      switchModule(defaultModule);
    }
  }, [defaultModule, currentModule, switchModule]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const message = input.trim();
    setInput('');
    
    await sendMessage(message);
    inputRef.current?.focus();
  };

  const handleQuickPrompt = async (prompt: string) => {
    await sendMessage(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: AIMessage) => (
    <div
      key={message.id}
      className={cn(
        "flex gap-3 p-4 rounded-lg",
        message.type === 'user' 
          ? "bg-primary/10 ml-auto max-w-[80%]" 
          : "bg-muted mr-auto max-w-[80%]"
      )}
    >
      <div className="flex-shrink-0">
        {message.type === 'user' ? (
          <User className="h-6 w-6 text-primary" />
        ) : (
          <Bot className="h-6 w-6 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-muted-foreground mb-1">
          {message.type === 'user' ? 'You' : 'TalentXcel AI'}
          {message.module && (
            <Badge variant="outline" className="ml-2 text-xs">
              {modules.find(m => m.key === message.module)?.name || message.module}
            </Badge>
          )}
        </div>
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
          <div className="mt-3 space-y-1">
            <div className="text-xs text-muted-foreground">💡 Try asking:</div>
            {message.metadata.suggestions.slice(0, 2).map((suggestion: string, index: number) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleQuickPrompt(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const welcomeMessage = !messages.length && (
    <div className="text-center py-8 px-4">
      <div className="flex justify-center mb-4">
        <div className="p-3 rounded-full bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2">
        General Assistant (AI-Powered)
      </h3>
      <p className="text-muted-foreground mb-6">
        How can we help you today?
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        Choose from popular questions or ask your own.
      </p>
      
      <div className="space-y-3">
        <div className="text-sm font-medium text-left">📝 Quick Questions You Can Ask:</div>
        {[
          "🔍 What are the best career options for someone with my skills?",
          "🎯 Help me build a 5-year career roadmap.",
          "💼 Suggest certifications for a Project Manager career.",
          "📄 Analyze and enhance my resume.",
          "🤝 How can I improve my chances of getting hired?"
        ].map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full text-left justify-start h-auto p-3 text-sm"
            onClick={() => handleQuickPrompt(prompt.substring(2))}
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            TalentXcel AI
            {currentModule && (
              <Badge variant="secondary" className="ml-2">
                {modules.find(m => m.key === currentModule)?.name}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={clearConversation}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-4 mb-2">
            <TabsTrigger value="chat" className="flex-1">
              <MessageSquare className="h-4 w-4 mr-1" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="modules" className="flex-1">
              <Zap className="h-4 w-4 mr-1" />
              Modules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
            <ScrollArea className="flex-1 px-4">
              {welcomeMessage}
              <div className="space-y-4">
                {messages.map(renderMessage)}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="flex-shrink-0 p-4 border-t">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your career..."
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isProcessing}
                  size="sm"
                >
                  {isProcessing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="modules" className="flex-1 mt-0">
            <ScrollArea className="flex-1 px-4">
              <div className="grid gap-3 pb-4">
                {modules.map((module) => (
                  <Card
                    key={module.key}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-accent",
                      currentModule === module.key && "border-primary bg-primary/5"
                    )}
                    onClick={() => {
                      switchModule(module.key);
                      setActiveTab('chat');
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{module.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{module.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {module.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {module.prompts.slice(0, 2).map((prompt, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {prompt.length > 30 ? `${prompt.substring(0, 30)}...` : prompt}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TalentXcelAIAgent;
