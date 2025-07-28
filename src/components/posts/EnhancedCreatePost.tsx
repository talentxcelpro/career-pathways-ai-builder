
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  ImagePlus, 
  Video, 
  MapPin, 
  Hash, 
  Globe, 
  Users, 
  Lock, 
  X,
  Loader2,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video';
  file: File;
  name: string;
}

interface AIScore {
  score: number;
  tone: string;
  ctaStrength: number;
  hashtagRelevance: number;
  viralityPotential: string;
  suggestions: string[];
}

interface EnhancedCreatePostProps {
  onPostCreate?: (post: any) => void;
}

export const EnhancedCreatePost: React.FC<EnhancedCreatePostProps> = ({ onPostCreate }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'connections' | 'private'>('public');
  const [isPosting, setIsPosting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiScore, setAiScore] = useState<AIScore>({
    score: 0,
    tone: 'neutral',
    ctaStrength: 0,
    hashtagRelevance: 0,
    viralityPotential: 'medium',
    suggestions: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const analyzeContent = async (text: string) => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis with realistic scoring
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const wordCount = text.split(' ').length;
      const hasHashtags = text.includes('#');
      const hasEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(text);
      const hasQuestion = text.includes('?');
      const hasExclamation = text.includes('!');
      
      // Calculate scores based on content analysis
      let score = Math.min(85, Math.max(45, 50 + (wordCount > 20 ? 15 : 0) + (hasHashtags ? 10 : 0) + (hasEmoji ? 10 : 0)));
      let ctaStrength = (hasQuestion || hasExclamation) ? Math.random() * 40 + 60 : Math.random() * 60 + 20;
      let hashtagRelevance = hasHashtags ? Math.random() * 30 + 70 : Math.random() * 50 + 25;
      
      const tones = ['professional', 'casual', 'enthusiastic', 'informative', 'inspirational'];
      const tone = tones[Math.floor(Math.random() * tones.length)];
      
      const viralityOptions = ['low', 'medium', 'high'];
      const viralityPotential = viralityOptions[score > 70 ? 2 : score > 55 ? 1 : 0];
      
      const suggestions = [
        hasHashtags ? null : 'Consider adding relevant hashtags to increase discoverability',
        hasEmoji ? null : 'Adding emojis can make your post more engaging',
        wordCount < 15 ? 'Try expanding your content for better engagement' : null,
        !hasQuestion && !hasExclamation ? 'Consider adding a call-to-action to boost engagement' : null
      ].filter(Boolean) as string[];

      setAiScore({
        score: Math.round(score),
        tone,
        ctaStrength: Math.round(ctaStrength),
        hashtagRelevance: Math.round(hashtagRelevance),
        viralityPotential,
        suggestions
      });
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast.error('Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (files: FileList | null, type: 'image' | 'video') => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newFiles: MediaFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      const fileType = file.type.split('/')[0];
      if (type === 'image' && fileType !== 'image') {
        toast.error(`${file.name} is not an image file`);
        continue;
      }
      if (type === 'video' && fileType !== 'video') {
        toast.error(`${file.name} is not a video file`);
        continue;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      const fileExtension = file.name.split('.').pop();
      const randomId = Math.random().toString(36).substring(2, 15);
      const filename = `${randomId}.${fileExtension}`;
      const filePath = `${user?.id}/${filename}`;

      try {
        const { data, error } = await supabase.storage
          .from('post-media')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Error uploading file:', error);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage.from('post-media').getPublicUrl(data.path);
        const url = publicUrl;
        newFiles.push({
          id: randomId,
          url: url,
          type: type,
          file: file,
          name: file.name,
        });
        toast.success(`${file.name} uploaded successfully!`);
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setMediaFiles(prev => [...prev, ...newFiles]);
    setIsUploading(false);
  };

  const handleRemoveMedia = (id: string) => {
    setMediaFiles(prev => prev.filter(file => file.id !== id));
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleVideoClick = () => {
    videoInputRef.current?.click();
  };

  const handleLocationClick = () => {
    setShowLocationInput(!showLocationInput);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          toast.success('Location detected!');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Failed to get location. Please enter manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
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
      console.log('Creating enhanced post with user:', user.id);
      
      const { data: postData, error } = await supabase
        .from('posts')
        .insert({
          content,
          post_type: 'text',
          author_id: user.id,
          user_id: user.id,
          media_urls: mediaFiles.map(file => file.url),
          location: location || null,
          is_public: privacy === 'public',
          visibility: privacy,
          origin: 'feed',
          tags: tags
        })
        .select()
        .single();

      if (error) {
        console.error('Database error creating post:', error);
        throw error;
      }

      console.log('Post created successfully:', postData);

      // AI score analysis complete - stored in component state for display
      console.log('AI analysis completed:', aiScore);

      onPostCreate?.(postData);
      
      // Reset form
      setContent('');
      setMediaFiles([]);
      setLocation('');
      setShowLocationInput(false);
      setTags([]);
      setPrivacy('public');
      setAiScore({
        score: 0,
        tone: 'neutral',
        ctaStrength: 0,
        hashtagRelevance: 0,
        viralityPotential: 'medium',
        suggestions: []
      });
      
      toast.success('Enhanced post created successfully!');
    } catch (error) {
      console.error('Error creating enhanced post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to create post: ${errorMessage}`);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Create Enhanced Post
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Share your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={() => analyzeContent(content)}
              className="min-h-[120px] resize-none border-0 p-0 text-lg placeholder:text-muted-foreground focus-visible:ring-0"
            />
          </div>
        </div>

        {/* Hidden file inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileUpload(e.target.files, 'image')}
          accept="image/*"
          multiple
          className="hidden"
        />
        <input
          type="file"
          ref={videoInputRef}
          onChange={(e) => handleFileUpload(e.target.files, 'video')}
          accept="video/*"
          multiple
          className="hidden"
        />

        {/* AI Analysis Results */}
        {(aiScore.score > 0 || isAnalyzing) && (
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-800">AI Content Analysis</span>
              {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin text-purple-600" />}
            </div>
            
            {!isAnalyzing && (
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">Overall Score</div>
                  <div className="text-2xl font-bold text-purple-600">{aiScore.score}/100</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">Tone</div>
                  <Badge variant="secondary" className="capitalize">{aiScore.tone}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">CTA Strength</div>
                  <div className="text-lg font-semibold">{aiScore.ctaStrength}%</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">Virality Potential</div>
                  <Badge 
                    variant={aiScore.viralityPotential === 'high' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {aiScore.viralityPotential}
                  </Badge>
                </div>
              </div>
            )}

            {aiScore.suggestions.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Suggestions:</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  {aiScore.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-purple-500 mt-1">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Location Input */}
        {showLocationInput && (
          <div className="p-3 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Add Location</span>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter location or click to detect"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={getCurrentLocation}
                className="whitespace-nowrap"
              >
                Detect
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowLocationInput(false);
                  setLocation('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Tags Input */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Add tags..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={handleAddTag}>
              <Hash className="h-4 w-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  #{tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Media Preview */}
        {mediaFiles.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {mediaFiles.map((file) => (
              <div key={file.id} className="relative group">
                {file.type === 'image' ? (
                  <img 
                    src={file.url} 
                    alt={file.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ) : (
                  <video 
                    src={file.url}
                    className="w-full h-32 object-cover rounded-lg"
                    controls
                  />
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  onClick={() => handleRemoveMedia(file.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handlePhotoClick}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ImagePlus className="h-4 w-4 mr-1" />}
              Photo
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleVideoClick}
              disabled={isUploading}
            >
              <Video className="h-4 w-4 mr-1" />
              Video
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLocationClick}
            >
              <MapPin className="h-4 w-4 mr-1" />
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
              disabled={!content.trim() || isPosting || isUploading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isPosting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Posting...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedCreatePost;
