import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Briefcase,
  Star,
  ArrowRight,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Zap,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAIService } from '@/hooks/useAIService';
import { toast } from 'sonner';

interface AIRecommendation {
  id: string;
  user_id: string;
  recommendation_type: string;
  title: string;
  description: string;
  confidence_score: number;
  priority: number;
  metadata: any;
  is_viewed: boolean;
  is_dismissed: boolean;
  expires_at: string;
  created_at: string;
}

interface SkillGap {
  skill: string;
  importance: number;
  currentLevel: number;
  targetLevel: number;
  resources: string[];
}

interface CareerPath {
  title: string;
  description: string;
  steps: string[];
  timeframe: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  compatibility: number;
}

export function AIRecommendationEngine({ userId }: { userId?: string }) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  const queryClient = useQueryClient();
  const { analyzeCareerPath, isProcessing } = useAIService();
  const [selectedTab, setSelectedTab] = useState('recommendations');

  // Fetch AI recommendations
  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['ai-recommendations', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      
      const { data, error } = await supabase
        .from('ai_career_recommendations')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('is_dismissed', false)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AIRecommendation[];
    },
    enabled: !!targetUserId,
  });

  // Fetch user profile for AI analysis
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!targetUserId,
  });

  // Generate new recommendations
  const generateRecommendations = useMutation({
    mutationFn: async () => {
      if (!targetUserId || !userProfile) throw new Error('Missing data');

      const result = await analyzeCareerPath(userProfile, userProfile.title || 'Professional');
      
      if (result.success && result.data) {
        const aiData = result.data;
        
        // Create recommendations from AI analysis
        const newRecommendations = [
          {
            recommendation_type: 'skill_development',
            title: 'Skill Development Opportunity',
            description: aiData.recommendations?.[0] || 'Focus on developing high-demand skills in your field',
            confidence_score: 0.85,
            priority: 1,
            metadata: { analysis: aiData }
          },
          {
            recommendation_type: 'career_path',
            title: 'Career Path Guidance',
            description: aiData.next_steps?.[0] || 'Consider advancing to the next level in your career',
            confidence_score: 0.8,
            priority: 2,
            metadata: { analysis: aiData }
          }
        ];

        // Insert into database
        for (const rec of newRecommendations) {
          await supabase
            .from('ai_career_recommendations')
            .insert({
              user_id: targetUserId,
              ...rec,
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
            });
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations', targetUserId] });
      toast.success('New recommendations generated!');
    },
    onError: (error) => {
      toast.error('Failed to generate recommendations');
      console.error('Recommendation generation error:', error);
    }
  });

  // Mark recommendation as viewed/dismissed
  const updateRecommendation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AIRecommendation> }) => {
      const { error } = await supabase
        .from('ai_career_recommendations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations', targetUserId] });
    }
  });

  // Mock data for skill gaps and career paths (in real app, this would come from AI)
  const skillGaps: SkillGap[] = [
    {
      skill: 'Cloud Computing',
      importance: 95,
      currentLevel: 40,
      targetLevel: 80,
      resources: ['AWS Certification', 'Cloud Practitioner Course', 'Hands-on Projects']
    },
    {
      skill: 'Data Analysis',
      importance: 85,
      currentLevel: 60,
      targetLevel: 90,
      resources: ['Python for Data Science', 'Statistics Course', 'Kaggle Competitions']
    },
    {
      skill: 'Leadership',
      importance: 80,
      currentLevel: 50,
      targetLevel: 85,
      resources: ['Management Training', 'Team Leadership Workshop', 'Mentoring Program']
    }
  ];

  const careerPaths: CareerPath[] = [
    {
      title: 'Senior Software Engineer',
      description: 'Advance to a senior technical role with increased responsibilities',
      steps: [
        'Master advanced programming concepts',
        'Lead a major project',
        'Mentor junior developers',
        'Obtain cloud certifications'
      ],
      timeframe: '12-18 months',
      difficulty: 'Medium',
      compatibility: 92
    },
    {
      title: 'Technical Team Lead',
      description: 'Transition to a leadership role combining technical and management skills',
      steps: [
        'Develop leadership skills',
        'Take on team coordination',
        'Improve communication skills',
        'Complete management training'
      ],
      timeframe: '18-24 months',
      difficulty: 'Hard',
      compatibility: 78
    }
  ];

  if (isLoading) {
    return <div>Loading AI recommendations...</div>;
  }

  return (
    <div className="space-y-6">
      {/* AI Engine Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-purple-800">
                <Brain className="w-6 h-6 mr-2" />
                AI Career Assistant
              </CardTitle>
              <CardDescription className="text-purple-700">
                Personalized insights and recommendations powered by AI
              </CardDescription>
            </div>
            <Button 
              onClick={() => generateRecommendations.mutate()}
              disabled={generateRecommendations.isPending || isProcessing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {generateRecommendations.isPending || isProcessing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Generate New Insights
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* AI Recommendations Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="skills">Skill Gaps</TabsTrigger>
          <TabsTrigger value="paths">Career Paths</TabsTrigger>
          <TabsTrigger value="insights">Market Insights</TabsTrigger>
        </TabsList>

        {/* Active Recommendations */}
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>
                AI-generated suggestions to accelerate your career growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    onDismiss={() => updateRecommendation.mutate({
                      id: rec.id,
                      updates: { is_dismissed: true }
                    })}
                    onView={() => updateRecommendation.mutate({
                      id: rec.id,
                      updates: { is_viewed: true }
                    })}
                  />
                ))}
                
                {recommendations.length === 0 && (
                  <div className="text-center py-8">
                    <Lightbulb className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Generate AI-powered insights to get personalized career recommendations
                    </p>
                    <Button onClick={() => generateRecommendations.mutate()}>
                      <Brain className="w-4 h-4 mr-2" />
                      Generate Recommendations
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skill Gap Analysis */}
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Skill Gap Analysis</CardTitle>
              <CardDescription>
                Identify and bridge skill gaps to reach your career goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {skillGaps.map((gap, index) => (
                  <SkillGapCard key={index} skillGap={gap} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Career Path Suggestions */}
        <TabsContent value="paths">
          <Card>
            <CardHeader>
              <CardTitle>AI-Suggested Career Paths</CardTitle>
              <CardDescription>
                Explore potential career trajectories based on your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {careerPaths.map((path, index) => (
                  <CareerPathCard key={index} careerPath={path} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Insights */}
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Market Insights</CardTitle>
              <CardDescription>
                Real-time market trends and opportunities in your field
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Trending Skills:</strong> Cloud Computing, AI/ML, and Cybersecurity are seeing 40% growth in job demand this quarter.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Salary Trends:</strong> Professionals with your background are earning 15% more when they have cloud certifications.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Briefcase className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Job Market:</strong> Remote opportunities in your field have increased by 60% in the last year.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RecommendationCard({ 
  recommendation, 
  onDismiss, 
  onView 
}: {
  recommendation: AIRecommendation;
  onDismiss: () => void;
  onView: () => void;
}) {
  const priorityColor = recommendation.priority >= 3 ? 'destructive' : 
                       recommendation.priority >= 2 ? 'default' : 'secondary';
  
  const confidenceColor = recommendation.confidence_score >= 0.8 ? 'text-green-600' :
                         recommendation.confidence_score >= 0.6 ? 'text-yellow-600' : 'text-red-600';

  return (
    <Card className={`transition-all hover:shadow-md ${!recommendation.is_viewed ? 'ring-2 ring-blue-200' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold">{recommendation.title}</h4>
              <Badge variant={priorityColor} className="text-xs">
                Priority {recommendation.priority}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {recommendation.description}
            </p>
            <div className="flex items-center justify-between">
              <div className={`text-xs ${confidenceColor}`}>
                {Math.round(recommendation.confidence_score * 100)}% confidence
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onView}>
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Details
                </Button>
                <Button variant="ghost" size="sm" onClick={onDismiss}>
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SkillGapCard({ skillGap }: { skillGap: SkillGap }) {
  const progress = (skillGap.currentLevel / skillGap.targetLevel) * 100;
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-semibold">{skillGap.skill}</h4>
            <p className="text-sm text-muted-foreground">
              Importance: {skillGap.importance}% | Gap: {skillGap.targetLevel - skillGap.currentLevel} points
            </p>
          </div>
          <Badge variant="outline">
            {skillGap.currentLevel}/{skillGap.targetLevel}
          </Badge>
        </div>
        
        <Progress value={progress} className="mb-3" />
        
        <div>
          <h5 className="text-sm font-medium mb-2">Recommended Resources:</h5>
          <div className="flex flex-wrap gap-1">
            {skillGap.resources.map((resource, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {resource}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CareerPathCard({ careerPath }: { careerPath: CareerPath }) {
  const difficultyColor = {
    'Easy': 'text-green-600 bg-green-50',
    'Medium': 'text-yellow-600 bg-yellow-50',
    'Hard': 'text-red-600 bg-red-50'
  };

  return (
    <Card className="hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold">{careerPath.title}</h4>
            <p className="text-sm text-muted-foreground">{careerPath.description}</p>
          </div>
          <Badge className={difficultyColor[careerPath.difficulty]}>
            {careerPath.difficulty}
          </Badge>
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span>Compatibility</span>
            <span>{careerPath.compatibility}%</span>
          </div>
          <Progress value={careerPath.compatibility} />
        </div>
        
        <div className="space-y-2">
          <h5 className="text-sm font-medium">Key Steps:</h5>
          {careerPath.steps.slice(0, 3).map((step, idx) => (
            <div key={idx} className="flex items-center text-sm">
              <ArrowRight className="w-3 h-3 mr-2 text-muted-foreground" />
              {step}
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <span className="text-xs text-muted-foreground">
            <Clock className="w-3 h-3 inline mr-1" />
            {careerPath.timeframe}
          </span>
          <Button size="sm">
            Explore Path
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}