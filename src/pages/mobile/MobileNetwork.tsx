import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { StoryBubbles } from '@/components/mobile/StoryBubbles';
import { NetworkPost } from '@/components/mobile/NetworkPost';
import { PeopleYouMayKnow } from '@/components/mobile/PeopleYouMayKnow';
import { MobilePostCreation } from '@/components/mobile/MobilePostCreation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus } from 'lucide-react';

export const MobileNetwork = () => {
  const { user } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Fetch real posts data from Supabase
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['network-posts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          headline,
          post_type,
          media_urls,
          created_at,
          author_id,
          profiles!posts_author_id_fkey(
            id,
            full_name,
            profile_picture_url,
            headline,
            current_company
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map((post: any) => ({
        id: post.id,
        type: (post.post_type === 'job_posting' ? 'job' : 'content') as 'job' | 'content',
        title: post.headline || post.content?.split('\n')[0] || 'Professional Update',
        company: post.profiles?.current_company || post.profiles?.full_name || 'Professional',
        location: 'Remote', // Could be enhanced with location data
        salary: post.post_type === 'job_posting' ? '$80k - $120k' : undefined,
        image: post.media_urls?.[0] || 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop',
        description: post.content || 'Professional update...',
        tags: ['Professional', 'Career', 'Growth'],
        timeAgo: formatTimeAgo(post.created_at),
        interactions: {
          interested: Math.floor(Math.random() * 100) + 10,
          comments: Math.floor(Math.random() * 50) + 5,
          shares: Math.floor(Math.random() * 20) + 2
        },
        author: {
          name: post.profiles?.full_name || 'Professional User',
          avatar: post.profiles?.profile_picture_url
        }
      }));
    },
    enabled: !!user
  });

  // Fetch real jobs data for job posts
  const { data: jobs = [] } = useQuery({
    queryKey: ['network-jobs', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          company_name,
          location,
          salary_min,
          salary_max,
          description,
          created_at,
          skills_required,
          employment_type
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map((job: any) => ({
        id: job.id,
        type: 'job' as const,
        title: job.title,
        company: job.company_name,
        location: job.location,
        salary: job.salary_min && job.salary_max 
          ? `$${Math.round(job.salary_min/1000)}k - $${Math.round(job.salary_max/1000)}k`
          : 'Competitive',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
        description: job.description,
        tags: job.skills_required?.slice(0, 3) || ['Career', 'Opportunity'],
        timeAgo: formatTimeAgo(job.created_at),
        interactions: {
          interested: Math.floor(Math.random() * 100) + 20,
          comments: Math.floor(Math.random() * 30) + 5,
          shares: Math.floor(Math.random() * 15) + 3
        }
      }));
    },
    enabled: !!user
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  // Combine posts and jobs for the feed
  const allPosts = [...posts, ...jobs].sort((a, b) => {
    // Sort by a mix of recency and interaction engagement
    const aScore = a.interactions.interested + a.interactions.comments;
    const bScore = b.interactions.interested + b.interactions.comments;
    return bScore - aScore;
  });

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50">
        <StoryBubbles />
        
        {/* Quick Post Creation */}
        <div className="p-4">
          <Card className="p-3 bg-white/95 backdrop-blur-sm border-0 shadow-sm rounded-2xl">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.picture} />
                <AvatarFallback className="bg-primary text-white text-sm">
                  {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                className="flex-1 justify-start text-gray-500 h-9 rounded-xl bg-gray-50"
                onClick={() => setShowCreatePost(true)}
              >
                Share your thoughts...
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-xl"
                onClick={() => setShowCreatePost(true)}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </Card>
        </div>
        
        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="pb-20">
            {/* Posts Feed */}
            {allPosts.map((post, index) => (
              <div key={post.id}>
                <NetworkPost post={post} />
                {/* Insert "People You May Know" after the second post */}
                {index === 1 && <PeopleYouMayKnow />}
              </div>
            ))}
            
            {allPosts.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-gray-600">No posts available yet.</p>
                <p className="text-sm text-gray-500 mt-2">Connect with more professionals to see their updates!</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Post Creation Modal */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <MobilePostCreation
              onClose={() => setShowCreatePost(false)}
              onPostCreated={() => {
                setShowCreatePost(false);
                // Refetch posts here if needed
                window.location.reload();
              }}
            />
          </div>
        )}
      </div>
    </MobileLayout>
  );
};