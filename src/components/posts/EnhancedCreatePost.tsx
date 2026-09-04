import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
  ChevronDown,
  Wand2,
  CheckCircle2,
  Zap,
  Compass,
  Check,
  Minimize2,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  generateTalentXcelPost, 
  rewriteTalentXcelPost, 
  extractSkillsFromPost 
} from '@/utils/geminiAi';

interface MediaItem {
  id: string;
  file: File;
  previewUrl: string;
  type: 'image' | 'video';
  uploadedUrl?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

interface EnhancedCreatePostProps {
  onPostCreate?: (post: any) => void;
}

const COMMON_TECH_HUBS = [
  'Bangalore, India',
  'Noida, India',
  'Hyderabad, India',
  'Mumbai, India',
  'Pune, India',
  'Delhi NCR, India',
  'Remote, Global',
  'San Francisco, USA',
  'Dubai, UAE',
  'London, UK'
];

export const EnhancedCreatePost: React.FC<EnhancedCreatePostProps> = ({ onPostCreate }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  // Media states
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Tags & Skills
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  
  // Audience / Privacy
  const [privacy, setPrivacy] = useState<'public' | 'connections' | 'private'>('public');
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);
  const privacyRef = useRef<HTMLDivElement>(null);

  // AI Suite States
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState('Thought Leader');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [detectedSkills, setDetectedSkills] = useState<string[]>([]);
  const [clarityScore, setClarityScore] = useState<number>(0);

  // Posting state
  const [isPosting, setIsPosting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Close privacy dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (privacyRef.current && !privacyRef.current.contains(event.target as Node)) {
        setShowPrivacyMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time Skill Detection & Clarity Scoring
  useEffect(() => {
    if (!content.trim()) {
      setDetectedSkills([]);
      setClarityScore(0);
      return;
    }
    const skills = extractSkillsFromPost(content);
    setDetectedSkills(skills);

    const words = content.trim().split(/\s+/).length;
    let score = Math.min(100, Math.max(40, words * 2 + (skills.length > 0 ? 20 : 0) + (content.includes('\n') ? 15 : 0)));
    setClarityScore(score);
  }, [content]);

  // Handle Photo & Video File Selection
  const handleFilesSelected = (files: FileList | null, type: 'image' | 'video') => {
    if (!files || files.length === 0) return;

    const newItems: MediaItem[] = [];
    const maxFiles = type === 'image' ? 6 : 1;

    for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
      const file = files[i];

      const maxSizeBytes = type === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        toast.error(`${file.name} is too large. Max size: ${type === 'image' ? '10MB' : '50MB'}`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      newItems.push({
        id: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
        file,
        previewUrl,
        type,
        progress: 0,
        status: 'pending'
      });
    }

    if (newItems.length > 0) {
      setMediaItems(prev => type === 'video' ? newItems : [...prev, ...newItems]);
      toast.success(`${newItems.length} ${type === 'image' ? 'photo(s)' : 'video'} added`);
    }
  };

  // Dedicated input onChange event handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesSelected(e.target.files, 'image');
    e.target.value = '';
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesSelected(e.target.files, 'video');
    e.target.value = '';
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const isVideo = Array.from(e.dataTransfer.files).some(f => f.type.startsWith('video/'));
      handleFilesSelected(e.dataTransfer.files, isVideo ? 'video' : 'image');
    }
  };

