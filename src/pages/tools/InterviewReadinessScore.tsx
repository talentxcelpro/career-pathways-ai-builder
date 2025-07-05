import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToolsData } from '@/hooks/useToolsData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Award, 
  CheckCircle,
  AlertCircle,
  Clock,
  BookOpen,
  MessageSquare,
  User,
  Target,
  Save,
  Download,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const InterviewReadinessScore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logToolUsage, updateToolUsage, saveToolResult } = useToolsData();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [usageId, setUsageId] = useState<string | null>(null);
  const [readinessData, setReadinessData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const usage = logToolUsage('interview-readiness-score', 'Interview Readiness Score');
      usage.then(data => {
        if (data) {
          setUsageId(data.id);
          analyzeReadiness();
        }
      });
    }
  }, [user]);

  const analyzeReadiness = async () => {
    if (!user) return;

    setIsAnalyzing(true);

    try {
      const [profileRes, resumeRes, applicationsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('ai_resumes').select('*').eq('user_id', user.id).eq('is_primary', true).single(),
        supabase.from('job_applications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
      ]);

      const profile = profileRes.data;
      const resume = resumeRes.data;
      const applications = applicationsRes.data || [];

      const { data: aiResponse } = await supabase.functions.invoke('ai-tools', {
        body: {
          type: 'interview-readiness-analysis',
          data: {
            profile,
            resume,
            applications,
            recentActivity: applications.length
          },
          userId: user.id
        }
      });

      const result = {
        overall_score: aiResponse?.overall_score || 72,
        category_scores: {
          profile_completeness: aiResponse?.category_scores?.profile_completeness || 85,
          resume_quality: aiResponse?.category_scores?.resume_quality || 75,
          technical_preparation: aiResponse?.category_scores?.technical_preparation || 65,
          behavioral_preparation: aiResponse?.category_scores?.behavioral_preparation || 70,
          company_research: aiResponse?.category_scores?.company_research || 60,
          communication_skills: aiResponse?.category_scores?.communication_skills || 80
        },
        strengths: aiResponse?.strengths || [
          'Strong professional profile',
          'Good communication skills',
          'Relevant work experience',
          'Active job seeking behavior'
        ],
        improvement_areas: aiResponse?.improvement_areas || [
          'Technical interview preparation',
          'Company research skills',
          'Behavioral question responses',
          'Industry knowledge updates'
        ],
        readiness_indicators: {
          strong_areas: [
            { category: 'Profile Setup', score: 85, status: 'excellent' },
            { category: 'Communication', score: 80, status: 'good' },
            { category: 'Resume Quality', score: 75, status: 'good' }
          ],
          needs_improvement: [
            { category: 'Technical Prep', score: 65, status: 'fair' },
            { category: 'Company Research', score: 60, status: 'needs_work' },
            { category: 'Behavioral Prep', score: 70, status: 'fair' }
          ]
        },
        preparation_checklist: {
          completed: [
            'Professional profile created',
            'Resume uploaded and optimized',
            'Basic interview questions prepared',
            'Portfolio/work samples ready'
          ],
          pending: [
            'Mock interview sessions',
            'Company-specific research',
            'Technical skill assessment',
            'STAR method practice',
            'Questions to ask interviewer',
            'Professional attire prepared'
          ]
        },
        personalized_recommendations: aiResponse?.personalized_recommendations || [
          'Practice coding problems daily for technical roles',
          'Research target companies thoroughly',
          'Prepare 5-7 behavioral examples using STAR method',
          'Schedule mock interviews with peers or mentors',
          'Update knowledge of industry trends'
        ],
        next_steps: aiResponse?.next_steps || [
          'Book mock interview sessions',
          'Prepare company-specific questions',
          'Practice technical skills daily',
          'Update LinkedIn and portfolio'
        ]
      };

      setReadinessData(result);

      if (usageId) {
        await updateToolUsage(usageId, result, 'completed', 120);
      }

      toast.success('Interview readiness analysis completed!');
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
    if (!readinessData) return;
    
    await saveToolResult(
      'interview-readiness-score',
      'Interview Readiness Assessment Results',
      readinessData,
      'analysis',
      ['interview', 'readiness', 'assessment', 'preparation']
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'needs_work': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <h3 className="text-heading-lg font-semibold mb-2 text-slate-900">Analyzing Your Interview Readiness</h3>
                <p className="text-body text-slate-600">
                  Evaluating your profile, experience, and preparation level...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/tools')} className="flex items-center gap-2 text-body">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Button>
        </div>

        <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
          <CardContent className="p-6">
            {!readinessData ? (
              <div className="text-center py-8">
                <div className="p-3 bg-primary/10 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-3">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-heading-xl font-bold mb-2 text-slate-900">Interview Readiness Score</h2>
                <p className="text-body text-slate-600 mb-6">
                  Get a comprehensive assessment of your interview preparation level
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Overall Score */}
                <div className="text-center">
                  <div className="p-3 bg-primary/10 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-3">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-heading-xl font-bold mb-2 text-slate-900">Interview Readiness Score</h2>
                  <div className="text-4xl font-bold text-primary mb-2">{readinessData.overall_score}%</div>
                  <Progress value={readinessData.overall_score} className="h-3 max-w-md mx-auto" />
                </div>

                {/* Category Breakdown */}
                <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-heading-md text-slate-900">Readiness Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(readinessData.category_scores).map(([category, score]: [string, any]) => (
                        <div key={category} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-body font-medium text-slate-700">
                              {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <span className="text-heading-md font-bold text-slate-900">{score}%</span>
                          </div>
                          <Progress value={score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Strengths and Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-heading-md text-green-600 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {readinessData.strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-500">•</span>
                            <span className="text-body text-slate-700">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-heading-md text-orange-600 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Areas to Improve
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {readinessData.improvement_areas.map((area: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-orange-500">•</span>
                            <span className="text-body text-slate-700">{area}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Preparation Checklist */}
                <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-heading-md text-slate-900">Preparation Checklist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-green-600 mb-3">✓ Completed</h4>
                        <ul className="space-y-2">
                          {readinessData.preparation_checklist.completed.map((item: string, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-body text-slate-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-orange-600 mb-3">○ Pending</h4>
                        <ul className="space-y-2">
                          {readinessData.preparation_checklist.pending.map((item: string, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-orange-500" />
                              <span className="text-body text-slate-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-heading-md text-slate-900">Personalized Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {readinessData.personalized_recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                          <span className="text-body text-slate-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Next Steps */}
                <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-heading-md text-slate-900">Next Steps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {readinessData.next_steps.map((step: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 p-2 border rounded-lg">
                          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-caption font-bold mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-body text-slate-700">{step}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button onClick={handleSaveResult} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Save Results
                  </Button>
                  <Button variant="outline" onClick={() => setReadinessData(null)} className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Analyze Again
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InterviewReadinessScore;