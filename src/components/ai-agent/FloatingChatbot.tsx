import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Bot, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgentChatInterface } from './AgentChatInterface';
import { PromptLibrary } from './PromptLibrary';
import { useAIAgent } from '@/hooks/useAIAgent';

interface FloatingChatbotProps {
  className?: string;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string>('general');
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  
  const { 
    conversations, 
    currentConversation, 
    createConversation, 
    sendMessage,
    isLoading 
  } = useAIAgent();

  // Auto-minimize after period of inactivity
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const timer = setTimeout(() => {
        setIsMinimized(true);
      }, 300000); // 5 minutes
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMinimized]);

  const handleToggleChat = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
      setHasNewMessage(false);
      if (!currentConversation) {
        createConversation(selectedModule);
      }
    } else {
      setIsOpen(false);
      setIsMinimized(false);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
  };

  const handleSendMessage = (message: string, moduleName: string) => {
    sendMessage(message, moduleName);
    setIsMinimized(false); // Expand when sending message
  };

  const handlePromptSelect = (prompt: any) => {
    if (prompt.module_name !== selectedModule) {
      setSelectedModule(prompt.module_name);
    }
    if (!currentConversation || currentConversation.module_name !== prompt.module_name) {
      createConversation(prompt.module_name);
    }
    sendMessage(prompt.prompt_content, prompt.module_name);
    setShowPromptLibrary(false);
    setIsMinimized(false);
  };

  return (
    <>
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3, type: "spring" }}
            >
              <Button
                onClick={handleToggleChat}
                className="relative h-14 w-14 rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-2xl hover:shadow-primary/25 transition-all duration-300"
                size="icon"
              >
                <Bot className="h-6 w-6 text-primary-foreground" />
                
                {/* Pulse animation for new messages */}
                {hasNewMessage && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/30"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
                
                {/* Notification badge */}
                {hasNewMessage && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="absolute bottom-0 right-0"
            >
              <Card className={`bg-card/95 backdrop-blur-lg border shadow-2xl transition-all duration-300 ${
                isMinimized 
                  ? 'w-80 h-16' 
                  : 'w-96 h-[600px]'
              }`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-card to-accent/10 rounded-t-lg">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                    </div>
                    
                    <div className={`transition-opacity duration-300 ${isMinimized ? 'opacity-0' : 'opacity-100'}`}>
                      <h3 className="font-semibold text-sm">TalentXcel AI Agent</h3>
                      <p className="text-xs text-muted-foreground">Your career intelligence assistant</p>
                    </div>
                    
                    {isMinimized && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">AI Assistant</span>
                        <Badge variant="secondary" className="text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Online
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {!isMinimized && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPromptLibrary(true)}
                        className="h-7 w-7 p-0"
                        title="Browse Prompts"
                      >
                        <Sparkles className="h-3 w-3" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={isMinimized ? handleMaximize : handleMinimize}
                      className="h-7 w-7 p-0"
                    >
                      {isMinimized ? (
                        <Maximize2 className="h-3 w-3" />
                      ) : (
                        <Minimize2 className="h-3 w-3" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleToggleChat}
                      className="h-7 w-7 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Chat Content */}
                <AnimatePresence>
                  {!isMinimized && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-1 overflow-hidden"
                    >
                      <div className="h-[536px]">
                        <AgentChatInterface
                          selectedModule={selectedModule}
                          conversation={currentConversation}
                          onSendMessage={handleSendMessage}
                          onBack={null} // No back button in floating mode
                          isLoading={isLoading}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Prompt Library Modal */}
      <AnimatePresence>
        {showPromptLibrary && (
          <PromptLibrary
            onClose={() => setShowPromptLibrary(false)}
            onPromptSelect={handlePromptSelect}
          />
        )}
      </AnimatePresence>
    </>
  );
};