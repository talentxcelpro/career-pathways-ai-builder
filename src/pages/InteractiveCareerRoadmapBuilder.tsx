import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Map, 
  Target, 
  Brain, 
  TrendingUp, 
  Calendar,
  Clock,
  Route,
  Share2,
  Download,
  Save,
  Plus,
  Settings
} from 'lucide-react';
import { InteractiveRoadmapBuilder } from '@/components/roadmap/InteractiveRoadmapBuilder';
import { AIRoadmapSuggestions } from '@/components/roadmap/AIRoadmapSuggestions';
import { GoalTracking } from '@/components/roadmap/GoalTracking';

export default function InteractiveCareerRoadmapBuilder() {
  const [activeTab, setActiveTab] = useState('builder');

  const quickStats = {
    totalMilestones: 15,
    completedMilestones: 8,
    activeGoals: 4,
    aiSuggestions: 12,
    estimatedCompletion: '18 months',
    nextDeadline: '2 weeks'
  };

  const recentActivity = [
    {
      id: '1',
      type: 'milestone_completed',
      title: 'AWS Associate Certification',
      description: 'Successfully passed AWS Solutions Architect Associate exam',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      impact: '+15% progress towards Senior Engineer goal'
    },
    {
      id: '2',
      type: 'ai_suggestion',
      title: 'New Skill Recommendation',
      description: 'AI suggests learning Kubernetes based on industry trends',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      impact: 'High relevance score: 92/100'
    },
    {
      id: '3',
      type: 'goal_updated',
      title: 'Leadership Goal Progress',
      description: 'Updated progress on cross-functional team leadership',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      impact: '65% complete'
    }
  ];

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const exportRoadmap = () => {
    // Implementation for exporting roadmap
    console.log('Exporting roadmap...');
  };

  const shareRoadmap = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Career Roadmap',
        text: 'Check out my career development roadmap created with TalentXcel!',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Career Roadmap Builder</h1>
            <p className="text-lg text-muted-foreground">
              Create, track, and optimize your personalized career development journey
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={shareRoadmap} variant="outline" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share Roadmap
            </Button>
            <Button onClick={exportRoadmap} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Progress
            </Button>
          </div>
        </div>

        {/* Quick Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Route className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{quickStats.totalMilestones}</p>
              <p className="text-sm text-muted-foreground">Total Milestones</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{quickStats.completedMilestones}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{quickStats.activeGoals}</p>
              <p className="text-sm text-muted-foreground">Active Goals</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{quickStats.aiSuggestions}</p>
              <p className="text-sm text-muted-foreground">AI Suggestions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{quickStats.estimatedCompletion}</p>
              <p className="text-sm text-muted-foreground">Est. Completion</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{quickStats.nextDeadline}</p>
              <p className="text-sm text-muted-foreground">Next Deadline</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="builder" className="flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  <span className="hidden sm:inline">Roadmap Builder</span>
                </TabsTrigger>
                <TabsTrigger value="ai-suggestions" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline">AI Suggestions</span>
                </TabsTrigger>
                <TabsTrigger value="goals" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Goal Tracking</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="builder">
                <InteractiveRoadmapBuilder />
              </TabsContent>

              <TabsContent value="ai-suggestions">
                <AIRoadmapSuggestions />
              </TabsContent>

              <TabsContent value="goals">
                <GoalTracking />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Career Progress Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Overall Career Progress</span>
                            <span>67%</span>
                          </div>
                          <Progress value={67} className="h-3" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">8</p>
                            <p className="text-sm text-muted-foreground">Skills Acquired</p>
                          </div>
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">3</p>
                            <p className="text-sm text-muted-foreground">Certifications</p>
                          </div>
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">2</p>
                            <p className="text-sm text-muted-foreground">Role Transitions</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Skill Development Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center text-muted-foreground">
                          <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                          <p>Detailed analytics coming soon...</p>
                          <p className="text-sm">Track your skill progression over time</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className={`p-1 rounded-full ${
                        activity.type === 'milestone_completed' ? 'bg-green-100' :
                        activity.type === 'ai_suggestion' ? 'bg-blue-100' :
                        'bg-orange-100'
                      }`}>
                        {activity.type === 'milestone_completed' ? (
                          <Target className="h-3 w-3 text-green-600" />
                        ) : activity.type === 'ai_suggestion' ? (
                          <Brain className="h-3 w-3 text-blue-600" />
                        ) : (
                          <TrendingUp className="h-3 w-3 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-blue-600">{activity.impact}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Milestone
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Brain className="h-4 w-4 mr-2" />
                  Get AI Recommendations
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Set New Goal
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Roadmap Settings
                </Button>
              </CardContent>
            </Card>

            {/* Progress Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Technical Skills</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Leadership Skills</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Industry Knowledge</span>
                      <span>60%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Network Building</span>
                      <span>80%</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                    <div>
                      <p className="font-medium text-sm">AWS Professional Exam</p>
                      <p className="text-xs text-muted-foreground">Critical priority</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">2 weeks</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-amber-50 rounded border border-amber-200">
                    <div>
                      <p className="font-medium text-sm">Team Leadership Project</p>
                      <p className="text-xs text-muted-foreground">High priority</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">1 month</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                    <div>
                      <p className="font-medium text-sm">Network Building Goal</p>
                      <p className="text-xs text-muted-foreground">Medium priority</p>
                    </div>
                    <Badge variant="outline" className="text-xs">2 months</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}