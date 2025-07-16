import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAI } from '@/contexts/AIContext';
import { useEnhancedAI } from '@/hooks/useEnhancedAI';
import { 
  Bot, 
  Send, 
  MessageSquare, 
  Minimize2, 
  Maximize2,
  X,
  Sparkles,
  Loader2,
  Lightbulb,
  Zap,
  RotateCcw,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  module: string;
  task: string;
  input?: any;
}

export const FloatingAIWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    currentModule, 
    conversationHistory, 
    isLoading, 
    error,
    addMessage,
    clearHistory
  } = useAI();
  
  const { callEnhancedAI } = useEnhancedAI();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  const moduleQuickActions: Record<string, QuickAction[]> = {
    network: [
      { id: 'generate-post', label: 'Generate Post', icon: <Sparkles className="h-4 w-4" />, module: 'network', task: 'generate_post', input: { topic: 'professional achievement' } },
      { id: 'optimize-profile', label: 'Optimize Profile', icon: <Zap className="h-4 w-4" />, module: 'network', task: 'optimize_profile' },
      { id: 'suggest-connections', label: 'Find Connections', icon: <Lightbulb className="h-4 w-4" />, module: 'network', task: 'suggest_connections' }
    ],
    jobs: [
      { id: 'match-jobs', label: 'Match Jobs', icon: <Sparkles className="h-4 w-4" />, module: 'jobs', task: 'match_jobs' },
      { id: 'interview-prep', label: 'Interview Prep', icon: <Zap className="h-4 w-4" />, module: 'jobs', task: 'prepare_interview' },
      { id: 'resume-tips', label: 'Resume Tips', icon: <Lightbulb className="h-4 w-4" />, module: 'jobs', task: 'resume_feedback' }
    ],
    employer: [
      { id: 'generate-jd', label: 'Create Job Post', icon: <Sparkles className="h-4 w-4" />, module: 'employer', task: 'generate_jd' },
      { id: 'screen-candidates', label: 'Screen Candidates', icon: <Zap className="h-4 w-4" />, module: 'employer', task: 'screening_questions' },
      { id: 'rank-applicants', label: 'Rank Applicants', icon: <Lightbulb className="h-4 w-4" />, module: 'employer', task: 'rank_candidates' }
    ],
    companies: [
      { id: 'analyze-company', label: 'Company Insights', icon: <Sparkles className="h-4 w-4" />, module: 'companies', task: 'analyze_company' },
      { id: 'culture-fit', label: 'Culture Fit', icon: <Zap className="h-4 w-4" />, module: 'companies', task: 'culture_fit' },
      { id: 'role-suggestions', label: 'Role Ideas', icon: <Lightbulb className="h-4 w-4" />, module: 'companies', task: 'suggest_roles' }
    ],
    resume_builder: [
      { id: 'analyze-resume', label: 'Analyze Resume', icon: <Sparkles className="h-4 w-4" />, module: 'resume_builder', task: 'analyze' },
      { id: 'optimize-resume', label: 'Optimize Resume', icon: <Zap className="h-4 w-4" />, module: 'resume_builder', task: 'optimize' },
      { id: 'generate-summary', label: 'Write Summary', icon: <Lightbulb className="h-4 w-4" />, module: 'resume_builder', task: 'generate_section', input: { sectionType: 'summary' } }
    ],
    tools: [
      { id: 'assessment-help', label: 'Assessment Tips', icon: <Sparkles className="h-4 w-4" />, module: 'tools', task: 'interpret_assessment' },
      { id: 'cover-letter', label: 'Cover Letter', icon: <Zap className="h-4 w-4" />, module: 'tools', task: 'generate_document', input: { documentType: 'cover_letter' } },
      { id: 'portfolio-ideas', label: 'Portfolio Help', icon: <Lightbulb className="h-4 w-4" />, module: 'tools', task: 'generate_document', input: { documentType: 'portfolio' } }
    ],
    services: [
      { id: 'service-reco', label: 'Service Recommendations', icon: <Sparkles className="h-4 w-4" />, module: 'services', task: 'recommend' },
      { id: 'upgrade-suggest', label: 'Upgrade Options', icon: <Zap className="h-4 w-4" />, module: 'services', task: 'suggest_upgrade' },
      { id: 'value-analysis', label: 'ROI Analysis', icon: <Lightbulb className="h-4 w-4" />, module: 'services', task: 'value_analysis' }
    ],
    learning: [
      { id: 'learning-path', label: 'Learning Path', icon: <Sparkles className="h-4 w-4" />, module: 'learning', task: 'create_path' },
      { id: 'skill-gaps', label: 'Skill Gaps', icon: <Zap className="h-4 w-4" />, module: 'learning', task: 'skill_gaps' },
      { id: 'course-reco', label: 'Course Ideas', icon: <Lightbulb className="h-4 w-4" />, module: 'learning', task: 'recommend_courses' }
    ],
    colleges: [
      { id: 'college-reco', label: 'College Search', icon: <Sparkles className="h-4 w-4" />, module: 'colleges', task: 'recommend_institutions' },
      { id: 'sop-help', label: 'SOP Writing', icon: <Zap className="h-4 w-4" />, module: 'colleges', task: 'generate_sop' },
      { id: 'program-compare', label: 'Compare Programs', icon: <Lightbulb className="h-4 w-4" />, module: 'colleges', task: 'compare_programs' }
    ],
    career_map: [
      { id: 'career-roadmap', label: 'Career Roadmap', icon: <Sparkles className="h-4 w-4" />, module: 'career_map', task: 'generate_roadmap' },
      { id: 'track-progress', label: 'Track Progress', icon: <Zap className="h-4 w-4" />, module: 'career_map', task: 'track_milestones' },
      { id: 'role-fit', label: 'Role Fit', icon: <Lightbulb className="h-4 w-4" />, module: 'career_map', task: 'assess_fit' }
    ]
  };

  const currentQuickActions = moduleQuickActions[currentModule] || [];

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userInput = inputMessage.trim();
    setInputMessage('');
    setShowQuickActions(false);

    console.log('Sending chat message:', userInput);

    try {
      const result = await callEnhancedAI({
        module: currentModule,
        task: 'chat',
        input: { message: userInput }
      });
      
      if (!result.success) {
        console.error('AI request failed:', result.error);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    setShowQuickActions(false);
    
    try {
      await callEnhancedAI({
        module: action.module,
        task: action.task,
        input: action.input || {}
      });
    } catch (error) {
      console.error('Failed to execute quick action:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewConversation = () => {
    clearHistory();
    setShowQuickActions(true);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] bg-white hover:bg-gray-50 text-gray-900 border border-gray-200/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_40px_rgba(0,0,0,0.16)] backdrop-blur-xl"
            size="icon"
          >
            <Bot className="h-6 w-6" />
          </Button>
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={cn(
        "transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] shadow-[0_20px_64px_rgba(0,0,0,0.12)] border-0 bg-white/95 backdrop-blur-2xl rounded-2xl overflow-hidden",
        isMinimized ? "w-80 h-16" : "w-[400px] h-[600px]"
      )}>
        <CardHeader className="p-4 bg-gradient-to-r from-white/90 to-gray-50/90 border-b border-gray-100/50 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center mr-3 shadow-lg">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 text-sm">TalentXcel AI</span>
                <Badge variant="secondary" className="w-fit text-xs mt-0.5 bg-blue-50/70 text-blue-700 border-0 rounded-full px-2 py-0.5">
                  {currentModule.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {conversationHistory.length > 0 && !isMinimized && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-400 hover:text-gray-600 hover:bg-gray-100/70 rounded-full"
                  onClick={handleNewConversation}
                  title="New conversation"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-400 hover:text-gray-600 hover:bg-gray-100/70 rounded-full"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-400 hover:text-gray-600 hover:bg-gray-100/70 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[552px]">
            <ScrollArea className="flex-1 p-5">
              <div className="space-y-4">
                {conversationHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                      <Bot className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">AI Assistant Ready</h3>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                      Ask me anything about {currentModule.replace('_', ' ')} or try a quick action
                    </p>
                    
                    {showQuickActions && currentQuickActions.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quick Actions</p>
                        <div className="grid grid-cols-1 gap-2">
                          {currentQuickActions.map((action) => (
                            <Button
                              key={action.id}
                              variant="outline"
                              size="sm"
                              className="justify-start h-11 bg-white/60 hover:bg-white border-gray-200/70 hover:border-blue-200 transition-all duration-200 rounded-xl text-gray-700 hover:text-blue-700"
                              onClick={() => handleQuickAction(action)}
                              disabled={isLoading}
                            >
                              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white mr-3 shadow-sm">
                                {action.icon}
                              </div>
                              <span className="text-sm font-medium">{action.label}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {conversationHistory.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex animate-fade-in",
                          message.type === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                            message.type === 'user'
                              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white ml-auto'
                              : 'bg-white border border-gray-100 text-gray-800'
                          )}
                        >
                          {message.type === 'ai' && (
                            <div className="flex items-center mb-2">
                              <div className="h-4 w-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-2">
                                <Bot className="h-2.5 w-2.5 text-white" />
                              </div>
                              <span className="text-xs font-medium text-blue-600">AI Assistant</span>
                            </div>
                          )}
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          <div className={cn(
                            "text-xs mt-2 opacity-60",
                            message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                          )}>
                            {new Date(message.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex justify-start animate-fade-in">
                        <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                          <div className="flex items-center">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                            </div>
                            <span className="text-gray-600 text-sm ml-3">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="border-t border-gray-100/50 p-4 bg-white/50 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <Input
                  placeholder={`Ask about ${currentModule.replace('_', ' ')}...`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1 border-gray-200/70 bg-white/70 backdrop-blur-sm rounded-xl h-10 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-sm"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {error && (
                <p className="text-xs text-red-500 mt-2 animate-fade-in">
                  {error}
                </p>
              )}
              
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                AI-powered by TalentXcel • Conversations are saved
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};