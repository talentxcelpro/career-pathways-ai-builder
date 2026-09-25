
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { OFFICIAL_TXC_VIDEOS } from '@/data/officialVideos';

export interface ReelData {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  tags: string[];
  user_id: string;
  created_at: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_following: boolean;
  has_liked: boolean;
  user_name: string;
  user_avatar: string;
  talent_score?: number;
  creator_role?: string;
  location?: string;
  related_job_query?: string;
}

export const GLOBAL_CURATED_REELS: ReelData[] = [
  {
    id: 'txc-sarah-rag-ai',
    title: 'How to design RAG architectures that actually scale in production',
    description: 'Breaking down chunking strategies, hybrid vector + keyword search, and latency optimization when scaling to 10M queries.',
    video_url: '/social-vault/2026-09-05/camp-jobs-2026/cnt-batch-20260905-ai_careers/youtube/video_9x16.mp4',
    thumbnail_url: '/videos/txc/thumbnails/talentxcel-job-match.jpg',
    duration_seconds: 32,
    tags: ['AI', 'MachineLearning', 'SystemDesign', 'Tech'],
    user_id: 'creator-sarah-chen',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    views_count: 42500,
    likes_count: 3890,
    comments_count: 284,
    shares_count: 412,
    is_following: true,
    has_liked: false,
    user_name: 'sarah_ai',
    user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    talent_score: 940,
    creator_role: 'Lead ML Architect',
    location: 'San Francisco & Remote',
    related_job_query: 'AI / Machine Learning Engineer'
  },
  {
    id: 'txc-vikram-kafka-perf',
    title: 'Why Kafka partitions break during flash sales (and how we fixed it)',
    description: 'Real war-story from scaling payment settlement to 250,000 writes/second across distributed clusters.',
    video_url: '/social-vault/2026-09-11/camp-google-vids/cnt-gvids-20260911-b75979ef/youtube/video_9x16.mp4',
    thumbnail_url: '/videos/txc/thumbnails/talentxcel-overview.jpg',
    duration_seconds: 40,
    tags: ['Kafka', 'DistributedSystems', 'Backend', 'SystemDesign'],
    user_id: 'creator-vikram-malhotra',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    views_count: 38100,
    likes_count: 2940,
    comments_count: 198,
    shares_count: 324,
    is_following: false,
    has_liked: false,
    user_name: 'vikram_tech',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    talent_score: 925,
    creator_role: 'Staff Distributed Systems Engineer',
    location: 'Dubai & Bengaluru',
    related_job_query: 'Distributed Systems Architect'
  },
  {
    id: 'txc-elena-ats-secrets',
    title: 'What 90% of candidates do wrong in their tech resume summary',
    description: 'Watch live as an enterprise ATS parses section headers, keyword densities, and quantifiable proof points.',
    video_url: '/videos/txc/ats-demo-2.mp4',
    thumbnail_url: '/videos/txc/thumbnails/ats-demo-2.jpg',
    duration_seconds: 42,
    tags: ['Resume', 'ATS', 'CareerGrowth', 'HiringSecrets'],
    user_id: 'creator-elena-rostova',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    views_count: 61200,
    likes_count: 5420,
    comments_count: 432,
    shares_count: 671,
    is_following: true,
    has_liked: false,
    user_name: 'elena_careers',
    user_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    talent_score: 890,
    creator_role: 'Principal Tech Recruiter',
    location: 'London & Berlin',
    related_job_query: 'Technical Recruiter / Talent Partner'
  },
  {
    id: 'txc-david-salary-negotiation',
    title: 'Negotiating ₹45L+ vs $180k global remote compensation: The exact playbook',
    description: 'How to benchmark international remote pay, equity vesting schedules, and tax structures across UAE, US, and Europe.',
    video_url: '/social-vault/2026-09-06/camp-resume_ats-2026/cnt-batch-20260906-resume_ats/youtube/video_9x16.mp4',
    thumbnail_url: '/videos/txc/thumbnails/talentxcel-career-hub.jpg',
    duration_seconds: 35,
    tags: ['SalaryTransparency', 'RemoteWork', 'Compensation', 'Career'],
    user_id: 'creator-david-kim',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    views_count: 54800,
    likes_count: 4780,
    comments_count: 341,
    shares_count: 512,
    is_following: false,
    has_liked: false,
    user_name: 'david_k',
    user_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    talent_score: 955,
    creator_role: 'VP of Product Engineering',
    location: 'Singapore & US Remote',
    related_job_query: 'Engineering Manager / VP Engineering'
  },
  {
    id: 'txc-priya-cloud-cost',
    title: 'Serverless vs Kubernetes in 2026: Cost breakdowns after 1M requests/sec',
    description: 'The cold start reality, cluster egress billing surprises, and architectural decision matrices for multi-region systems.',
    video_url: '/videos/txc/talentxcel-job-match.mp4',
    thumbnail_url: '/videos/txc/thumbnails/talentxcel-job-match.jpg',
    duration_seconds: 29,
    tags: ['AWS', 'Cloud', 'Kubernetes', 'DevOps', 'SystemDesign'],
    user_id: 'creator-priya-sharma',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    views_count: 29400,
    likes_count: 2120,
    comments_count: 165,
    shares_count: 278,
    is_following: false,
    has_liked: false,
    user_name: 'priya_cloud',
    user_avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    talent_score: 915,
    creator_role: 'Principal Cloud Architect',
    location: 'Hyderabad & Remote',
    related_job_query: 'Cloud & DevOps Architect'
  },
  {
    id: 'txc-alex-design-systems',
    title: 'Micro-interactions that made our SaaS conversion jump 34%',
    description: 'How spring physics, tactile button feedback, and progressive data disclosure transform mundane dashboard UX.',
    video_url: '/videos/txc/talentxcel-career-passport.mp4',
    thumbnail_url: '/videos/txc/thumbnails/talentxcel-career-passport.jpg',
    duration_seconds: 19,
    tags: ['Frontend', 'React', 'DesignSystems', 'UIUX'],
    user_id: 'creator-alex-rivera',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    views_count: 33600,
    likes_count: 2870,
    comments_count: 182,
    shares_count: 194,
    is_following: false,
    has_liked: false,
    user_name: 'alex_frontend',
    user_avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    talent_score: 895,
    creator_role: 'Senior UI/UX Architect',
    location: 'São Paulo & Remote',
    related_job_query: 'Senior React / Frontend Developer'
  },
  {
    id: 'txc-official-platform',
    title: 'Inside Recruiter OS: How the database actively searches for you',
    description: 'Stop submitting static resumes into black holes. See how verified Career Passports link directly with hiring teams.',
    video_url: '/videos/txc/talentxcel-overview.mp4',
    thumbnail_url: '/videos/txc/thumbnails/talentxcel-overview.jpg',
    duration_seconds: 24,
    tags: ['TalentXcel', 'RecruiterOS', 'CareerPassport', 'Leadership'],
    user_id: 'official-talentxcel',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    views_count: 89400,
    likes_count: 7120,
    comments_count: 512,
    shares_count: 843,
    is_following: true,
    has_liked: false,
    user_name: 'TalentXcel Official',
    user_avatar: '/talentxcel-official-logo.png',
    talent_score: 990,
    creator_role: 'Global Talent Network',
    location: 'Worldwide',
    related_job_query: 'Executive & Tech Leadership'
  }
];

