import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Zap
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
    addMessage
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

  const currentQuickActions = moduleQuickActions[currentModule] || moduleQuickActions.general || [];

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userInput = inputMessage.trim();
    setInputMessage('');
    setShowQuickActions(false);

    try {
      await callEnhancedAI({
        module: currentModule,
        task: 'chat',
        input: { message: userInput }
      });
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

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
          size="icon"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={cn(
        "transition-all duration-300 shadow-xl border",
        isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
      )}>
        <CardHeader className="p-4 border-b bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-sm font-medium">
              <Bot className="h-4 w-4 mr-2" />
              TalentXcel AI
              <Badge variant="secondary" className="ml-2 text-xs">
                {currentModule.replace('_', ' ')}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[544px]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {conversationHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium text-sm mb-2">AI Assistant Ready</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Ask me anything about {currentModule.replace('_', ' ')} or try a quick action below
                    </p>
                    
                    {showQuickActions && currentQuickActions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Quick Actions:</p>
                        <div className="grid grid-cols-1 gap-2">
                          {currentQuickActions.map((action) => (
                            <Button
                              key={action.id}
                              variant="outline"
                              size="sm"
                              className="justify-start text-xs h-8"
                              onClick={() => handleQuickAction(action)}
                              disabled={isLoading}
                            >
                              {action.icon}
                              <span className="ml-2">{action.label}</span>
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
                          "flex",
                          message.type === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                            message.type === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {message.type === 'ai' && (
                            <div className="flex items-center mb-1">
                              <Bot className="h-3 w-3 mr-1" />
                              <span className="text-xs font-medium">AI</span>
                            </div>
                          )}
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          <div className={cn(
                            "text-xs mt-1 opacity-70",
                            message.type === 'user' ? 'text-primary-foreground' : 'text-muted-foreground'
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
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                          <div className="flex items-center">
                            <Loader2 className="h-3 w-3 animate-spin mr-2" />
                            <span className="text-muted-foreground">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="border-t p-3">
              <div className="flex items-center gap-2">
                <Input
                  placeholder={`Ask about ${currentModule.replace('_', ' ')}...`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1 text-sm h-8"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="icon"
                  className="h-8 w-8"
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                </Button>
              </div>
              
              {error && (
                <p className="text-xs text-destructive mt-2">
                  {error}
                </p>
              )}
              
              <p className="text-xs text-muted-foreground mt-2">
                AI-powered by TalentXcel • Context-aware assistance
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};