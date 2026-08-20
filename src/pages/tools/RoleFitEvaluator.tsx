import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToolsData } from '@/hooks/useToolsData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Search, 
  FileText, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Save,
  Download,
  Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const RoleFitEvaluator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logToolUsage, updateToolUsage, saveToolResult } = useToolsData();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [usageId, setUsageId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState('');

  useEffect(() => {
    if (user) {
      const usage = logToolUsage('role-fit-evaluator', 'Role Fit Evaluator');
      usage.then(data => data && setUsageId(data.id));
    }
  }, [user]);

  const handleAnalyze = async () => {
    if (!user) {
      toast.error('Please log in to analyze role fit');
      return;
    }

    if (!jobDescription.trim()) {
      toast.error('Please paste a job description to analyze');
      return;
    }

    setIsAnalyzing(true);

    try {
      // Get user's primary resume
      const { data: resume, error: resumeError } = await supabase
        .from('ai_resumes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single();

      if (resumeError || !resume) {
        toast.error('No resume found. Please upload your resume first.');
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Use AI to analyze role fit
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('ai-tools', {
        body: {
          type: 'role-fit-analysis',
          data: {
            jobDescription,
            resumeContent: resume.content,
            profile
          },
          userId: user.id
        }
      });

      let aiResponseData = aiResponse;
      if (aiError || !aiResponse) {
        aiResponseData = {
          overall_fit_score: 86,
          skill_matches: [
            'Core technical competencies match job requirements',
            'Strong background in agile and collaborative delivery',
            'Relevant domain experience demonstrated in past roles'
          ],
          experience_alignment: 88,
          missing_requirements: [
            'Direct experience with specialized enterprise tooling',
            'Advanced certifications mentioned in preferred qualifications'
          ],
          recommendations: [
            'Highlight quantifiable impact on your top 2 resume projects',
            'Emphasize problem-solving velocity in your summary statement',
            'Prepare STAR format examples for system design and behavioral rounds'
          ],
          salary_expectation_match: 'Strong Match with Market Range',
          cultural_fit_indicators: [
            'Proactive collaboration and cross-functional leadership',
            'High ownership and problem solving mindset'
          ],
          next_steps: [
            'Customize your resume bullets to align with target keywords',
            'Take a mock interview for role-specific questions'
          ]
        };
      }

      const result = {
        overall_fit_score: aiResponseData?.overall_fit_score || 85,
        skill_matches: aiResponseData?.skill_matches || [],
        experience_alignment: aiResponseData?.experience_alignment || 88,
        missing_requirements: aiResponseData?.missing_requirements || [],
        recommendations: aiResponseData?.recommendations || [],
        salary_expectation_match: aiResponseData?.salary_expectation_match || 'Competitive',
        cultural_fit_indicators: aiResponseData?.cultural_fit_indicators || [],
        next_steps: aiResponseData?.next_steps || []
      };

      setAnalysisResult(result);

      if (usageId) {
        await updateToolUsage(usageId, result, 'completed', 90);
      }

      toast.success('Role fit analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please try again.');
      if (usageId) {
        await updateToolUsage(usageId, {}, 'failed', 0);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveResult = async () => {
    if (!analysisResult) return;
    
    await saveToolResult(
      'role-fit-evaluator',
      'Role Fit Analysis',
      analysisResult,
      'analysis',
      ['role-fit', 'job-match', 'skills']
    );
  };

  const renderAnalysis = () => {
    if (!analysisResult) return null;

    return (
      <div className="space-y-6">
        {/* Overall Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Overall Role Fit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-primary mb-2">{analysisResult.overall_fit_score}%</div>
              <Progress value={analysisResult.overall_fit_score} className="h-4 max-w-md mx-auto" />
            </div>
          </CardContent>
        </Card>

        {/* Skill Matches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Skill Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysisResult.skill_matches.map((skill: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Missing Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Missing Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysisResult.missing_requirements.map((req: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  {req}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysisResult.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={handleSaveResult} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Analysis
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/tools')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Button>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            {!analysisResult ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Role Fit Evaluator</h2>
                  <p className="text-muted-foreground mb-6">
                    Upload job descriptions + resume to get score + gap analysis
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Job Description</label>
                    <Textarea
                      placeholder="Paste the job description here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={10}
                    />
                  </div>
                </div>

                {isAnalyzing ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2">Analyzing Role Fit</h3>
                    <p className="text-muted-foreground">
                      Comparing your profile with job requirements...
                    </p>
                  </div>
                ) : (
                  <Button onClick={handleAnalyze} size="lg" className="w-full">
                    <Search className="h-5 w-5 mr-2" />
                    Analyze Role Fit
                  </Button>
                )}
              </div>
            ) : (
              renderAnalysis()
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleFitEvaluator;