import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lightbulb, 
  BookOpen, 
  Target, 
  Award, 
  TrendingUp, 
  Users,
  Rocket,
  Star,
  Clock
} from 'lucide-react';
import { useAICareerMapping } from '@/hooks/useAICareerMapping';

interface AIRecommendationsDashboardProps {
  userId: string;
  currentSkills: Array<{
    name: string;
    proficiency: number;
    category: string;
  }>;
  targetRole: string;
  userProgress?: any;
  learningPreferences?: any;
}

const AIRecommendationsDashboard: React.FC<AIRecommendationsDashboardProps> = ({
  userId,
  currentSkills,
  targetRole,
  userProgress,
  learningPreferences
}) => {
  const [recommendations, setRecommendations] = useState<any>(null);
  const { getAIRecommendations, isGettingRecommendations } = useAICareerMapping();

  useEffect(() => {
    if (userId && currentSkills.length > 0) {
      handleGetRecommendations();
    }
  }, [userId, targetRole]);

  const handleGetRecommendations = async () => {
    try {
      const result = await getAIRecommendations.mutateAsync({
        userId,
        userProgress,
        currentSkills,
        targetRole,
        learningPreferences
      });
      setRecommendations(result);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'skill': return <TrendingUp className="h-4 w-4" />;
      case 'course': return <BookOpen className="h-4 w-4" />;
      case 'project': return <Rocket className="h-4 w-4" />;
      case 'networking': return <Users className="h-4 w-4" />;
      case 'certification': return <Award className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  if (isGettingRecommendations) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Generating AI Recommendations...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Career Recommendations
          </CardTitle>
          <CardDescription>
            Get personalized recommendations for your career journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGetRecommendations} className="w-full">
            Get AI Recommendations
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Your Personalized Career Recommendations
          </CardTitle>
          <CardDescription>
            AI-powered insights based on your skills, progress, and market trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {recommendations.immediateActions?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Immediate Actions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {recommendations.confidenceScore || 85}%
              </div>
              <p className="text-sm text-muted-foreground">Confidence Score</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {recommendations.refreshRecommended || '7 days'}
              </div>
              <p className="text-sm text-muted-foreground">Refresh In</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="immediate" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="immediate">Immediate</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="motivation">Progress</TabsTrigger>
        </TabsList>

        {/* Immediate Actions */}
        <TabsContent value="immediate">
          <Card>
            <CardHeader>
              <CardTitle>Immediate Action Items</CardTitle>
              <CardDescription>Priority tasks to focus on right now</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.immediateActions?.map((action: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(action.category)}
                        <h4 className="font-semibold">{action.title}</h4>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getPriorityColor(action.priority)}>
                          {action.priority}
                        </Badge>
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {action.estimatedTime}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {action.description}
                    </p>
                    <p className="text-xs text-muted-foreground italic">
                      {action.reasoning}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Recommendations */}
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Skill Development Roadmap</CardTitle>
              <CardDescription>Skills to develop and improve</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.skillRecommendations?.map((skill: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold">{skill.skill}</h4>
                      <div className="flex gap-2">
                        <Badge variant={getPriorityColor(skill.priority)}>
                          {skill.priority}
                        </Badge>
                        <Badge variant={skill.marketDemand === 'high' ? 'default' : 'secondary'}>
                          {skill.marketDemand} demand
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Current Level: {skill.currentLevel}/10</span>
                        <span>Target Level: {skill.targetLevel}/10</span>
                      </div>
                      <Progress value={(skill.currentLevel / 10) * 100} className="h-2" />
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {skill.learningPath}
                    </p>
                    
                    <div className="flex gap-2">
                      {skill.resources?.map((resource: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {resource}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Course Recommendations */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Courses</CardTitle>
              <CardDescription>Curated learning opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.courseRecommendations?.map((course: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{course.title}</h4>
                        <p className="text-sm text-muted-foreground">{course.provider}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="default">
                          {course.relevanceScore}% match
                        </Badge>
                        <Badge variant="outline">{course.duration}</Badge>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <Badge variant={course.difficulty === 'beginner' ? 'default' : 'secondary'}>
                        {course.difficulty}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {course.reasoning}
                    </p>
                    
                    {course.prerequisites?.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Prerequisites:</p>
                        <div className="flex gap-1 mt-1">
                          {course.prerequisites.map((prereq: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {prereq}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Suggestions */}
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Project Suggestions</CardTitle>
              <CardDescription>Hands-on projects to build your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.projectSuggestions?.map((project: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold">{project.title}</h4>
                      <div className="flex gap-2">
                        <Badge variant={project.portfolioValue === 'high' ? 'default' : 'secondary'}>
                          {project.portfolioValue} value
                        </Badge>
                        <Badge variant="outline">{project.estimatedTime}</Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {project.description}
                    </p>
                    
                    <div className="mb-2">
                      <Badge variant={project.complexity === 'simple' ? 'default' : 'secondary'}>
                        {project.complexity}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      {project.skills?.map((skill: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Networking Advice */}
        <TabsContent value="network">
          <Card>
            <CardHeader>
              <CardTitle>Networking Strategy</CardTitle>
              <CardDescription>Build your professional network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.networkingAdvice?.map((advice: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold">{advice.action}</h4>
                      <div className="flex gap-2">
                        <Badge variant="default">{advice.platform}</Badge>
                        <Badge variant="outline">{advice.frequency}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {advice.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Motivational Insights */}
        <TabsContent value="motivation">
          <Card>
            <CardHeader>
              <CardTitle>Progress & Motivation</CardTitle>
              <CardDescription>Your journey insights and encouragement</CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.motivationalInsights && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {recommendations.motivationalInsights.progress}
                    </div>
                    <p className="text-muted-foreground">
                      {recommendations.motivationalInsights.encouragement}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Your Strengths
                    </h4>
                    <div className="flex gap-2">
                      {recommendations.motivationalInsights.strengths?.map((strength: string, index: number) => (
                        <Badge key={index} variant="default">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Next Milestone
                    </h4>
                    <p className="text-muted-foreground">
                      {recommendations.motivationalInsights.nextMilestone}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Refresh Button */}
      <div className="text-center">
        <Button 
          onClick={handleGetRecommendations} 
          disabled={isGettingRecommendations}
          variant="outline"
        >
          Refresh Recommendations
        </Button>
      </div>
    </div>
  );
};

export default AIRecommendationsDashboard;