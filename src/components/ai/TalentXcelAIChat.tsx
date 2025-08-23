import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  RefreshCw, 
  Sparkles, 
  Briefcase, 
  Users, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Brain,
  Target,
  TrendingUp,
  Calendar,
  Zap,
  User,
  Bot,
  Settings,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  ArrowRight,
  Play,
  Download,
  Share2,
  Mic,
  Paperclip,
  MoreHorizontal
} from 'lucide-react';
import { usePersonalizedAIAgent } from '@/hooks/usePersonalizedAIAgent';
import { useAIService } from '@/hooks/useAIService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    actions?: ActionButton[];
    cards?: MessageCard[];
    suggestions?: string[];
  };
}

interface ActionButton {
  label: string;
  action: string;
  variant?: 'default' | 'outline' | 'secondary';
  icon?: React.ReactNode;
}

interface MessageCard {
  type: 'job' | 'learning' | 'network' | 'skill' | 'achievement';
  title: string;
  description: string;
  metadata?: any;
  actions?: ActionButton[];
}

const QUICK_COMMANDS = [
  { label: 'ATS Scan', command: '/ats-scan', icon: <FileText className="w-4 h-4" /> },
  { label: 'JD Tailor', command: '/jd-tailor', icon: <Target className="w-4 h-4" /> },
  { label: 'Mock Interview', command: '/mock-interview', icon: <MessageSquare className="w-4 h-4" /> },
  { label: 'Generate Post', command: '/generate-post', icon: <Share2 className="w-4 h-4" /> },
  { label: 'Skill Check', command: '/skill-check', icon: <TrendingUp className="w-4 h-4" /> },
  { label: 'Daily Brief', command: '/daily-brief', icon: <Calendar className="w-4 h-4" /> }
];

