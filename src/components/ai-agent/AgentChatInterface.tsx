import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Bot, User, Copy, ThumbsUp, ThumbsDown, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AIAgentConversation, AIAgentMessage } from '@/hooks/useAIAgent';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AgentChatInterfaceProps {
  selectedModule: string | null;
  conversation: AIAgentConversation | null;
  onSendMessage: (message: string, moduleName: string) => void;
  onBack?: (() => void) | null;
  isLoading: boolean;
}

export const AgentChatInterface: React.FC<AgentChatInterfaceProps> = ({
  selectedModule,
  conversation,
  onSendMessage,
  onBack,
  isLoading
}) => {
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedModule || isLoading) return;
    
    onSendMessage(message, selectedModule);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getModuleColor = (moduleName: string) => {
    const colors: Record<string, string> = {
      general: 'from-primary to-accent',
      network: 'from-blue-500 to-cyan-500',
      jobs: 'from-emerald-500 to-green-500',
      employer: 'from-purple-500 to-violet-500',
      companies: 'from-orange-500 to-red-500',
      'resume-builder': 'from-pink-500 to-rose-500',
      tools: 'from-teal-500 to-cyan-500',
      learning: 'from-indigo-500 to-blue-500',
      'career-map': 'from-amber-500 to-yellow-500'
    };
    return colors[moduleName] || 'from-primary to-accent';
  };

  const renderMessage = (msg: AIAgentMessage, index: number) => {
    const isUser = msg.type === 'user';
    
    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className={`flex gap-4 mb-6 ${isUser ? 'flex-row-reverse' : ''}`}
      >
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-gradient-to-br from-primary to-accent' 
            : `bg-gradient-to-br ${getModuleColor(selectedModule || 'network')}`
        }`}>
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <Bot className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Message */}
        <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
          <div className={`p-4 rounded-2xl ${
            isUser 
              ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground' 
              : 'bg-card border shadow-sm'
          }`}>
            <div className="prose prose-sm max-w-none">
              <p className={`whitespace-pre-wrap ${isUser ? 'text-primary-foreground' : 'text-foreground'}`}>
                {msg.content}
              </p>
            </div>
            
            {msg.metadata && (
              <div className="mt-3 pt-3 border-t border-white/20 text-xs opacity-75">
                {msg.metadata.model && (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    Model: {msg.metadata.model}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {!isUser && (
            <div className="flex items-center gap-2 mt-2 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(msg.content)}
                className="h-8 px-2"
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
              >
                <ThumbsUp className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
              >
                <ThumbsDown className="w-3 h-3" />
              </Button>
              <span className="text-xs text-muted-foreground">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-card via-card/95 to-accent/5">
      {/* Header */}
      <CardHeader className="border-b bg-gradient-to-r from-card to-accent/10">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          
          <div className="flex-1">
            <CardTitle className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getModuleColor(selectedModule || 'network')}`} />
              {selectedModule?.charAt(0).toUpperCase() + selectedModule?.slice(1).replace('-', ' ')} Assistant
            </CardTitle>
            {conversation && (
              <p className="text-sm text-muted-foreground mt-1">
                {conversation.conversation_title}
              </p>
            )}
          </div>

          <Badge variant="secondary" className="px-3 py-1">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered
          </Badge>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          {conversation?.messages?.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${getModuleColor(selectedModule || 'general')} flex items-center justify-center`}>
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  General Assistant (AI-Powered)
                </h3>
                <p className="text-muted-foreground mb-6">
                  How can we help you today?
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose from popular questions or ask your own.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">📝 Quick Questions You Can Ask:</h4>
                
                {[
                  {
                    icon: "🔍",
                    question: "What are the best career options for someone with my skills?",
                    description: "(Auto-detects your resume or lets you input your skills)"
                  },
                  {
                    icon: "🎯", 
                    question: "Help me build a 5-year career roadmap.",
                    description: "(Get a role-wise, goal-driven career plan)"
                  },
                  {
                    icon: "💼",
                    question: "Suggest certifications for a Project Manager career.",
                    description: "(AI recommends top certifications based on your goals)"
                  },
                  {
                    icon: "📄",
                    question: "Analyze and enhance my resume.",
                    description: "(Upload or paste your resume for AI optimization)"
                  },
                  {
                    icon: "🤝",
                    question: "How can I improve my chances of getting hired?",
                    description: "(AI scans your profile and offers suggestions)"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group cursor-pointer p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-accent/20 transition-all duration-200"
                    onClick={() => onSendMessage(item.question, selectedModule || 'general')}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm group-hover:text-primary transition-colors">
                          "{item.question}"
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div>
              {conversation?.messages?.map((msg, index) => renderMessage(msg, index))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 mb-6"
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${getModuleColor(selectedModule || 'network')}`}>
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 max-w-[80%]">
                    <div className="p-4 rounded-2xl bg-card border shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </ScrollArea>

        <Separator />

        {/* Input */}
        <div className="p-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask your ${selectedModule} assistant anything...`}
                className="min-h-[44px] max-h-32 resize-none"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className={`h-[44px] px-4 bg-gradient-to-r ${getModuleColor(selectedModule || 'network')} hover:opacity-90`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </CardContent>
    </Card>
  );
};