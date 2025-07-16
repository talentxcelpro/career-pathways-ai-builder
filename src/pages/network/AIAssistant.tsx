
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bot, Send, Lightbulb, FileText, TrendingUp, Users } from "lucide-react";

const AIAssistant = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI Career Assistant. I can help you with career advice, resume feedback, interview preparation, and job matching insights. How can I assist you today?",
      timestamp: new Date().toISOString()
    }
  ]);

  const quickQuestions = [
    {
      icon: <FileText className="h-4 w-4" />,
      text: "Review my resume",
      category: "Resume"
    },
    {
      icon: <Users className="h-4 w-4" />,
      text: "How to network effectively?",
      category: "Networking"
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      text: "Career switch advice",
      category: "Career"
    },
    {
      icon: <Lightbulb className="h-4 w-4" />,
      text: "Interview preparation tips",
      category: "Interview"
    }
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I understand your question. Let me provide you with some helpful insights based on current industry trends and best practices. This is a placeholder response - in the full implementation, this would connect to OpenAI's API for intelligent responses.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleQuickQuestion = (question: string) => {
    setMessage(question);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/network/messages" className="text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Bot className="h-8 w-8 mr-3 text-blue-600" />
              AI Career Assistant
            </h1>
            <p className="text-gray-600 mt-1">Get personalized career advice and insights</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quick Questions Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => handleQuickQuestion(question.text)}
                  >
                    <div className="flex items-start space-x-3">
                      {question.icon}
                      <div>
                        <div className="font-medium text-sm">{question.text}</div>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {question.category}
                        </Badge>
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center">
                  <Bot className="h-5 w-5 mr-2 text-blue-600" />
                  Career Chat
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[450px] p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-3 ${
                            msg.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {msg.type === 'ai' && (
                            <div className="flex items-center mb-2">
                              <Bot className="h-4 w-4 mr-2 text-blue-600" />
                              <span className="text-sm font-medium text-blue-600">AI Assistant</span>
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-xs mt-2 ${
                            msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="border-t p-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Ask me anything about your career..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    AI responses are powered by advanced language models and current industry data
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
