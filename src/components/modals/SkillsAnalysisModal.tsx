import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Target, TrendingUp, Star, Eye, Zap, Award, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface SkillsAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SkillAnalysis {
  name: string;
  currentLevel: number;
  marketDemand: number;
  salaryImpact: number;
  learningPath: string[];
  resources: number;
  timeToMaster: string;
}

interface AnalysisInsight {
  title: string;
  description: string;
  type: 'strength' | 'opportunity' | 'recommendation';
  priority: 'high' | 'medium' | 'low';
}

export const SkillsAnalysisModal: React.FC<SkillsAnalysisModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SkillAnalysis[]>([]);
  const [insights, setInsights] = useState<AnalysisInsight[]>([]);

  // Fetch user profile and career goals
  const { data: userProfile } = useQuery({
    queryKey: ['user_profile_skills'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: open
  });

  const { data: careerGoals = [] } = useQuery({
    queryKey: ['career_goals_skills'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('career_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (error) return [];
      return data;
    },
    enabled: open
  });

  const runAnalysis = async () => {
    if (!userProfile) return;
    
    setAnalyzing(true);
    
    // Simulate AI analysis with realistic data
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const userSkills = userProfile.skills || ['JavaScript', 'React', 'CSS'];
    const targetSkills = careerGoals.length > 0 ? careerGoals[0].skills_needed || [] : ['Node.js', 'TypeScript', 'AWS'];
    
    const skillsToAnalyze = [...new Set([...userSkills, ...targetSkills])];
    
    const mockAnalysis: SkillAnalysis[] = skillsToAnalyze.map((skill, index) => ({
      name: skill,
      currentLevel: userSkills.includes(skill) ? Math.random() * 40 + 60 : Math.random() * 30 + 10,
      marketDemand: Math.random() * 30 + 70,
      salaryImpact: Math.random() * 25 + 15,
      learningPath: [`${skill} Fundamentals`, `Advanced ${skill}`, `${skill} Best Practices`],
      resources: Math.floor(Math.random() * 50) + 20,
      timeToMaster: `${Math.floor(Math.random() * 6) + 2} months`
    }));

    const mockInsights: AnalysisInsight[] = [
      {
        title: 'Strong Foundation in Frontend',
        description: 'Your React and JavaScript skills are well-developed and in high demand.',
        type: 'strength',
        priority: 'high'
      },
      {
        title: 'Backend Skills Gap',
        description: 'Consider strengthening Node.js and database skills for full-stack roles.',
        type: 'opportunity',
        priority: 'high'
      },
      {
        title: 'Cloud Skills in Demand',
        description: 'AWS certification could increase your salary potential by 25-40%.',
        type: 'recommendation',
        priority: 'medium'
      }
    ];

    setAnalysis(mockAnalysis);
    setInsights(mockInsights);
    setAnalyzing(false);
  };

  useEffect(() => {
    if (open && userProfile && !analyzing && analysis.length === 0) {
      runAnalysis();
    }
  }, [open, userProfile]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength': return <Star className="h-4 w-4 text-green-600" />;
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'recommendation': return <Target className="h-4 w-4 text-purple-600" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-apple shadow-apple-large">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-apple-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            AI Skills Analysis Report
          </DialogTitle>
          <p className="text-text-secondary mt-2">
            Comprehensive analysis of your skills, market trends, and personalized recommendations
          </p>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {analyzing ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-apple-lg flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analyzing Your Skills...</h3>
              <p className="text-text-secondary mb-6">
                Our AI is evaluating your profile against market trends and career opportunities
              </p>
              <div className="max-w-md mx-auto space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Analyzing skill proficiency</span>
                  <span className="text-green-600">✓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Evaluating market demand</span>
                  <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Generating recommendations</span>
                  <span>⏳</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Key Insights */}
              <Card className="border-0 shadow-apple-medium bg-gradient-to-r from-purple-50 to-blue-50 rounded-apple">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                    <Eye className="h-5 w-5" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {insights.map((insight, index) => (
                      <div key={index} className="p-4 bg-white/80 backdrop-blur-sm rounded-apple-lg border border-white/50">
                        <div className="flex items-start gap-3 mb-2">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-text-primary">{insight.title}</h4>
                            <Badge className={`text-xs mt-1 ${getPriorityColor(insight.priority)}`}>
                              {insight.priority} priority
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-text-secondary">{insight.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Skills Breakdown */}
              <Card className="border-0 shadow-apple-medium bg-white rounded-apple">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Skills Analysis & Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.map((skill, index) => (
                      <div key={index} className="p-4 border border-gray-100 rounded-apple-lg hover:shadow-apple-subtle transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-text-primary">{skill.name}</h3>
                          <div className="flex gap-2">
                            <Badge className="bg-blue-100 text-blue-700 text-xs">
                              {Math.round(skill.marketDemand)}% demand
                            </Badge>
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              +{Math.round(skill.salaryImpact)}% salary
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-text-secondary">Current Level</span>
                              <span className="text-sm font-medium">{Math.round(skill.currentLevel)}%</span>
                            </div>
                            <Progress value={skill.currentLevel} className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-text-secondary">Market Demand</span>
                              <span className="text-sm font-medium">{Math.round(skill.marketDemand)}%</span>
                            </div>
                            <Progress value={skill.marketDemand} className="h-2" />
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-text-secondary">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {skill.resources} resources
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {skill.timeToMaster}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-xs text-text-secondary mb-2">Recommended Learning Path:</p>
                          <div className="flex flex-wrap gap-1">
                            {skill.learningPath.map((step, stepIndex) => (
                              <Badge key={stepIndex} variant="outline" className="text-xs bg-gray-50">
                                {stepIndex + 1}. {step}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Action Items */}
              <Card className="border-0 shadow-apple-medium bg-gradient-to-r from-green-50 to-emerald-50 rounded-apple">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <Award className="h-5 w-5" />
                    Recommended Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white/80 rounded-apple-lg">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                      <div>
                        <h4 className="font-semibold text-sm text-green-800">Focus on High-Impact Skills</h4>
                        <p className="text-xs text-green-700">Prioritize skills with highest salary impact and market demand</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/80 rounded-apple-lg">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                      <div>
                        <h4 className="font-semibold text-sm text-blue-800">Create Learning Schedule</h4>
                        <p className="text-xs text-blue-700">Dedicate 5-10 hours per week to skill development</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/80 rounded-apple-lg">
                      <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                      <div>
                        <h4 className="font-semibold text-sm text-purple-800">Build Portfolio Projects</h4>
                        <p className="text-xs text-purple-700">Apply new skills in real-world projects to demonstrate proficiency</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-apple-lg border-gray-200"
          >
            Close
          </Button>
          {!analyzing && (
            <Button
              onClick={runAnalysis}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-apple-lg shadow-apple-light"
            >
              <Brain className="h-4 w-4 mr-2" />
              Re-analyze Skills
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};