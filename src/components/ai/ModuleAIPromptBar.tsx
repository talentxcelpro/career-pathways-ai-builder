import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAI } from '@/contexts/AIContext';
import { useSimpleAI } from '@/hooks/useSimpleAI';
import { 
  Bot, 
  Send, 
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptSuggestion {
  id: string;
  text: string;
  task: string;
  icon: React.ReactNode;
  input?: any;
}

interface ModuleAIPromptBarProps {
  className?: string;
  variant?: 'compact' | 'full';
  showSuggestions?: boolean;
}

export const ModuleAIPromptBar: React.FC<ModuleAIPromptBarProps> = ({
  className,
  variant = 'full',
  showSuggestions = true
}) => {
  const [prompt, setPrompt] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPromptSuggestions, setShowPromptSuggestions] = useState(false);
  
  const { currentModule, isLoading } = useAI();
  const { callAI, isLoading: aiLoading } = useSimpleAI();

  const modulePrompts: Record<string, PromptSuggestion[]> = {
    network: [
      { id: '1', text: 'Write a professional post about my recent achievement', task: 'generate_post', icon: <Sparkles className="h-4 w-4" />, input: { topic: 'achievement', tone: 'professional' } },
      { id: '2', text: 'Suggest people I should connect with in my industry', task: 'suggest_connections', icon: <Lightbulb className="h-4 w-4" /> },
      { id: '3', text: 'Optimize my profile headline and summary', task: 'optimize_profile', icon: <Zap className="h-4 w-4" />, input: { section: 'headline' } }
    ],
    jobs: [
      { id: '1', text: 'Find jobs that match my skills and preferences', task: 'match_jobs', icon: <Sparkles className="h-4 w-4" /> },
      { id: '2', text: 'Prepare me for a software engineer interview', task: 'prepare_interview', icon: <Lightbulb className="h-4 w-4" />, input: { role: 'Software Engineer' } },
      { id: '3', text: 'Tailor my resume for this specific job posting', task: 'tailor_resume', icon: <Zap className="h-4 w-4" /> }
    ],
    employer: [
      { id: '1', text: 'Create a job description for a React developer position', task: 'generate_jd', icon: <Sparkles className="h-4 w-4" />, input: { jobTitle: 'React Developer' } },
      { id: '2', text: 'Generate screening questions for data science roles', task: 'screening_questions', icon: <Lightbulb className="h-4 w-4" />, input: { jobTitle: 'Data Scientist' } },
      { id: '3', text: 'Rank these candidates based on job requirements', task: 'rank_candidates', icon: <Zap className="h-4 w-4" /> }
    ],
    companies: [
      { id: '1', text: 'Analyze company culture and recent developments', task: 'analyze_company', icon: <Sparkles className="h-4 w-4" /> },
      { id: '2', text: 'Check if this company is a good fit for my career goals', task: 'culture_fit', icon: <Lightbulb className="h-4 w-4" /> },
      { id: '3', text: 'Suggest roles I should look for at this company', task: 'suggest_roles', icon: <Zap className="h-4 w-4" /> }
    ],
    resume_builder: [
      { id: '1', text: 'Analyze my resume and provide detailed feedback', task: 'analyze', icon: <Sparkles className="h-4 w-4" /> },
      { id: '2', text: 'Optimize my resume for ATS systems', task: 'optimize', icon: <Lightbulb className="h-4 w-4" /> },
      { id: '3', text: 'Write a compelling professional summary for my resume', task: 'generate_section', icon: <Zap className="h-4 w-4" />, input: { sectionType: 'summary' } }
    ],
    tools: [
      { id: '1', text: 'Help me interpret my personality assessment results', task: 'interpret_assessment', icon: <Sparkles className="h-4 w-4" /> },
      { id: '2', text: 'Create a cover letter for this job application', task: 'generate_document', icon: <Lightbulb className="h-4 w-4" />, input: { documentType: 'cover_letter' } },
      { id: '3', text: 'Design a portfolio layout for my creative work', task: 'generate_document', icon: <Zap className="h-4 w-4" />, input: { documentType: 'portfolio' } }
    ],
    services: [
      { id: '1', text: 'Recommend services based on my career goals', task: 'recommend', icon: <Sparkles className="h-4 w-4" /> },
      { id: '2', text: 'Should I upgrade my plan? What are the benefits?', task: 'suggest_upgrade', icon: <Lightbulb className="h-4 w-4" /> },
      { id: '3', text: 'Calculate ROI for resume writing services', task: 'value_analysis', icon: <Zap className="h-4 w-4" /> }
    ],
    learning: [
      { id: '1', text: 'Create a learning roadmap to become a product manager', task: 'create_path', icon: <Sparkles className="h-4 w-4" />, input: { targetRole: 'Product Manager' } },
      { id: '2', text: 'What skills am I missing for my target role?', task: 'skill_gaps', icon: <Lightbulb className="h-4 w-4" /> },
      { id: '3', text: 'Recommend courses for machine learning', task: 'recommend_courses', icon: <Zap className="h-4 w-4" />, input: { skillGaps: ['Machine Learning'] } }
    ],
    colleges: [
      { id: '1', text: 'Find the best MBA programs for technology management', task: 'recommend_institutions', icon: <Sparkles className="h-4 w-4" />, input: { program: 'MBA in Technology Management' } },
      { id: '2', text: 'Help me write a statement of purpose for computer science', task: 'generate_sop', icon: <Lightbulb className="h-4 w-4" />, input: { program: 'Computer Science' } },
      { id: '3', text: 'Compare IIT vs private engineering colleges', task: 'compare_programs', icon: <Zap className="h-4 w-4" /> }
    ],
    career_map: [
      { id: '1', text: 'Generate a 5-year career roadmap to become a CTO', task: 'generate_roadmap', icon: <Sparkles className="h-4 w-4" />, input: { targetRole: 'CTO', timeframe: '5 years' } },
      { id: '2', text: 'Track my progress towards my career goals', task: 'track_milestones', icon: <Lightbulb className="h-4 w-4" /> },
      { id: '3', text: 'Am I a good fit for product management roles?', task: 'assess_fit', icon: <Zap className="h-4 w-4" />, input: { role: 'Product Manager' } }
    ]
  };

  const currentPrompts = modulePrompts[currentModule] || [];

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;

    const userPrompt = prompt.trim();
    setPrompt('');
    setShowPromptSuggestions(false);

    try {
      await callAI({
        module: currentModule,
        task: 'chat',
        prompt: userPrompt
      });
    } catch (error) {
      console.error('Failed to submit prompt:', error);
    }
  };

  const handleSuggestionClick = async (suggestion: PromptSuggestion) => {
    setPrompt('');
    setShowPromptSuggestions(false);

    try {
      await callAI({
        module: currentModule,
        task: suggestion.task,
        input: suggestion.input || {}
      });
    } catch (error) {
      console.error('Failed to execute suggestion:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (variant === 'compact') {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border">
          <Bot className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Ask AI about ${currentModule.replace('_', ' ')}...`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowPromptSuggestions(true)}
            disabled={isLoading}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button 
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
            size="sm"
            variant="ghost"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-2", className)}>
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">AI Assistant</h3>
            <Badge variant="secondary" className="text-xs">
              {currentModule.replace('_', ' ')}
            </Badge>
          </div>
          {showSuggestions && currentPrompts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            placeholder={`Ask AI to help with your ${currentModule.replace('_', ' ')}...`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowPromptSuggestions(true)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {showSuggestions && currentPrompts.length > 0 && (
          <div className={cn(
            "transition-all duration-300 overflow-hidden",
            isExpanded ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
          )}>
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-800">Quick prompts:</p>
              <div className="grid grid-cols-1 gap-2">
                {currentPrompts.map((suggestion) => (
                  <Button
                    key={suggestion.id}
                    variant="outline"
                    size="sm"
                    className="justify-start text-left h-auto p-3 bg-white hover:bg-blue-50 border-blue-200"
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isLoading}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 p-1 bg-blue-100 rounded">
                        {suggestion.icon}
                      </div>
                      <span className="text-sm text-blue-900">{suggestion.text}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};