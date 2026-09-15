import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ReelsPost {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    title?: string;
    isFollowing?: boolean;
  };
  content: {
    type: 'video' | 'image' | 'text';
    url?: string;
    text?: string;
    duration?: number;
  };
  caption?: string;
  stats: {
    likes: number;
    comments: number;
    shares: number;
    isLiked: boolean;
    isBookmarked: boolean;
  };
  isJobPost?: boolean;
  jobDetails?: {
    company: string;
    position: string;
    location: string;
    applyUrl?: string;
  };
  timestamp: string;
}

export const useReelsFeed = (feedType: 'following' | 'explore' = 'explore') => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ReelsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockPosts: ReelsPost[] = [
    {
      id: '1',
      user: {
        id: 'user1',
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612c632?w=150&h=150&fit=crop&crop=face',
        title: 'Senior Software Engineer at Google',
        isFollowing: false
      },
      content: {
        type: 'video',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        duration: 30
      },
      caption: 'Just shipped a major feature at work! 🚀 The feeling when your code works on the first try is unmatched. Here\'s a quick walkthrough of the new dashboard we built for our users. #TechLife #SoftwareEngineering #WebDevelopment',
      stats: {
        likes: 1547,
        comments: 89,
        shares: 23,
        isLiked: false,
        isBookmarked: false
      },
      timestamp: '2h ago'
    },
    {
      id: '2',
      user: {
        id: 'user2',
        name: 'Microsoft Careers',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop',
        title: 'Official Microsoft Account',
        isFollowing: true
      },
      content: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=1200&fit=crop'
      },
      caption: 'We\'re hiring! Join our team of innovators and help build the future of technology. Apply now for our Software Engineer positions.',
      stats: {
        likes: 3289,
        comments: 156,
        shares: 67,
        isLiked: true,
        isBookmarked: true
      },
      isJobPost: true,
      jobDetails: {
        company: 'Microsoft',
        position: 'Senior Software Engineer',
        location: 'Seattle, WA',
        applyUrl: 'https://careers.microsoft.com'
      },
      timestamp: '4h ago'
    },
    {
      id: '3',
      user: {
        id: 'user3',
        name: 'Alex Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        title: 'Product Manager at Stripe',
        isFollowing: false
      },
      content: {
        type: 'text',
        text: 'Just finished reading "The Lean Startup" and I\'m blown away by the insights on product development. The concept of validated learning has completely changed how I approach building features. Anyone else reading this? Would love to discuss! 📚'
      },
      caption: 'Book recommendations for fellow product managers 📖',
      stats: {
        likes: 892,
        comments: 45,
        shares: 12,
        isLiked: false,
        isBookmarked: false
      },
      timestamp: '6h ago'
    },
    {
      id: '4',
      user: {
        id: 'user4',
        name: 'Emma Watson',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        title: 'UX Designer at Figma',
        isFollowing: true
      },
      content: {
        type: 'video',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        duration: 45
      },
      caption: 'Quick design process behind our latest feature ✨ From wireframes to final design in 3 days! The key is rapid iteration and constant user feedback. #UXDesign #ProductDesign #DesignProcess',
      stats: {
        likes: 2156,
        comments: 78,
        shares: 34,
        isLiked: false,
        isBookmarked: true
      },
      timestamp: '8h ago'
    },
    {
      id: '5',
      user: {
        id: 'user5',
        name: 'TechCorp Recruiting',
        avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&h=150&fit=crop',
        title: 'Fortune 500 Tech Company',
        isFollowing: false
      },
      content: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=1200&fit=crop'
      },
      caption: '🔥 URGENT HIRING: Full Stack Developers needed! Remote-first company with amazing benefits. DM us for details!',
      stats: {
        likes: 1823,
        comments: 234,
        shares: 89,
        isLiked: false,
        isBookmarked: false
      },
      isJobPost: true,
      jobDetails: {
        company: 'TechCorp',
        position: 'Full Stack Developer',
        location: 'Remote',
        applyUrl: 'https://techcorp.com/careers'
      },
      timestamp: '12h ago'
    }
  ];

  useEffect(() => {
    const loadFeed = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Filter posts based on feed type
        let filteredPosts = mockPosts;
        if (feedType === 'following') {
          filteredPosts = mockPosts.filter(post => post.user.isFollowing);
        }
        
        setPosts(filteredPosts);
      } catch (err) {
        setError('Failed to load feed');
        console.error('Error loading feed:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadFeed();
    }
  }, [user, feedType]);

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? {
            ...post,
            stats: {
              ...post.stats,
              isLiked: !post.stats.isLiked,
              likes: post.stats.isLiked ? post.stats.likes - 1 : post.stats.likes + 1
            }
          }
        : post
    ));
  };

  const handleBookmark = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? {
            ...post,
            stats: {
              ...post.stats,
              isBookmarked: !post.stats.isBookmarked
            }
          }
        : post
    ));
  };

  const handleShare = (postId: string) => {
    // Implement share functionality
    console.log('Share post:', postId);
  };

  const handleComment = (postId: string) => {
    // Implement comment functionality
    console.log('Comment on post:', postId);
  };

  const handleFollow = (userId: string) => {
    setPosts(prev => prev.map(post => 
      post.user.id === userId 
        ? {
            ...post,
            user: {
              ...post.user,
              isFollowing: !post.user.isFollowing
            }
          }
        : post
    ));
  };

  const handleApply = (jobUrl: string) => {
    window.open(jobUrl, '_blank');
  };

  return {
    posts,
    loading,
    error,
    handleLike,
    handleBookmark,
    handleShare,
    handleComment,
    handleFollow,
    handleApply
  };
};