import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  MapPin, 
  Hash, 
  Smile, 
  ImagePlus, 
  Video, 
  FileText,
  Globe,
  Users,
  Lock,
  Sparkles,
  Target,
  TrendingUp,
  MessageSquare,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AIScore {
  score: number;
  tone: string;
  ctaStrength: number;
  hashtagRelevance: number;
  viralityPotential: number;
}

interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video';
  file: File;
}

interface EnhancedCreatePostProps {
  onPostCreate?: (post: any) => void;
}

export const EnhancedCreatePost: React.FC<EnhancedCreatePostProps> = ({ onPostCreate }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'text' | 'article'>('text');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [location, setLocation] = useState('');
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<'public' | 'connections' | 'private'>('public');
  const [isPosting, setIsPosting] = useState(false);
  const [aiScore, setAiScore] = useState<AIScore>({
    score: 0,
    tone: 'neutral',
    ctaStrength: 0,
    hashtagRelevance: 0,
    viralityPotential: 0
  });

  const popularHashtags = [
    '#CareerGrowth', '#JobSearch', '#Networking', '#Leadership', 
    '#Innovation', '#Technology', '#Remote', '#AI', '#Success', '#Motivation'
  ];

  const emojiReactions = ['😊', '🎉', '💪', '🚀', '💡', '🔥', '👏', '❤️'];

  const analyzeContent = (text: string) => {
    const words = text.split(' ').length;
    const hasHashtags = selectedHashtags.length > 0;
    const hasEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(text);
    const hasQuestion = text.includes('?');
    const hasCTA = /\b(check out|learn more|read|visit|join|follow|share|comment)\b/i.test(text);
    
    const baseScore = Math.min(words * 2, 100);
    let score = baseScore;
    
    if (hasHashtags) score += 15;
    if (hasEmoji) score += 10;
    if (hasQuestion) score += 10;
    if (hasCTA) score += 20;
    
    score = Math.min(score, 100);
    
    const tone = hasEmoji ? 'friendly' : hasQuestion ? 'engaging' : 'professional';
    const ctaStrength = hasCTA ? 80 : hasQuestion ? 60 : 20;
    const hashtagRelevance = hasHashtags ? 85 : 0;
    const viralityPotential = hasEmoji && hasHashtags && hasCTA ? 90 : 45;
    
    setAiScore({
      score,
      tone,
      ctaStrength,
      hashtagRelevance,
      viralityPotential
    });
  };

  useEffect(() => {
    if (content) {
      analyzeContent(content);
    }
  }, [content, selectedHashtags]);

  const handleHashtagClick = (hashtag: string) => {
    if (selectedHashtags.includes(hashtag)) {
      setSelectedHashtags(prev => prev.filter(h => h !== hashtag));
    } else {
      setSelectedHashtags(prev => [...prev, hashtag]);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setContent(prev => prev + emoji);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please write something before posting');
      return;
    }

    if (!user?.id) {
      toast.error('You must be logged in to create a post');
      return;
    }

    setIsPosting(true);
    try {
      // Combine content with hashtags
      const fullContent = content + (selectedHashtags.length > 0 ? '\n\n' + selectedHashtags.join(' ') : '');
      console.log('Creating post with user:', user?.id);
      console.log('Post content:', content);
      console.log('Post type:', postType);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      if (!content.trim()) {
        throw new Error('Post content is required');
      }
      
      const { data: postData, error } = await supabase
        .from('posts')
        .insert({
          content: fullContent,
          post_type: postType,
          author_id: user.id,
          media_urls: mediaFiles.map(file => file.url),
          location: location || null,
          is_public: privacy === 'public',
          tags: selectedHashtags.map(tag => tag.replace('#', ''))
        })
        .select()
        .single();

      if (error) {
        console.error('Database error creating post:', error);
        throw error;
      }

      console.log('Post created successfully:', postData);

      // Save AI score
      if (postData?.id) {
        try {
          await supabase
            .from('posts_ai_scores')
            .insert({
              post_id: postData.id,
              user_id: user.id,
              score: aiScore.score,
              tone: aiScore.tone,
              cta_strength: aiScore.ctaStrength,
              hashtag_relevance: aiScore.hashtagRelevance,
              virality_potential: aiScore.viralityPotential
            });
        } catch (scoreError) {
          console.warn('Failed to save AI score:', scoreError);
          // Don't throw here as the post was created successfully
        }
      }

      onPostCreate?.(postData);
      
      // Reset form
      setContent('');
      setPostType('text');
      setMediaFiles([]);
      setLocation('');
      setSelectedHashtags([]);
      setPrivacy('public');
      setAiScore({
        score: 0,
        tone: 'neutral',
        ctaStrength: 0,
        hashtagRelevance: 0,
        viralityPotential: 0
      });
      
      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to create post: ${errorMessage}`);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex gap-2 mb-3">
              <Button
                variant={postType === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPostType('text')}
                className="flex items-center gap-1"
              >
                <MessageSquare className="h-4 w-4" />
                Post
              </Button>
              <Button
                variant={postType === 'article' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPostType('article')}
                className="flex items-center gap-1"
              >
                <FileText className="h-4 w-4" />
                Article
              </Button>
            </div>
            
            <Textarea
              placeholder={postType === 'article' ? "Write your article..." : "What's on your mind?"}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none border-0 p-0 text-lg placeholder:text-muted-foreground focus-visible:ring-0"
            />
          </div>
        </div>

        {/* AI Analysis Panel */}
        {content && (
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-sm">AI Content Analysis</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Overall Score</span>
                  <span className="text-xs font-medium">{aiScore.score}/100</span>
                </div>
                <Progress value={aiScore.score} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Virality Potential</span>
                  <span className="text-xs font-medium">{aiScore.viralityPotential}/100</span>
                </div>
                <Progress value={aiScore.viralityPotential} className="h-2" />
              </div>
            </div>
            
            <div className="flex gap-2 text-xs">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                Tone: {aiScore.tone}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                CTA: {aiScore.ctaStrength}%
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                Hashtags: {aiScore.hashtagRelevance}%
              </Badge>
            </div>
          </div>
        )}

        {/* Popular Hashtags */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Trending Hashtags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularHashtags.map((hashtag) => (
              <Badge
                key={hashtag}
                variant={selectedHashtags.includes(hashtag) ? "default" : "outline"}
                className="cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => handleHashtagClick(hashtag)}
              >
                {hashtag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Emoji Reactions */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Smile className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium">Quick Reactions</span>
          </div>
          <div className="flex gap-2">
            {emojiReactions.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-yellow-100"
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>

        {/* Media and Options */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <ImagePlus className="h-4 w-4" />
              Photo
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Video className="h-4 w-4" />
              Video
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Location
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {privacy === 'public' && <Globe className="h-4 w-4 text-green-600" />}
              {privacy === 'connections' && <Users className="h-4 w-4 text-blue-600" />}
              {privacy === 'private' && <Lock className="h-4 w-4 text-gray-600" />}
              <select 
                value={privacy} 
                onChange={(e) => setPrivacy(e.target.value as any)}
                className="text-sm border-0 bg-transparent"
              >
                <option value="public">Public</option>
                <option value="connections">Connections</option>
                <option value="private">Private</option>
              </select>
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={!content.trim() || isPosting}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPosting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
