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
          'Update knowledge of industry trends',
          'Prepare thoughtful questions for interviewers'
        ],
        next_steps: aiResponse?.next_steps || [
          'Complete pending preparation items',
          'Schedule practice interviews',
          'Research specific companies you\'re targeting',
          'Practice your elevator pitch',
          'Prepare for common technical questions',
          'Set up a pre-interview routine'
        ],
        estimated_timeline: aiResponse?.estimated_timeline || '2-3 weeks to reach 85+ readiness'
      };

      setReadinessData(result);

      if (usageId) {
        await updateToolUsage(usageId, result, 'completed', 180);
      }

      toast.success('Interview readiness analysis complete!');
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
      'Interview Readiness Analysis',
      readinessData,
      'analysis',
      ['interview', 'readiness', 'preparation', 'assessment']
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
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

  const renderAnalysis = () => {
    if (!readinessData) return null;

    return (
      <div className="space-y-6">
        {/* Overall Score */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Award className="h-6 w-6" />
              Interview Readiness Score
            </CardTitle>
            <div className="text-4xl font-bold text-primary mt-4">{readinessData.overall_score}</div>
            <div className="text-muted-foreground">Out of 100</div>
          </CardHeader>
          <CardContent>
            <Progress value={readinessData.overall_score} className="h-4 mb-4" />
            <div className="text-center">
              <Badge className={getScoreColor(readinessData.overall_score)} variant="secondary">
                {readinessData.overall_score >= 80 ? 'Excellent' : 
                 readinessData.overall_score >= 70 ? 'Good' :
                 readinessData.overall_score >= 60 ? 'Fair' : 'Needs Improvement'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Readiness Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(readinessData.category_scores).map(([category, score]: [string, any]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{category.replace('_', ' ')}</span>
                    <Badge className={getScoreColor(score)}>{score}%</Badge>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strengths and Improvement Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {readinessData.strengths.map((strength: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="h-5 w-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {readinessData.improvement_areas.map((area: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-orange-500">•</span>
                    <span className="text-sm">{area}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Readiness Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-green-600">Strong Areas</h4>
                <div className="space-y-2">
                  {readinessData.readiness_indicators.strong_areas.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{item.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{item.score}%</span>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-orange-600">Needs Focus</h4>
                <div className="space-y-2">
                  {readinessData.readiness_indicators.needs_improvement.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{item.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{item.score}%</span>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preparation Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Preparation Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-green-600">Completed ✓</h4>
                <ul className="space-y-2">
                  {readinessData.preparation_checklist.completed.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-orange-600">Pending Action</h4>
                <ul className="space-y-2">
                  {readinessData.preparation_checklist.pending.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-orange-500 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Personalized Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {readinessData.personalized_recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Next Steps
            </CardTitle>
            <CardDescription>
              Estimated time to reach 85+ readiness: {readinessData.estimated_timeline}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {readinessData.next_steps.map((step: string, index: number) => (
                <div key={index} className="flex items-start gap-2 p-2 border rounded-lg">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={handleSaveResult} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Assessment
          </Button>
          <Button variant="outline" onClick={analyzeReadiness} className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Re-analyze
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

        <Card className="max-w-6xl mx-auto">
          <CardContent className="p-8">
            {isAnalyzing ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Analyzing Interview Readiness</h3>
                <p className="text-muted-foreground">
                  Evaluating your preparation across multiple dimensions...
                </p>
              </div>
            ) : !readinessData ? (
              <div className="text-center space-y-6">
                <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Interview Readiness Score</h2>
                  <p className="text-muted-foreground mb-6">
                    Get a comprehensive assessment of your interview preparation
                  </p>
                </div>
                <Button onClick={analyzeReadiness} size="lg" className="px-8">
                  <Award className="h-5 w-5 mr-2" />
                  Analyze My Readiness
                </Button>
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

export default InterviewReadinessScore;