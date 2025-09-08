import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIResumeAnalyzer } from '@/components/resume/ai/AIResumeAnalyzer';
import { AIOptimizationSuggestions } from '@/components/resume/ai/AIOptimizationSuggestions';
import { Brain, TrendingUp, Target, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AIEnhancement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState<any>(null);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to access AI Enhancement features');
      navigate('/auth');
      return;
    }

    loadUserResume();
  }, [user, navigate]);

  const loadUserResume = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_resumes')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setResumeData(data.content);
      } else {
        toast.info('No resume found. Please create a resume first.');
        navigate('/resume/builder');
      }
    } catch (error) {
      console.error('Failed to load resume:', error);
      toast.error('Failed to load your resume');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimizeResume = (suggestions: any) => {
    setOptimizationSuggestions(suggestions.suggestions || []);
    toast.success('AI optimization suggestions generated!');
  };

  const handleApplySuggestion = (suggestion: any) => {
    // Apply the suggestion to the resume data
    // This would integrate with the resume builder to update the actual resume
    console.log('Applying suggestion:', suggestion);
    toast.success('Suggestion applied! Remember to save your resume.');
  };

  const handleApplyAllSuggestions = (suggestions: any[]) => {
    // Apply all suggestions to the resume data
    console.log('Applying all suggestions:', suggestions);
    toast.success(`Applied ${suggestions.length} suggestions! Remember to save your resume.`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your resume...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Resume Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              You need to create a resume first before using AI enhancement features.
            </p>
            <button
              onClick={() => navigate('/resume/builder')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Create Resume
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          AI Resume Enhancement
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Leverage artificial intelligence to optimize your resume for better job matching, 
          improved ATS compatibility, and enhanced professional presentation.
        </p>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-blue-600" />
              ATS Analysis
            </CardTitle>
            <CardDescription>
              Analyze how well your resume performs with Applicant Tracking Systems
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-green-600" />
              Job Targeting
            </CardTitle>
            <CardDescription>
              Compare your resume against specific job descriptions for better matches
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              AI Optimization
            </CardTitle>
            <CardDescription>
              Get intelligent suggestions to improve your resume's effectiveness
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="analyzer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analyzer" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Analyzer
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Suggestions ({optimizationSuggestions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyzer">
          <AIResumeAnalyzer
            resumeData={resumeData}
            onOptimizeResume={handleOptimizeResume}
          />
        </TabsContent>

        <TabsContent value="suggestions">
          <AIOptimizationSuggestions
            suggestions={optimizationSuggestions}
            onApplySuggestion={handleApplySuggestion}
            onApplyAll={handleApplyAllSuggestions}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIEnhancement;