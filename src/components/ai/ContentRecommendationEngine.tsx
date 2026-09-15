import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Bookmark, TrendingUp, Users, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ContentRecommendation {
  id: string;
  content_type: 'post' | 'user' | 'job' | 'event';
  content_id: string;
  recommendation_type: 'trending' | 'personalized' | 'similar' | 'network';
  score: number;
  confidence_level: 'low' | 'medium' | 'high';
  reasoning: any;
  content?: any;
}

interface RecommendationProps {
  recommendation: ContentRecommendation;
  onInteraction: (type: string, contentId: string) => void;
}

const RecommendationCard: React.FC<RecommendationProps> = ({ 
  recommendation, 
  onInteraction 
}) => {
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'trending': return <TrendingUp className="w-4 h-4" />;
      case 'personalized': return <Zap className="w-4 h-4" />;
      case 'similar': return <Heart className="w-4 h-4" />;
      case 'network': return <Users className="w-4 h-4" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getRecommendationIcon(recommendation.recommendation_type)}
            <span className="text-sm font-medium capitalize">
              {recommendation.recommendation_type}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={getConfidenceColor(recommendation.confidence_level)}
            >
              {recommendation.confidence_level} confidence
            </Badge>
            <Badge variant="outline">
              {Math.round(recommendation.score * 100)}% match
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {recommendation.content_type === 'post' && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">John Doe</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            
            <p className="text-sm">
              Just launched our new AI-powered analytics dashboard! 
              The insights we're getting are incredible. 
              #AI #Analytics #ProductLaunch
            </p>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onInteraction('like', recommendation.content_id)}
                >
                  <Heart className="w-4 h-4 mr-1" />
                  24
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onInteraction('comment', recommendation.content_id)}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  8
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onInteraction('share', recommendation.content_id)}
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  3
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onInteraction('bookmark', recommendation.content_id)}
              >
                <Bookmark className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {recommendation.content_type === 'user' && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-medium">Jane Smith</h4>
                <p className="text-sm text-muted-foreground">
                  Senior Data Scientist at TechCorp
                </p>
                <p className="text-xs text-muted-foreground">
                  500+ connections • 2nd degree
                </p>
              </div>
            </div>
            
            <p className="text-sm">
              Recommended based on your interest in machine learning and data science.
            </p>

            <Button 
              className="w-full"
              onClick={() => onInteraction('connect', recommendation.content_id)}
            >
              Connect
            </Button>
          </div>
        )}

        {recommendation.content_type === 'job' && (
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">Senior Frontend Developer</h4>
              <p className="text-sm text-muted-foreground">
                TechStartup Inc. • Remote • $90k-$120k
              </p>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {['React', 'TypeScript', 'Node.js'].map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Matches your skills and experience level
            </p>

            <Button 
              className="w-full"
              onClick={() => onInteraction('apply', recommendation.content_id)}
            >
              View Job
            </Button>
          </div>
        )}

        {recommendation.reasoning?.reasons && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Why recommended: {recommendation.reasoning.reasons.slice(0, 2).join(', ')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const ContentRecommendationEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState('personalized');

  // Fetch recommendations
  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['content-recommendations', activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_recommendations')
        .select('*')
        .eq('recommendation_type', activeTab)
        .order('score', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    }
  });

  const handleInteraction = async (type: string, contentId: string) => {
    // Track user interaction for ML feedback
    try {
      await supabase
        .from('user_content_signals')
        .insert({
          content_type: 'recommendation',
          content_id: contentId,
          signal_type: type,
          signal_strength: type === 'like' ? 1.0 : type === 'skip' ? -0.5 : 0.8
        });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Recommended for You</h2>
        <p className="text-muted-foreground">
          AI-powered content recommendations based on your interests and network
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personalized">For You</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="similar">Similar</TabsTrigger>
        </TabsList>

        <TabsContent value="personalized" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onInteraction={handleInteraction}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onInteraction={handleInteraction}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="network" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onInteraction={handleInteraction}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="similar" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onInteraction={handleInteraction}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-64">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};