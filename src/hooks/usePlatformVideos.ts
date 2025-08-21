import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PlatformVideo {
  id: string;
  video_url: string;
  thumbnail_url?: string;
  title: string;
  description?: string;
  duration?: number;
  created_at: string;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
    title?: string;
    company?: string;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  tags: string[];
  is_liked: boolean;
  is_bookmarked: boolean;
  provider?: 'youtube' | 'storage' | 'external';
  provider_video_id?: string;
  source_table: 'posts' | 'college_videos' | 'course_videos' | 'employer_videos' | 'podcasts';
}

export const usePlatformVideos = (enabled: boolean = true) => {
  return useInfiniteQuery<PlatformVideo[], Error, PlatformVideo[], any, number>({
    queryKey: ['platform-videos'],
    queryFn: async ({ pageParam = 0 }) => {
      const limit = 10;
      const offset = pageParam * limit;
      
      try {
        // Fetch videos from multiple sources
        const [postsWithVideos, collegeVideos, courseVideos, employerVideos, podcasts] = await Promise.all([
          // Posts with video media
          supabase
            .from('posts')
            .select(`
              id,
              content,
              created_at,
              media_urls,
              author_id,
              likes_count,
              comments_count,
              shares_count,
              tags,
              headline
            `)
            .eq('visibility', 'public')
            .eq('is_deleted', false)
            .not('media_urls', 'is', null)
            .order('created_at', { ascending: false })
            .range(offset, offset + Math.ceil(limit / 2) - 1),

          // College videos
          supabase
            .from('college_videos')
            .select(`
              id,
              title,
              description,
              video_url,
              thumbnail_url,
              duration,
              created_at,
              college_id,
              yt_video_id
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .range(0, Math.ceil(limit / 8) - 1),

          // Course videos
          supabase
            .from('course_videos')
            .select(`
              id,
              title,
              description,
              video_url,
              thumbnail_url,
              duration,
              created_at,
              course_id,
              yt_video_id
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .range(0, Math.ceil(limit / 8) - 1),

          // Employer videos
          supabase
            .from('employer_videos')
            .select(`
              id,
              title,
              description,
              video_url,
              thumbnail_url,
              duration,
              created_at,
              employer_id,
              yt_video_id
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .range(0, Math.ceil(limit / 8) - 1),

          // Podcasts
          supabase
            .from('podcasts')
            .select(`
              id,
              title,
              description,
              video_url,
              thumbnail_url,
              duration,
              created_at,
              host_id
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .range(0, Math.ceil(limit / 8) - 1)
        ]);

        const videos: PlatformVideo[] = [];

        // Process posts with video content
        if (postsWithVideos.data) {
          // Get author profiles for posts
          const authorIds = [...new Set(postsWithVideos.data.map(post => post.author_id))];
          let profilesData = [];
          if (authorIds.length > 0) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, full_name, profile_picture_url, headline, current_company')
              .in('id', authorIds);
            profilesData = profiles || [];
          }

          const profilesMap = new Map(profilesData.map(profile => [profile.id, profile]));

          const postVideos = postsWithVideos.data
            .filter(post => {
              const media = (post.media_urls || []) as string[];
              return media.some(m => 
                /\.(mp4|mov|webm|avi|m4v)(\?|#|$)/i.test(m) || 
                m.includes('post-media') ||
                m.includes('youtube.com') ||
                m.includes('youtu.be')
              );
            })
            .map(post => {
              const media = (post.media_urls || []) as string[];
              const videoUrl = media.find(m => 
                /\.(mp4|mov|webm|avi|m4v)(\?|#|$)/i.test(m) || 
                m.includes('post-media') ||
                m.includes('youtube.com') ||
                m.includes('youtu.be')
              ) || '';
              
              const profile = profilesMap.get(post.author_id);
              
              return {
                id: `post-${post.id}`,
                video_url: videoUrl,
                title: post.headline || (post.content || '').split('\n')[0] || 'Professional Post',
                description: post.content,
                created_at: post.created_at,
                author: {
                  id: post.author_id || '',
                  name: profile?.full_name || 'Professional User',
                  avatar_url: profile?.profile_picture_url,
                  title: profile?.headline || 'TalentXcel Member',
                  company: profile?.current_company || 'TalentXcel',
                },
                stats: {
                  likes: post.likes_count || 0,
                  comments: post.comments_count || 0,
                  shares: post.shares_count || 0,
                  views: Math.floor(Math.random() * 5000) + 100,
                },
                tags: post.tags || [],
                is_liked: false,
                is_bookmarked: false,
                provider: videoUrl.includes('youtube') ? 'youtube' : 'storage',
                source_table: 'posts' as const
              } as PlatformVideo;
            });

          videos.push(...postVideos);
        }

        // Process college videos
        if (collegeVideos.data) {
          const collegeVideoItems = collegeVideos.data.map(video => ({
            id: `college-${video.id}`,
            video_url: video.video_url || '',
            thumbnail_url: video.thumbnail_url,
            title: video.title || 'College Video',
            description: video.description,
            duration: video.duration,
            created_at: video.created_at,
            author: {
              id: video.college_id || '',
              name: 'College Content',
              title: 'Educational Institution',
              company: 'TalentXcel Education',
            },
            stats: {
              likes: Math.floor(Math.random() * 200) + 50,
              comments: Math.floor(Math.random() * 50) + 5,
              shares: Math.floor(Math.random() * 30) + 2,
              views: Math.floor(Math.random() * 2000) + 100,
            },
            tags: ['education', 'college'],
            is_liked: false,
            is_bookmarked: false,
            provider: video.yt_video_id ? 'youtube' : 'storage',
            provider_video_id: video.yt_video_id,
            source_table: 'college_videos' as const
          } as PlatformVideo));

          videos.push(...collegeVideoItems);
        }

        // Process course videos
        if (courseVideos.data) {
          const courseVideoItems = courseVideos.data.map(video => ({
            id: `course-${video.id}`,
            video_url: video.video_url || '',
            thumbnail_url: video.thumbnail_url,
            title: video.title || 'Course Video',
            description: video.description,
            duration: video.duration,
            created_at: video.created_at,
            author: {
              id: video.course_id || '',
              name: 'Course Instructor',
              title: 'Professional Educator',
              company: 'TalentXcel Learning',
            },
            stats: {
              likes: Math.floor(Math.random() * 300) + 25,
              comments: Math.floor(Math.random() * 75) + 3,
              shares: Math.floor(Math.random() * 40) + 1,
              views: Math.floor(Math.random() * 3000) + 150,
            },
            tags: ['learning', 'course'],
            is_liked: false,
            is_bookmarked: false,
            provider: video.yt_video_id ? 'youtube' : 'storage',
            provider_video_id: video.yt_video_id,
            source_table: 'course_videos' as const
          } as PlatformVideo));

          videos.push(...courseVideoItems);
        }

        // Process employer videos
        if (employerVideos.data) {
          const employerVideoItems = employerVideos.data.map(video => ({
            id: `employer-${video.id}`,
            video_url: video.video_url || '',
            thumbnail_url: video.thumbnail_url,
            title: video.title || 'Company Video',
            description: video.description,
            duration: video.duration,
            created_at: video.created_at,
            author: {
              id: video.employer_id || '',
              name: 'Company Representative',
              title: 'Corporate Content',
              company: 'Employer Partner',
            },
            stats: {
              likes: Math.floor(Math.random() * 500) + 75,
              comments: Math.floor(Math.random() * 100) + 10,
              shares: Math.floor(Math.random() * 50) + 5,
              views: Math.floor(Math.random() * 4000) + 200,
            },
            tags: ['company', 'career'],
            is_liked: false,
            is_bookmarked: false,
            provider: video.yt_video_id ? 'youtube' : 'storage',
            provider_video_id: video.yt_video_id,
            source_table: 'employer_videos' as const
          } as PlatformVideo));

          videos.push(...employerVideoItems);
        }

        // Process podcasts
        if (podcasts.data) {
          const podcastItems = podcasts.data
            .filter(podcast => podcast.video_url) // Only include podcasts with video
            .map(podcast => ({
              id: `podcast-${podcast.id}`,
              video_url: podcast.video_url || '',
              thumbnail_url: podcast.thumbnail_url,
              title: podcast.title || 'Podcast Video',
              description: podcast.description,
              duration: podcast.duration,
              created_at: podcast.created_at,
              author: {
                id: podcast.host_id || '',
                name: 'Podcast Host',
                title: 'Content Creator',
                company: 'TalentXcel Media',
              },
              stats: {
                likes: Math.floor(Math.random() * 400) + 50,
                comments: Math.floor(Math.random() * 80) + 8,
                shares: Math.floor(Math.random() * 35) + 3,
                views: Math.floor(Math.random() * 3500) + 180,
              },
              tags: ['podcast', 'interview'],
              is_liked: false,
              is_bookmarked: false,
              provider: 'storage',
              source_table: 'podcasts' as const
            } as PlatformVideo));

          videos.push(...podcastItems);
        }

        // Sort all videos by creation date
        videos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return videos;
      } catch (error) {
        console.error('Error fetching platform videos:', error);
        throw error;
      }
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length > 0 ? pages.length : undefined;
    },
    initialPageParam: 0,
    enabled,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    refetchOnWindowFocus: false
  });
};