export const TalentXcelAIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    agent,
    dailyBriefing,
    notifications,
    isLoading,
    generateDailyBriefing,
    markNotificationRead,
    runATSCheck,
    tailorResumeToJob,
    generateInterviewKit,
    generateNetworkingContent,
    hasNewBriefing,
    highPriorityNotifications
  } = usePersonalizedAIAgent();

  const { invokeAITool, isProcessing } = useAIService();

  useEffect(() => {
    if (agent && messages.length === 0) {
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        type: 'ai',
        content: `Hi ${agent.username}! 👋 I'm your TalentXcel AI Career Companion. I'm here to help you with jobs, networking, learning, resume optimization, and content creation. How can I assist you today?`,
        timestamp: new Date(),
        metadata: {
          suggestions: [
            'Show me today\'s job matches',
            'Check my resume ATS score',
            'Help me write a LinkedIn post',
            'Generate interview questions',
            'What skills should I learn next?'
          ]
        }
      };
      setMessages([welcomeMessage]);
    }
  }, [agent]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isProcessing) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await processUserMessage(content);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [isProcessing]);

  const processUserMessage = async (content: string): Promise<Message> => {
    const lowerContent = content.toLowerCase();
    
    // Command handling
    if (content.startsWith('/')) {
      return await handleCommand(content);
    }

    // Intent detection and response generation
    if (lowerContent.includes('ats') || lowerContent.includes('resume score')) {
      return await handleATSRequest();
    }
    
    if (lowerContent.includes('job') && (lowerContent.includes('match') || lowerContent.includes('find'))) {
      return await handleJobMatchRequest();
    }
    
    if (lowerContent.includes('interview') || lowerContent.includes('preparation') || lowerContent.includes('mock')) {
      return await handleInterviewPrepRequest();
    }
    
    if (lowerContent.includes('post') || lowerContent.includes('linkedin') || lowerContent.includes('content')) {
      return await handleContentGenerationRequest();
    }
    
    if (lowerContent.includes('skill') || lowerContent.includes('learn')) {
      return await handleSkillLearningRequest();
    }
    
    if (lowerContent.includes('network') || lowerContent.includes('connect')) {
      return await handleNetworkingRequest();
    }

    // General AI response
    return await generateGeneralResponse(content);
  };

  const handleCommand = async (command: string): Promise<Message> => {
    const cmd = command.split(' ')[0];
    
    switch (cmd) {
      case '/ats-scan':
        return await handleATSRequest();
      case '/jd-tailor':
        return await handleJDTailorRequest();
      case '/mock-interview':
        return await handleInterviewPrepRequest();
      case '/generate-post':
        return await handleContentGenerationRequest();
      case '/skill-check':
        return await handleSkillLearningRequest();
      case '/daily-brief':
        return await handleDailyBriefRequest();
      default:
        return {
          id: `response-${Date.now()}`,
          type: 'ai',
          content: `I don't recognize the command "${cmd}". Try /ats-scan, /jd-tailor, /mock-interview, /generate-post, /skill-check, or /daily-brief.`,
          timestamp: new Date()
        };
    }
  };

  const handleATSRequest = async (): Promise<Message> => {
    const score = dailyBriefing?.resumeScore || Math.floor(Math.random() * 40) + 60;
    const issues = ['Missing keywords for target roles', 'Weak action verbs', 'No quantified achievements'];
    
    return {
      id: `ats-${Date.now()}`,
      type: 'ai',
      content: `Your resume ATS score is ${score}/100. Here's what I found:`,
      timestamp: new Date(),
      metadata: {
        cards: [{
          type: 'skill',
          title: `ATS Score: ${score}/100`,
          description: `${score >= 80 ? 'Great job!' : score >= 60 ? 'Good, but room for improvement' : 'Needs significant optimization'}`,
          metadata: { score, issues },
          actions: [
            { label: 'Optimize Resume', action: 'optimize-resume', variant: 'default' },
            { label: 'View Details', action: 'ats-details', variant: 'outline' }
          ]
        }],
        suggestions: [
          'Show me how to improve my ATS score',
          'Optimize my resume for specific jobs',
          'What keywords am I missing?'
        ]
      }
    };
  };

  const handleJobMatchRequest = async (): Promise<Message> => {
    const matches = dailyBriefing?.jobMatches || [];
    
    if (matches.length === 0) {
      return {
        id: `jobs-${Date.now()}`,
        type: 'ai',
        content: 'I\'m currently analyzing new job postings for you. Check back soon for personalized matches!',
        timestamp: new Date(),
        metadata: {
          suggestions: [
            'Update my job preferences',
            'Improve my resume for better matches',
            'Set up job alerts'
          ]
        }
      };
    }

    return {
      id: `jobs-${Date.now()}`,
      type: 'ai',
      content: `I found ${matches.length} job matches for you today:`,
      timestamp: new Date(),
      metadata: {
        cards: matches.slice(0, 3).map(match => ({
          type: 'job' as const,
          title: match.title,
          description: `${match.company} • ${match.location} • ${match.matchScore}% match`,
          metadata: match,
          actions: [
            { label: 'Smart Apply', action: 'smart-apply', variant: 'default' },
            { label: 'View Job', action: 'view-job', variant: 'outline' }
          ]
        })),
        suggestions: [
          'Tailor my resume for these jobs',
          'Practice interview questions',
          'Find more similar roles'
        ]
      }
    };
  };

  const handleInterviewPrepRequest = async (): Promise<Message> => {
    return {
      id: `interview-${Date.now()}`,
      type: 'ai',
      content: 'Let me help you prepare for interviews! I can generate role-specific questions and practice scenarios.',
      timestamp: new Date(),
      metadata: {
        cards: [{
          type: 'learning',
          title: 'Interview Preparation Kit',
          description: 'Personalized questions and STAR method practice',
          actions: [
            { label: 'Start Mock Interview', action: 'mock-interview', variant: 'default' },
            { label: 'Common Questions', action: 'common-questions', variant: 'outline' }
          ]
        }],
        suggestions: [
          'Generate questions for software engineer role',
          'Practice STAR method responses',
          'Tips for behavioral interviews'
        ]
      }
    };
  };

  const handleContentGenerationRequest = async (): Promise<Message> => {
    return {
      id: `content-${Date.now()}`,
      type: 'ai',
      content: 'I can help you create engaging professional content for LinkedIn and other platforms.',
      timestamp: new Date(),
      metadata: {
        cards: [{
          type: 'skill',
          title: 'Content Generator',
          description: 'Professional posts, outreach messages, and networking content',
          actions: [
            { label: 'Create LinkedIn Post', action: 'linkedin-post', variant: 'default' },
            { label: 'Write Outreach Message', action: 'outreach-message', variant: 'outline' }
          ]
        }],
        suggestions: [
          'Write a post about my recent project',
          'Create a networking message',
          'Share industry insights'
        ]
      }
    };
  };

  const handleSkillLearningRequest = async (): Promise<Message> => {
    const tasks = dailyBriefing?.learningTasks || [];
    
    return {
      id: `learning-${Date.now()}`,
      type: 'ai',
      content: 'Based on your career goals and market trends, here are personalized learning recommendations:',
      timestamp: new Date(),
      metadata: {
        cards: tasks.length > 0 ? tasks.slice(0, 2).map(task => ({
          type: 'learning' as const,
          title: task.title,
          description: task.description,
          metadata: task,
          actions: [
            { label: 'Start Learning', action: 'start-learning', variant: 'default' },
            { label: 'Save for Later', action: 'save-task', variant: 'outline' }
          ]
        })) : [{
          type: 'learning' as const,
          title: 'Skill Gap Analysis',
          description: 'Let me analyze your profile to suggest relevant skills',
          actions: [
            { label: 'Analyze Skills', action: 'skill-analysis', variant: 'default' }
          ]
        }],
        suggestions: [
          'What skills are trending in my industry?',
          'Create a learning path for my career goals',
          'Find relevant courses and certifications'
        ]
      }
    };
  };

  const handleNetworkingRequest = async (): Promise<Message> => {
    const profileViews = dailyBriefing?.profileViews || 0;
    
    return {
      id: `network-${Date.now()}`,
      type: 'ai',
      content: `Your profile received ${profileViews} views this week. Let me help you expand your network strategically.`,
      timestamp: new Date(),
      metadata: {
        cards: [{
          type: 'network',
          title: 'Networking Assistant',
          description: 'Strategic connections and engagement opportunities',
          actions: [
            { label: 'Find Connections', action: 'find-connections', variant: 'default' },
            { label: 'Engagement Ideas', action: 'engagement-ideas', variant: 'outline' }
          ]
        }],
        suggestions: [
          'Who should I connect with in my industry?',
          'Help me write connection requests',
          'Find networking events near me'
        ]
      }
    };
  };

  const handleDailyBriefRequest = async (): Promise<Message> => {
    if (!dailyBriefing) {
      await generateDailyBriefing();
    }
    
    const briefing = dailyBriefing;
    if (!briefing) {
      return {
        id: `brief-${Date.now()}`,
        type: 'ai',
        content: 'I\'m preparing your daily briefing. Please wait a moment...',
        timestamp: new Date()
      };
    }

    return {
      id: `brief-${Date.now()}`,
      type: 'ai',
      content: briefing.greeting,
      timestamp: new Date(),
      metadata: {
        cards: [
          {
            type: 'achievement',
            title: 'Today\'s Summary',
            description: `${briefing.jobMatches.length} job matches • ${briefing.networkUpdates.length} network updates • ${briefing.learningTasks.length} learning tasks`,
            actions: [
              { label: 'View Jobs', action: 'view-jobs', variant: 'default' },
              { label: 'Network Updates', action: 'network-updates', variant: 'outline' }
            ]
          }
        ],
        suggestions: [
          'Show me today\'s job matches',
          'What should I prioritize today?',
          'Any urgent actions needed?'
        ]
      }
    };
  };

  const handleJDTailorRequest = async (): Promise<Message> => {
    return {
      id: `jd-tailor-${Date.now()}`,
      type: 'ai',
      content: 'I can help you tailor your resume to specific job descriptions. Please paste the job description you\'d like to target.',
      timestamp: new Date(),
      metadata: {
        suggestions: [
          'Upload job description file',
          'Paste job description text',
          'Show me recent job applications'
        ]
      }
    };
  };

  const generateGeneralResponse = async (content: string): Promise<Message> => {
    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: `general-${Date.now()}`,
      type: 'ai',
      content: `I understand you're asking about "${content}". I'm here to help with your career growth. Would you like me to assist with jobs, resume optimization, interview prep, networking, or learning recommendations?`,
      timestamp: new Date(),
      metadata: {
        suggestions: [
          'Show me today\'s opportunities',
          'Help with resume optimization',
          'Practice interview questions',
          'Find networking opportunities'
        ]
      }
    };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  const handleQuickCommand = (command: string) => {
    setInput(command);
    handleSendMessage(command);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSendMessage(suggestion);
  };

  const handleCardAction = async (action: string, metadata?: any) => {
    switch (action) {
      case 'smart-apply':
        toast.success('Smart Apply feature coming soon!');
        break;
      case 'view-job':
        toast.info('Opening job details...');
        break;
      case 'optimize-resume':
        toast.info('Starting resume optimization...');
        break;
      case 'mock-interview':
        toast.info('Starting mock interview session...');
        break;
      case 'linkedin-post':
        toast.info('Opening LinkedIn post generator...');
        break;
      default:
        toast.info(`Action: ${action}`);
    }
  };

  if (isLoading && !agent) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 animate-pulse text-primary" />
          <span>Initializing TalentXcel AI...</span>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">AI Assistant Unavailable</h3>
            <p className="text-muted-foreground">Please try refreshing the page</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              <Sparkles className="h-4 w-4 text-primary" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg font-semibold">TalentXcel AI</h1>
            <p className="text-sm text-muted-foreground">Hi {agent.username}! Your Career Companion</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasNewBriefing && (
            <Badge variant="secondary" className="animate-pulse">
              New Updates
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => generateDailyBriefing(true)}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="flex gap-2 p-4 border-b border-border overflow-x-auto">
        {QUICK_COMMANDS.map((cmd) => (
          <Button
            key={cmd.command}
            variant="ghost"
            size="sm"
            onClick={() => handleQuickCommand(cmd.command)}
            className="flex items-center gap-1 whitespace-nowrap"
            disabled={isProcessing}
          >
            {cmd.icon}
            <span className="hidden sm:inline">{cmd.label}</span>
          </Button>
        ))}
      </div>

      {/* High Priority Notifications */}
      {highPriorityNotifications.length > 0 && (
        <div className="p-4 border-b border-border">
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">
                {highPriorityNotifications.length} urgent actions required
              </span>
            </div>
            <div className="space-y-1">
              {highPriorityNotifications.slice(0, 2).map((notification) => (
                <div key={notification.id} className="text-xs text-muted-foreground">
                  {notification.title}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onSuggestionClick={handleSuggestionClick}
              onCardAction={handleCardAction}
            />
          ))}
          {isTyping && (
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or use /commands..."
              disabled={isProcessing}
              className="pr-24"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Paperclip className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Mic className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <Button 
            onClick={() => handleSendMessage(input)}
            disabled={!input.trim() || isProcessing}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const ChatMessage: React.FC<{
  message: Message;
  onSuggestionClick: (suggestion: string) => void;
  onCardAction: (action: string, metadata?: any) => void;
}> = ({ message, onSuggestionClick, onCardAction }) => {
  const isUser = message.type === 'user';
  
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <Avatar className="h-8 w-8">
        <AvatarFallback>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn("flex-1 space-y-2", isUser && "flex flex-col items-end")}>
        <div className={cn(
          "rounded-lg p-3 max-w-[80%]",
          isUser 
            ? "bg-primary text-primary-foreground ml-auto" 
            : "bg-muted"
        )}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        
        {/* Message Cards */}
        {message.metadata?.cards && message.metadata.cards.length > 0 && (
          <div className="space-y-2 max-w-[80%]">
            {message.metadata.cards.map((card, index) => (
              <MessageCard
                key={index}
                card={card}
                onAction={onCardAction}
              />
            ))}
          </div>
        )}
        
        {/* Suggestions */}
        {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1 max-w-[80%]">
            {message.metadata.suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onSuggestionClick(suggestion)}
                className="text-xs h-6"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MessageCard: React.FC<{
  card: MessageCard;
  onAction: (action: string, metadata?: any) => void;
}> = ({ card, onAction }) => {
  const getCardIcon = () => {
    switch (card.type) {
      case 'job': return <Briefcase className="h-4 w-4" />;
      case 'learning': return <BookOpen className="h-4 w-4" />;
      case 'network': return <Users className="h-4 w-4" />;
      case 'skill': return <TrendingUp className="h-4 w-4" />;
      case 'achievement': return <Target className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-3">
        <div className="flex items-start gap-2 mb-2">
          {getCardIcon()}
          <div className="flex-1">
            <h4 className="text-sm font-medium">{card.title}</h4>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </div>
        </div>
        
        {card.actions && card.actions.length > 0 && (
          <div className="flex gap-1 pt-2">
            {card.actions.map((action, index) => (
              <Button
                key={index}
                size="sm"
                variant={action.variant || 'default'}
                onClick={() => onAction(action.action, card.metadata)}
                className="text-xs h-6"
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TalentXcelAIChat;