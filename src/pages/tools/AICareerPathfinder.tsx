import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToolsData } from '@/hooks/useToolsData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Map, 
  ArrowLeft, 
  Sparkles, 
  Target, 
  Clock, 
  TrendingUp,
  BookOpen,
  Award,
  Users,
  Save,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AICareerPathfinder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logToolUsage, updateToolUsage, saveToolResult } = useToolsData();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [usageId, setUsageId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    currentRole: '',
    targetRole: '',
    industry: '',
    timeframe: '12',
    currentSkills: '',
    interests: '',
    workStyle: 'hybrid'
  });
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const usage = logToolUsage('ai-career-pathfinder', 'AI Career Pathfinder');
      usage.then(data => data && setUsageId(data.id));
    }
  }, [user]);

  const handleAnalyze = async () => {
    if (!formData.currentRole || !formData.targetRole) {
      toast.error('Please fill in your current and target roles');
      return;
    }

    setIsAnalyzing(true);
    setCurrentStep(2);

    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResult = {
        pathwayTitle: `${formData.currentRole} → ${formData.targetRole}`,
        timelineMonths: parseInt(formData.timeframe),
        difficultyScore: Math.floor(Math.random() * 30) + 70,
        milestones: [
          {
            phase: 'Foundation Building',
            duration: '0-3 months',
            tasks: [
              'Complete LinkedIn profile optimization',
              'Build portfolio with 2-3 relevant projects',
              'Network with professionals in target industry',
              'Research top companies and job requirements'
            ],
            skills: ['Communication', 'Industry Knowledge', 'Professional Branding']
          },
          {
            phase: 'Skill Development',
            duration: '3-8 months',
            tasks: [
              'Complete relevant certifications',
              'Take on stretch assignments in current role',
              'Join professional associations',
              'Attend industry conferences/webinars'
            ],
            skills: ['Technical Skills', 'Leadership', 'Strategic Thinking']
          },
          {
            phase: 'Transition Execution',
            duration: '8-12 months',
            tasks: [
              'Apply to target positions',
              'Leverage network for referrals',
              'Prepare for interviews with mock sessions',
              'Negotiate job offers and transition timeline'
            ],
            skills: ['Interview Skills', 'Negotiation', 'Change Management']
          }
        ],
        skillGaps: [
          { skill: 'Data Analysis', current: 40, required: 80, priority: 'High' },
          { skill: 'Project Management', current: 60, required: 85, priority: 'Medium' },
          { skill: 'Leadership', current: 50, required: 75, priority: 'High' }
        ],
        recommendations: [
          'Consider pursuing a Project Management certification (PMP)',
          'Build data analysis skills through online courses',
          'Seek mentorship from someone in your target role',
          'Start a side project to demonstrate new capabilities'
        ],
        marketDemand: 85,
        salaryProjection: {
          current: 75000,
          target: 95000,
          increase: '27%'
        }
      };

      setAnalysisResult(mockResult);
      setCurrentStep(3);

      // Update usage log
      if (usageId) {
        await updateToolUsage(usageId, mockResult, 'completed', 180);
      }

      toast.success('Career pathway analysis complete!');
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
      'ai-career-pathfinder',
      `Career Path: ${analysisResult.pathwayTitle}`,
      analysisResult,
      'analysis',
      ['career', 'pathfinder', formData.targetRole.toLowerCase()]
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Map className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">AI Career Pathfinder</h2>
        <p className="text-muted-foreground">
          Get a personalized 5-year roadmap with skill gaps & milestones
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Current Role *</label>
            <Input
              placeholder="e.g., Marketing Specialist"
              value={formData.currentRole}
              onChange={(e) => setFormData({...formData, currentRole: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Target Role *</label>
            <Input
              placeholder="e.g., Marketing Manager"
              value={formData.targetRole}
              onChange={(e) => setFormData({...formData, targetRole: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Industry</label>
            <Input
              placeholder="e.g., Technology, Healthcare, Finance"
              value={formData.industry}
              onChange={(e) => setFormData({...formData, industry: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Timeframe (months)</label>
            <Input
              type="number"
              min="6"
              max="60"
              value={formData.timeframe}
              onChange={(e) => setFormData({...formData, timeframe: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Current Skills</label>
            <Textarea
              placeholder="List your key skills, technologies, certifications..."
              value={formData.currentSkills}
              onChange={(e) => setFormData({...formData, currentSkills: e.target.value})}
              rows={3}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Career Interests & Goals</label>
        <Textarea
          placeholder="What motivates you? What type of work environment do you prefer? What are your long-term career goals?"
          value={formData.interests}
          onChange={(e) => setFormData({...formData, interests: e.target.value})}
          rows={3}
        />
      </div>

      <Button 
        onClick={handleAnalyze} 
        className="w-full" 
        size="lg"
        disabled={!formData.currentRole || !formData.targetRole}
      >
        <Sparkles className="h-5 w-5 mr-2" />
        Generate Career Pathway
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <h3 className="text-xl font-semibold mb-2">Analyzing Your Career Path</h3>
      <p className="text-muted-foreground">
        Our AI is creating your personalized roadmap...
      </p>
    </div>
  );

  const renderStep3 = () => {
    if (!analysisResult) return null;

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{analysisResult.pathwayTitle}</h2>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {analysisResult.timelineMonths} months
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              {analysisResult.difficultyScore}% success rate
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Market demand: {analysisResult.marketDemand}%
            </div>
          </div>
        </div>

        {/* Salary Projection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Salary Projection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-muted-foreground">${analysisResult.salaryProjection.current.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Current</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">${analysisResult.salaryProjection.target.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Target</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">+{analysisResult.salaryProjection.increase}</div>
                <div className="text-sm text-muted-foreground">Increase</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Career Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {analysisResult.milestones.map((milestone: any, index: number) => (
                <div key={index} className="relative">
                  {index < analysisResult.milestones.length - 1 && (
                    <div className="absolute left-4 top-8 w-0.5 h-16 bg-muted"></div>
                  )}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{milestone.phase}</h4>
                        <Badge variant="outline">{milestone.duration}</Badge>
                      </div>
                      <ul className="space-y-1 text-sm text-muted-foreground mb-3">
                        {milestone.tasks.map((task: string, taskIndex: number) => (
                          <li key={taskIndex} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                            {task}
                          </li>
                        ))}
                      </ul>
                      <div className="flex flex-wrap gap-1">
                        {milestone.skills.map((skill: string, skillIndex: number) => (
                          <Badge key={skillIndex} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skill Gaps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Skill Gap Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysisResult.skillGaps.map((gap: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{gap.skill}</span>
                    <Badge variant={gap.priority === 'High' ? 'destructive' : 'secondary'}>
                      {gap.priority} Priority
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Current: {gap.current}%</span>
                      <span>Required: {gap.required}%</span>
                    </div>
                    <Progress value={(gap.current / gap.required) * 100} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysisResult.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={handleSaveResult} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Roadmap
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
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
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Step {currentStep} of 3</span>
          </div>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AICareerPathfinder;