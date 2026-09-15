import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Target, MapPin, Calendar, Star, ArrowRight, Plus, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CareerGoal {
  id: string;
  title: string;
  targetRole: string;
  targetCompany?: string;
  timeline: string;
  currentProgress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  milestones: Milestone[];
  skills: SkillRequirement[];
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
  completedDate?: string;
}

interface SkillRequirement {
  skillName: string;
  currentLevel: number;
  targetLevel: number;
  priority: 'high' | 'medium' | 'low';
}

interface CareerPath {
  id: string;
  currentRole: string;
  targetRole: string;
  steps: CareerStep[];
  estimatedTimeline: string;
  skillGaps: SkillRequirement[];
}

interface CareerStep {
  id: string;
  role: string;
  description: string;
  duration: string;
  skills: string[];
  salary?: { min: number; max: number };
}

export const CareerPathTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [careerGoals, setCareerGoals] = useState<CareerGoal[]>([]);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form states for new goal
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTargetRole, setNewGoalTargetRole] = useState('');
  const [newGoalTimeline, setNewGoalTimeline] = useState('');

  const generateCareerPath = async () => {
    if (!newGoalTargetRole) {
      toast.error('Please enter a target role');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('career-path-ai', {
        body: {
          action: 'generate_path',
          targetRole: newGoalTargetRole,
          currentRole: 'Software Developer', // This would come from user profile
          timeline: newGoalTimeline
        }
      });

      if (error) throw error;

      const newPath: CareerPath = {
        id: `path_${Date.now()}`,
        currentRole: 'Software Developer',
        targetRole: newGoalTargetRole,
        steps: data.steps,
        estimatedTimeline: data.timeline,
        skillGaps: data.skillGaps
      };

      setCareerPaths(prev => [...prev, newPath]);
      toast.success('Career path generated successfully!');

    } catch (error) {
      console.error('Error generating career path:', error);
      toast.error('Failed to generate career path');
    } finally {
      setIsGenerating(false);
    }
  };

  const createGoalFromPath = (path: CareerPath) => {
    const newGoal: CareerGoal = {
      id: `goal_${Date.now()}`,
      title: `Become ${path.targetRole}`,
      targetRole: path.targetRole,
      timeline: path.estimatedTimeline,
      currentProgress: 0,
      status: 'not-started',
      milestones: path.steps.map((step, index) => ({
        id: `milestone_${index}`,
        title: `Achieve ${step.role} role`,
        description: step.description,
        targetDate: new Date(Date.now() + (index + 1) * 365 * 24 * 60 * 60 * 1000 / path.steps.length).toISOString().split('T')[0],
        completed: false
      })),
      skills: path.skillGaps
    };

    setCareerGoals(prev => [...prev, newGoal]);
    toast.success('Career goal created!');
  };

  const updateMilestone = (goalId: string, milestoneId: string, completed: boolean) => {
    setCareerGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const updatedMilestones = goal.milestones.map(milestone => 
          milestone.id === milestoneId 
            ? { ...milestone, completed, completedDate: completed ? new Date().toISOString().split('T')[0] : undefined }
            : milestone
        );
        
        const progress = (updatedMilestones.filter(m => m.completed).length / updatedMilestones.length) * 100;
        
        return {
          ...goal,
          milestones: updatedMilestones,
          currentProgress: progress,
          status: progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'not-started'
        };
      }
      return goal;
    }));
  };

  const getStatusColor = (status: CareerGoal['status']) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'secondary';
      case 'paused': return 'outline';
      default: return 'outline';
    }
  };

  const getUpcomingMilestones = () => {
    return careerGoals
      .flatMap(goal => 
        goal.milestones
          .filter(m => !m.completed)
          .map(m => ({ ...m, goalTitle: goal.title }))
      )
      .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
      .slice(0, 5);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Career Path Tracker</h1>
          <p className="text-muted-foreground">Plan and track your career progression with AI guidance</p>
        </div>
        <Button onClick={() => setActiveTab('paths')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Career Path
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="paths">Career Paths</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{careerGoals.filter(g => g.status === 'in-progress').length}</div>
                <p className="text-sm text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Completed Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{careerGoals.filter(g => g.status === 'completed').length}</div>
                <p className="text-sm text-muted-foreground">Achieved</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Avg Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {careerGoals.length > 0 
                    ? Math.round(careerGoals.reduce((sum, g) => sum + g.currentProgress, 0) / careerGoals.length)
                    : 0}%
                </div>
                <p className="text-sm text-muted-foreground">Overall completion</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {careerGoals.slice(0, 3).map(goal => (
                  <div key={goal.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{goal.title}</h4>
                      <p className="text-sm text-muted-foreground">{goal.targetRole}</p>
                      <Progress value={goal.currentProgress} className="mt-2" />
                    </div>
                    <Badge variant={getStatusColor(goal.status)}>
                      {goal.status}
                    </Badge>
                  </div>
                ))}
                {careerGoals.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No career goals yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Milestones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getUpcomingMilestones().map(milestone => (
                  <div key={milestone.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{milestone.title}</h4>
                      <p className="text-xs text-muted-foreground">{milestone.goalTitle}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(milestone.targetDate).toLocaleDateString()}
                    </Badge>
                  </div>
                ))}
                {getUpcomingMilestones().length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No upcoming milestones</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          {careerGoals.map(goal => (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{goal.title}</CardTitle>
                    <p className="text-muted-foreground">{goal.targetRole} • {goal.timeline}</p>
                  </div>
                  <Badge variant={getStatusColor(goal.status)}>
                    {goal.status}
                  </Badge>
                </div>
                <Progress value={goal.currentProgress} className="mt-4" />
                <p className="text-sm text-muted-foreground">{Math.round(goal.currentProgress)}% complete</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Milestones</h4>
                    <div className="space-y-2">
                      {goal.milestones.map(milestone => (
                        <div key={milestone.id} className="flex items-center gap-3 p-2 border rounded">
                          <input
                            type="checkbox"
                            checked={milestone.completed}
                            onChange={(e) => updateMilestone(goal.id, milestone.id, e.target.checked)}
                          />
                          <div className="flex-1">
                            <h5 className={`font-medium ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {milestone.title}
                            </h5>
                            <p className="text-sm text-muted-foreground">{milestone.description}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {milestone.targetDate}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Required Skills</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {goal.skills.map((skill, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{skill.skillName}</span>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={(skill.currentLevel / skill.targetLevel) * 100} 
                              className="w-16 h-2"
                            />
                            <span className="text-xs text-muted-foreground">
                              {skill.currentLevel}/{skill.targetLevel}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {careerGoals.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Career Goals Yet</h3>
                <p className="text-muted-foreground mb-4">Create a career path to set your first goal</p>
                <Button onClick={() => setActiveTab('paths')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Career Path
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="paths" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Career Path</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Target Role *</label>
                  <Input
                    placeholder="e.g., Senior Software Engineer"
                    value={newGoalTargetRole}
                    onChange={(e) => setNewGoalTargetRole(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Timeline</label>
                  <Select value={newGoalTimeline} onValueChange={setNewGoalTimeline}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-year">1 Year</SelectItem>
                      <SelectItem value="2-years">2 Years</SelectItem>
                      <SelectItem value="3-years">3 Years</SelectItem>
                      <SelectItem value="5-years">5 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={generateCareerPath} 
                disabled={isGenerating || !newGoalTargetRole}
                className="w-full"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating Path...' : 'Generate Career Path'}
              </Button>
            </CardContent>
          </Card>

          {careerPaths.map(path => (
            <Card key={path.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{path.currentRole} → {path.targetRole}</CardTitle>
                    <p className="text-muted-foreground">Estimated timeline: {path.estimatedTimeline}</p>
                  </div>
                  <Button onClick={() => createGoalFromPath(path)}>
                    <Target className="h-4 w-4 mr-2" />
                    Create Goal
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Career Steps</h4>
                    <div className="space-y-3">
                      {path.steps.map((step, index) => (
                        <div key={step.id} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium">{step.role}</h5>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {step.skills.slice(0, 3).map(skill => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {step.skills.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{step.skills.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{step.duration}</div>
                            {step.salary && (
                              <div className="text-xs text-muted-foreground">
                                ${step.salary.min}k - ${step.salary.max}k
                              </div>
                            )}
                          </div>
                          {index < path.steps.length - 1 && (
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Skill Gaps to Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {path.skillGaps.map((skill, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{skill.skillName}</span>
                          <Badge variant={
                            skill.priority === 'high' ? 'destructive' :
                            skill.priority === 'medium' ? 'default' : 'secondary'
                          } className="text-xs">
                            {skill.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Career Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Advanced analytics and insights coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};