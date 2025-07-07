import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Video, 
  FileText, 
  MapPin, 
  Users, 
  Globe,
  Lock,
  X,
  Send,
  Smile,
  Loader2,
  Target,
  Sparkles,
  Wand2,
  Hash,
  Mic,
  TrendingUp,
  Upload
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { EmojiPicker } from './EmojiPicker';
import { LinkPreview } from '@/components/shared/LinkPreview';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CareerIntentTags } from './CareerIntentTags';
import { AIPostQualityScore } from './AIPostQualityScore';
import { HashtagAssistant } from './HashtagAssistant';
import { TrendingTopicsWidget } from './TrendingTopicsWidget';
import { EnhancedMediaUpload } from './EnhancedMediaUpload';

interface EnhancedCreatePostProps {
  onPostCreate?: (post: any) => void;
}

export const EnhancedCreatePost: React.FC<EnhancedCreatePostProps> = ({ onPostCreate }) => {
  const { user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'connections' | 'private'>('public');
  const [detectedLinks, setDetectedLinks] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [selectedIntents, setSelectedIntents] = useState<string[]>([]);
  const [showIntentSelector, setShowIntentSelector] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showHashtagAssistant, setShowHashtagAssistant] = useState(false);
  const [showTrendingTopics, setShowTrendingTopics] = useState(false);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // AI Quality Score calculation
  const [aiScore, setAiScore] = useState<{
    score: number;
    tone: string;
    ctaStrength: number;
    hashtagRelevance: number;
    viralityPotential: 'low' | 'medium' | 'high' | 'viral';
  }>({
    score: 0,
    tone: 'professional',
    ctaStrength: 0,
    hashtagRelevance: 0,
    viralityPotential: 'low'
  });

  // Calculate AI score in real-time
  useEffect(() => {
    const calculateScore = () => {
      let score = 20; // Base score
      
      // Content length bonus
      if (content.length > 50) score += 20;
      if (content.length > 150) score += 10;
      
      // Call-to-action detection
      const ctaKeywords = ['apply', 'join', 'connect', 'learn', 'share', 'comment', 'like', 'follow'];
      const ctaCount = ctaKeywords.filter(keyword => content.toLowerCase().includes(keyword)).length;
      const ctaStrength = Math.min(ctaCount * 2, 10);
      score += ctaStrength * 2;
      
      // Hashtag relevance
      const hashtagRelevance = Math.min(selectedHashtags.length * 2, 10);
      score += hashtagRelevance;
      
      // Media bonus
      if (mediaFiles.length > 0) score += 15;
      
      // Engagement elements
      if (content.includes('?')) score += 5; // Questions
      if (content.includes('!')) score += 5; // Excitement
      
      const finalScore = Math.min(score, 100);
      let viralityPotential: 'low' | 'medium' | 'high' | 'viral' = 'low';
      
      if (finalScore >= 90) viralityPotential = 'viral';
      else if (finalScore >= 70) viralityPotential = 'high';
      else if (finalScore >= 50) viralityPotential = 'medium';
      
      setAiScore({
        score: finalScore,
        tone: 'professional',
        ctaStrength,
        hashtagRelevance,
        viralityPotential
      });
    };

    calculateScore();
  }, [content, selectedHashtags, mediaFiles]);

  const privacyOptions = [
    { value: 'public', label: 'Public', icon: Globe, description: 'Anyone can see this post' },
    { value: 'connections', label: 'Connections', icon: Users, description: 'Only your connections can see this' },
    { value: 'private', label: 'Private', icon: Lock, description: 'Only you can see this' }
  ];

  const handleContentChange = (value: string) => {
    setContent(value);
    
    // Detect URLs in the content
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const links = value.match(urlRegex) || [];
    setDetectedLinks([...new Set(links)]);
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.slice(0, start) + emoji + content.slice(end);
      setContent(newContent);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setContent(prev => prev + emoji);
    }
  };

  const handleAIRewrite = async (tone: string) => {
    if (!content.trim()) return;
    
    try {
      toast.info('AI is rewriting your post...', { duration: 2000 });
      
      const response = await fetch('/api/ai-post-rewriter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          tone,
          userRole: user?.user_metadata?.role || user?.user_metadata?.user_role,
          targetAudience: 'Professional network'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to rewrite post');
      }

      const data = await response.json();
      setContent(data.rewrittenContent);
      toast.success(`Post rewritten in ${tone} tone! ${data.newLength} characters.`);
      
    } catch (error) {
      console.error('AI rewrite error:', error);
      toast.error('Failed to rewrite with AI. Please try again.');
    }
  };

  const handleVoiceToText = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      toast.info('Listening... Speak now');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setContent(prev => prev + (prev ? ' ' : '') + transcript);
      toast.success('Voice converted to text');
    };

    recognition.onerror = (event) => {
      toast.error('Voice recognition error');
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handlePost = async () => {
    if (!content.trim()) {
      toast.error('Please write something before posting');
      return;
    }

    setIsPosting(true);
    try {
      // Combine content with hashtags
      const fullContent = content + (selectedHashtags.length > 0 ? '\n\n' + selectedHashtags.join(' ') : '');
      
      const { data: postData, error } = await supabase
        .from('posts')
        .insert({
          content: fullContent,
          author_id: user?.id,
          media_urls: mediaFiles.map(file => file.url),
          location: location || null,
          is_public: privacy === 'public',
          intent_tags: selectedIntents
        })
        .select()
        .single();

      if (error) throw error;

      // Save AI score
      await supabase
        .from('posts_ai_scores')
        .insert({
          post_id: postData.id,
          user_id: user?.id,
          score: aiScore.score,
          tone: aiScore.tone,
          cta_strength: aiScore.ctaStrength,
          hashtag_relevance: aiScore.hashtagRelevance,
          virality_potential: aiScore.viralityPotential
        });

      onPostCreate?.(postData);
      
      // Reset form
      setContent('');
      setMediaFiles([]);
      setDetectedLinks([]);
      setLocation('');
      setShowLocationInput(false);
      setPrivacy('public');
      setSelectedIntents([]);
      setSelectedHashtags([]);
      setShowIntentSelector(false);
      setShowAIAssistant(false);
      setShowHashtagAssistant(false);
      
      toast.success('Post created successfully!');
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  const handleIntentToggle = (intentId: string) => {
    setSelectedIntents(prev => 
      prev.includes(intentId) 
        ? prev.filter(id => id !== intentId)
        : [...prev, intentId]
    );
  };

  const handleTrendingTopicClick = (topic: string) => {
    setContent(prev => prev + (prev ? '\n\n' : '') + `Thoughts on ${topic}... `);
    setShowTrendingTopics(false);
  };

  // File upload handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (mediaFiles.length + files.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = `${Date.now()}-${i}`;
      
      try {
        // Determine file type
        let type: 'image' | 'video' | 'document';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('video/')) type = 'video';
        else type = 'document';

        // Create media file object (simplified for inline upload)
        const mediaFile = {
          id: fileId,
          url: URL.createObjectURL(file),
          type,
          name: file.name,
          size: file.size,
          metadata: {}
        };

        setMediaFiles(prev => [...prev, mediaFile]);
        toast.success(`${file.name} added successfully`);
        
      } catch (error) {
        toast.error(`Failed to add ${file.name}`);
        console.error('File error:', error);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const currentPrivacy = privacyOptions.find(opt => opt.value === privacy);

  return (
    <div className="space-y-4">
      <Card className="w-full overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage src={user?.user_metadata?.avatar_url} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-bold">
                {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-lg">{user?.user_metadata?.full_name || 'Your Name'}</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => {
                    const nextIndex = (privacyOptions.findIndex(opt => opt.value === privacy) + 1) % privacyOptions.length;
                    setPrivacy(privacyOptions[nextIndex].value as any);
                  }}
                >
                  {currentPrivacy && (
                    <>
                      <currentPrivacy.icon className="h-3 w-3 mr-1" />
                      {currentPrivacy.label}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Textarea
              ref={textareaRef}
              placeholder="What's happening in your career? Share your insights..."
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="min-h-[120px] resize-none border-0 p-0 text-lg placeholder:text-muted-foreground focus-visible:ring-0"
            />

            {/* AI Quality Score */}
            {content.length > 10 && (
              <AIPostQualityScore
                score={aiScore.score}
                tone={aiScore.tone}
                ctaStrength={aiScore.ctaStrength}
                hashtagRelevance={aiScore.hashtagRelevance}
                viralityPotential={aiScore.viralityPotential}
                isRealTime={true}
              />
            )}

            {/* Link Previews */}
            {detectedLinks.length > 0 && (
              <div className="space-y-3">
                {detectedLinks.map((link, index) => (
                  <LinkPreview key={index} url={link} />
                ))}
              </div>
            )}

            {/* Inline Media Upload */}
            {(mediaFiles.length > 0 || dragActive) && (
              <div className="space-y-3 animate-fade-in">
                {/* Compact Upload Area */}
                <div 
                  className={`border-2 border-dashed rounded-lg p-4 transition-all duration-300 ${
                    dragActive 
                      ? 'border-primary bg-primary/5 scale-[1.02]' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex items-center gap-3 cursor-pointer">
                    <div className={`p-2 rounded-full transition-colors ${
                      dragActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <Upload className={`h-4 w-4 ${dragActive ? 'animate-bounce' : ''}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {dragActive ? 'Drop files here!' : 'Drop files or click to upload'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Images, videos, documents up to 100MB
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="secondary" className="text-xs">
                        <Image className="h-3 w-3 mr-1" />
                        IMG
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Video className="h-3 w-3 mr-1" />
                        VID
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        DOC
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Media Files Grid */}
                {mediaFiles.length > 0 && (
                  <div className="grid gap-2">
                    {mediaFiles.map((media, index) => (
                      <div key={media.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg animate-fade-in">
                        {/* Preview */}
                        <div className="flex-shrink-0">
                          {media.type === 'image' && (
                            <img
                              src={media.url}
                              alt={media.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          {media.type === 'video' && (
                            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                              <Video className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          {media.type === 'document' && (
                            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{media.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(media.size)}
                            {media.metadata?.width && media.metadata?.height && (
                              <span> • {media.metadata.width}×{media.metadata.height}</span>
                            )}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMediaFiles(prev => prev.filter(m => m.id !== media.id))}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileInput}
              className="hidden"
            />

            {/* Career Intent Tags */}
            {showIntentSelector && (
              <CareerIntentTags
                selectedIntents={selectedIntents}
                onIntentToggle={handleIntentToggle}
                showDescription={false}
              />
            )}

            {/* Selected Intent Display */}
            {selectedIntents.length > 0 && (
              <CareerIntentTags
                selectedIntents={selectedIntents}
                onIntentToggle={() => {}}
                variant="display"
              />
            )}

            {/* Location Input */}
            {showLocationInput && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Add location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button variant="ghost" size="sm" onClick={() => setShowLocationInput(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Enhanced Toolbar */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                <Wand2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHashtagAssistant(!showHashtagAssistant)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Hash className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTrendingTopics(!showTrendingTopics)}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
              <EmojiPicker onEmojiSelect={handleEmojiSelect}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </EmojiPicker>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoiceToText}
                className={`${isRecording ? 'text-red-600 animate-pulse' : 'text-green-600'} hover:text-green-700 hover:bg-green-50`}
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLocationInput(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <MapPin className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              >
                <Image className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowIntentSelector(!showIntentSelector)}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                <Target className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {/* AI Tone Buttons */}
              {showAIAssistant && (
                <div className="flex gap-1 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => handleAIRewrite('professional')}>
                    ✨ Professional
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAIRewrite('engaging')}>
                    🔥 Engaging
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAIRewrite('casual')}>
                    😊 Casual
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAIRewrite('concise')}>
                    ⚡ Concise
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAIRewrite('thoughtful')}>
                    🧠 Thoughtful
                  </Button>
                </div>
              )}
              
              <Button 
                onClick={handlePost} 
                disabled={!content.trim() || isPosting}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {isPosting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Posting...
                  </div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Assistant Panels */}
      {showHashtagAssistant && (
        <HashtagAssistant
          content={content}
          userRole={user?.user_metadata?.role}
          userSkills={user?.user_metadata?.skills || []}
          onHashtagsSelect={setSelectedHashtags}
          selectedHashtags={selectedHashtags}
        />
      )}

      {showTrendingTopics && (
        <TrendingTopicsWidget
          userRole={user?.user_metadata?.role}
          onTopicClick={handleTrendingTopicClick}
        />
      )}
    </div>
  );
};