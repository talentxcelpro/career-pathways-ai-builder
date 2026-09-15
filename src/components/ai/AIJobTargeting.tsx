// ============================================
// AI JOB TARGETING SYSTEM - PHASE 3 INTEGRATION
// ============================================
// Advanced job targeting with AI matching and optimization

import React, { useState, useCallback, useEffect } from 'react';
import { useAIService } from '@/hooks/useAIService';
import { CoreResumeData } from '@/types/resume-core';
import { AIJobMatch } from '@/services/ai-service-manager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Target, Zap, TrendingUp, Star, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface AIJobTargetingProps {
  resumeData: CoreResumeData;
  onResumeUpdate?: (updatedResume: CoreResumeData) => void;
  onMatchingComplete?: (matches: AIJobMatch[]) => void;
}

interface JobTargetingState {
  targetJobDescription: string;
  jobMatches: AIJobMatch[];
  selectedMatch: AIJobMatch | null;
  optimizationSuggestions: string[];
  atsScore: number;
  skillGaps: string[];
}

export const AIJobTargeting: React.FC<AIJobTargetingProps> = ({
  resumeData,
  onResumeUpdate,
  onMatchingComplete
}) => {
  const {
    matchJobs,
    optimizeForATS,
    enhanceResume,
    isProcessing,
    progress,
    currentOperation,
    submitFeedback
  } = useAIService({ enableFeedback: true, enableAnalytics: true });

  const [state, setState] = useState<JobTargetingState>({
    targetJobDescription: '',
    jobMatches: [],
    selectedMatch: null,
    optimizationSuggestions: [],
    atsScore: 0,
    skillGaps: []
  });

  const [activeTab, setActiveTab] = useState('target');
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Update state helper
  const updateState = useCallback((updates: Partial<JobTargetingState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Analyze job compatibility
  const analyzeJobCompatibility = useCallback(async () => {
    if (!state.targetJobDescription.trim()) {
      toast.error('Please enter a job description to analyze');
      return;
    }

    try {
      const jobData = [{
        id: 'target_job',
        title: 'Target Position',
        description: state.targetJobDescription,
        requirements: []
      }];

      const result = await matchJobs(resumeData, jobData, {
        includeSkillGaps: true,
        includeSalaryComparison: true,
        maxMatches: 1
      });

      if (result.success && result.data && result.data.length > 0) {
        const match = result.data[0];
        updateState({
          jobMatches: result.data,
          selectedMatch: match,
          skillGaps: match.skill_gaps,
          atsScore: Math.round(match.match_score)
        });

        onMatchingComplete?.(result.data);
        setActiveTab('analysis');
        toast.success('Job compatibility analysis completed!');
      } else {
        throw new Error(result.error || 'Failed to analyze job compatibility');
      }
    } catch (error) {
      console.error('Job analysis failed:', error);
      toast.error('Failed to analyze job compatibility');
    }
  }, [state.targetJobDescription, resumeData, matchJobs, onMatchingComplete, updateState]);

  // Optimize resume for target job
  const optimizeResumeForJob = useCallback(async () => {
    if (!state.targetJobDescription.trim()) {
      toast.error('Please enter a job description first');
      return;
    }

    setIsOptimizing(true);
    try {
      const result = await optimizeForATS(resumeData, state.targetJobDescription, {
        targetScore: 85,
        includeKeywordSuggestions: true,
        includeFormattingTips: true
      });

      if (result.success && result.data) {
        updateState({
          optimizationSuggestions: result.data.formatting_improvements || [],
          atsScore: result.data.ats_score?.potential || 0
        });

        // Update the resume if callback provided
        if (result.data.optimized_resume && onResumeUpdate) {
          onResumeUpdate(result.data.optimized_resume);
        }

        setActiveTab('optimization');
        toast.success('Resume optimization completed!');
      } else {
        throw new Error(result.error || 'Optimization failed');
      }
    } catch (error) {
      console.error('Resume optimization failed:', error);
      toast.error('Failed to optimize resume');
    } finally {
      setIsOptimizing(false);
    }
  }, [state.targetJobDescription, resumeData, optimizeForATS, onResumeUpdate, updateState]);

  // Enhance specific sections based on job requirements
  const enhanceForJob = useCallback(async (sections: string[] = ['experience', 'skills']) => {
    try {
      const result = await enhanceResume(resumeData, {
        sections,
        enhancementType: 'ats',
        targetRole: 'Target Position',
        jobDescription: state.targetJobDescription
      });

      if (result.success && result.data) {
        toast.success(`Enhanced ${sections.join(', ')} sections for better job alignment`);
        
        // If we have optimized content, trigger resume update
        if (onResumeUpdate && result.data.enhanced_sections) {
          // This would need implementation to merge enhanced sections back into resume
          // For now, just show the suggestions
          const suggestions = Object.entries(result.data.enhanced_sections)
            .map(([section, data]: [string, any]) => `${section}: ${data.improvements?.join(', ')}`)
            .filter(Boolean);
          
          updateState({
            optimizationSuggestions: [...state.optimizationSuggestions, ...suggestions]
          });
        }
      } else {
        throw new Error(result.error || 'Enhancement failed');
      }
    } catch (error) {
      console.error('Resume enhancement failed:', error);
      toast.error('Failed to enhance resume sections');
    }
  }, [resumeData, state.targetJobDescription, state.optimizationSuggestions, enhanceResume, onResumeUpdate, updateState]);

  // Get match score color
  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get match score description
  const getMatchScoreDescription = (score: number) => {
    if (score >= 80) return 'Excellent match! Your profile aligns well with this role.';
    if (score >= 60) return 'Good match with some areas for improvement.';
    return 'Moderate match. Consider enhancing your profile for this role.';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Target className="h-8 w-8 text-primary" />
          <h2 className="text-2xl font-bold">AI Job Targeting</h2>
        </div>
        <p className="text-muted-foreground">
          Analyze job compatibility and optimize your resume with AI-powered insights
        </p>
      </div>

      {/* Progress Indicator */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{currentOperation}</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="target" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Target Job
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Optimization
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Results
          </TabsTrigger>
        </TabsList>

        {/* Job Targeting Tab */}
        <TabsContent value="target" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enter Target Job Description</CardTitle>
              <CardDescription>
                Paste the complete job description or requirements you want to target
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste the job description here..."
                value={state.targetJobDescription}
                onChange={(e) => updateState({ targetJobDescription: e.target.value })}
                className="min-h-[200px]"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={analyzeJobCompatibility}
                  disabled={!state.targetJobDescription.trim() || isProcessing}
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Analyze Compatibility
                </Button>
                <Button 
                  variant="outline"
                  onClick={optimizeResumeForJob}
                  disabled={!state.targetJobDescription.trim() || isProcessing || isOptimizing}
                  className="flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Optimize Resume
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          {state.selectedMatch ? (
            <>
              {/* Match Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Job Compatibility Score
                    <Badge variant="outline" className={getMatchScoreColor(state.selectedMatch.match_score)}>
                      {Math.round(state.selectedMatch.match_score)}%
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {getMatchScoreDescription(state.selectedMatch.match_score)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={state.selectedMatch.match_score} className="w-full" />
                </CardContent>
              </Card>

              {/* Matching Factors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Matching Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {state.selectedMatch.matching_factors.map((factor, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{factor}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Skill Gaps */}
              {state.skillGaps.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      Skill Gaps to Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {state.skillGaps.map((gap, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm">{gap}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => enhanceForJob(['skills', 'experience'])}
                        disabled={isProcessing}
                        className="flex items-center gap-2"
                      >
                        <Zap className="h-4 w-4" />
                        Enhance to Address Gaps
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {state.selectedMatch.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {state.selectedMatch.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 text-primary mt-0.5" />
                          <span className="text-sm">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No analysis data available. Please analyze a job description first.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4">
          {state.optimizationSuggestions.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Optimization Suggestions</CardTitle>
                <CardDescription>
                  AI-generated recommendations to improve your resume for this role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {state.optimizationSuggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                        <Zap className="h-4 w-4 text-primary mt-0.5" />
                        <span className="text-sm">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => enhanceForJob(['personalInfo', 'experience'])}>
                    Apply to Experience
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => enhanceForJob(['skills'])}>
                    Apply to Skills
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No optimization suggestions available. Please run the optimization process first.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Targeting Results Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{state.atsScore}%</div>
                  <div className="text-sm text-muted-foreground">ATS Score</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{state.skillGaps.length}</div>
                  <div className="text-sm text-muted-foreground">Skill Gaps</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{state.optimizationSuggestions.length}</div>
                  <div className="text-sm text-muted-foreground">Suggestions</div>
                </div>
              </div>
              
              {state.selectedMatch && (
                <div className="space-y-2">
                  <h4 className="font-medium">Overall Assessment:</h4>
                  <p className="text-sm text-muted-foreground">
                    {getMatchScoreDescription(state.selectedMatch.match_score)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback Section */}
          <Card>
            <CardHeader>
              <CardTitle>How was this analysis?</CardTitle>
              <CardDescription>Your feedback helps improve our AI targeting system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant="outline"
                    size="sm"
                    onClick={() => submitFeedback('job_targeting', rating as any)}
                  >
                    {rating} ⭐
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};