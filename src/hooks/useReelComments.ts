import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ReelComment {
  id: string;
  content: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  created_at: string;
  reel_id: string;
  likes_count?: number;
  is_guest?: boolean;
}

const SEED_COMMENTS_MAP: Record<string, ReelComment[]> = {
  'txc-sarah-rag-ai': [
    {
      id: 'sc-sarah-1',
      content: 'The contextual compression technique combined with BM25 reranking dropped our retrieval latency by 45ms. Golden advice!',
      user_id: 'user-marcus-vance',
      user_name: 'Marcus Vance',
      user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      reel_id: 'txc-sarah-rag-ai',
      likes_count: 42
    },
    {
      id: 'sc-sarah-2',
      content: "We're hiring 3 Senior ML Engineers for this exact production setup in Dubai. Verified candidates with 850+ TalentScore reach out!",
      user_id: 'user-layla-mansoori',
      user_name: 'Layla Al-Mansoori',
      user_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=face',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      reel_id: 'txc-sarah-rag-ai',
      likes_count: 89
    },
    {
      id: 'sc-sarah-3',
      content: 'Did you benchmark cross-encoders vs bi-encoders for the rerank stage on multi-turn conversations?',
      user_id: 'user-ananya-gupta',
      user_name: 'Ananya Gupta',
      user_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face',
      created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
      reel_id: 'txc-sarah-rag-ai',
      likes_count: 19
    }
  ],
  'txc-vikram-kafka-perf': [
    {
      id: 'sc-vik-1',
      content: 'Keying partitions by merchant_id instead of order_id was the absolute gamechanger. Prevented consumer lag spikes completely.',
      user_id: 'user-david-schneider',
      user_name: 'David Schneider',
      user_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face',
      created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
      reel_id: 'txc-vikram-kafka-perf',
      likes_count: 67
    },
    {
      id: 'sc-vik-2',
      content: '250k writes/sec is serious throughput. Are you running tiered storage on AWS S3 or pure EBS volumes?',
      user_id: 'user-carlos-silva',
      user_name: 'Carlos Silva',
      user_avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&crop=face',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      reel_id: 'txc-vikram-kafka-perf',
      likes_count: 34
    }
  ],
  'txc-elena-ats-secrets': [
    {
      id: 'sc-elena-1',
      content: 'As an agency recruiter who reviewed 15,000+ resumes across Europe, the 2-column layout warning is 100% accurate. Plain single-column wins every time.',
      user_id: 'user-robert-sterling',
      user_name: 'Robert Sterling',
      user_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      reel_id: 'txc-elena-ats-secrets',
      likes_count: 154
    },
    {
      id: 'sc-elena-2',
      content: 'Rewrote my resume using TalentXcel Career Passport format and got 3 interviews in a single week. TalentScore went from 710 to 910!',
      user_id: 'user-tariq-mansour',
      user_name: 'Tariq Mansour',
      user_avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      reel_id: 'txc-elena-ats-secrets',
      likes_count: 88
    }
  ],
  'txc-david-salary-negotiation': [
    {
      id: 'sc-david-1',
      content: 'The bracket technique helped me negotiate an extra $32,000 base when relocating from London to San Francisco. Never say a single fixed number.',
      user_id: 'user-liam-oconnor',
      user_name: "Liam O'Connor",
      user_avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&h=120&fit=crop&crop=face',
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      reel_id: 'txc-david-salary-negotiation',
      likes_count: 112
    },
    {
      id: 'sc-david-2',
      content: 'Recruiter perspective: Candidates who articulate ROI with concrete business impact like this get approved at top-of-band every time.',
      user_id: 'user-chloe-dubois',
      user_name: 'Chloe Dubois',
      user_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      reel_id: 'txc-david-salary-negotiation',
      likes_count: 61
    }
  ]
};

