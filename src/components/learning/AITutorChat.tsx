import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2, Lightbulb, Target } from 'lucide-react';
import { useAITutor } from '@/hooks/useAdvancedLearning';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AITutorChatProps {
  userId: string;
  courseId: string;
  lessonId?: string;
  courseName?: string;
  lessonName?: string;
  learningObjectives?: string[];
  onInsightGenerated?: (insight: any) => void;
}

export const AITutorChat: React.FC<AITutorChatProps> = ({
  userId,
  courseId,
  lessonId,
  courseName,
  lessonName,
  learningObjectives = [],
  onInsightGenerated
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm your AI tutor for ${courseName || 'this course'}. I'm here to help you understand the concepts, answer questions, and guide your learning journey. What would you like to learn about today?`,
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  
  const { startTutorSession, isLoading } = useAITutor();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    try {
      const response = await startTutorSession({
        userId,
        courseId,
        lessonId,
        userMessage: newMessage,
        sessionId,
        learningObjectives,
        difficulty
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSessionId(response.sessionId);

      // Handle learning insights
      if (response.learningInsights && onInsightGenerated) {
        onInsightGenerated(response.learningInsights);
      }

    } catch (error) {
      console.error('AI Tutor error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "Can you explain this concept in simpler terms?",
    "What are some real-world applications?",
    "How does this relate to what I learned before?",
    "Can you give me a practical example?",
    "What should I focus on next?"
  ];

  const handleSuggestedQuestion = (question: string) => {
    setNewMessage(question);
    inputRef.current?.focus();
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Tutor
          </CardTitle>
          <div className="flex items-center gap-2">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="text-sm border rounded px-2 py-1 bg-background"
            >
              <option value="beginner">Beginner Level</option>
              <option value="intermediate">Intermediate Level</option>
              <option value="advanced">Advanced Level</option>
            </select>
          </div>
        </div>
        
        {(courseName || lessonName) && (
          <div className="text-sm text-muted-foreground">
            {courseName && <span>Course: {courseName}</span>}
            {courseName && lessonName && <span> • </span>}
            {lessonName && <span>Lesson: {lessonName}</span>}
          </div>
        )}

        {learningObjectives.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="text-xs text-muted-foreground mr-2">Learning Objectives:</span>
            {learningObjectives.slice(0, 3).map((objective, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {objective}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">AI Tutor is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Suggested Questions */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Suggested questions:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {suggestedQuestions.slice(0, 3).map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask your AI tutor anything..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};