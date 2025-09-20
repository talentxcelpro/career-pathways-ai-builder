import React, { useState, useEffect, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, MessageSquare, Heart, Share2, Bookmark, TrendingUp, Users, Clock, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface AIContentSuggestionProps {
  postContent?: string;
  userProfile?: any;
  onSuggestionApply: (suggestion: string) => void;
}

interface ContentSuggestion {
  type: 'caption' | 'hashtags' | 'engagement' | 'timing';
  title: string;
  suggestion: string;
  confidence: number;
}

export const AIContentSuggestion: React.FC<AIContentSuggestionProps> = memo(({
  postContent = '',
  userProfile,
  onSuggestionApply
}) => {
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Generate AI-powered content suggestions
  const generateSuggestions = useMutation({
    mutationFn: async ({ content, topic }: { content: string; topic: string }) => {
      const { data, error } = await supabase.functions.invoke('ai-content-suggestions', {
        body: {
          content,
          topic,
          userProfile: {
            title: userProfile?.title || '',
            industry: userProfile?.industry || '',
            skills: userProfile?.skills || []
          }
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setSuggestions(data.suggestions || []);
      toast.success('AI suggestions generated successfully!');
    },
    onError: (error) => {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate suggestions');
    }
  });

  // Smart hashtag generation
  const generateHashtags = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase.functions.invoke('ai-hashtag-generator', {
        body: {
          content,
          industry: userProfile?.industry || '',
          trendingTopics: true
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const hashtags = data.hashtags?.join(' ') || '';
      onSuggestionApply(`${postContent} ${hashtags}`);
      toast.success('Smart hashtags added!');
    }
  });

  // Engagement optimization suggestions
  const optimizeEngagement = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase.functions.invoke('ai-engagement-optimizer', {
        body: {
          content,
          postType: 'professional',
          targetAudience: userProfile?.industry || 'general'
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      onSuggestionApply(data.optimizedContent || postContent);
      toast.success('Content optimized for engagement!');
    }
  });

  const handleGenerateSuggestions = () => {
    generateSuggestions.mutate({ content: postContent, topic: selectedTopic });
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-700">
          <Sparkles className="w-5 h-5" />
          AI Content Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Topic Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Content Focus</label>
          <Input
            placeholder="e.g., career growth, industry insights, team collaboration"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="border-purple-200 focus:border-purple-400"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Button
            onClick={handleGenerateSuggestions}
            disabled={generateSuggestions.isPending}
            variant="outline"
            size="sm"
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            Generate Ideas
          </Button>

          <Button
            onClick={() => generateHashtags.mutate(postContent)}
            disabled={generateHashtags.isPending || !postContent}
            variant="outline"
            size="sm"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Smart Hashtags
          </Button>

          <Button
            onClick={() => optimizeEngagement.mutate(postContent)}
            disabled={optimizeEngagement.isPending || !postContent}
            variant="outline"
            size="sm"
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            <Users className="w-4 h-4 mr-1" />
            Optimize
          </Button>
        </div>

        {/* Generated Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">AI Suggestions</h4>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer"
                onClick={() => onSuggestionApply(suggestion.suggestion)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.type}
                      </Badge>
                      <Badge 
                        variant={suggestion.confidence > 0.8 ? "default" : "outline"}
                        className="text-xs"
                      >
                        {Math.round(suggestion.confidence * 100)}% match
                      </Badge>
                    </div>
                    <h5 className="font-medium text-sm text-gray-900 mb-1">
                      {suggestion.title}
                    </h5>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {suggestion.suggestion}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" className="ml-2">
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Tips */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <h5 className="font-medium text-sm text-gray-900 mb-2">💡 Pro Tips</h5>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>• Posts with questions get 2x more engagement</li>
            <li>• Best posting times: 8-10 AM and 12-2 PM</li>
            <li>• Use 3-5 relevant hashtags for optimal reach</li>
            <li>• Include a call-to-action to encourage interaction</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
});

AIContentSuggestion.displayName = 'AIContentSuggestion';