import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { AIChat } from './AIChat';
import { Bot, Sparkles } from "lucide-react";

export const SimpleAIWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  if (isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <AIChat 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 transition-all duration-300 hover:scale-105"
          size="icon"
        >
          <Bot className="h-6 w-6 text-white" />
        </Button>
        <div className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
          <Sparkles className="h-3 w-3 text-white" />
        </div>
      </div>
    </div>
  );
};