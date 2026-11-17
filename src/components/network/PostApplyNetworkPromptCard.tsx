import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Sparkles, Send, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Share2, ShieldCheck, Flame } from 'lucide-react';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  generatePostApplyPrompts,
  getAllPostApplyPrompts,
  recordSeenPrompt,
  PostApplyPrompt
} from '@/lib/network/postApplyPromptEngine';

interface PostApplyNetworkPromptCardProps {
  job: {
    id: string;
    title: string;
    category?: string;
    location?: string;
    skills_required?: string[] | string;
  };
  onPublished?: (postId: string) => void;
  onSkip?: () => void;
  className?: string;
}

export const PostApplyNetworkPromptCard: React.FC<PostApplyNetworkPromptCardProps> = ({
  job,
  onPublished,
  onSkip,
  className = ''
}) => {
  const navigate = useNavigate();
  const { user, profile } = useOptimizedAuth();

  // Extract top skill from job
  const topSkill = Array.isArray(job.skills_required) && job.skills_required.length > 0
    ? job.skills_required[0]
    : typeof job.skills_required === 'string' && job.skills_required.length > 0
    ? job.skills_required.split(',')[0].trim()
    : 'System Architecture';

  const promptContext = {
    role: job.title,
    industry: job.category || 'Tech & Engineering',
    topSkill,
    city: job.location || 'Global Remote'
  };

  const initialPrompts = generatePostApplyPrompts(promptContext);
  const allPrompts = getAllPostApplyPrompts(promptContext);

  const [prompts, setPrompts] = useState<PostApplyPrompt[]>(initialPrompts);
  const [selectedPrompt, setSelectedPrompt] = useState<PostApplyPrompt>(initialPrompts[0]);
  const [draftContent, setDraftContent] = useState<string>(initialPrompts[0]?.starterDraft || '');
  const [showAllPrompts, setShowAllPrompts] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [charCount, setCharCount] = useState<number>(initialPrompts[0]?.starterDraft?.length || 0);

  // Telemetry helper
  const trackFunnel = async (eventName: string, metadata: Record<string, any> = {}) => {
    try {
      await (supabase.rpc as any)('track_funnel_event', {
        p_event_name: eventName,
        p_step: 'post_apply_prompt',
        p_metadata: {
          job_id: job.id,
          role: job.title,
          industry: job.category,
          user_id: user?.id || null,
          ...metadata
        }
      });
    } catch {
      // Fallback direct insert if RPC unavailable
      try {
        await supabase.from('funnel_events' as any).insert({
          event_name: eventName,
          step: 'post_apply_prompt',
          metadata: {
            job_id: job.id,
            role: job.title,
            industry: job.category,
            user_id: user?.id || null,
            ...metadata
          }
        });
      } catch {
        // Silently ignore telemetry failure
      }
    }
  };

  useEffect(() => {
    trackFunnel('post_apply_prompt_viewed', { initial_prompt_id: selectedPrompt?.id });
  }, []);

  const handleSelectPrompt = (prompt: PostApplyPrompt) => {
    setSelectedPrompt(prompt);
    setDraftContent(prompt.starterDraft);
    setCharCount(prompt.starterDraft.length);
    recordSeenPrompt(prompt.id);
    trackFunnel('post_apply_prompt_selected', { prompt_id: prompt.id, archetype: prompt.archetype });
  };

  const handleDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setDraftContent(text);
    setCharCount(text.length);
  };

  const handlePublish = async () => {
    if (!draftContent.trim()) {
      toast.error('Please write some content before publishing.');
      return;
    }

    setIsSubmitting(true);
    try {
      const authorId = user?.id || '9aebe002-fa04-4f7f-af4d-a588de663ac3'; // Sanobar Khan fallback
      const hashtags = [
        job.category?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'careers',
        topSkill.toLowerCase().replace(/[^a-z0-9]/g, ''),
        'talentxcel'
      ].filter(Boolean);

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: authorId,
          content: draftContent.trim(),
          hashtags: hashtags.map(h => `#${h}`),
          post_type: 'perspective',
          industry_slug: job.category?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'tech'
        } as any)
        .select('id')
        .single();

      if (error) throw error;

      const postId = data?.id || '';
      toast.success('Your perspective was shared to the Network!');
      trackFunnel('post_apply_post_published', { post_id: postId, prompt_id: selectedPrompt.id });

      const industryQuery = encodeURIComponent(job.category || 'tech');
      if (onPublished) {
        onPublished(postId);
      } else {
        navigate(`/network?highlight_post=${postId}&industry=${industryQuery}`);
      }
    } catch (err: any) {
      console.error('Error publishing network post:', err);
      toast.error('Could not publish post. Navigating to network...');
      handleSkip();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    trackFunnel('post_apply_skipped_to_network');
    const industryQuery = encodeURIComponent(job.category || 'tech');
    if (onSkip) {
      onSkip();
    } else {
      navigate(`/network?industry=${industryQuery}`);
    }
  };

  const authorName = profile?.full_name || user?.user_metadata?.full_name || 'Verified Professional';
  const authorTitle = profile?.title || `${job.title} Practitioner`;
  const authorAvatar = profile?.avatar_url || profile?.profile_picture_url || user?.user_metadata?.avatar_url;

  return (
    <Card className={`border-blue-200/80 dark:border-blue-900/50 bg-gradient-to-br from-blue-500/5 via-card to-indigo-500/5 shadow-md rounded-2xl overflow-hidden ${className}`}>
      <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              Recruiter Visibility Multiplier
            </div>
            <CardTitle className="text-base sm:text-lg font-black text-foreground">
              Share your perspective with the TalentXcel Network
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Application Submitted!</span> Professionals who start a discussion get <span className="font-bold text-foreground">3x more profile visits</span> from active recruiters.
            </CardDescription>
          </div>
          <Badge className="bg-blue-600/10 text-blue-700 dark:text-blue-300 border-blue-500/30 text-[10px] font-bold px-2 py-0.5 shrink-0">
            Optional
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Discussion Topic Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground flex items-center justify-between">
            <span>Choose a discussion starter:</span>
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                setShowAllPrompts(!showAllPrompts);
                setPrompts(showAllPrompts ? initialPrompts : allPrompts);
              }}
              className="text-[11px] font-semibold text-primary p-0 h-auto gap-0.5"
            >
              {showAllPrompts ? (
                <>Show less <ChevronUp className="h-3 w-3" /></>
              ) : (
                <>Explore 4 more <ChevronDown className="h-3 w-3" /></>
              )}
            </Button>
          </label>

          <div className="flex flex-wrap gap-2">
            {prompts.map((p) => {
              const isSelected = selectedPrompt?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPrompt(p)}
                  className={`text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border/80'
                  }`}
                >
                  <span className="font-bold block text-[10px] opacity-80 uppercase tracking-wider">{p.archetype}</span>
                  <span>{p.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Editable Post Textarea with Optimal Length Telemetry */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
            <span>Edit your draft (never mentions application or company):</span>
            <span className={charCount >= 280 && charCount <= 600 ? 'text-emerald-600 font-bold' : ''}>
              {charCount} / 600 chars {charCount >= 280 && charCount <= 600 && '• Optimal Length'}
            </span>
          </div>

          <Textarea
            value={draftContent}
            onChange={handleDraftChange}
            rows={4}
            maxLength={800}
            className="rounded-xl resize-none text-xs leading-relaxed bg-background font-normal focus-visible:ring-blue-500"
            placeholder="Write your career perspective or industry observation..."
          />
        </div>

        {/* Live Network Preview Card */}
        <div className="p-3 rounded-xl border border-dashed border-border/80 bg-muted/30 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>Feed Post Preview</span>
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
              <ShieldCheck className="h-3 w-3" /> Live on /network
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <Avatar className="w-8 h-8 border border-border shrink-0">
              <AvatarImage src={authorAvatar} />
              <AvatarFallback className="text-xs font-bold bg-slate-900 text-white">
                {authorName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-foreground truncate">{authorName}</span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-blue-500/10 text-blue-600 border-blue-500/20 font-semibold">
                  Level 2 Passport
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                {draftContent || 'Your perspective post content will appear here...'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="w-full sm:w-auto text-xs text-muted-foreground hover:text-foreground font-semibold order-2 sm:order-1"
          >
            Skip & Browse /network <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>

          <Button
            type="button"
            onClick={handlePublish}
            disabled={isSubmitting || !draftContent.trim()}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm h-9 px-4 gap-1.5 order-1 sm:order-2"
          >
            {isSubmitting ? (
              <>Publishing...</>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Publish to Network & View Feed
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostApplyNetworkPromptCard;
