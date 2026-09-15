import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Bot, User, Send, Mic, BookOpen, Target, TrendingUp } from 'lucide-react';
import { TieredAccessGuard } from '@/components/access/TieredAccessGuard';
import { UsageMeter } from '@/components/ui/usage-meter';

interface Message {
  id: string;
  type: 'user' | 'coach';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  resources?: Resource[];
}

interface Resource {
  title: string;
  type: 'article' | 'course' | 'video' | 'book';
  url: string;
  duration?: string;
}

interface CoachingSession {
  id: string;
  topic: string;
  date: Date;
  messages: Message[];
  goals: string[];
  progress: number;
}

const IntelligentCareerCoach: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isCoachTyping, setIsCoachTyping] = useState(false);
  const [currentSession, setCurrentSession] = useState<CoachingSession | null>(null);
  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  const [coachingMode, setCoachingMode] = useState<'general' | 'goal-setting' | 'skill-development' | 'interview-prep'>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeSession();
    loadPreviousSessions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeSession = () => {
    const welcomeMessage: Message = {
      id: '1',
      type: 'coach',
      content: "Hello! I'm your AI Career Coach. I'm here to help you navigate your career journey, set goals, develop skills, and prepare for interviews. What would you like to work on today?",
      timestamp: new Date(),
      suggestions: [
        "Help me set career goals",
        "Review my skill development plan",
        "Practice interview questions",
        "Analyze market trends for my field"
      ]
    };

    setMessages([welcomeMessage]);
    
    const newSession: CoachingSession = {
      id: Date.now().toString(),
      topic: 'General Coaching',
      date: new Date(),
      messages: [welcomeMessage],
      goals: [],
      progress: 0
    };
    
    setCurrentSession(newSession);
  };

  const loadPreviousSessions = () => {
    const mockSessions: CoachingSession[] = [
      {
        id: '1',
        topic: 'Interview Preparation - Data Science Roles',
        date: new Date(Date.now() - 86400000), // Yesterday
        messages: [],
        goals: ['Practice technical questions', 'Improve behavioral responses'],
        progress: 75
      },
      {
        id: '2',
        topic: 'Skill Development Planning',
        date: new Date(Date.now() - 172800000), // 2 days ago
        messages: [],
        goals: ['Learn MLOps', 'Improve communication skills'],
        progress: 40
      }
    ];
    
    setSessions(mockSessions);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsCoachTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const coachResponse = generateCoachResponse(inputMessage, coachingMode);
      setMessages(prev => [...prev, coachResponse]);
      setIsCoachTyping(false);
    }, 1500);
  };

  const generateCoachResponse = (userInput: string, mode: string): Message => {
    const responses = {
      general: {
        content: "Based on your current profile and career trajectory, I can see several opportunities for growth. Let me provide some personalized recommendations...",
        suggestions: [
          "Tell me about your current role challenges",
          "What are your 5-year career goals?",
          "Which skills do you want to develop?",
          "Are you considering a career change?"
        ],
        resources: [
          {
            title: "Career Goal Setting Framework",
            type: 'article' as const,
            url: '#',
            duration: '10 min read'
          },
          {
            title: "Industry Trends Analysis",
            type: 'video' as const,
            url: '#',
            duration: '15 min'
          }
        ]
      },
      'goal-setting': {
        content: "Great! Let's work on setting SMART career goals. I'll help you define specific, measurable, achievable, relevant, and time-bound objectives.",
        suggestions: [
          "I want to advance to a senior position",
          "I'm looking to switch industries",
          "I want to develop leadership skills",
          "I'm aiming for a salary increase"
        ],
        resources: [
          {
            title: "SMART Goals for Career Development",
            type: 'course' as const,
            url: '#',
            duration: '2 hours'
          }
        ]
      },
      'skill-development': {
        content: "Let's analyze your current skill set and identify the most impactful skills to develop based on market demand and your career goals.",
        suggestions: [
          "Show me trending skills in my field",
          "Create a learning roadmap for me",
          "Recommend specific courses",
          "How can I practice these skills?"
        ],
        resources: [
          {
            title: "Skill Gap Analysis Tool",
            type: 'article' as const,
            url: '#',
            duration: '5 min'
          }
        ]
      },
      'interview-prep': {
        content: "I'll help you prepare for interviews with personalized questions based on your target roles and experience level. Let's practice!",
        suggestions: [
          "Practice behavioral questions",
          "Review technical concepts",
          "Mock interview session",
          "Salary negotiation tips"
        ],
        resources: [
          {
            title: "Interview Mastery Course",
            type: 'course' as const,
            url: '#',
            duration: '3 hours'
          }
        ]
      }
    };

    const response = responses[mode] || responses.general;

    return {
      id: Date.now().toString(),
      type: 'coach',
      content: response.content,
      timestamp: new Date(),
      suggestions: response.suggestions,
      resources: response.resources
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const switchMode = (mode: 'general' | 'goal-setting' | 'skill-development' | 'interview-prep') => {
    setCoachingMode(mode);
    const modeMessage: Message = {
      id: Date.now().toString(),
      type: 'coach',
      content: `Great! I've switched to ${mode.replace('-', ' ')} mode. How can I help you with this?`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, modeMessage]);
  };

  return (
    <TieredAccessGuard feature="ai_career_coach">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              Intelligent Career Coach
            </h2>
            <p className="text-muted-foreground">Your AI-powered personal career development assistant</p>
          </div>
        </div>

        <UsageMeter type="dailyAIRequests" currentUsage={8} label="AI Coach Sessions" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Career Coaching Session
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={coachingMode === 'general' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => switchMode('general')}
                    >
                      General
                    </Button>
                    <Button
                      variant={coachingMode === 'goal-setting' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => switchMode('goal-setting')}
                    >
                      Goals
                    </Button>
                    <Button
                      variant={coachingMode === 'skill-development' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => switchMode('skill-development')}
                    >
                      Skills
                    </Button>
                    <Button
                      variant={coachingMode === 'interview-prep' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => switchMode('interview-prep')}
                    >
                      Interview
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                          }`}>
                            {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                          </div>
                          
                          <div className="space-y-2">
                            <div className={`p-3 rounded-lg ${
                              message.type === 'user' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-secondary'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                            </div>
                            
                            {message.suggestions && (
                              <div className="flex flex-wrap gap-2">
                                {message.suggestions.map((suggestion, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="text-xs"
                                  >
                                    {suggestion}
                                  </Button>
                                ))}
                              </div>
                            )}
                            
                            {message.resources && message.resources.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">Recommended Resources:</p>
                                {message.resources.map((resource, index) => (
                                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded text-xs">
                                    <BookOpen className="h-3 w-3" />
                                    <span className="font-medium">{resource.title}</span>
                                    <Badge variant="secondary" className="text-xs">{resource.type}</Badge>
                                    {resource.duration && (
                                      <span className="text-muted-foreground">({resource.duration})</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isCoachTyping && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-secondary p-3 rounded-lg">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask your career coach anything..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <Button onClick={sendMessage} disabled={!inputMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button variant="outline">
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Session History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="p-3 border rounded-lg cursor-pointer hover:bg-muted">
                    <h4 className="font-medium text-sm mb-1">{session.topic}</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {session.date.toLocaleDateString()}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Progress</span>
                        <span>{session.progress}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-1">
                        <div 
                          className="bg-primary h-1 rounded-full" 
                          style={{ width: `${session.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Current Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-2 bg-muted rounded text-xs">
                  <div className="font-medium">Advance to Senior Role</div>
                  <div className="text-muted-foreground">Target: 6 months</div>
                </div>
                <div className="p-2 bg-muted rounded text-xs">
                  <div className="font-medium">Learn MLOps</div>
                  <div className="text-muted-foreground">Progress: 60%</div>
                </div>
                <div className="p-2 bg-muted rounded text-xs">
                  <div className="font-medium">Salary Increase</div>
                  <div className="text-muted-foreground">Target: 20%</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Sessions This Month</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Goals Achieved</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Avg. Progress Rate</span>
                  <span className="font-medium">85%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TieredAccessGuard>
  );
};

export default IntelligentCareerCoach;