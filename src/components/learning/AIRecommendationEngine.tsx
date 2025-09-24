import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';
import {
  Brain,
  Target,
  TrendingUp,
  Star,
  BookOpen,
  Users,
  Clock,
  Award,
  Lightbulb,
  BarChart3,
  Zap,
  Filter
} from 'lucide-react';

export const AIRecommendationEngine: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const { 
    personalizedRecommendations,
    skillGapAnalysis,
    careerPathSuggestions,
    trendingCourses,
    collaborativeFiltering,
    isLoading,
    refreshRecommendations
  } = useAIRecommendations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI Recommendation Engine
          </h1>
          <p className="text-muted-foreground mt-2">
            Personalized learning paths powered by advanced machine learning
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={refreshRecommendations}>
            <Zap className="h-4 w-4 mr-2" />
            Refresh AI
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Customize
          </Button>
        </div>
      </div>

      {/* AI Insights Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Confidence Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">94%</div>
            <p className="text-sm text-muted-foreground">
              High accuracy in recommendations based on your learning patterns
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-secondary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-secondary" />
              Skills to Master
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">7</div>
            <p className="text-sm text-muted-foreground">
              Key skills identified for your career advancement
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Learning Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">2.3x</div>
            <p className="text-sm text-muted-foreground">
              Faster learning with AI-optimized content sequence
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="personalized" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personalized">Personalized</TabsTrigger>
          <TabsTrigger value="skills">Skills Gap</TabsTrigger>
          <TabsTrigger value="career">Career Paths</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="social">Social Learning</TabsTrigger>
        </TabsList>

        <TabsContent value="personalized" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Recommended for You
              </CardTitle>
              <CardDescription>
                AI-curated courses based on your learning history and goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {personalizedRecommendations?.map((course, index) => (
                  <Card key={index} className="relative overflow-hidden">
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {course.aiScore}% match
                      </Badge>
                    </div>
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{course.instructor_name}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{course.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-current text-yellow-500" />
                          {course.rating}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.enrolled}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Relevance Score</span>
                          <span className="font-medium">{course.relevanceScore}%</span>
                        </div>
                        <Progress value={course.relevanceScore} className="h-2" />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {course.skills?.map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button className="flex-1">Start Learning</Button>
                        <Button variant="outline" size="sm">
                          <Award className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-secondary" />
                Skills Gap Analysis
              </CardTitle>
              <CardDescription>
                AI-identified skills gaps and recommended learning paths
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {skillGapAnalysis?.map((gap, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{gap.skill}</h3>
                        <p className="text-sm text-muted-foreground">{gap.category}</p>
                      </div>
                      <Badge 
                        variant={gap.priority === 'high' ? 'destructive' : 
                                gap.priority === 'medium' ? 'default' : 'secondary'}
                      >
                        {gap.priority} priority
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Current Level</div>
                        <div className="font-medium">{gap.currentLevel}/10</div>
                        <Progress value={gap.currentLevel * 10} className="h-2 mt-1" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Target Level</div>
                        <div className="font-medium">{gap.targetLevel}/10</div>
                        <Progress value={gap.targetLevel * 10} className="h-2 mt-1" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Market Demand</div>
                        <div className="font-medium">{gap.marketDemand}%</div>
                        <Progress value={gap.marketDemand} className="h-2 mt-1" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm font-medium">Recommended Courses:</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {gap.recommendedCourses?.map((course, courseIndex) => (
                          <div key={courseIndex} className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{course.title}</div>
                              <div className="text-xs text-muted-foreground">{course.duration}</div>
                            </div>
                            <Button size="sm" variant="outline">View</Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="career" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" />
                AI-Powered Career Paths
              </CardTitle>
              <CardDescription>
                Personalized career progression recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {careerPathSuggestions?.map((path, index) => (
                  <Card key={index} className="relative">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{path.title}</CardTitle>
                          <p className="text-muted-foreground">{path.description}</p>
                        </div>
                        <Badge variant="outline">
                          {path.timeToComplete} to complete
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Success Probability</div>
                          <div className="text-2xl font-bold text-green-600">{path.successProbability}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Salary Range</div>
                          <div className="text-2xl font-bold">{path.salaryRange}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Job Openings</div>
                          <div className="text-2xl font-bold text-primary">{path.jobOpenings}</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="text-sm font-medium">Learning Path:</div>
                        <div className="space-y-2">
                          {path.milestones?.map((milestone, milestoneIndex) => (
                            <div key={milestoneIndex} className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                milestone.completed ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                              }`}>
                                {milestoneIndex + 1}
                              </div>
                              <div className="flex-1">
                                <div className={`font-medium ${milestone.completed ? 'line-through' : ''}`}>
                                  {milestone.title}
                                </div>
                                <div className="text-sm text-muted-foreground">{milestone.description}</div>
                              </div>
                              <Badge variant={milestone.completed ? 'default' : 'outline'}>
                                {milestone.duration}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button className="w-full">Start This Path</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Trending & Popular Courses
              </CardTitle>
              <CardDescription>
                Courses gaining momentum in your industry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingCourses?.map((course, index) => (
                  <Card key={index} className="relative overflow-hidden">
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-red-500 text-white">
                        🔥 Trending
                      </Badge>
                    </div>
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-primary/60" />
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{course.instructor_name}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Popularity</span>
                        <span className="font-medium">+{course.growthRate}% this week</span>
                      </div>
                      <Progress value={course.popularityScore} className="h-2" />
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.enrolled}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-current text-yellow-500" />
                          {course.rating}
                        </div>
                      </div>

                      <Button className="w-full">Join Trend</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-secondary" />
                Social Learning Recommendations
              </CardTitle>
              <CardDescription>
                Courses your peers and similar learners are taking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {collaborativeFiltering?.map((group, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{group.title}</h3>
                        <p className="text-sm text-muted-foreground">{group.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {group.courses?.map((course, courseIndex) => (
                        <div key={courseIndex} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-10 h-10 rounded bg-secondary/10 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-secondary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{course.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {course.peersEnrolled} peers enrolled
                            </div>
                          </div>
                          <Button size="sm" variant="outline">Join</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};