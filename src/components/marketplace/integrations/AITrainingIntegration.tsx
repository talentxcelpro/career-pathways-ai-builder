import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Brain, BookOpen, Target, TrendingUp, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface AITrainingRecommendation {
  id: string;
  title: string;
  description: string;
  aiModel: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  skills: string[];
  relevanceScore: number;
  serviceId?: string;
}

interface AITrainingIntegrationProps {
  userSkills: string[];
  careerGoals?: string[];
  onServiceRecommend: (serviceId: string) => void;
}

export const AITrainingIntegration: React.FC<AITrainingIntegrationProps> = ({
  userSkills,
  careerGoals = [],
  onServiceRecommend
}) => {
  const [recommendations, setRecommendations] = useState<AITrainingRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [trainingModels, setTrainingModels] = useState<any[]>([]);

  useEffect(() => {
    fetchAITrainingData();
  }, [userSkills, careerGoals]);

  const fetchAITrainingData = async () => {
    try {
      setLoading(true);

      // Fetch AI models for training recommendations
      const { data: models, error: modelsError } = await supabase
        .from('ai_models')
        .select('*')
        .eq('is_active', true)
        .in('task_type', ['skill_analysis', 'career_guidance', 'content_generation']);

      if (modelsError) throw modelsError;
      setTrainingModels(models || []);

      // Generate AI-powered training recommendations
      const trainingRecommendations = generateTrainingRecommendations(userSkills, careerGoals);
      setRecommendations(trainingRecommendations);

    } catch (error) {
      console.error('Error fetching AI training data:', error);
      toast.error('Failed to load AI training recommendations');
    } finally {
      setLoading(false);
    }
  };

  const generateTrainingRecommendations = (skills: string[], goals: string[]): AITrainingRecommendation[] => {
    // AI-powered recommendation logic based on user profile
    const baseRecommendations: AITrainingRecommendation[] = [
      {
        id: '1',
        title: 'AI-Powered Resume Optimization',
        description: 'Learn to use AI models for resume enhancement and ATS optimization',
        aiModel: 'resume_enhancement_v2',
        difficulty: 'intermediate',
        duration: '2 weeks',
        skills: ['AI Tools', 'Resume Writing', 'ATS Optimization'],
        relevanceScore: 0,
        serviceId: 'ai-resume-service'
      },
      {
        id: '2',
        title: 'Machine Learning for Job Matching',
        description: 'Understand how ML algorithms match candidates to job opportunities',
        aiModel: 'job_matching_v3',
        difficulty: 'advanced',
        duration: '4 weeks',
        skills: ['Machine Learning', 'Data Analysis', 'Python'],
        relevanceScore: 0,
        serviceId: 'ml-job-matching'
      },
      {
        id: '3',
        title: 'Career Path AI Analytics',
        description: 'Use AI to analyze and predict optimal career trajectories',
        aiModel: 'career_analysis_v1',
        difficulty: 'intermediate',
        duration: '3 weeks',
        skills: ['Data Analytics', 'Career Planning', 'AI Insights'],
        relevanceScore: 0,
        serviceId: 'career-analytics'
      },
      {
        id: '4',
        title: 'Natural Language Processing for Recruitment',
        description: 'Apply NLP techniques to recruitment and candidate screening',
        aiModel: 'nlp_recruitment_v2',
        difficulty: 'advanced',
        duration: '5 weeks',
        skills: ['NLP', 'Python', 'Text Analysis', 'Recruitment'],
        relevanceScore: 0,
        serviceId: 'nlp-recruitment'
      }
    ];

    // Calculate relevance scores based on user skills and goals
    return baseRecommendations.map(rec => ({
      ...rec,
      relevanceScore: calculateRelevanceScore(rec, skills, goals)
    })).sort((a, b) => b.relevanceScore - a.relevanceScore);
  };

  const calculateRelevanceScore = (
    recommendation: AITrainingRecommendation,
    userSkills: string[],
    goals: string[]
  ): number => {
    let score = 0;

    // Skill matching (40% weight)
    const skillMatches = recommendation.skills.filter(skill => 
      userSkills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    ).length;
    score += (skillMatches / recommendation.skills.length) * 40;

    // Career goal alignment (30% weight)
    const goalAlignment = goals.some(goal =>
      recommendation.title.toLowerCase().includes(goal.toLowerCase()) ||
      recommendation.description.toLowerCase().includes(goal.toLowerCase())
    ) ? 30 : 0;
    score += goalAlignment;

    // Difficulty appropriateness (20% weight)
    const difficultyScore = userSkills.length > 5 ? 
      (recommendation.difficulty === 'advanced' ? 20 : 15) :
      (recommendation.difficulty === 'beginner' ? 20 : 10);
    score += difficultyScore;

    // Base relevance (10% weight)
    score += 10;

    return Math.min(score, 100);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Training Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Training Center Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Training Center Integration
          </CardTitle>
          <CardDescription>
            Personalized AI/ML training recommendations based on your skills and career goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{trainingModels.length}</div>
              <div className="text-sm text-gray-600">AI Models Available</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{recommendations.length}</div>
              <div className="text-sm text-gray-600">Personalized Courses</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(recommendations.reduce((acc, rec) => acc + rec.relevanceScore, 0) / recommendations.length)}%
              </div>
              <div className="text-sm text-gray-600">Avg. Relevance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Training Programs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Recommended Training Programs
        </h3>
        
        {recommendations.map((recommendation) => (
          <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-2">{recommendation.title}</h4>
                  <p className="text-gray-600 mb-3">{recommendation.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span>🤖 {recommendation.aiModel}</span>
                    <span>⏱️ {recommendation.duration}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={getDifficultyColor(recommendation.difficulty)}>
                      {recommendation.difficulty}
                    </Badge>
                    {recommendation.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className="text-sm text-gray-500 mb-1">Relevance Score</div>
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {Math.round(recommendation.relevanceScore)}%
                  </div>
                  <Progress value={recommendation.relevanceScore} className="w-20 mb-3" />
                  
                  {recommendation.serviceId && (
                    <Button
                      size="sm"
                      onClick={() => onServiceRecommend(recommendation.serviceId!)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      Find Service
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};