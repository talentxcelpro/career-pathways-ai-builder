import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  ImagePlus, 
  Video, 
  MapPin, 
  Hash, 
  Globe, 
  X,
  Loader2,
  ChevronDown,
  Wand2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { generateGeminiPost } from '@/utils/geminiAi';

interface EnhancedCreatePostProps {
  onPostCreate?: (post: any) => void;
}

export const EnhancedCreatePost: React.FC<EnhancedCreatePostProps> = ({ onPostCreate }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [privacy, setPrivacy] = useState<'public' | 'connections' | 'private'>('public');
  const [isPosting, setIsPosting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  // Gemini AI Post Assistant states
  const [showGeminiAssistant, setShowGeminiAssistant] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState('Thought Leader');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null, type: 'image' | 'video') => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const uploaded: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const filePath = `post-media/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('post-media').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('post-media').getPublicUrl(filePath);
        uploaded.push(publicUrl);
      }
      setMediaUrls(prev => [...prev, ...uploaded]);
      toast.success(`${type === 'image' ? 'Photos' : 'Video'} attached!`);
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message || 'Error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim().replace(/^#/, '')]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Generate Post with Gemini AI
  const handleGeminiPostGenerate = async () => {
    if (!aiTopic.trim()) {
      toast.error("Please enter a topic for Gemini AI");
      return;
    }

    setIsGeneratingAi(true);
    try {
      const result = await generateGeminiPost(aiTopic, aiTone);
      const fullText = `${result.hook}\n\n${result.content}`;
      setContent(fullText);
      
      if (result.hashtags && result.hashtags.length > 0) {
        const cleanTags = result.hashtags.map(t => t.replace(/^#/, ''));
        setTags(Array.from(new Set([...tags, ...cleanTags])));
      }
      
      toast.success("Gemini AI drafted your post!");
      setShowGeminiAssistant(false);
    } catch (err: any) {
      toast.error("Gemini AI generation failed");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaUrls.length === 0) {
      toast.error('Please write something or attach media');
      return;
    }

    if (!user?.id) {
      toast.error('You must be logged in to create a post');
      return;
    }

    setIsPosting(true);
    try {
      const { data: postData, error } = await supabase
        .from('posts')
        .insert({
          content,
          post_type: mediaUrls.length > 0 ? 'media' : 'text',
          author_id: user.id,
          user_id: user.id,
          media_urls: mediaUrls,
          location: location || null,
          visibility: privacy,
          origin: 'feed',
          tags: tags
        })
        .select()
        .single();

      if (error) throw error;

      onPostCreate?.(postData);
      setContent('');
      setMediaUrls([]);
      setLocation('');
      setShowLocationInput(false);
      setTags([]);
      setPrivacy('public');
      
      toast.success('Post created successfully!');
    } catch (error: any) {
      toast.error(`Failed to create post: ${error.message || 'Error'}`);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="w-full border border-slate-200/80 dark:border-border/60 shadow-sm bg-white dark:bg-card rounded-3xl overflow-hidden p-5 space-y-4">
      
      {/* Header with Gemini AI Copilot Trigger */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-extrabold text-foreground tracking-tight">Create Enhanced Post</h2>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowGeminiAssistant(prev => !prev)}
          className="rounded-full text-xs font-extrabold border-purple-300 dark:border-purple-800 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 px-3 h-7 gap-1.5"
        >
          <Wand2 className="h-3.5 w-3.5 text-purple-600" />
          <span>Gemini AI Copilot</span>
        </Button>
      </div>

      {/* ✨ Gemini AI Post Assistant Copilot Drawer */}
      {showGeminiAssistant && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-200 dark:border-purple-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              Gemini AI Post Assistant
            </span>
            <X className="h-4 w-4 cursor-pointer text-muted-foreground" onClick={() => setShowGeminiAssistant(false)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input 
              placeholder="Topic e.g. Q3 APAC Sales Leadership..."
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              className="sm:col-span-2 text-xs h-8 rounded-xl bg-white dark:bg-card border-purple-200"
            />
            <select
              value={aiTone}
              onChange={(e) => setAiTone(e.target.value)}
              className="text-xs rounded-xl h-8 px-2 bg-white dark:bg-card border border-purple-200 font-bold focus:outline-none"
            >
              <option value="Thought Leader">Thought Leader</option>
              <option value="Executive">Executive</option>
              <option value="Inspiring">Inspiring</option>
              <option value="Storytelling">Storytelling</option>
              <option value="Concise">Concise</option>
            </select>
          </div>

          <Button
            size="sm"
            onClick={handleGeminiPostGenerate}
            disabled={!aiTopic.trim() || isGeneratingAi}
            className="w-full h-8 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
          >
            {isGeneratingAi ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
            Generate Draft &amp; Hashtags
          </Button>
        </div>
      )}

      {/* Input Container matching mockup */}
      <div className="relative rounded-2xl bg-slate-50/80 dark:bg-muted/30 border border-slate-200/80 dark:border-border/60 p-4 space-y-3">
        <Textarea
          placeholder="Share your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[90px] border-0 p-0 bg-transparent text-sm placeholder:text-muted-foreground focus-visible:ring-0 resize-none font-medium text-foreground"
        />

        {/* Tag Input Toggle Button inside box */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-border/40">
          <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200">
                #{tag}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
              </Badge>
            ))}
            {showTagInput ? (
              <div className="flex items-center gap-1 max-w-xs">
                <Input 
                  placeholder="Add tag..." 
                  value={newTag} 
                  onChange={(e) => setNewTag(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="h-7 text-xs rounded-xl"
                />
                <Button size="sm" onClick={handleAddTag} className="h-7 px-2 text-xs rounded-xl">Add</Button>
                <X className="h-4 w-4 cursor-pointer text-muted-foreground" onClick={() => setShowTagInput(false)} />
              </div>
            ) : (
              <span className="text-xs text-muted-foreground font-medium">Add tags...</span>
            )}
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowTagInput(prev => !prev)} 
            className="rounded-xl h-8 w-8 p-0 border-slate-200 dark:border-border shrink-0"
          >
            <Hash className="h-4 w-4 text-slate-700 dark:text-slate-300" />
          </Button>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e.target.files, 'image')} accept="image/*" multiple className="hidden" />
      <input type="file" ref={videoInputRef} onChange={(e) => handleFileUpload(e.target.files, 'video')} accept="video/*" multiple className="hidden" />

      {/* Location Input Box */}
      {showLocationInput && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-muted border border-slate-200/80">
          <MapPin className="h-4 w-4 text-primary" />
          <Input 
            placeholder="Enter location..." 
            value={location} 
            onChange={(e) => setLocation(e.target.value)} 
            className="h-8 text-xs bg-transparent border-0 focus-visible:ring-0"
          />
          <X className="h-4 w-4 cursor-pointer text-muted-foreground" onClick={() => setShowLocationInput(false)} />
        </div>
      )}

      {/* Media Previews */}
      {mediaUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {mediaUrls.map((url, idx) => (
            <div key={idx} className="relative rounded-xl overflow-hidden h-24 border border-slate-200">
              <img src={url} alt="Media" className="w-full h-full object-cover" />
              <button 
                onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== idx))} 
                className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Attachment Actions Row matching mockup */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading}
            className="rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100"
          >
            <ImagePlus className="h-4 w-4 mr-1 text-blue-600" />
            Photo
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => videoInputRef.current?.click()} 
            disabled={isUploading}
            className="rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100"
          >
            <Video className="h-4 w-4 mr-1 text-purple-600" />
            Video
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowLocationInput(prev => !prev)} 
            className="rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100"
          >
            <MapPin className="h-4 w-4 mr-1 text-emerald-600" />
            Location
          </Button>

          {/* Privacy Dropdown */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-muted px-2.5 py-1.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-border">
            <Globe className="h-3.5 w-3.5 text-emerald-600" />
            <select 
              value={privacy} 
              onChange={(e) => setPrivacy(e.target.value as any)}
              className="bg-transparent border-0 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="public">Public</option>
              <option value="connections">Connections</option>
              <option value="private">Private</option>
            </select>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={handleSubmit} 
          disabled={(!content.trim() && mediaUrls.length === 0) || isPosting || isUploading}
          className="rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 shadow-md flex items-center gap-1.5"
        >
          {isPosting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          Post
        </Button>

      </div>

    </Card>
  );
};

export default EnhancedCreatePost;
