import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Send, User, Bot, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AICareerAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser?: any;
}

interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
}

export const AICareerAssistantDialog: React.FC<AICareerAssistantDialogProps> = ({
  open,
  onOpenChange,
  currentUser
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hi! I'm your AI Career Assistant. I can help you with job search strategies, career planning, resume tips, and more. What would you like to know?",
      type: 'assistant',
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      type: 'user',
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // Simulate AI response (replace with actual AI service call)
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: generateAIResponse(message),
          type: 'assistant',
          timestamp: new Date()
        };
        setChatHistory(prev => [...prev, aiResponse]);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      toast.error('Failed to get AI response');
      setIsLoading(false);
    }
  };

  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('resume')) {
      return "For a strong resume, focus on: 1) Quantifiable achievements with numbers, 2) Relevant keywords from job descriptions, 3) Clean, ATS-friendly formatting, 4) Tailored content for each application. Would you like specific tips for any section?";
    } else if (message.includes('interview')) {
      return "Interview preparation tips: 1) Research the company thoroughly, 2) Practice STAR method for behavioral questions, 3) Prepare thoughtful questions about the role, 4) Practice your elevator pitch, 5) Dress appropriately for company culture.";
    } else if (message.includes('salary')) {
      return "When negotiating salary: 1) Research market rates for your role and location, 2) Consider total compensation (benefits, equity, etc.), 3) Wait for them to make the first offer, 4) Be prepared to justify your ask with achievements, 5) Stay professional and collaborative.";
    } else if (message.includes('career change')) {
      return "For career transitions: 1) Identify transferable skills, 2) Gain relevant experience through projects/volunteering, 3) Network in your target industry, 4) Consider additional training/certifications, 5) Craft a compelling transition story.";
    } else {
      return "That's a great question! Based on current job market trends, I'd recommend focusing on developing both technical and soft skills. What specific area of your career would you like to improve? I can provide more targeted advice.";
    }
  };

  const quickPrompts = [
    "How can I improve my resume?",
    "What are good interview questions to ask?",
    "How do I negotiate salary?",
    "Tips for career change",
    "How to find remote jobs?"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Career Assistant
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[60vh]">
          {/* Chat History */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg mb-4">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`p-2 rounded-full ${msg.type === 'user' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                    {msg.type === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <Card>
                    <CardContent className="p-3">
                      <p className="text-sm">{msg.content}</p>
                      <span className="text-xs text-gray-500 mt-1 block">
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="p-2 rounded-full bg-purple-500">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setMessage(prompt)}
                  className="text-xs"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask me anything about your career..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 resize-none"
              rows={2}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};