import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Target, TrendingUp, BookOpen, Star, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'leadership' | 'domain';
  currentLevel: number; // 1-10
  targetLevel: number; // 1-10
  priority: 'high' | 'medium' | 'low';
  gap: number;
  marketDemand: 'high' | 'medium' | 'low';
  learningResources: LearningResource[];
}

interface LearningResource {
  id: string;
  title: string;
  type: 'course' | 'book' | 'article' | 'video' | 'certification';
  provider: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  url?: string;
  cost?: string;
}

interface SkillAssessment {
  id: string;
  targetRole: string;
  currentRole: string;
  skills: Skill[];
  overallScore: number;
  readinessLevel: 'ready' | 'partially-ready' | 'needs-work';
  estimatedTimeToTarget: string;
  generatedAt: string;
}

export const SkillGapAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState('assessment');
  const [assessments, setAssessments] = useState<SkillAssessment[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Form states
  const [targetRole, setTargetRole] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillLevels, setSkillLevels] = useState<Record<string, number>>({});

  const popularSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes',
    'Machine Learning', 'Data Analysis', 'SQL', 'MongoDB', 'GraphQL',
    'Leadership', 'Communication', 'Problem Solving', 'Project Management',
    'Agile', 'Scrum', 'DevOps', 'CI/CD', 'Security', 'Testing'
  ];

  const runSkillGapAnalysis = async () => {
    if (!targetRole || selectedSkills.length === 0) {
      toast.error('Please select a target role and skills');
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('skill-gap-ai', {
        body: {
          action: 'analyze_gaps',
          currentRole,
          targetRole,
          skills: selectedSkills.map(skill => ({
            name: skill,
            currentLevel: skillLevels[skill] || 1
          }))
        }
      });

      if (error) throw error;

      const newAssessment: SkillAssessment = {
        id: `assessment_${Date.now()}`,
        targetRole,
        currentRole,
        skills: data.skillAnalysis,
        overallScore: data.overallScore,
        readinessLevel: data.readinessLevel,
        estimatedTimeToTarget: data.estimatedTime,
        generatedAt: new Date().toISOString()
      };

      setAssessments(prev => [newAssessment, ...prev]);
      setActiveTab('results');
      toast.success('Skill gap analysis completed!');

    } catch (error) {
      console.error('Error analyzing skills:', error);
      toast.error('Failed to analyze skill gaps');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateLearningPlan = async (skillId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('skill-gap-ai', {
        body: {
          action: 'generate_learning_plan',
          skillId
        }
      });

      if (error) throw error;
      toast.success('Learning plan generated!');
    } catch (error) {
      console.error('Error generating learning plan:', error);
      toast.error('Failed to generate learning plan');
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const updateSkillLevel = (skill: string, level: number) => {
    setSkillLevels(prev => ({ ...prev, [skill]: level }));
  };

  const getGapSeverity = (gap: number) => {
    if (gap <= 2) return { severity: 'low', color: 'secondary' };
    if (gap <= 4) return { severity: 'medium', color: 'default' };
    return { severity: 'high', color: 'destructive' };
  };

  const getReadinessColor = (level: SkillAssessment['readinessLevel']) => {
    switch (level) {
      case 'ready': return 'default';
      case 'partially-ready': return 'secondary';
      case 'needs-work': return 'destructive';
    }
  };

  const latestAssessment = assessments[0];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Skill Gap Analysis</h1>
          <p className="text-muted-foreground">Identify and bridge skill gaps for your career goals</p>
        </div>
        <Button onClick={() => setActiveTab('assessment')}>
          <BarChart3 className="h-4 w-4 mr-2" />
          New Analysis
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="results" disabled={!latestAssessment}>Results</TabsTrigger>
          <TabsTrigger value="learning">Learning Plan</TabsTrigger>
          <TabsTrigger value="tracking">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skill Gap Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Current Role</label>
                  <Input
                    placeholder="e.g., Software Developer"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Target Role *</label>
                  <Input
                    placeholder="e.g., Senior Full Stack Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Select Skills to Evaluate</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {popularSkills.map(skill => (
                    <Badge
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
                
                {selectedSkills.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h4 className="font-medium">Rate Your Current Level (1-10)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedSkills.map(skill => (
                        <div key={skill} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium">{skill}</span>
                          <Select 
                            value={skillLevels[skill]?.toString() || "1"}
                            onValueChange={(value) => updateSkillLevel(skill, parseInt(value))}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1,2,3,4,5,6,7,8,9,10].map(level => (
                                <SelectItem key={level} value={level.toString()}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={runSkillGapAnalysis}
                disabled={isAnalyzing || !targetRole || selectedSkills.length === 0}
                className="w-full"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {isAnalyzing ? 'Analyzing Skills...' : 'Run Skill Gap Analysis'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {latestAssessment && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Assessment Results</CardTitle>
                      <p className="text-muted-foreground">
                        {latestAssessment.currentRole} → {latestAssessment.targetRole}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={getReadinessColor(latestAssessment.readinessLevel)} className="mb-2">
                        {latestAssessment.readinessLevel.replace('-', ' ')}
                      </Badge>
                      <div className="text-2xl font-bold">{latestAssessment.overallScore}%</div>
                      <div className="text-sm text-muted-foreground">Overall Score</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 border rounded-lg">
                      <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="font-semibold">{latestAssessment.skills.length}</div>
                      <div className="text-sm text-muted-foreground">Skills Analyzed</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                      <div className="font-semibold">
                        {latestAssessment.skills.filter(s => s.gap > 3).length}
                      </div>
                      <div className="text-sm text-muted-foreground">High Priority Gaps</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <div className="font-semibold">{latestAssessment.estimatedTimeToTarget}</div>
                      <div className="text-sm text-muted-foreground">Est. Time to Target</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Skill Breakdown</h4>
                    {latestAssessment.skills
                      .sort((a, b) => b.gap - a.gap)
                      .map(skill => {
                        const gapInfo = getGapSeverity(skill.gap);
                        return (
                          <Card key={skill.id}>
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <h5 className="font-medium">{skill.name}</h5>
                                  <Badge variant="outline">{skill.category}</Badge>
                                  <Badge variant={gapInfo.color as any}>
                                    Gap: {skill.gap}
                                  </Badge>
                                </div>
                                <Badge variant={
                                  skill.priority === 'high' ? 'destructive' :
                                  skill.priority === 'medium' ? 'default' : 'secondary'
                                }>
                                  {skill.priority} priority
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Current Level</span>
                                    <span>{skill.currentLevel}/10</span>
                                  </div>
                                  <Progress value={skill.currentLevel * 10} />
                                </div>
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Target Level</span>
                                    <span>{skill.targetLevel}/10</span>
                                  </div>
                                  <Progress value={skill.targetLevel * 10} />
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">Market Demand:</span>
                                  <Badge variant={
                                    skill.marketDemand === 'high' ? 'default' :
                                    skill.marketDemand === 'medium' ? 'secondary' : 'outline'
                                  }>
                                    {skill.marketDemand}
                                  </Badge>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => generateLearningPlan(skill.id)}
                                >
                                  <BookOpen className="h-4 w-4 mr-1" />
                                  Learning Plan
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="learning">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Learning Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Learning plan interface coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking">
          <Card>
            <CardHeader>
              <CardTitle>Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Progress tracking dashboard coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};