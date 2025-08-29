import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Bot, 
  Send, 
  Mic, 
  FileText, 
  TrendingUp, 
  Star, 
  MessageCircle,
  Lightbulb,
  Target,
  Calendar,
  BarChart
} from "lucide-react";
import { useDeepSeekAI } from '@/hooks/useDeepSeekAI';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actionItems?: ActionItem[];
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  type: 'resume' | 'application' | 'skill' | 'interview' | 'networking';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

interface CareerInsight {
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  category: 'market' | 'skills' | 'opportunities' | 'strategy';
}

export const AICareerAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI Career Assistant. I can help you with job search strategies, resume optimization, interview preparation, and career planning. What would you like to work on today?",
      timestamp: new Date(),
      suggestions: [
        "Optimize my resume for ATS",
        "Prepare for software engineer interviews",
        "Find salary insights for my role",
        "Plan my career growth path"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'actions' | 'analytics'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isProcessing, chatWithDeepSeek } = useDeepSeekAI();

  const [actionItems, setActionItems] = useState<ActionItem[]>([
    {
      id: '1',
      title: 'Update Resume with Latest Projects',
      description: 'Add your recent React project and quantify achievements',
      type: 'resume',
      priority: 'high',
      completed: false
    },
    {
      id: '2',
      title: 'Practice System Design Questions',
      description: 'Focus on scalability and database design concepts',
      type: 'interview',
      priority: 'medium',
      completed: false
    },
    {
      id: '3',
      title: 'Connect with Senior Engineers',
      description: 'Reach out to 3 engineers at target companies on LinkedIn',
      type: 'networking',
      priority: 'medium',
      completed: true
    }
  ]);

  const careerInsights: CareerInsight[] = [
    {
      title: 'React Developers in High Demand',
      description: 'React job postings increased 35% this month. Consider highlighting React expertise.',
      icon: <TrendingUp className="h-5 w-5 text-green-600" />,
      priority: 'high',
      category: 'market'
    },
    {
      title: 'TypeScript Skills Premium',
      description: 'Jobs requiring TypeScript offer 15% higher salaries on average.',
      icon: <Star className="h-5 w-5 text-yellow-600" />,
      priority: 'high',
      category: 'skills'
    },
    {
      title: 'Remote Opportunities Growing',
      description: '45% of new postings offer remote work options in your field.',
      icon: <Target className="h-5 w-5 text-blue-600" />,
      priority: 'medium',
      category: 'opportunities'
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      const response = await chatWithDeepSeek(
        inputMessage,
        "You are an AI Career Assistant specialized in helping job seekers with resume optimization, interview preparation, career planning, and job search strategies. Provide practical, actionable advice."
      );

      if (response) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response,
          timestamp: new Date(),
          suggestions: generateSuggestions(response)
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      toast.error('Failed to get AI response. Please try again.');
    }
  };

  const generateSuggestions = (response: string): string[] => {
    // Simple suggestion generation based on response content
    const suggestions = [];
    if (response.toLowerCase().includes('resume')) {
      suggestions.push("Help me optimize my resume");
    }
    if (response.toLowerCase().includes('interview')) {
      suggestions.push("Prepare for technical interviews");
    }
    if (response.toLowerCase().includes('salary')) {
      suggestions.push("Research salary benchmarks");
    }
    if (response.toLowerCase().includes('skill')) {
      suggestions.push("Identify skills to develop");
    }
    return suggestions.slice(0, 3);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Voice input not supported in this browser');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Voice recognition failed');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const toggleActionItem = (id: string) => {
    setActionItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'resume': return <FileText className="h-4 w-4" />;
      case 'interview': return <MessageCircle className="h-4 w-4" />;
      case 'skill': return <Star className="h-4 w-4" />;
      case 'networking': return <Target className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          AI Career Assistant
        </CardTitle>
        <div className="flex gap-2">
          {['chat', 'insights', 'actions', 'analytics'].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab as any)}
              className="capitalize"
            >
              {tab}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {activeTab === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}>
                  {message.type === 'assistant' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-last' : ''}`}>
                    <div className={`p-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white ml-auto' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {message.content}
                    </div>
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="mr-2 mb-1 text-xs"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.type === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything about your career..."
                onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleSendMessage()}
                disabled={isProcessing}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleVoiceInput}
                disabled={isListening}
              >
                <Mic className={`h-4 w-4 ${isListening ? 'text-red-500' : ''}`} />
              </Button>
              <Button onClick={handleSendMessage} disabled={isProcessing || !inputMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold">Career Insights</span>
            </div>
            {careerInsights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  {insight.icon}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">{insight.title}</h3>
                      <Badge className={getPriorityColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {insight.category}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-green-600" />
              <span className="font-semibold">Action Items</span>
            </div>
            {actionItems.map((item) => (
              <div key={item.id} className={`p-4 border rounded-lg ${item.completed ? 'bg-green-50' : ''}`}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleActionItem(item.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold ${item.completed ? 'line-through text-gray-500' : ''}`}>
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                        <div className="text-gray-500">
                          {getTypeIcon(item.type)}
                        </div>
                      </div>
                    </div>
                    <p className={`text-sm ${item.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart className="h-5 w-5 text-purple-600" />
              <span className="font-semibold">Career Analytics</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">24</div>
                <div className="text-sm text-gray-600">Applications Sent</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">8</div>
                <div className="text-sm text-gray-600">Interviews Scheduled</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">3</div>
                <div className="text-sm text-gray-600">Offers Received</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">85%</div>
                <div className="text-sm text-gray-600">Profile Completeness</div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-3">Weekly Progress</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Job Applications</span>
                    <span>6/10 goal</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Profile Updates</span>
                    <span>3/3 goal</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};