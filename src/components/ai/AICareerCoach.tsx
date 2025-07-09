import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Calendar,
  BookOpen,
  Users,
  MessageSquare,
  Award,
  Lightbulb,
  BarChart3,
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
  Zap
} from "lucide-react";
import { toast } from "sonner";

interface CareerGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  category: 'skill' | 'experience' | 'network' | 'education';
}

interface AIInsight {
  id: string;
  type: 'recommendation' | 'warning' | 'opportunity' | 'achievement';
  title: string;
  description: string;
  actionable: boolean;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
}

interface SkillGap {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  importance: number;
  learningPath: string[];
}

export const AICareerCoach: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentGoal, setCurrentGoal] = useState('');
  const [timeframe, setTimeframe] = useState('6');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in real app, fetch from API
  const [careerGoals] = useState<CareerGoal[]>([
    {
      id: '1',
      title: 'Master React Development',
      description: 'Become proficient in advanced React patterns and hooks',
      progress: 75,
      dueDate: '2024-12-01',
      priority: 'high',
      category: 'skill'
    },
    {
      id: '2',
      title: 'Build Professional Network',
      description: 'Connect with 50 industry professionals on LinkedIn',
      progress: 40,
      dueDate: '2024-11-15',
      priority: 'medium',
      category: 'network'
    },
    {
      id: '3',
      title: 'Complete AWS Certification',
      description: 'Get AWS Solutions Architect Associate certification',
      progress: 20,
      dueDate: '2025-01-30',
      priority: 'high',
      category: 'education'
    }
  ]);

  const [aiInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'opportunity',
      title: 'High-Demand Skills Alert',
      description: 'TypeScript proficiency is mentioned in 85% of React jobs you\'re interested in. Consider prioritizing this skill.',
      actionable: true,
      impact: 'high',
      timeframe: '2-3 months'
    },
    {
      id: '2',
      type: 'recommendation',
      title: 'Career Progression Path',
      description: 'Based on your current experience, Senior Frontend Developer roles are within reach. Focus on system design skills.',
      actionable: true,
      impact: 'high',
      timeframe: '6-12 months'
    },
    {
      id: '3',
      type: 'warning',
      title: 'Skill Gap Identified',
      description: 'Your backend knowledge may limit full-stack opportunities. Consider learning Node.js or Python.',
      actionable: true,
      impact: 'medium',
      timeframe: '3-6 months'
    }
  ]);

  const [skillGaps] = useState<SkillGap[]>([
    {
      skill: 'TypeScript',
      currentLevel: 6,
      targetLevel: 9,
      importance: 95,
      learningPath: ['Advanced Types', 'Generics', 'Utility Types', 'Type Guards']
    },
    {
      skill: 'System Design',
      currentLevel: 4,
      targetLevel: 8,
      importance: 85,
      learningPath: ['Scalability', 'Database Design', 'Microservices', 'Load Balancing']
    },
    {
      skill: 'Node.js',
      currentLevel: 3,
      targetLevel: 7,
      importance: 70,
      learningPath: ['Express.js', 'APIs', 'Database Integration', 'Authentication']
    }
  ]);

  const handleAnalyzeCareer = useCallback(async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Career analysis complete! Check your new insights.');
    } catch (error) {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleCreateGoal = useCallback(async () => {
    if (!currentGoal.trim()) {
      toast.error('Please enter a career goal');
      return;
    }

    // In real app, save to database
    toast.success('Career goal created successfully!');
    setCurrentGoal('');
  }, [currentGoal]);

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'warning': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'achievement': return <Award className="h-4 w-4 text-purple-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Career Coach</h1>
          <p className="text-gray-600">Personalized career guidance powered by AI</p>
        </div>
        <Button 
          onClick={handleAnalyzeCareer}
          disabled={isAnalyzing}
          className="flex items-center gap-2"
        >
          <Brain className="h-4 w-4" />
          {isAnalyzing ? 'Analyzing...' : 'Analyze Career'}
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="coaching">Coaching</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Career Score */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Career Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">82/100</div>
                <Progress value={82} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  +5 points this month
                </p>
              </CardContent>
            </Card>

            {/* Goals Progress */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{careerGoals.length}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(careerGoals.reduce((acc, goal) => acc + goal.progress, 0) / careerGoals.length)}% average progress
                </p>
              </CardContent>
            </Card>

            {/* Skill Development */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Skill Gaps</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{skillGaps.length}</div>
                <p className="text-xs text-muted-foreground">
                  Areas for improvement
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Latest AI Insights</CardTitle>
              <CardDescription>
                Recent recommendations and opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiInsights.slice(0, 3).map((insight) => (
                  <div key={insight.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="mt-0.5">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{insight.title}</p>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {insight.impact} impact
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {insight.timeframe}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          {/* Create New Goal */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Goal</CardTitle>
              <CardDescription>
                Set a specific career objective with AI-powered recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Goal Description</label>
                  <Textarea
                    placeholder="e.g., Become a Senior Full Stack Developer..."
                    value={currentGoal}
                    onChange={(e) => setCurrentGoal(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Target Timeframe (months)</label>
                  <Input
                    type="number"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    min="1"
                    max="60"
                    className="mt-1"
                  />
                </div>
              </div>
              <Button onClick={handleCreateGoal} className="w-full">
                <Target className="h-4 w-4 mr-2" />
                Create Goal with AI Guidance
              </Button>
            </CardContent>
          </Card>

          {/* Active Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Your Career Goals</CardTitle>
              <CardDescription>Track progress on your career objectives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {careerGoals.map((goal) => (
                  <div key={goal.id} className="p-4 rounded-lg border space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">{goal.title}</h3>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      </div>
                      <Badge variant={getPriorityColor(goal.priority) as any}>
                        {goal.priority}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {new Date(goal.dueDate).toLocaleDateString()}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            {aiInsights.map((insight) => (
              <Card key={insight.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {getInsightIcon(insight.type)}
                    <div>
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <CardDescription>{insight.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'secondary' : 'outline'}>
                        {insight.impact} impact
                      </Badge>
                      <Badge variant="outline">{insight.timeframe}</Badge>
                    </div>
                    {insight.actionable && (
                      <Button size="sm">
                        Take Action
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skill Gap Analysis</CardTitle>
              <CardDescription>
                AI-identified skills to focus on for your career goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {skillGaps.map((skill, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{skill.skill}</h3>
                      <Badge variant="secondary">
                        {skill.importance}% importance
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Level</p>
                        <div className="flex items-center gap-2">
                          <Progress value={skill.currentLevel * 10} className="flex-1" />
                          <span className="text-sm font-medium">{skill.currentLevel}/10</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Target Level</p>
                        <div className="flex items-center gap-2">
                          <Progress value={skill.targetLevel * 10} className="flex-1" />
                          <span className="text-sm font-medium">{skill.targetLevel}/10</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Recommended Learning Path:</p>
                      <div className="flex flex-wrap gap-2">
                        {skill.learningPath.map((step, stepIndex) => (
                          <Badge key={stepIndex} variant="outline" className="text-xs">
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
        </TabsContent>

        {/* Coaching Tab */}
        <TabsContent value="coaching" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Coach Chat */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat with AI Coach
                </CardTitle>
                <CardDescription>
                  Get personalized career advice and guidance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-64 border rounded-lg p-4 overflow-y-auto">
                    <div className="flex items-start gap-3 mb-4">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                      <div className="bg-muted p-3 rounded-lg flex-1">
                        <p className="text-sm">Hello! I'm your AI Career Coach. How can I help you today?</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Ask me anything about your career..." />
                    <Button size="sm">Send</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coaching Sessions */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Coaching Sessions
                </CardTitle>
                <CardDescription>
                  Schedule one-on-one sessions with career experts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Resume Review Session</h3>
                      <Badge variant="secondary">Available</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Get expert feedback on your resume and improve your chances
                    </p>
                    <Button size="sm" className="w-full">Book Session</Button>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Interview Preparation</h3>
                      <Badge variant="secondary">Available</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Practice interviews and get personalized feedback
                    </p>
                    <Button size="sm" className="w-full">Book Session</Button>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Career Strategy Planning</h3>
                      <Badge variant="secondary">Available</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Develop a comprehensive career advancement plan
                    </p>
                    <Button size="sm" className="w-full">Book Session</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common coaching tasks and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="flex items-center gap-2 h-auto p-4">
                  <Zap className="h-5 w-5 text-blue-500" />
                  <div className="text-left">
                    <p className="font-medium">Skill Assessment</p>
                    <p className="text-sm text-muted-foreground">Evaluate your current skills</p>
                  </div>
                </Button>
                
                <Button variant="outline" className="flex items-center gap-2 h-auto p-4">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div className="text-left">
                    <p className="font-medium">Career Path Finder</p>
                    <p className="text-sm text-muted-foreground">Discover new opportunities</p>
                  </div>
                </Button>
                
                <Button variant="outline" className="flex items-center gap-2 h-auto p-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div className="text-left">
                    <p className="font-medium">Goal Tracker</p>
                    <p className="text-sm text-muted-foreground">Monitor your progress</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};