import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TalentXcelMobileHeader } from '@/components/mobile/TalentXcelMobileHeader';
import { StoryBubbles } from '@/components/mobile/StoryBubbles';
import { NetworkPost } from '@/components/mobile/NetworkPost';
import { PeopleYouMayKnow } from '@/components/mobile/PeopleYouMayKnow';
import { ScrollArea } from '@/components/ui/scroll-area';

export const MobileNetwork = () => {
  const { user } = useAuth();

  // Sample posts data (in a real app, this would come from Supabase)
  const samplePosts = [
    {
      id: '1',
      type: 'job' as const,
      title: 'Senior React Developer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      salary: '$120k - $160k',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
      description: 'We are looking for a passionate Senior React Developer to join our growing team. You will be responsible for building scalable web applications using modern technologies.',
      tags: ['React', 'TypeScript', 'Remote'],
      timeAgo: '2h',
      interactions: {
        interested: 47,
        comments: 12,
        shares: 8
      }
    },
    {
      id: '2',
      type: 'content' as const,
      title: 'The Future of Remote Work',
      company: 'LinkedIn',
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop',
      description: 'Remote work is here to stay. Companies that embrace flexible work arrangements are seeing higher employee satisfaction and retention rates. Here are 5 key strategies for successful remote teams...',
      tags: ['Remote Work', 'Leadership', 'Productivity'],
      timeAgo: '4h',
      interactions: {
        interested: 234,
        comments: 67,
        shares: 45
      }
    },
    {
      id: '3',
      type: 'job' as const,
      title: 'Product Manager - AI/ML',
      company: 'Google',
      location: 'Mountain View, CA',
      salary: '$140k - $200k',
      video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop',
      description: 'Join our AI/ML team as a Product Manager and help shape the future of artificial intelligence products that impact billions of users worldwide.',
      tags: ['AI/ML', 'Product Management', 'Leadership'],
      timeAgo: '6h',
      interactions: {
        interested: 189,
        comments: 34,
        shares: 28
      }
    },
    {
      id: '4',
      type: 'content' as const,
      title: 'Career Growth Tips for 2024',
      company: 'Harvard Business Review',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
      description: 'As we move into 2024, professionals need to adapt to new market demands. Here are the top 10 skills that will be in high demand and how to develop them effectively.',
      tags: ['Career Development', 'Skills', '2024 Trends'],
      timeAgo: '8h',
      interactions: {
        interested: 512,
        comments: 128,
        shares: 89
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <TalentXcelMobileHeader />
      <StoryBubbles />
      
      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="pb-20">
          {/* Posts Feed */}
          {samplePosts.map((post, index) => (
            <div key={post.id}>
              <NetworkPost post={post} />
              {/* Insert "People You May Know" after the second post */}
              {index === 1 && <PeopleYouMayKnow />}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};