  // Remove Media Item
  const handleRemoveMedia = (id: string) => {
    setMediaItems(prev => {
      const target = prev.find(item => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter(item => item.id !== id);
    });
  };

  // Geolocation Lookup
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.state_district || data.address?.state || 'India';
          const country = data.address?.country || 'India';
          const resolvedLocation = `${city}, ${country}`;
          setLocation(resolvedLocation);
          toast.success(`Location set: ${resolvedLocation}`);
          setShowLocationInput(false);
        } catch {
          setLocation('India (Detected)');
          toast.success('Location set to India');
          setShowLocationInput(false);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        toast.error(`Location access denied: ${err.message}`);
      },
      { timeout: 10000 }
    );
  };

  // Add Tag / Skill
  const handleAddTag = (customTag?: string) => {
    const tagToAdd = (customTag || newTag).trim().replace(/^#/, '');
    if (tagToAdd && !tags.includes(tagToAdd)) {
      setTags([...tags, tagToAdd]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // ✨ TalentXcel AI: Rewrite & Transform Post
  const handleAiTransform = async (mode: 'polish' | 'professional' | 'career' | 'engaging' | 'concise' | 'job_seeker' | 'hiring' | 'hindi') => {
    if (!content.trim()) {
      toast.error('Please write some thoughts first for AI to transform');
      return;
    }
    setIsGeneratingAi(true);
    try {
      const profile = user?.user_metadata || {};
      const result = await rewriteTalentXcelPost(content, mode, profile);
      setContent(result.text);

      if (result.hashtags && result.hashtags.length > 0) {
        const cleanTags = result.hashtags.map(t => t.replace(/^#/, ''));
        setTags(Array.from(new Set([...tags, ...cleanTags])));
      }
      if (result.skills && result.skills.length > 0) {
        setTags(Array.from(new Set([...tags, ...result.skills])));
      }

      toast.success(`Post transformed with TalentXcel AI (${mode.replace('_', ' ')})!`);
      setShowAiDrawer(false);
    } catch (err: any) {
      toast.error('AI transformation failed');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // ✨ TalentXcel AI: Generate Post from Scratch / Topic
  const handleAiDraftFromTopic = async () => {
    if (!aiTopic.trim()) {
      toast.error('Please enter a topic or achievement');
      return;
    }
    setIsGeneratingAi(true);
    try {
      const result = await generateTalentXcelPost(aiTopic, aiTone);
      const fullText = `${result.hook}\n\n${result.content}`;
      setContent(fullText);

      if (result.hashtags && result.hashtags.length > 0) {
        const cleanTags = result.hashtags.map(t => t.replace(/^#/, ''));
        setTags(Array.from(new Set([...tags, ...cleanTags])));
      }

      toast.success('TalentXcel AI crafted your post!');
      setShowAiDrawer(false);
    } catch {
      toast.error('AI draft generation failed');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Helper to convert file to persistent Base64 Data URL as reliable fallback
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Upload pending media to Supabase Storage with graceful Base64 fallback
  const uploadAllMedia = async (): Promise<string[]> => {
    if (mediaItems.length === 0) return [];
    setIsUploading(true);

    const uploadedUrls: string[] = [];
    const userId = user?.id || 'guest';

    for (let i = 0; i < mediaItems.length; i++) {
      const item = mediaItems[i];
      if (item.uploadedUrl && !item.uploadedUrl.startsWith('blob:')) {
        uploadedUrls.push(item.uploadedUrl);
        continue;
      }

      try {
        const fileExt = item.file.name.split('.').pop() || 'jpg';
        const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const targetBucket = 'avatars';

        const { data, error } = await supabase.storage
          .from(targetBucket)
          .upload(fileName, item.file, {
            cacheControl: '3600',
            upsert: true,
            contentType: item.file.type
          });

        if (error || !data?.path) {
          console.warn('Storage bucket upload issue, utilizing base64 data stream fallback:', error);
          const dataUrl = await readFileAsDataUrl(item.file);
          uploadedUrls.push(dataUrl);
        } else {
          const { data: urlData } = supabase.storage.from(targetBucket).getPublicUrl(data.path);
          uploadedUrls.push(urlData.publicUrl);
        }
      } catch (err) {
        console.warn('Storage upload catch block, utilizing base64 fallback:', err);
        const dataUrl = await readFileAsDataUrl(item.file);
        uploadedUrls.push(dataUrl);
      }
    }

    setIsUploading(false);
    return uploadedUrls;
  };

  // Submit Post
  const handleSubmit = async () => {
    if (!content.trim() && mediaItems.length === 0) {
      toast.error('Please write something or attach media');
      return;
    }

    // Resolve current authenticated user or existing profile
    let activeUserId = user?.id;
    if (!activeUserId) {
      const { data: authData } = await supabase.auth.getUser();
      activeUserId = authData?.user?.id;
    }

    if (!activeUserId) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .maybeSingle();
      if (profileData?.id) {
        activeUserId = profileData.id;
      }
    }

    if (!activeUserId) {
      toast.error('Please sign in to publish your post on TalentXcel');
      return;
    }

    setIsPosting(true);
    try {
      const finalMediaUrls = await uploadAllMedia();
      const isVideo = mediaItems.some(m => m.type === 'video');
      const isImage = mediaItems.some(m => m.type === 'image') || finalMediaUrls.length > 0;
      const resolvedPostType: 'text' | 'image' | 'video' = isVideo ? 'video' : (isImage ? 'image' : 'text');

      const postPayload: any = {
        content: content.trim(),
        post_type: resolvedPostType,
        author_id: activeUserId,
        user_id: activeUserId,
        media_urls: finalMediaUrls.length > 0 ? finalMediaUrls : null,
        location: location || null,
        tags: tags.length > 0 ? tags : null,
        hashtags: tags.length > 0 ? tags : null,
        visibility: privacy,
        is_public: privacy === 'public',
        status: 'published',
        origin: 'feed',
        likes_count: 0,
        comments_count: 0,
        shares_count: 0
      };

      const { data: postData, error } = await supabase
        .from('posts')
        .insert(postPayload)
        .select()
        .single();

      if (error) {
        console.error('Post insertion error:', error);
        throw error;
      }

      // Invalidate feed cache to show the new post instantly
      await queryClient.invalidateQueries({ queryKey: ['network-feed'] });
      await queryClient.invalidateQueries({ queryKey: ['posts'] });

      onPostCreate?.(postData);

      // Clean up object URLs
      mediaItems.forEach(item => {
        if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });

      // Reset Form State
      setContent('');
      setMediaItems([]);
      setLocation('');
      setShowLocationInput(false);
      setTags([]);
      setPrivacy('public');
      setShowAiDrawer(false);
      setIsExpanded(false);

      toast.success('Post published successfully to TalentXcel Network!');
    } catch (error: any) {
      console.error('Failed to post:', error);
      toast.error(`Failed to publish post: ${error.message || error.details || 'Database error'}`);
    } finally {
      setIsPosting(false);
    }
  };

  // Compact collapsed state: keeps feed visible above the fold just like Smart Feed
  if (!isExpanded && !content.trim() && mediaItems.length === 0) {
    return (
      <Card className="w-full border border-slate-200/80 dark:border-border/60 shadow-xs bg-white dark:bg-card rounded-2xl p-3 space-y-2.5">
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9 border border-slate-200 dark:border-border shrink-0">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => setIsExpanded(true)}
            className="flex-1 text-left px-4 py-2 rounded-full border border-slate-200/80 dark:border-border/60 bg-slate-50 dark:bg-muted/40 hover:bg-slate-100 dark:hover:bg-muted text-xs text-muted-foreground font-medium transition-colors"
          >
            Share thoughts, achievements, or project milestones...
          </button>
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-border/40 px-1">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setIsExpanded(true); setTimeout(() => fileInputRef.current?.click(), 50); }}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-lg"
            >
              <ImagePlus className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-[11px] font-semibold">Photo</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setIsExpanded(true); setTimeout(() => videoInputRef.current?.click(), 50); }}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-lg"
            >
              <Video className="h-3.5 w-3.5 text-purple-500" />
              <span className="text-[11px] font-semibold">Video</span>
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => { setIsExpanded(true); setShowAiDrawer(true); }}
            className="h-7 px-2.5 text-[11px] font-bold text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 bg-purple-500/10 hover:bg-purple-500/20 rounded-full gap-1"
          >
            <Sparkles className="h-3 w-3 text-purple-600" />
            <span>TalentXcel AI</span>
          </Button>
        </div>

        {/* Hidden file inputs so they work from buttons */}
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" multiple className="hidden" />
        <input type="file" ref={videoInputRef} onChange={handleVideoSelect} accept="video/*" className="hidden" />
      </Card>
    );
  }

  return (
    <Card 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full border transition-all duration-200 shadow-sm bg-white dark:bg-card rounded-3xl overflow-hidden p-5 space-y-4 ${
        isDragging ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-400/30' : 'border-slate-200/80 dark:border-border/60'
      }`}
    >
      
      {/* Header: Title, Minimize & AI Copilot Launcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-blue-50 dark:bg-blue-950/80 flex items-center justify-center border border-blue-200 dark:border-blue-800">
            <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-sm font-extrabold text-foreground tracking-tight">Create Enhanced Post</h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground rounded-lg gap-1"
            title="Collapse"
          >
            <Minimize2 className="h-3.5 w-3.5" />
            <span className="text-[11px] hidden sm:inline">Minimize</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAiDrawer(prev => !prev)}
            className={`rounded-full text-xs font-extrabold transition-all px-3.5 h-7 gap-1.5 ${
              showAiDrawer 
                ? 'bg-purple-600 text-white border-purple-600 shadow-md' 
                : 'border-purple-300 dark:border-purple-800 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20'
            }`}
          >
            <Wand2 className="h-3.5 w-3.5 text-purple-600 dark:text-purple-300" />
            <span>TalentXcel AI</span>
          </Button>
        </div>
      </div>

      {/* ✨ TalentXcel AI Assistant Panel */}
      {showAiDrawer && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-200 dark:border-purple-900/60 space-y-3.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              TalentXcel AI Post Studio
            </span>
            <X className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => setShowAiDrawer(false)} />
          </div>

          {/* Quick AI Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Quick Transform:</span>
            <div className="flex flex-wrap gap-1.5">
              <Button
                size="sm"
                variant="outline"
                disabled={isGeneratingAi}
                onClick={() => handleAiTransform('professional')}
                className="h-7 text-xs rounded-xl bg-white dark:bg-card border-purple-200 text-purple-800 dark:text-purple-300 hover:bg-purple-50"
              >
                ✍️ Rewrite Professionally
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isGeneratingAi}
                onClick={() => handleAiTransform('career')}
                className="h-7 text-xs rounded-xl bg-white dark:bg-card border-purple-200 text-purple-800 dark:text-purple-300 hover:bg-purple-50"
              >
                💼 Career Milestone
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isGeneratingAi}
                onClick={() => handleAiTransform('engaging')}
                className="h-7 text-xs rounded-xl bg-white dark:bg-card border-purple-200 text-purple-800 dark:text-purple-300 hover:bg-purple-50"
              >
                🎯 High Engagement
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isGeneratingAi}
                onClick={() => handleAiTransform('job_seeker')}
                className="h-7 text-xs rounded-xl bg-white dark:bg-card border-purple-200 text-purple-800 dark:text-purple-300 hover:bg-purple-50"
              >
                📢 Looking for Work
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isGeneratingAi}
                onClick={() => handleAiTransform('hiring')}
                className="h-7 text-xs rounded-xl bg-white dark:bg-card border-purple-200 text-purple-800 dark:text-purple-300 hover:bg-purple-50"
              >
                🏢 We Are Hiring
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isGeneratingAi}
                onClick={() => handleAiTransform('hindi')}
                className="h-7 text-xs rounded-xl bg-white dark:bg-card border-purple-200 text-purple-800 dark:text-purple-300 hover:bg-purple-50"
              >
                🇮🇳 Hindi / Hinglish
              </Button>
            </div>
          </div>

          {/* Draft From Scratch */}
          <div className="pt-2 border-t border-purple-200/60 dark:border-purple-900/40 space-y-2">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Or Draft from a Topic / Achievement:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Input 
                placeholder="e.g. Launched new product, Python ML project..." 
                value={aiTopic} 
                onChange={(e) => setAiTopic(e.target.value)} 
                className="sm:col-span-2 text-xs h-8 rounded-xl bg-white dark:bg-card border-purple-200" 
              />
              <select
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value)}
                className="text-xs rounded-xl h-8 px-2 bg-white dark:bg-card border border-purple-200 font-bold focus:outline-none cursor-pointer"
              >
                <option value="Thought Leader">Thought Leader</option>
                <option value="Executive">Executive</option>
                <option value="Inspiring">Inspiring</option>
                <option value="Technical">Technical</option>
                <option value="Storytelling">Storytelling</option>
              </select>
            </div>

            <Button
              size="sm"
              onClick={handleAiDraftFromTopic}
              disabled={!aiTopic.trim() || isGeneratingAi}
              className="w-full h-8 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
            >
              {isGeneratingAi ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
              Generate AI Draft &amp; Hashtags
            </Button>
          </div>
        </div>
      )}

      {/* Main Textarea Container */}
      <div className="relative rounded-2xl bg-slate-50/80 dark:bg-muted/30 border border-slate-200/80 dark:border-border/60 p-4 space-y-3">
        <Textarea
          placeholder="Share your thoughts, achievements, career updates, or project milestones..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] border-0 p-0 bg-transparent text-sm placeholder:text-muted-foreground focus-visible:ring-0 resize-none font-medium text-foreground leading-relaxed"
        />

        {/* Media Preview Grid */}
        {mediaItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 dark:border-border/40">
            {mediaItems.map((item) => (
              <div key={item.id} className="relative rounded-xl overflow-hidden h-28 border border-slate-200 dark:border-border group bg-slate-900">
                {item.type === 'image' ? (
                  <img src={item.previewUrl} alt="Upload preview" className="w-full h-full object-cover" />
                ) : (
                  <video src={item.previewUrl} className="w-full h-full object-cover" controls={false} />
                )}
                
                <button 
                  onClick={() => handleRemoveMedia(item.id)} 
                  className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-black text-white rounded-full transition-colors shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>

                {item.type === 'video' && (
                  <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white font-bold flex items-center gap-1">
                    <Video className="h-3 w-3 text-purple-400" />
                    Video
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Real-time Detected Skills Bar */}
        {detectedSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-border/40">
            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" />
              Detected Skills:
            </span>
            {detectedSkills.map(skill => (
              <Badge 
                key={skill} 
                variant="outline" 
                onClick={() => handleAddTag(skill)}
                className="cursor-pointer text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 hover:bg-amber-100 transition-colors gap-1"
              >
                +{skill}
              </Badge>
            ))}
          </div>
        )}

        {/* Selected Tags & Manual Tag Input */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-border/40">
          <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200">
                #{tag}
                <X className="h-3 w-3 ml-1 cursor-pointer hover:text-blue-900" onClick={() => handleRemoveTag(tag)} />
              </Badge>
            ))}
            {showTagInput ? (
              <div className="flex items-center gap-1 max-w-xs">
                <Input 
                  placeholder="Add skill or topic..." 
                  value={newTag} 
                  onChange={(e) => setNewTag(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="h-7 text-xs rounded-xl"
                />
                <Button size="sm" onClick={() => handleAddTag()} className="h-7 px-2.5 text-xs rounded-xl bg-blue-600 text-white">Add</Button>
                <X className="h-4 w-4 cursor-pointer text-muted-foreground" onClick={() => setShowTagInput(false)} />
              </div>
            ) : (
              <span 
                onClick={() => setShowTagInput(true)} 
                className="text-xs text-muted-foreground hover:text-foreground font-medium cursor-pointer"
              >
                + Add tags or skills...
              </span>
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

      {/* Hidden Native File Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => handleFilesSelected(e.target.files, 'image')} 
        accept="image/png,image/jpeg,image/webp,image/gif" 
        multiple 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={videoInputRef} 
        onChange={(e) => handleFilesSelected(e.target.files, 'video')} 
        accept="video/mp4,video/webm,video/quicktime" 
        className="hidden" 
      />

      {/* Location Selector Box */}
      {showLocationInput && (
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-muted/40 border border-slate-200/80 dark:border-border space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
            <Input 
              placeholder="Search or enter location (e.g. Bangalore, Remote)..." 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              className="h-8 text-xs bg-white dark:bg-card rounded-xl"
            />
            <Button
              size="sm"
              variant="outline"
              disabled={isLocating}
              onClick={handleDetectLocation}
              className="h-8 text-xs rounded-xl gap-1 shrink-0 font-bold"
            >
              {isLocating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Compass className="h-3 w-3 text-blue-600" />}
              <span>Auto-Detect</span>
            </Button>
            <X className="h-4 w-4 cursor-pointer text-muted-foreground" onClick={() => setShowLocationInput(false)} />
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-400">Popular:</span>
            {COMMON_TECH_HUBS.map(hub => (
              <Badge 
                key={hub} 
                variant="outline" 
                onClick={() => { setLocation(hub); setShowLocationInput(false); }}
                className="cursor-pointer text-[10px] font-medium bg-white dark:bg-card hover:bg-slate-100"
              >
                {hub}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Selected Location Pill */}
      {location && !showLocationInput && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 w-fit">
          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
          <span>{location}</span>
          <X className="h-3 w-3 ml-1 cursor-pointer hover:text-emerald-900" onClick={() => setLocation('')} />
        </div>
      )}

      {/* Uploading Progress Indicator */}
      {isUploading && (
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
            <span>Uploading Media...</span>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          </div>
          <Progress value={75} className="h-1.5" />
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-border/40">
        
        {/* Attachment Buttons Row */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          
          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading}
            className="rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 transition-colors"
          >
            <ImagePlus className="h-4 w-4 mr-1.5 text-blue-600" />
            Photo
          </Button>

          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            onClick={() => videoInputRef.current?.click()} 
            disabled={isUploading}
            className="rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600 transition-colors"
          >
            <Video className="h-4 w-4 mr-1.5 text-purple-600" />
            Video
          </Button>

          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            onClick={() => setShowLocationInput(prev => !prev)} 
            className="rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 transition-colors"
          >
            <MapPin className="h-4 w-4 mr-1.5 text-emerald-600" />
            Location
          </Button>

          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/network?tab=discover')} 
            className="rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-600 transition-colors"
          >
            <FileText className="h-4 w-4 mr-1.5 text-amber-600" />
            Write Article
          </Button>

          {/* Privacy Dropdown (Fixed clean single-chevron UI) */}
          <div className="relative" ref={privacyRef}>
            <button
              type="button"
              onClick={() => setShowPrivacyMenu(prev => !prev)}
              className="flex items-center gap-1.5 bg-slate-100 dark:bg-muted hover:bg-slate-200/80 dark:hover:bg-muted/80 px-3 py-1.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-border transition-colors cursor-pointer"
            >
              {privacy === 'public' && <Globe className="h-3.5 w-3.5 text-emerald-600" />}
              {privacy === 'connections' && <Users className="h-3.5 w-3.5 text-blue-600" />}
              {privacy === 'private' && <Lock className="h-3.5 w-3.5 text-amber-600" />}
              <span className="capitalize">{privacy}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            </button>

            {showPrivacyMenu && (
              <div className="absolute left-0 bottom-full mb-1.5 w-44 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl shadow-xl p-1.5 z-50 space-y-1 animate-in fade-in duration-150">
                <button
                  type="button"
                  onClick={() => { setPrivacy('public'); setShowPrivacyMenu(false); }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold text-left transition-colors ${
                    privacy === 'public' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950' : 'hover:bg-slate-100 dark:hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Public</span>
                  </div>
                  {privacy === 'public' && <Check className="h-3.5 w-3.5 text-blue-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => { setPrivacy('connections'); setShowPrivacyMenu(false); }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold text-left transition-colors ${
                    privacy === 'connections' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950' : 'hover:bg-slate-100 dark:hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-blue-600" />
                    <span>Connections</span>
                  </div>
                  {privacy === 'connections' && <Check className="h-3.5 w-3.5 text-blue-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => { setPrivacy('private'); setShowPrivacyMenu(false); }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold text-left transition-colors ${
                    privacy === 'private' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950' : 'hover:bg-slate-100 dark:hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-amber-600" />
                    <span>Only Me</span>
                  </div>
                  {privacy === 'private' && <Check className="h-3.5 w-3.5 text-blue-600" />}
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          {clarityScore > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-muted px-2.5 py-1 rounded-xl">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              <span>Score: {clarityScore}/100</span>
            </div>
          )}

          <Button 
            onClick={handleSubmit} 
            disabled={(!content.trim() && mediaItems.length === 0) || isPosting || isUploading}
            className="rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {isPosting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Post
          </Button>
        </div>

      </div>

      {/* Hidden file inputs for expanded card */}
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" multiple className="hidden" />
      <input type="file" ref={videoInputRef} onChange={handleVideoSelect} accept="video/*" className="hidden" />
    </Card>
  );
};

export default EnhancedCreatePost;

