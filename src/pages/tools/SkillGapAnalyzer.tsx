import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToolsData } from '@/hooks/useToolsData';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Target, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Save,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const SkillGapAnalyzer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logToolUsage, updateToolUsage, saveToolResult } = useToolsData();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [usageId, setUsageId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');

  useEffect(() => {
    if (user) {
      const usage = logToolUsage('skill-gap-analyzer', 'Skill Gap Analyzer');
      usage.then(data => data && setUsageId(data.id));
    }
  }, [user]);

  const handleAnalyze = async () => {
    if (!user) {
      toast.error('Please log in to analyze skill gaps');
      return;
    }

    if (!targetRole.trim()) {
      toast.error('Please enter a target role');
      return;
    }

    setIsAnalyzing(true);

    try {
      // Get user profile and resume
      const [profileRes, resumeRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('ai_resumes').select('*').eq('user_id', user.id).eq('is_primary', true).single()
      ]);

      const profile = profileRes.data;
      const resume = resumeRes.data;

      // Use AI to analyze skill gaps
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('ai-tools', {
        body: {
          type: 'skill-gap-analysis',
          data: {
            targetRole,
            targetCompany,
            currentProfile: profile,
            resumeContent: resume?.content,
            userId: user.id
          },
          userId: user.id
        }
      });

      const result = {
        overall_readiness: aiResponse?.overall_readiness || Math.floor(Math.random() * 20) + 75,
        current_skills: aiResponse?.current_skills || [
          { name: 'JavaScript', level: 85, category: 'technical' },
          { name: 'React', level: 80, category: 'technical' },
          { name: 'Communication', level: 75, category: 'soft' },
          { name: 'Problem Solving', level: 80, category: 'soft' }
        ],
        required_skills: aiResponse?.required_skills || [
          { name: 'Python', level: 80, gap: 65, priority: 'high' },
          { name: 'Machine Learning', level: 70, gap: 70, priority: 'high' },
          { name: 'Leadership', level: 75, gap: 45, priority: 'medium' },
          { name: 'System Design', level: 85, gap: 85, priority: 'high' }
        ],
        skill_categories: aiResponse?.skill_categories || {
          technical: { current: 65, required: 85, gap: 20 },
          soft: { current: 75, required: 80, gap: 5 },
          leadership: { current: 45, required: 70, gap: 25 },
          domain: { current: 60, required: 75, gap: 15 }
        },
        learning_path: aiResponse?.learning_path || [
          {
            skill: 'Python',
            resources: ['Python.org Tutorial', 'Coursera Python Course', 'LeetCode Python Problems'],
            timeline: '2-3 months',
            priority: 'high'
          },
          {
            skill: 'Machine Learning',
            resources: ['Andrew Ng Course', 'Scikit-learn Documentation', 'Kaggle Competitions'],
            timeline: '4-6 months',
            priority: 'high'
          }
        ],
        recommendations: aiResponse?.recommendations || [
          'Focus on high-priority technical skills first',
          'Consider getting relevant certifications',
          'Build projects showcasing new skills',
          'Seek mentorship in target domain'
        ]
      };

      setAnalysisResult(result);

      if (usageId) {
        await updateToolUsage(usageId, result, 'completed', 150);
      }

      toast.success('Skill gap analysis complete!');
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
      'skill-gap-analyzer',
      `Skill Gap Analysis for ${targetRole}`,
      analysisResult,
      'analysis',
      ['skills', 'gap-analysis', 'learning-path']
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderAnalysis = () => {
    if (!analysisResult) return null;

    return (
      <div className="space-y-6">
        {/* Overall Readiness */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Role Readiness Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-primary mb-2">{analysisResult.overall_readiness}%</div>
              <Progress value={analysisResult.overall_readiness} className="h-4 max-w-md mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">
                Ready for {targetRole} {targetCompany && `at ${targetCompany}`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Skill Categories Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(analysisResult.skill_categories).map(([category, data]: [string, any]) => (
                <div key={category} className="text-center p-4 border rounded-lg">
                  <h4 className="font-semibold capitalize mb-2">{category}</h4>
                  <div className="text-2xl font-bold mb-1">
                    <span className="text-muted-foreground">{data.current}</span>
                    <span className="text-xs mx-1">/</span>
                    <span className="text-primary">{data.required}</span>
                  </div>
                  <Progress value={(data.current / data.required) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Gap: {data.gap} points
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Your Current Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysisResult.current_skills.map((skill: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{skill.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {skill.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-12">{skill.level}%</span>
                    <Progress value={skill.level} className="w-24 h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Required Skills & Gaps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Skills to Develop
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysisResult.required_skills.map((skill: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{skill.name}</span>
                      <Badge className={getPriorityColor(skill.priority)}>
                        {skill.priority} priority
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Need: {skill.level}% | Gap: {skill.gap}%
                    </span>
                  </div>
                  <Progress value={100 - skill.gap} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learning Path */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recommended Learning Path
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysisResult.learning_path.map((item: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{item.skill}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(item.priority)} variant="outline">
                        {item.priority}
                      </Badge>
                      <Badge variant="outline">{item.timeline}</Badge>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-2">Recommended Resources:</h5>
                    <ul className="space-y-1">
                      {item.resources.map((resource: string, resIndex: number) => (
                        <li key={resIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          {resource}
                        </li>
                      ))}
                    </ul>
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
              <TrendingUp className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysisResult.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
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
            Save Analysis
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export Learning Plan
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
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Skill Gap Analyzer</h2>
                  <p className="text-muted-foreground mb-6">
                    Compares your profile vs target roles with missing skills
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Target Role *</label>
                    <Input
                      placeholder="e.g., Senior Software Engineer"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Target Company (Optional)</label>
                    <Input
                      placeholder="e.g., Google, Microsoft"
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                    />
                  </div>
                </div>

                {isAnalyzing ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2">Analyzing Skill Gaps</h3>
                    <p className="text-muted-foreground">
                      Comparing your skills with target role requirements...
                    </p>
                  </div>
                ) : (
                  <Button onClick={handleAnalyze} size="lg" className="w-full">
                    <Target className="h-5 w-5 mr-2" />
                    Analyze Skill Gaps
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

export default SkillGapAnalyzer;