import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hash, TrendingUp, X, Plus } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

interface HashtagSystemProps {
  selectedTags?: string[];
  onTagsChange?: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
  className?: string;
}

interface TrendingTag {
  tag: string;
  usage_count: number;
  trending_score: number;
}

export const HashtagSystem: React.FC<HashtagSystemProps> = ({
  selectedTags = [],
  onTagsChange,
  maxTags = 5,
  placeholder = "Add hashtags to increase reach...",
  className
}) => {
  const [inputValue, setInputValue] = useState('');
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch trending hashtags
  useEffect(() => {
    const fetchTrendingTags = async () => {
      try {
        const { data, error } = await supabase
          .from('hashtags')
          .select('tag, usage_count, trending_score')
          .order('trending_score', { ascending: false })
          .limit(20);

        if (error) throw error;
        setTrendingTags(data || []);
      } catch (error) {
        console.error('Error fetching trending tags:', error);
      }
    };

    fetchTrendingTags();
  }, []);

  // Generate suggestions based on input
  useEffect(() => {
    if (inputValue.length > 1) {
      const filtered = trendingTags
        .filter(tag => 
          tag.tag.toLowerCase().includes(inputValue.toLowerCase()) &&
          !selectedTags.includes(tag.tag)
        )
        .map(tag => tag.tag)
        .slice(0, 5);
      
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, trendingTags, selectedTags]);

  const addTag = async (tag: string) => {
    const cleanTag = tag.replace('#', '').trim().toLowerCase();
    
    if (!cleanTag || selectedTags.includes(cleanTag) || selectedTags.length >= maxTags) {
      return;
    }

    const newTags = [...selectedTags, cleanTag];
    onTagsChange?.(newTags);
    setInputValue('');
    setSuggestions([]);

    // Update hashtag usage in database
    try {
      await supabase.rpc('increment_hashtag_usage', { tag_name: cleanTag });
    } catch (error) {
      console.error('Error updating hashtag usage:', error);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    onTagsChange?.(newTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const getTopTrending = () => {
    return trendingTags
      .filter(tag => !selectedTags.includes(tag.tag))
      .slice(0, 8);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Input Section */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="pl-10 border-primary/20 focus:border-primary"
              disabled={selectedTags.length >= maxTags}
            />
          </div>
          {inputValue && (
            <Button
              onClick={() => addTag(inputValue)}
              size="sm"
              disabled={selectedTags.length >= maxTags}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => addTag(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors flex items-center gap-2"
                >
                  <Hash className="h-3 w-3 text-muted-foreground" />
                  {suggestion}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {trendingTags.find(t => t.tag === suggestion)?.usage_count || 0}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {selectedTags.map((tag, index) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
              >
                <Badge 
                  variant="secondary" 
                  className="bg-primary/10 text-primary border-primary/20 pl-2 pr-1 py-1"
                >
                  #{tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTag(tag)}
                    className="h-4 w-4 p-0 ml-1 hover:bg-primary/20"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Usage Limit */}
      {maxTags && (
        <div className="text-xs text-muted-foreground">
          {selectedTags.length}/{maxTags} hashtags used
        </div>
      )}

      {/* Trending Tags */}
      {getTopTrending().length > 0 && (
        <Card className="border-0 bg-gradient-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Trending Now</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {getTopTrending().map((trendingTag, index) => (
                <motion.div
                  key={trendingTag.tag}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors border-primary/20"
                    onClick={() => addTag(trendingTag.tag)}
                  >
                    #{trendingTag.tag}
                    <span className="ml-1 text-xs opacity-70">
                      ({trendingTag.usage_count})
                    </span>
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};