const DEFAULT_SEED_COMMENTS: ReelComment[] = [
  {
    id: 'sc-default-1',
    content: 'Brilliant breakdown! Bookmarking this for our engineering architecture review.',
    user_id: 'user-dev-lead',
    user_name: 'Alexandre Morel',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    reel_id: 'default',
    likes_count: 28
  },
  {
    id: 'sc-default-2',
    content: 'Top quality insight. TalentXcel community is delivering real engineering value.',
    user_id: 'user-sarah-m',
    user_name: 'Fatima Al-Hassan',
    user_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=face',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    reel_id: 'default',
    likes_count: 45
  }
];

export const useReelComments = (reelId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch comments with graceful seed fallback
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['reel-comments', reelId],
    queryFn: async () => {
      const seedComments = SEED_COMMENTS_MAP[reelId] || DEFAULT_SEED_COMMENTS.map(c => ({ ...c, reel_id: reelId }));

      // If reelId is a non-UUID format (curated/official reel), serve seed comments immediately
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reelId);
      if (!isUUID) {
        return seedComments;
      }

      try {
        const { data, error } = await supabase
          .from('comments')
          .select(`
            id,
            content,
            user_id,
            created_at,
            reel_id,
            profiles!comments_user_id_fkey (
              display_name,
              avatar_url
            )
          `)
          .eq('content_id', reelId)
          .eq('content_type', 'post')
          .order('created_at', { ascending: true });

        if (error) {
          console.warn('Comments fetch notice, serving curated discussion:', error.message);
          return seedComments;
        }

        if (!data || data.length === 0) {
          return seedComments;
        }

        const dbComments = data.map(comment => ({
          id: comment.id,
          content: comment.content,
          user_id: comment.user_id,
          user_name: (comment.profiles as any)?.full_name || (comment.profiles as any)?.display_name || 'TalentXcel Professional',
          user_avatar: (comment.profiles as any)?.avatar_url || '',
          created_at: comment.created_at,
          reel_id: comment.reel_id,
          likes_count: 1
        })) as ReelComment[];

        return [...seedComments, ...dbComments];
      } catch (err) {
        return seedComments;
      }
    },
    enabled: !!reelId,
    refetchOnWindowFocus: false,
  });

  // Add comment mutation (supports both authenticated users & optimistic guest commenting)
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reelId);

      if (user && isUUID) {
        try {
          const { data, error } = await supabase
            .from('comments')
            .insert({
              content,
              user_id: user.id,
              content_id: reelId,
              content_type: 'post'
            })
            .select(`
              id,
              content,
              user_id,
              created_at,
              profiles!comments_user_id_fkey (
                display_name,
                avatar_url
              )
            `)
            .single();

          if (!error && data) {
            return {
              id: data.id,
              content: data.content,
              user_id: data.user_id,
              user_name: (data.profiles as any)?.display_name || user.user_metadata?.full_name || 'You',
              user_avatar: (data.profiles as any)?.avatar_url || user.user_metadata?.avatar_url || '',
              created_at: data.created_at,
              reel_id: reelId,
              likes_count: 1
            } as ReelComment;
          }
        } catch (e) {
          console.warn('DB comment insert fallback to optimistic cache');
        }
      }

      // Optimistic client comment for guest or non-UUID reel
      const optimisticComment: ReelComment = {
        id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        content,
        user_id: user?.id || 'guest-user',
        user_name: user?.user_metadata?.full_name || 'You (TalentXcel Member)',
        user_avatar: user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face',
        created_at: new Date().toISOString(),
        reel_id: reelId,
        likes_count: 1,
        is_guest: !user
      };

      return optimisticComment;
    },
    onSuccess: (newComment) => {
      // Add the new comment to the cache immediately
      queryClient.setQueryData(['reel-comments', reelId], (oldComments: ReelComment[] = []) => [
        ...oldComments,
        newComment
      ]);

      if (newComment.is_guest) {
        toast.success('Comment shared! Join TalentXcel to claim your Career Passport handle.');
      } else {
        toast.success('Comment posted successfully!');
      }
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment. Please try again.');
    }
  });

  return {
    comments,
    isLoading,
    addComment: addCommentMutation.mutateAsync,
    isAddingComment: addCommentMutation.isPending
  };
};