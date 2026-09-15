import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hash, Plus, X, Sparkles, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface HashtagAssistantProps {
  content: string;
  userRole?: string;
  userSkills?: string[];
  onHashtagsSelect: (hashtags: string[]) => void;
  selectedHashtags: string[];
}

export const HashtagAssistant: React.FC<HashtagAssistantProps> = ({
  content,
  userRole,
  userSkills = [],
  onHashtagsSelect,
  selectedHashtags
}) => {
  const [customHashtag, setCustomHashtag] = useState('');

  // Get AI-generated hashtag suggestions
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['hashtag-suggestions', content, userRole],
    queryFn: async () => {
      if (!content.trim()) return [];
      
      // Generate suggestions based on content and user profile
      const roleBasedTags = {
        'Software Developer': ['#coding', '#programming', '#techlife', '#developer', '#softwaredev'],
        'Marketing Manager': ['#marketing', '#digitalmarketing', '#strategy', '#branding', '#growth'],
        'Product Manager': ['#product', '#productmanagement', '#innovation', '#strategy', '#agile'],
        'Data Scientist': ['#datascience', '#analytics', '#machinelearning', '#ai', '#bigdata'],
        'Designer': ['#design', '#ux', '#ui', '#creativity', '#userexperience']
      };

      const skillBasedTags = userSkills.map(skill => `#${skill.toLowerCase().replace(/\s+/g, '')}`);
      
      const contentKeywords = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
      const contentTags = contentKeywords
        .filter((word: string) => word.length > 4)
        .slice(0, 3)
        .map(word => `#${word}`);

      const roleTags = roleBasedTags[userRole as keyof typeof roleBasedTags] || [];
      
      return [
        ...roleTags,
        ...skillBasedTags.slice(0, 3),
        ...contentTags,
        '#career', '#professional', '#networking', '#growth'
      ].slice(0, 12);
    },
    enabled: !!content.trim()
  });

  const handleHashtagToggle = (hashtag: string) => {
    const newSelection = selectedHashtags.includes(hashtag)
      ? selectedHashtags.filter(h => h !== hashtag)
      : [...selectedHashtags, hashtag];
    
    onHashtagsSelect(newSelection);
  };

  const handleAddCustomHashtag = () => {
    if (customHashtag.trim() && !selectedHashtags.includes(`#${customHashtag}`)) {
      const newTag = customHashtag.startsWith('#') ? customHashtag : `#${customHashtag}`;
      onHashtagsSelect([...selectedHashtags, newTag]);
      setCustomHashtag('');
    }
  };

  const trendingHashtags = ['#mondaymotivation', '#techtuesday', '#wednesdaywisdom', '#throwbackthursday', '#fridayfeeling'];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Hash className="h-4 w-4" />
          Hashtag Assistant
          <Sparkles className="h-3 w-3 text-yellow-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">AI Suggestions</h4>
            <div className="flex flex-wrap gap-1">
              {suggestions.map((hashtag, index) => (
                <Badge
                  key={index}
                  variant={selectedHashtags.includes(hashtag) ? "default" : "outline"}
                  className="cursor-pointer text-xs hover:bg-primary/10"
                  onClick={() => handleHashtagToggle(hashtag)}
                >
                  {hashtag}
                  {selectedHashtags.includes(hashtag) && (
                    <X className="h-2 w-2 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Trending Tags */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Trending This Week
          </h4>
          <div className="flex flex-wrap gap-1">
            {trendingHashtags.map((hashtag, index) => (
              <Badge
                key={index}
                variant={selectedHashtags.includes(hashtag) ? "default" : "outline"}
                className="cursor-pointer text-xs hover:bg-primary/10"
                onClick={() => handleHashtagToggle(hashtag)}
              >
                {hashtag}
                {selectedHashtags.includes(hashtag) && (
                  <X className="h-2 w-2 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Custom Hashtag Input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add custom hashtag..."
            value={customHashtag}
            onChange={(e) => setCustomHashtag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomHashtag()}
            className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button
            size="sm"
            onClick={handleAddCustomHashtag}
            disabled={!customHashtag.trim()}
            className="h-8 px-2"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Selected Hashtags */}
        {selectedHashtags.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">
              Selected ({selectedHashtags.length}/30)
            </h4>
            <div className="flex flex-wrap gap-1">
              {selectedHashtags.map((hashtag, index) => (
                <Badge
                  key={index}
                  variant="default"
                  className="cursor-pointer text-xs"
                  onClick={() => handleHashtagToggle(hashtag)}
                >
                  {hashtag}
                  <X className="h-2 w-2 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {selectedHashtags.length > 10 && (
          <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
            💡 Consider using fewer hashtags (5-10) for better engagement
          </div>
        )}
      </CardContent>
    </Card>
  );
};