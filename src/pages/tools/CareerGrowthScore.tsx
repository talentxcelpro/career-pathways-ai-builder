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
  TrendingUp, 
  Star, 
  Target, 
  Award,
  Users,
  BookOpen,
  Briefcase,
  Save,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const CareerGrowthScore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logToolUsage, updateToolUsage, saveToolResult } = useToolsData();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [usageId, setUsageId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const usage = logToolUsage('career-growth-score', 'Career Growth Score');
      usage.then(data => data && setUsageId(data.id));
    }
  }, [user]);

  const handleAnalyze = async () => {
    if (!user) {
      toast.error('Please log in to calculate your career growth score');
      return;
    }

    setIsAnalyzing(true);

    try {
      // Fetch user profile and related data
      const [profileRes, resumesRes, connectionsRes, applicationsRes, toolUsageRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('ai_resumes').select('*').eq('user_id', user.id),
        supabase.from('connections').select('*').or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`),
        supabase.from('job_applications').select('*').eq('user_id', user.id),
        supabase.from('tool_usage_enhanced').select('*').eq('user_id', user.id)
      ]);

      const profile = profileRes.data;
      const resumes = resumesRes.data || [];
      const connections = connectionsRes.data || [];
      const applications = applicationsRes.data || [];
      const toolUsage = toolUsageRes.data || [];

      // Calculate component scores based on real data
      const resumeStrength = Math.min(100, (resumes.length * 20) + (resumes.reduce((sum, r) => sum + (r.ats_score || 0), 0) / Math.max(resumes.length, 1)));
      const skillsScore = profile?.profile_completed ? 85 : 50;
      const networkActivity = Math.min(100, connections.length * 5 + toolUsage.length * 2);
      const careerProgression = applications.length > 0 ? Math.min(100, 60 + applications.filter(a => a.status === 'hired').length * 20) : 40;

      const components = [
        {
          category: 'Resume Strength',
          score: Math.round(resumeStrength),
          weight: 25,
          icon: 'Briefcase',
          details: resumes.length > 0 ? `${resumes.length} resume(s) with avg ATS score ${Math.round(resumes.reduce((sum, r) => sum + (r.ats_score || 0), 0) / resumes.length)}` : 'No resumes uploaded',
          improvements: resumes.length === 0 ? ['Upload your resume', 'Optimize for ATS'] : ['Add more technical keywords', 'Include recent achievements']
        },
        {
          category: 'Skills Development',
          score: skillsScore,
          weight: 30,
          icon: 'BookOpen',
          details: profile?.profile_completed ? 'Profile completed with skills listed' : 'Incomplete profile',
          improvements: profile?.profile_completed ? ['Complete skill assessments', 'Add certifications'] : ['Complete your profile', 'Add your skills']
        },
        {
          category: 'Network Activity',
          score: Math.round(networkActivity),
          weight: 20,
          icon: 'Users',
          details: `${connections.length} connections, ${toolUsage.length} tool uses`,
          improvements: connections.length < 10 ? ['Build more connections', 'Use networking tools'] : ['Engage more actively', 'Share knowledge']
        },
        {
          category: 'Career Progression',
          score: Math.round(careerProgression),
          weight: 25,
          icon: 'TrendingUp',
          details: `${applications.length} applications, ${applications.filter(a => a.status === 'hired').length} hires`,
          improvements: applications.length === 0 ? ['Start applying for jobs', 'Set career goals'] : ['Apply more strategically', 'Track progress better']
        }
      ];

      const overallScore = Math.round(components.reduce((sum, comp) => sum + (comp.score * comp.weight / 100), 0));
      const growthTrajectory = overallScore > 80 ? 'Accelerating' : overallScore > 60 ? 'Steady' : 'Building';
      const grade = overallScore >= 85 ? 'A' : overallScore >= 75 ? 'B+' : overallScore >= 65 ? 'B' : overallScore >= 55 ? 'C+' : 'C';

      // Use AI for personalized insights
      const { data: aiResponse } = await supabase.functions.invoke('ai-tools', {
        body: {
          type: 'career-growth-analysis',
          data: {
            profile,
            resumesCount: resumes.length,
            connectionsCount: connections.length,
            applicationsCount: applications.length,
            scores: { resumeStrength, skillsScore, networkActivity, careerProgression }
          },
          userId: user.id
        }
      });

      const result = {
        overall_score: overallScore,
        growth_trajectory: growthTrajectory,
        grade,
        components,
        strengths: aiResponse?.strengths || [
          resumeStrength > 70 ? 'Strong resume foundation' : null,
          connections.length > 10 ? 'Good professional network' : null,
          applications.length > 5 ? 'Active job seeker' : null,
          profile?.profile_completed ? 'Complete professional profile' : null
        ].filter(Boolean),
        growth_opportunities: aiResponse?.growth_opportunities || [
          resumeStrength < 70 ? 'Improve resume quality and ATS optimization' : null,
          connections.length < 10 ? 'Expand professional network' : null,
          applications.length === 0 ? 'Start applying for suitable positions' : null,
          !profile?.profile_completed ? 'Complete your professional profile' : null
        ].filter(Boolean),
        industry_benchmark: {
          your_score: overallScore,
          industry_average: 65,
          top_10_percent: 88,
          percentile: Math.min(95, Math.max(5, Math.round((overallScore / 100) * 100)))
        },
        next_milestones: [
          {
            title: overallScore < 60 ? 'Profile Completion' : 'Senior-Level Role',
            timeline: overallScore < 60 ? '1-2 months' : '6-12 months',
            probability: overallScore < 60 ? 90 : Math.max(30, overallScore - 20),
            requirements: overallScore < 60 ? ['Complete profile', 'Upload resume', 'Set goals'] : ['Leadership experience', 'Technical depth', 'Network expansion']
          },
          {
            title: 'Industry Recognition',
            timeline: '12-18 months',
            probability: Math.max(20, overallScore - 40),
            requirements: ['Thought leadership', 'Active networking', 'Skill certifications']
          },
          {
            title: 'Executive Position',
            timeline: '2-3 years',
            probability: Math.max(10, overallScore - 60),
            requirements: ['Strategic thinking', 'Business acumen', 'Large team leadership']
          }
        ]
      };

      setAnalysisResult(result);

      if (usageId) {
        await updateToolUsage(usageId, result, 'completed', 120);
      }

      toast.success('Career growth analysis complete!');
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
      'career-growth-score',
      'Career Growth Score Analysis',
      analysisResult,
      'analysis',
      ['career', 'growth', 'score', 'development']
    );
  };

  const getIcon = (iconName: string) => {
    const icons = {
      Briefcase: Briefcase,
      BookOpen: BookOpen,
      Users: Users,
      TrendingUp: TrendingUp
    };
    const IconComponent = icons[iconName as keyof typeof icons] || Star;
    return <IconComponent className="h-5 w-5" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderAnalysis = () => {
    if (!analysisResult) return null;

    return (
      <div className="space-y-6">
        {/* Overall Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Your Career Growth Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-primary mb-2">{analysisResult.overall_score}</div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge variant="outline" className="text-lg px-4 py-1">{analysisResult.grade}</Badge>
                <Badge variant="secondary">{analysisResult.growth_trajectory}</Badge>
              </div>
              <Progress value={analysisResult.overall_score} className="h-4 max-w-md mx-auto" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground">Your Score</div>
                <div className="font-bold text-lg">{analysisResult.industry_benchmark.your_score}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Industry Avg</div>
                <div className="font-bold text-lg">{analysisResult.industry_benchmark.industry_average}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Top 10%</div>
                <div className="font-bold text-lg">{analysisResult.industry_benchmark.top_10_percent}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Percentile</div>
                <div className="font-bold text-lg">{analysisResult.industry_benchmark.percentile}th</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {analysisResult.components.map((component: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getIcon(component.icon)}
                      <div>
                        <h4 className="font-semibold">{component.category}</h4>
                        <p className="text-sm text-muted-foreground">{component.details}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(component.score)}`}>
                        {component.score}
                      </div>
                      <div className="text-xs text-muted-foreground">Weight: {component.weight}%</div>
                    </div>
                  </div>
                  <Progress value={component.score} className="h-2 mb-3" />
                  <div>
                    <h5 className="text-sm font-medium mb-2">Improvement Areas:</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {component.improvements.map((improvement: string, impIndex: number) => (
                        <li key={impIndex} className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Your Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysisResult.strengths.map((strength: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Growth Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Growth Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysisResult.growth_opportunities.map((opportunity: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{opportunity}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Next Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Predicted Career Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysisResult.next_milestones.map((milestone: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{milestone.title}</h4>
                    <Badge variant="outline">{milestone.timeline}</Badge>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-muted-foreground">Probability:</span>
                      <span className="font-semibold">{milestone.probability}%</span>
                    </div>
                    <Progress value={milestone.probability} className="h-2" />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-2">Key Requirements:</h5>
                    <div className="flex flex-wrap gap-2">
                      {milestone.requirements.map((req: string, reqIndex: number) => (
                        <Badge key={reqIndex} variant="secondary" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={handleSaveResult} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Score Report
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
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/tools')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Button>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            {!analysisResult ? (
              <div className="text-center space-y-6">
                <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Career Growth Score</h2>
                  <p className="text-muted-foreground mb-6">
                    Get a composite score based on resume strength, skills development, and activity
                  </p>
                </div>

                {isAnalyzing ? (
                  <div className="py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2">Calculating Your Score</h3>
                    <p className="text-muted-foreground">
                      Analyzing your career progression and potential...
                    </p>
                  </div>
                ) : (
                  <Button onClick={handleAnalyze} size="lg" className="px-8">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Calculate Growth Score
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

export default CareerGrowthScore;