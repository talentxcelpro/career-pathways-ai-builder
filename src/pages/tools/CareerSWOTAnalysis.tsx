import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToolsData } from '@/hooks/useToolsData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  Shield,
  Zap,
  Save,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const CareerSWOTAnalysis = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logToolUsage, updateToolUsage, saveToolResult } = useToolsData();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [usageId, setUsageId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    currentRole: '',
    targetRole: '',
    industry: '',
    experience: '',
    challenges: ''
  });
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const usage = logToolUsage('career-swot-analysis', 'Career SWOT Analysis');
      usage.then(data => data && setUsageId(data.id));
    }
  }, [user]);

  const handleAnalyze = async () => {
    if (!formData.currentRole) {
      toast.error('Please enter your current role');
      return;
    }

    setIsAnalyzing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResult = {
        strengths: [
          'Strong technical foundation with 5+ years experience',
          'Proven track record of delivering projects on time',
          'Excellent problem-solving and analytical skills',
          'Leadership experience managing small teams',
          'Continuous learning mindset with recent certifications'
        ],
        weaknesses: [
          'Limited experience with cloud technologies',
          'Needs improvement in public speaking/presentations',
          'Could benefit from stronger business acumen',
          'Sometimes perfectionist leading to slower delivery'
        ],
        opportunities: [
          'Growing demand for AI/ML expertise in your industry',
          'Company expansion creating new leadership roles',
          'Remote work trend opening global opportunities',
          'Industry conferences to build thought leadership',
          'Mentorship programs available internally'
        ],
        threats: [
          'Automation potentially replacing routine tasks',
          'Increasing competition from bootcamp graduates',
          'Economic uncertainty affecting hiring',
          'Rapid technology changes requiring constant upskilling',
          'Budget cuts impacting training and development'
        ],
        strategic_actions: [
          {
            category: 'Leverage Strengths',
            actions: ['Apply for technical lead positions', 'Mentor junior developers', 'Lead complex projects']
          },
          {
            category: 'Address Weaknesses',
            actions: ['Take cloud certification courses', 'Join Toastmasters', 'Read business strategy books']
          },
          {
            category: 'Capture Opportunities',
            actions: ['Learn AI/ML skills', 'Network at industry events', 'Apply for remote positions']
          },
          {
            category: 'Mitigate Threats',
            actions: ['Focus on strategic/creative work', 'Build unique value proposition', 'Diversify skill set']
          }
        ]
      };

      setAnalysisResult(mockResult);

      if (usageId) {
        await updateToolUsage(usageId, mockResult, 'completed', 180);
      }

      toast.success('SWOT analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveResult = async () => {
    if (!analysisResult) return;
    
    await saveToolResult(
      'career-swot-analysis',
      'Career SWOT Analysis',
      analysisResult,
      'analysis',
      ['career', 'swot', 'strategy']
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
                <div className="text-center mb-8">
                  <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Career SWOT Analysis</h2>
                  <p className="text-muted-foreground">
                    AI-analyzed Strengths, Weaknesses, Opportunities, Threats with actionable insights
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Current Role *</label>
                      <Input
                        placeholder="e.g., Software Developer"
                        value={formData.currentRole}
                        onChange={(e) => setFormData({...formData, currentRole: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Target Role</label>
                      <Input
                        placeholder="e.g., Senior Developer"
                        value={formData.targetRole}
                        onChange={(e) => setFormData({...formData, targetRole: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Industry</label>
                      <Input
                        placeholder="e.g., Technology"
                        value={formData.industry}
                        onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Years of Experience</label>
                      <Input
                        type="number"
                        placeholder="e.g., 5"
                        value={formData.experience}
                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Current Challenges</label>
                      <Textarea
                        placeholder="What challenges are you facing in your career?"
                        value={formData.challenges}
                        onChange={(e) => setFormData({...formData, challenges: e.target.value})}
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                {isAnalyzing ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2">Analyzing Your Career Profile</h3>
                    <p className="text-muted-foreground">
                      AI is generating your personalized SWOT analysis...
                    </p>
                  </div>
                ) : (
                  <Button 
                    onClick={handleAnalyze} 
                    className="w-full" 
                    size="lg"
                    disabled={!formData.currentRole}
                  >
                    <Target className="h-5 w-5 mr-2" />
                    Generate SWOT Analysis
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Your Career SWOT Analysis</h2>
                  <p className="text-muted-foreground">Strategic insights for your professional growth</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <Shield className="h-5 w-5" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysisResult.strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                            <span className="text-sm">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Weaknesses */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Weaknesses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysisResult.weaknesses.map((weakness: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                            <span className="text-sm">{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Opportunities */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-600">
                        <TrendingUp className="h-5 w-5" />
                        Opportunities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysisResult.opportunities.map((opportunity: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                            <span className="text-sm">{opportunity}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Threats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-600">
                        <Zap className="h-5 w-5" />
                        Threats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysisResult.threats.map((threat: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                            <span className="text-sm">{threat}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Strategic Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Strategic Action Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResult.strategic_actions.map((category: any, index: number) => (
                        <div key={index}>
                          <h4 className="font-semibold mb-2">{category.category}</h4>
                          <ul className="space-y-1 ml-4">
                            {category.actions.map((action: string, actionIndex: number) => (
                              <li key={actionIndex} className="flex items-start gap-2 text-sm">
                                <span className="text-primary">•</span>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CareerSWOTAnalysis;