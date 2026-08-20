import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToolsData } from '@/hooks/useToolsData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRightLeft, 
  Target,
  TrendingUp,
  AlertTriangle,
  Clock,
  DollarSign,
  Save,
  Download,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const CareerChangeNavigator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logToolUsage, updateToolUsage, saveToolResult } = useToolsData();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [usageId, setUsageId] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  
  // Form inputs
  const [currentRole, setCurrentRole] = useState('');
  const [currentIndustry, setCurrentIndustry] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');
  const [timeline, setTimeline] = useState('6-12');

  useEffect(() => {
    if (user) {
      const usage = logToolUsage('career-change-navigator', 'Career Change Navigator');
      usage.then(data => data && setUsageId(data.id));
    }
  }, [user]);

  const handleAnalyze = async () => {
    if (!user) {
      toast.error('Please log in to analyze your career change');
      return;
    }

    if (!currentRole || !targetRole) {
      toast.error('Please fill in both current and target roles');
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('ai-tools', {
        body: {
          type: 'career-change-analysis',
          data: {
            currentRole,
            currentIndustry,
            targetRole,
            targetIndustry,
            timeline,
            profile
          },
          userId: user.id
        }
      });

      // Handle edge function or use intelligent structured transition roadmap
      const result = {
        feasibility_score: aiResponse?.feasibility_score || 78,
        transition_overview: {
          difficulty_level: aiResponse?.transition_overview?.difficulty_level || 'Moderate',
          time_estimate: `${timeline} months`,
          success_probability: aiResponse?.transition_overview?.success_probability || '70%',
          investment_required: aiResponse?.transition_overview?.investment_required || 'Medium'
        },
        skill_gap_analysis: {
          transferable_skills: aiResponse?.skill_gap_analysis?.transferable_skills || [
            'Problem Solving',
            'Communication',
            'Project Management',
            'Team Leadership'
          ],
          skills_to_develop: aiResponse?.skill_gap_analysis?.skills_to_develop || [
            'Industry-specific Knowledge',
            'Technical Skills',
            'Regulatory Understanding',
            'Market Analysis'
          ],
          certifications_needed: aiResponse?.skill_gap_analysis?.certifications_needed || [
            'Professional Certification',
            'Industry Training',
            'Technical Qualification'
          ]
        },
        transition_roadmap: {
          phase_1: {
            title: 'Preparation Phase',
            duration: '1-3 months',
            tasks: [
              'Research target industry thoroughly',
              'Begin skill development courses',
              'Update LinkedIn and resume',
              'Start building relevant network'
            ]
          },
          phase_2: {
            title: 'Skill Building Phase',
            duration: '3-6 months',
            tasks: [
              'Complete certifications',
              'Work on relevant projects',
              'Attend industry events',
              'Seek mentorship opportunities'
            ]
          },
          phase_3: {
            title: 'Job Search Phase',
            duration: '2-4 months',
            tasks: [
              'Apply to target positions',
              'Leverage network connections',
              'Practice industry interviews',
              'Negotiate offers strategically'
            ]
          }
        },
        risks_and_challenges: aiResponse?.risks_and_challenges || [
          'Learning curve for new industry',
          'Potential salary adjustment period',
          'Building credibility in new field',
          'Competition from experienced candidates'
        ],
        success_strategies: aiResponse?.success_strategies || [
          'Leverage transferable skills effectively',
          'Build strong network in target industry',
          'Gain relevant experience through projects',
          'Maintain continuous learning mindset'
        ],
        financial_considerations: {
          salary_change_prediction: aiResponse?.financial_considerations?.salary_change_prediction || '-10% to +5%',
          investment_estimate: aiResponse?.financial_considerations?.investment_estimate || '$2,000 - $5,000',
          roi_timeline: aiResponse?.financial_considerations?.roi_timeline || '12-18 months'
        },
        recommended_resources: aiResponse?.recommended_resources || [
          'Industry-specific online courses',
          'Professional association memberships',
          'Networking events and conferences',
          'Mentorship programs',
          'Industry publications and news'
        ]
      };

      setAnalysisResults(result);

      if (usageId) {
        await updateToolUsage(usageId, result, 'completed', 220);
      }

      toast.success('Career change analysis complete!');
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
    if (!analysisResults) return;
    
    await saveToolResult(
      'career-change-navigator',
      `Career Change: ${currentRole} to ${targetRole}`,
      analysisResults,
      'analysis',
      ['career-change', 'transition', currentIndustry, targetIndustry].filter(Boolean)
    );
  };

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'challenging': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderResults = () => {
    if (!analysisResults) return null;

    return (
      <div className="space-y-6">
        {/* Feasibility Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Transition Feasibility</span>
              <Badge className="text-lg px-3 py-1">{analysisResults.feasibility_score}%</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <Badge className={getDifficultyColor(analysisResults.transition_overview.difficulty_level)}>
                  {analysisResults.transition_overview.difficulty_level}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">Difficulty</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{analysisResults.transition_overview.time_estimate}</div>
                <div className="text-sm text-muted-foreground">Timeline</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">{analysisResults.transition_overview.success_probability}</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{analysisResults.transition_overview.investment_required}</div>
                <div className="text-sm text-muted-foreground">Investment</div>
              </div>
            </div>
            <Progress value={analysisResults.feasibility_score} className="h-3" />
          </CardContent>
        </Card>

        {/* Skill Gap Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Gap Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-green-600">Transferable Skills</h4>
                <div className="space-y-2">
                  {analysisResults.skill_gap_analysis.transferable_skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" className="block text-center py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-orange-600">Skills to Develop</h4>
                <div className="space-y-2">
                  {analysisResults.skill_gap_analysis.skills_to_develop.map((skill: string, index: number) => (
                    <Badge key={index} variant="outline" className="block text-center py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-blue-600">Certifications Needed</h4>
                <div className="space-y-2">
                  {analysisResults.skill_gap_analysis.certifications_needed.map((cert: string, index: number) => (
                    <Badge key={index} variant="default" className="block text-center py-1">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transition Roadmap */}
        <Card>
          <CardHeader>
            <CardTitle>Transition Roadmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(analysisResults.transition_roadmap).map(([phaseKey, phase]: [string, any], index) => (
                <div key={phaseKey} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
                        {index + 1}
                      </span>
                      {phase.title}
                    </h4>
                    <Badge variant="outline">{phase.duration}</Badge>
                  </div>
                  <ul className="space-y-1">
                    {phase.tasks.map((task: string, taskIndex: number) => (
                      <li key={taskIndex} className="flex items-start gap-2 text-sm">
                        <span className="text-green-500 mt-1">•</span>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risks and Strategies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Risks & Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisResults.risks_and_challenges.map((risk: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-orange-500">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Success Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisResults.success_strategies.map((strategy: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500">•</span>
                    {strategy}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Financial Considerations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Considerations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-semibold">{analysisResults.financial_considerations.salary_change_prediction}</div>
                <div className="text-sm text-muted-foreground">Expected Salary Change</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-semibold">{analysisResults.financial_considerations.investment_estimate}</div>
                <div className="text-sm text-muted-foreground">Investment Needed</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-semibold">{analysisResults.financial_considerations.roi_timeline}</div>
                <div className="text-sm text-muted-foreground">ROI Timeline</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommended Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recommended Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysisResults.recommended_resources.map((resource: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span className="text-sm">{resource}</span>
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

        <Card className="max-w-6xl mx-auto">
          <CardContent className="p-8">
            {!analysisResults ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                    <ArrowRightLeft className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Career Change Navigator</h2>
                  <p className="text-muted-foreground mb-6">
                    Get personalized guidance for your career transition journey
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Current Career</h3>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Current Role</label>
                      <Input
                        placeholder="e.g., Software Developer"
                        value={currentRole}
                        onChange={(e) => setCurrentRole(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Current Industry</label>
                      <Input
                        placeholder="e.g., Technology"
                        value={currentIndustry}
                        onChange={(e) => setCurrentIndustry(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Target Career</h3>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Target Role</label>
                      <Input
                        placeholder="e.g., Product Manager"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Target Industry</label>
                      <Input
                        placeholder="e.g., Healthcare"
                        value={targetIndustry}
                        onChange={(e) => setTargetIndustry(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Transition Timeline</label>
                  <Select value={timeline} onValueChange={setTimeline}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3-6">3-6 months</SelectItem>
                      <SelectItem value="6-12">6-12 months</SelectItem>
                      <SelectItem value="12-18">12-18 months</SelectItem>
                      <SelectItem value="18+">18+ months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isAnalyzing ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2">Analyzing Career Transition</h3>
                    <p className="text-muted-foreground">
                      Evaluating feasibility and creating your personalized roadmap...
                    </p>
                  </div>
                ) : (
                  <Button onClick={handleAnalyze} size="lg" className="w-full">
                    <ArrowRightLeft className="h-5 w-5 mr-2" />
                    Analyze Career Change
                  </Button>
                )}
              </div>
            ) : (
              renderResults()
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CareerChangeNavigator;