export const useReelsData = (feedType: 'following' | 'explore' = 'explore', category: string = 'all') => {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['reels-feed', user?.id, feedType, category],
    queryFn: async ({ pageParam = 0 }) => {
      console.log('Fetching reels with pageParam:', pageParam, 'feedType:', feedType, 'category:', category);
      const limit = 10;
      const offset = pageParam * limit;
      
      // Filter curated reels according to feedType & category
      let curated = [...GLOBAL_CURATED_REELS];

      if (category && category !== 'all') {
        const catLower = category.toLowerCase();
        curated = curated.filter(r => 
          r.tags.some(t => t.toLowerCase().includes(catLower)) ||
          r.title.toLowerCase().includes(catLower) ||
          r.description.toLowerCase().includes(catLower)
        );
        // If filter is too narrow, fall back to all
        if (curated.length === 0) curated = [...GLOBAL_CURATED_REELS];
      }

      if (feedType === 'following') {
        const followed = curated.filter(r => r.is_following);
        if (followed.length > 0) {
          curated = followed;
        }
      }

      // Check Supabase for user uploaded reels/video posts
      try {
        const { data: posts } = await supabase
          .from('posts')
          .select(`
            id, 
            user_id, 
            created_at, 
            headline, 
            content, 
            media_urls,
            likes_count,
            comments_count,
            shares_count,
            views_count
          `)
          .not('media_urls', 'is', null)
          .order('created_at', { ascending: false })
          .limit(10);

        if (posts && posts.length > 0) {
          const videoPosts = posts.filter((p: any) => {
            if (!Array.isArray(p.media_urls) || p.media_urls.length === 0) return false;
            return p.media_urls.some((u: string) => 
              typeof u === 'string' && (u.includes('.mp4') || u.includes('.mov') || u.includes('.webm'))
            );
          });

          if (videoPosts.length > 0) {
            const userIds = Array.from(new Set(videoPosts.map((p: any) => p.user_id).filter(Boolean)));
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, full_name, profile_picture_url')
              .in('id', userIds);

            const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

            const mapped: ReelData[] = videoPosts.map((p: any) => {
              const videoUrl = p.media_urls.find((u: string) => 
                u.toLowerCase().includes('.mp4') || u.toLowerCase().includes('.mov') || u.toLowerCase().includes('.webm')
              );
              const prof = profileMap.get(p.user_id);
              return {
                id: p.id,
                title: p.headline || 'Community Reel',
                description: p.content || '',
                video_url: videoUrl,
                thumbnail_url: '',
                duration_seconds: 30,
                tags: ['Community', 'TalentXcel'],
                user_id: p.user_id,
                created_at: p.created_at,
                views_count: p.views_count || 120,
                likes_count: p.likes_count || 15,
                comments_count: p.comments_count || 3,
                shares_count: p.shares_count || 4,
                is_following: false,
                has_liked: false,
                user_name: prof?.full_name || 'Community Member',
                user_avatar: prof?.profile_picture_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
                talent_score: 850,
                creator_role: 'Network Member',
                location: 'Global'
              };
            });

            // Prepend user videos ahead of curated
            return [...mapped, ...curated];
          }
        }
      } catch (err) {
        console.warn('Supabase reels fetch fallback to curated:', err);
      }

      return curated;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length >= 10 ? allPages.length : undefined;
    },
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const useReelViewTracking = () => {
  const { user } = useAuth();

  const trackView = async (reelId: string, durationWatched: number = 0) => {
    if (!user) return;

    try {
      console.log('Tracking view for reel:', reelId);
      await supabase.rpc('increment_reel_view', {
        reel_id_param: reelId,
        user_id_param: user.id,
        duration_watched_param: durationWatched
      });
    } catch (error) {
      console.error('Error tracking reel view:', error);
    }
  };

  return { trackView };
};
