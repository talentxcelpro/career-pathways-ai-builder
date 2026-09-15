import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { TrendingUp, Sparkles, RefreshCw, Loader2, Hash, Target, Copy, Plus } from 'lucide-react';

interface TrendingTopic {
  topicName: string;
  description: string;
  relevanceScore: number;
  hashtags: string[];
  contentAngle: string;
  trendReason: string;
}

interface EnhancedTrendingTopicsProps {
  onTopicSelect?: (topic: TrendingTopic) => void;
  onHashtagSelect?: (hashtag: string) => void;
  userInterests?: string[];
  industry?: string;
}

export const EnhancedTrendingTopics: React.FC<EnhancedTrendingTopicsProps> = ({
  onTopicSelect,
  onHashtagSelect,
  userInterests = [],
  industry = 'Technology'
}) => {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TrendingTopic | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchTrendingTopics = async () => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get user profile for context
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      const { data: response, error } = await supabase.functions.invoke('ai-trending-topics', {
        body: {
          userId: user?.id,
          userInterests: userInterests.length > 0 ? userInterests : userProfile?.career_interests || [],
          userIndustry: industry || userProfile?.industry,
          timeframe: 'week'
        }
      });

      if (error) throw error;

      if (response?.topics && response.topics.length > 0) {
        setTopics(response.topics);
        setLastUpdated(response.generatedAt);
      } else {
        throw new Error('No topics received');
      }

    } catch (error) {
      console.error('Trending topics error:', error);
      
      // Fallback topics
      const fallbackTopics: TrendingTopic[] = [
        {
          topicName: "AI in Workplace",
          description: "How artificial intelligence is transforming professional workflows and productivity.",
          relevanceScore: 9,
          hashtags: ["#AI", "#Productivity", "#FutureOfWork"],
          contentAngle: "Share your experience with AI tools in your daily work",
          trendReason: "Growing adoption of AI tools across industries"
        },
        {
          topicName: "Remote Work Evolution",
          description: "The changing landscape of remote and hybrid work arrangements.",
          relevanceScore: 8,
          hashtags: ["#RemoteWork", "#WorkFromHome", "#HybridWork"],
          contentAngle: "Discuss remote work best practices and challenges",
          trendReason: "Post-pandemic workplace transformation"
        },
        {
          topicName: "Professional Development",
          description: "Continuous learning and skill enhancement strategies for career growth.",
          relevanceScore: 8,
          hashtags: ["#ProfessionalDevelopment", "#Learning", "#CareerGrowth"],
          contentAngle: "Share your learning journey and skill-building strategies",
          trendReason: "Increased focus on lifelong learning"
        },
        {
          topicName: "Leadership Insights",
          description: "Modern leadership approaches and team management strategies.",
          relevanceScore: 7,
          hashtags: ["#Leadership", "#Management", "#TeamBuilding"],
          contentAngle: "Share leadership lessons and team management experiences",
          trendReason: "Evolving leadership styles in modern workplaces"
        },
        {
          topicName: "Industry Innovation",
          description: "Breakthrough innovations and emerging technologies in your field.",
          relevanceScore: 8,
          hashtags: ["#Innovation", "#Technology", "#Industry"],
          contentAngle: "Discuss how innovation is impacting your industry",
          trendReason: "Rapid technological advancement across sectors"
        }
      ];
      
      setTopics(fallbackTopics);
      setLastUpdated(new Date().toISOString());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingTopics();
  }, []);

  const handleTopicClick = (topic: TrendingTopic) => {
    setSelectedTopic(topic);
    onTopicSelect?.(topic);
  };

  const handleHashtagClick = (hashtag: string) => {
    onHashtagSelect?.(hashtag);
    toast.success(`Added ${hashtag} to your post!`);
  };

  const copyContentAngle = async (contentAngle: string) => {
    try {
      await navigator.clipboard.writeText(contentAngle);
      toast.success('Content angle copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy content angle');
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-800';
    if (score >= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            Trending Topics
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTrendingTopics}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          AI-powered trending topics personalized for your industry
        </p>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {topics.length > 0 ? (
          <div className="space-y-3">
            {topics.slice(0, 6).map((topic, index) => (
              <Card 
                key={index} 
                className={`bg-white cursor-pointer transition-all hover:shadow-md ${
                  selectedTopic?.topicName === topic.topicName ? 'ring-2 ring-indigo-500' : ''
                }`}
                onClick={() => handleTopicClick(topic)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{topic.topicName}</h4>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getRelevanceColor(topic.relevanceScore)}`}
                          >
                            {topic.relevanceScore}/10
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{topic.description}</p>
                        <p className="text-xs text-indigo-600 mb-2">
                          <strong>Why trending:</strong> {topic.trendReason}
                        </p>
                      </div>
                    </div>
                    
                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-1">
                      {topic.hashtags.map((hashtag, hashIndex) => (
                        <Badge
                          key={hashIndex}
                          variant="outline"
                          className="text-xs cursor-pointer hover:bg-indigo-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHashtagClick(hashtag);
                          }}
                        >
                          <Hash className="h-3 w-3 mr-1" />
                          {hashtag.replace('#', '')}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Content Angle */}
                    <div className="bg-indigo-50 p-2 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-indigo-800 mb-1">Content Angle:</p>
                          <p className="text-xs text-indigo-700">{topic.contentAngle}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyContentAngle(topic.contentAngle);
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No trending topics available</p>
            <Button onClick={fetchTrendingTopics} disabled={isLoading}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Topics
            </Button>
          </div>
        )}

        {/* Quick Tips */}
        <div className="bg-white/50 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-gray-800 mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Pro Tips:
          </h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Click on topics to get detailed content suggestions</li>
            <li>• Use hashtags to increase your post visibility</li>
            <li>• Follow the content angle for maximum engagement</li>
            <li>• Share your unique perspective on trending topics</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};