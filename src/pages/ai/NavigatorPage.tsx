import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Compass, Briefcase, FileText, Route, ArrowRight, Brain, Activity, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useReverseJobMatch } from '@/hooks/useReverseJobMatch';
import { cn } from "@/lib/utils";
import { generateLocalCareerCoachResponse } from '@/utils/localCareerCoach';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface CoachResponse {
  message?: string;
  sessionId?: string;
}

const SUGGESTED_PROMPTS = [
  { icon: FileText, text: 'Calibrate identity for ATS synchronization', command: '/ats-scan' },
  { icon: Briefcase, text: 'Optimize identity for a precision match', command: '/jd-tailor' },
  { icon: Route, text: 'Initialize mock performance interview', command: '/mock-interview' },
  { icon: Sparkles, text: 'Index new high-fidelity job matches', command: '/beacon-scan' }
];

export default function NavigatorPage() {
  const { user } = useAuth();
  const { startBeaconScan } = useReverseJobMatch();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [coachMode, setCoachMode] = useState<'cloud' | 'local'>('cloud');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch full user context to pass to the coach
  const { data: contextData } = useQuery({
    queryKey: ['coach-context', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const [profile, skills, resumes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user?.id).single(),
        supabase.from('user_skills').select('skill_name, proficiency_level').eq('user_id', user?.id),
        supabase.from('ai_resumes').select('id, ats_score, content').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(1)
      ]);
      return {
        profile: profile.data,
        skills: skills.data?.map(s => s.skill_name) || [],
        latestResume: resumes.data?.[0]
      };
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const addAIMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: `${Date.now()}-ai`,
      type: 'ai',
      content,
      timestamp: new Date()
    }]);
  };

  const handleSendMessage = async (text: string, command?: string) => {
    if (!text.trim() && !command) return;

    if (!user) {
      addAIMessage('Please sign in so TalentXcel Navigator can index your professional identity and intelligence context.');
      return;
    }

    const userMsg = text || command || '';
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content: userMsg,
      timestamp: new Date()
    }]);
    
    setInputMessage('');
    setIsTyping(true);

    if (command === '/beacon-scan') {
      try {
        const scanResult = await startBeaconScan();
        setMessages(prev => [...prev, {
          id: `${Date.now()}-beacon`,
          type: 'ai',
          content: `${scanResult.message} Open TalentXcel Beacon to review high-fidelity opportunities and broadcast interest signals.`,
          timestamp: new Date()
        }]);
        setIsTyping(false);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
        return;
      } catch (err) {
        console.error('Beacon scan synchronization failed:', err);
      }
    }

    try {
      const timeout = new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error('TalentXcel Navigator synchronization timed out')), 18000);
      });

      const invokeCoach = supabase.functions.invoke<CoachResponse>('ai-chat', {
        body: {
          message: text || command,
          command,
          sessionId,
          context: contextData
        }
      });

      const { data, error } = await Promise.race([invokeCoach, timeout]);

      if (error) throw error;
      if (!data?.message) throw new Error('TalentXcel Navigator returned an empty intelligence response');
      
      setCoachMode('cloud');

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      addAIMessage(data.message);
    } catch (error) {
      console.error('Error in TalentXcel Navigator:', error);
      setCoachMode('local');
      addAIMessage(generateLocalCareerCoachResponse({
        message: text || command || '',
        command,
        context: contextData
      }));
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputMessage);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50/50 backdrop-blur-xl relative overflow-hidden edge-to-edge">
      
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />

      {/* Premium Header */}
      <div className="bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 px-8 py-5 relative z-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-950 flex items-center justify-center shadow-2xl">
            <Compass className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-apple-heavy text-slate-950 tracking-tight leading-none">Intelligence Navigator</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-apple-heavy uppercase tracking-widest text-slate-400">Intelligence Sync Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={cn(
              "h-8 px-4 rounded-xl border-slate-200 bg-white font-apple-heavy text-[10px] uppercase tracking-widest transition-all",
              coachMode === 'cloud' ? 'text-blue-600' : 'border-amber-200 bg-amber-50 text-amber-700'
            )}
          >
            {coachMode === 'cloud' ? 'INTELLIGENCE SYNC' : 'LOCAL GUIDE'}
          </Badge>
          <button className="h-10 w-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all shadow-sm">
            <Sparkles className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Intelligence Stream */}
      <div className="flex-1 overflow-y-auto px-8 py-12 relative z-10 no-scrollbar">
        <div className="max-w-4xl mx-auto space-y-12 pb-24">
          
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="relative mb-12">
                <div className="absolute inset-0 bg-blue-600/10 blur-[80px] rounded-full" />
                <div className="w-32 h-32 bg-slate-950 rounded-[40px] flex items-center justify-center relative z-10 shadow-2xl">
                  <Compass className="w-16 h-16 text-white" />
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-apple-heavy text-slate-950 tracking-tighter mb-6 leading-[1.1]">
                Accelerate your evolution,<br />
                {contextData?.profile?.full_name?.split(' ')[0] || 'Strategic Partner'}
              </h1>
              
              <p className="text-xl font-apple-medium text-slate-400 max-w-2xl mb-16 uppercase tracking-[0.2em] leading-relaxed">
                TalentXcel has synchronized your professional intelligence.<br />
                Initializing strategic navigation.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl text-left">
                {SUGGESTED_PROMPTS.map((prompt, i) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(prompt.text, prompt.command)}
                      disabled={isTyping}
                      className="group p-8 bg-white rounded-[32px] border border-slate-100 shadow-xl hover:shadow-2xl hover:border-blue-200 transition-all duration-500 text-left hover:-translate-y-2 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-all group-hover:scale-110">
                        <Icon className="h-16 w-16" />
                      </div>
                      <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-slate-50 group-hover:bg-blue-50 mb-6 transition-colors shadow-inner">
                        <Icon className="h-8 w-8 text-slate-950 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <h4 className="font-apple-heavy text-slate-950 text-base mb-2">{prompt.text}</h4>
                      <p className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest">Execute Move</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={msg.id} className={cn(
                "flex gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700",
                msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}>
                {msg.type === 'ai' && (
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center shrink-0 mt-2 shadow-2xl">
                    <Compass className="w-6 h-6 text-white" />
                  </div>
                )}
                
                <div className={cn(
                  "max-w-[85%] md:max-w-[75%] px-10 py-7 rounded-[40px] shadow-xl relative",
                  msg.type === 'user' 
                    ? 'bg-slate-950 text-white rounded-tr-lg' 
                    : 'bg-white border border-slate-100 text-slate-950 rounded-tl-lg shadow-2xl'
                )}>
                  <div className="text-[17px] leading-relaxed font-apple-medium whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  <div className={cn(
                    "text-[10px] font-apple-heavy uppercase tracking-widest mt-5 opacity-40",
                    msg.type === 'user' ? 'text-right' : 'text-left'
                  )}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}

          {isTyping && (
            <div className="flex gap-8 justify-start animate-pulse">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 mt-2">
                <Compass className="w-6 h-6 text-slate-300" />
              </div>
              <div className="bg-white border border-slate-100 px-10 py-8 rounded-[40px] rounded-tl-lg shadow-xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '200ms' }} />
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '400ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-16" />
        </div>
      </div>

      {/* Floating Tactical Input */}
      <div className="p-10 bg-transparent relative z-20">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[36px] blur opacity-10 group-hover:opacity-20 transition-opacity duration-700" />
          <div className="relative flex items-center bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden px-4">
            <button className="h-14 w-14 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
              <Sparkles className="h-6 w-6" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Query Intelligence Navigator..."
              aria-label="Query Intelligence Navigator"
              disabled={isTyping}
              className="flex-1 bg-transparent border-none py-8 px-6 text-lg font-apple-medium text-slate-950 placeholder:text-slate-400 focus:ring-0 outline-none"
            />
            <div className="flex items-center gap-3 pr-2">
              <button
                onClick={() => handleSendMessage(inputMessage)}
                disabled={!inputMessage.trim() || isTyping}
                className="h-14 px-8 rounded-2xl bg-slate-950 text-white font-apple-heavy text-xs uppercase tracking-widest disabled:bg-slate-100 disabled:text-slate-300 transition-all duration-500 hover:scale-105 active:scale-95 flex items-center gap-3 shadow-2xl"
              >
                <span className="hidden sm:inline">Initialize</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="text-center mt-6">
            <p className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-[0.25em]">
            Intelligence calibration may contain variances. Verify critical professional moves.
          </p>
        </div>
      </div>
    </div>
  );
}
