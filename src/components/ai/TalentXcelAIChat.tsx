import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, RefreshCw, BookOpen, Briefcase, Users, FileText, MessageSquare, Sparkles, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { talentXcelAIPayloads, getPayloadByCommand, AIPayload } from '@/lib/aiPayloads';

// Import AI Modules
import { ATSScanModule } from './modules/ATSScanModule';
import { JDTailorModule } from './modules/JDTailorModule';
import { MockInterviewModule } from './modules/MockInterviewModule';
import { GeneratePostModule } from './modules/GeneratePostModule';
import { SkillCheckModule } from './modules/SkillCheckModule';
import { DailyBriefModule } from './modules/DailyBriefModule';

interface UserProfile {
  id: string;
  full_name?: string;
  title?: string;
  location?: string;
  experience?: number;
}

interface Message {
  id: number;
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
  metadata?: any;
}

export default function TalentXcelAIChat() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [activeModule, setActiveModule] = useState<React.ReactNode>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userName = userProfile?.full_name || 'User';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { 
    scrollToBottom(); 
    
    // Load user profile
    const loadUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, title, location')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            setUserProfile(profile as UserProfile);
          }
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    };

    loadUserProfile();
    
    // Welcome message on component mount
    if (messages.length === 0) {
      const welcomeMsg: Message = {
        id: Date.now(),
        type: 'ai',
        text: `Hi ${userName}! 👋 I'm your TalentXcel AI Career Companion. I'm powered by real AI and can help you with:\n\n🎯 ATS Resume Scanning\n📝 Job Description Tailoring\n🎤 Mock Interview Practice\n✍️ Content Generation\n📚 Skill Assessment\n📋 Daily Career Brief\n\nTry clicking any button above or type a command like /ats-scan, /daily-brief, or ask me anything!`,
        timestamp: new Date()
      };
      setMessages([welcomeMsg]);
    }
  }, [messages.length, userName]);

  const addMessage = (text: string, type: 'user' | 'ai' = 'ai', metadata?: any) => {
    const newMessage: Message = {
      id: Date.now(),
      type,
      text,
      timestamp: new Date(),
      metadata
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const callAIService = async (payload: AIPayload) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to use AI features');
        addMessage('Please log in to access AI features. You can still explore the modules above!');
        return;
      }

      // Ensure userId is set
      const fullPayload = {
        ...payload,
        userId: userProfile?.id || session.user.id
      };

      const response = await supabase.functions.invoke('ai-agent', {
        body: fullPayload,
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { response: aiResponse, metadata } = response.data;
      addMessage(aiResponse || 'AI response received successfully.', 'ai', metadata);
      
    } catch (error) {
      console.error('AI Service Error:', error);
      addMessage('Sorry, I encountered an error processing your request. Please try again.');
      toast.error('AI service temporarily unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommand = (command: string) => {
    setActiveModule(null); // Clear previous module
    
    const userId = userProfile?.id || '';
    const payload = getPayloadByCommand(command, userId, userProfile);
    
    if (payload) {
      // Set appropriate modules based on command
      switch (command.toLowerCase()) {
        case '/ats-scan':
          setActiveModule(<ATSScanModule onResult={addMessage} userProfile={userProfile} />);
          break;
        case '/jd-tailor':
          setActiveModule(<JDTailorModule onResult={addMessage} userProfile={userProfile} />);
          break;
        case '/mock-interview':
          setActiveModule(<MockInterviewModule onResult={addMessage} userProfile={userProfile} />);
          break;
        case '/generate-post':
          setActiveModule(<GeneratePostModule onResult={addMessage} userProfile={userProfile} />);
          break;
        case '/skill-check':
          setActiveModule(<SkillCheckModule onResult={addMessage} userProfile={userProfile} />);
          break;
        case '/daily-brief':
          setActiveModule(<DailyBriefModule onResult={addMessage} userProfile={userProfile} />);
          break;
      }
      
      callAIService(payload);
    } else {
      addMessage(`I can help you with these commands:\n\n/ats-scan - Analyze resume for ATS optimization\n/jd-tailor - Tailor resume to job descriptions\n/mock-interview - Practice interview skills\n/generate-post - Create professional content\n/skill-check - Get skill recommendations\n/daily-brief - View your career summary\n/jobs - Find matching jobs\n/courses - Recommend learning paths\n/salary-analysis - Analyze salary expectations\n\nOr just ask me anything about your career!`);
    }
  };

  const sendMessage = (text: string) => {
    if (!text.trim() || isLoading) return;

    // Add user message
    addMessage(text, 'user');
    setInput('');

    // Check if it's a command
    if (text.startsWith('/')) {
      handleCommand(text);
    } else {
      // Send to AI service for general chat
      const userId = userProfile?.id || '';
      const payload = talentXcelAIPayloads.general.chat(userId, text);
      callAIService(payload);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">TalentXcel AI</h1>
            <p className="text-sm text-muted-foreground">Your AI Career Companion</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4" />
            <span>Hi, {userName}!</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => {
            setMessages([]);
            setActiveModule(null);
            setSessionId(null);
          }}>
            <RefreshCw className="w-4 h-4 mr-1" /> Reset
          </Button>
        </div>
      </div>

      {/* Command Buttons */}
      <div className="flex gap-2 p-4 border-b border-border overflow-x-auto bg-muted/30">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleCommand('/ats-scan')}
          className="flex items-center gap-2 whitespace-nowrap"
          disabled={isLoading}
        >
          <FileText className="w-4 h-4" />
          ATS Scan
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleCommand('/jd-tailor')}
          className="flex items-center gap-2 whitespace-nowrap"
          disabled={isLoading}
        >
          <Briefcase className="w-4 h-4" />
          JD Tailor
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleCommand('/mock-interview')}
          className="flex items-center gap-2 whitespace-nowrap"
          disabled={isLoading}
        >
          <MessageSquare className="w-4 h-4" />
          Mock Interview
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleCommand('/generate-post')}
          className="flex items-center gap-2 whitespace-nowrap"
          disabled={isLoading}
        >
          <BookOpen className="w-4 h-4" />
          Generate Post
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleCommand('/skill-check')}
          className="flex items-center gap-2 whitespace-nowrap"
          disabled={isLoading}
        >
          <Users className="w-4 h-4" />
          Skill Check
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleCommand('/daily-brief')}
          className="flex items-center gap-2 whitespace-nowrap"
          disabled={isLoading}
        >
          <Sparkles className="w-4 h-4" />
          Daily Brief
        </Button>
      </div>

      {/* Messages and Active Module */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <Card className={`${
              msg.type === 'user' 
                ? 'bg-primary text-primary-foreground ml-16' 
                : 'bg-card text-card-foreground mr-16'
            } max-w-2xl w-full`}>
              <CardContent className="p-4">
                <div className="whitespace-pre-wrap text-sm">{msg.text}</div>
                <div className="text-xs opacity-60 mt-2 flex items-center gap-2">
                  {msg.timestamp.toLocaleTimeString()}
                  {msg.metadata?.tokens_used && (
                    <Badge variant="outline" className="text-xs">
                      {msg.metadata.tokens_used} tokens
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <Card className="bg-card text-card-foreground mr-16">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Active Module */}
        {activeModule && (
          <div className="flex justify-center mt-6">
            {activeModule}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card flex gap-2">
        <Input
          placeholder="Type your message or use /commands like /ats-scan, /daily-brief..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { 
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
          className="flex-1"
          disabled={isLoading}
        />
        <Button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-1" />
          )}
          Send
        </Button>
      </div>
    </div>
  );
}