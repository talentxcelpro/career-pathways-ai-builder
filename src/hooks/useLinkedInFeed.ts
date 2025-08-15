import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface LinkedInPost {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    title?: string;
    company?: string;
    isFollowing?: boolean;
    isConnection?: boolean;
  };
  content: {
    type: 'video' | 'image' | 'text' | 'article';
    url?: string;
    text?: string;
    title?: string;
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
  isPromoted?: boolean;
  jobDetails?: {
    company: string;
    position: string;
    location: string;
    applyUrl?: string;
  };
  timestamp: string;
  engagement?: {
    likedBy: string[];
    topComment?: {
      user: string;
      text: string;
    };
  };
}

export const useLinkedInFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<LinkedInPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock LinkedIn-style posts with videos
  const mockPosts: LinkedInPost[] = [
    {
      id: '1',
      user: {
        id: 'user1',
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612c632?w=150&h=150&fit=crop&crop=face',
        title: 'Senior Product Manager',
        company: 'Microsoft',
        isConnection: true
      },
      content: {
        type: 'video',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        duration: 45
      },
      caption: 'Excited to share our latest product demo! 🚀 Our team has been working tirelessly to deliver this new feature that will revolutionize how teams collaborate. The response from beta users has been incredible.\n\nWhat features do you think are most important for team productivity? Would love to hear your thoughts! #ProductManagement #Innovation #Microsoft',
      stats: {
        likes: 234,
        comments: 18,
        shares: 7,
        isLiked: false,
        isBookmarked: false
      },
      timestamp: '2h ago',
      engagement: {
        likedBy: ['John Smith', 'Emily Johnson', 'Alex Chen'],
        topComment: {
          user: 'John Smith',
          text: 'This looks amazing! Can\'t wait to try it out with my team.'
        }
      }
    },
    {
      id: '2',
      user: {
        id: 'user2',
        name: 'TechCorp Recruiting',
        avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&h=150&fit=crop',
        title: 'Official Company Page',
        company: 'TechCorp Inc.',
        isConnection: false
      },
      content: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop'
      },
      caption: 'We\'re hiring! 🔥 Join our growing engineering team and help us build the future of technology. We offer competitive compensation, flexible work arrangements, and amazing growth opportunities.',
      stats: {
        likes: 89,
        comments: 12,
        shares: 23,
        isLiked: true,
        isBookmarked: true
      },
      isJobPost: true,
      isPromoted: true,
      jobDetails: {
        company: 'TechCorp Inc.',
        position: 'Senior Full Stack Developer',
        location: 'San Francisco, CA (Remote)',
        applyUrl: 'https://techcorp.com/careers'
      },
      timestamp: '4h ago',
      engagement: {
        likedBy: ['Sarah Chen', 'Mike Wilson'],
        topComment: {
          user: 'Mike Wilson',
          text: 'Great opportunity! Just applied through the website.'
        }
      }
    },
    {
      id: '3',
      user: {
        id: 'user3',
        name: 'Alex Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        title: 'Software Engineer',
        company: 'Google',
        isConnection: false
      },
      content: {
        type: 'text',
        text: 'Just completed my first marathon! 🏃‍♂️ Training for the past 6 months has taught me so much about consistency, goal-setting, and pushing through challenges - lessons that directly apply to software development.'
      },
      caption: 'Personal achievement that translates to professional growth 💪 The discipline required for marathon training mirrors what we need in our careers: consistency, patience, and the ability to break down big goals into manageable steps.\n\nWhat personal challenges have helped you grow professionally?',
      stats: {
        likes: 156,
        comments: 24,
        shares: 5,
        isLiked: false,
        isBookmarked: false
      },
      timestamp: '6h ago',
      engagement: {
        likedBy: ['Emma Watson', 'David Kim'],
        topComment: {
          user: 'Emma Watson',
          text: 'Congratulations! That\'s an amazing achievement. The parallels to software development are spot on.'
        }
      }
    },
    {
      id: '4',
      user: {
        id: 'user4',
        name: 'Emily Johnson',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        title: 'UX Designer',
        company: 'Figma',
        isConnection: true
      },
      content: {
        type: 'video',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        duration: 30
      },
      caption: 'Behind the scenes of our design process ✨ Here\'s how we went from initial wireframes to final high-fidelity designs in just one week. The key was rapid iteration and constant user feedback.\n\nDesign isn\'t just about making things look pretty - it\'s about solving real user problems. #UXDesign #ProductDesign #DesignThinking',
      stats: {
        likes: 298,
        comments: 31,
        shares: 12,
        isLiked: true,
        isBookmarked: true
      },
      timestamp: '8h ago',
      engagement: {
        likedBy: ['Sarah Chen', 'Alex Rodriguez', 'Mike Wilson'],
        topComment: {
          user: 'David Kim',
          text: 'Love seeing the design process! The attention to user feedback really shows in the final product.'
        }
      }
    },
    {
      id: '5',
      user: {
        id: 'user5',
        name: 'David Kim',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        title: 'Data Scientist',
        company: 'Netflix',
        isConnection: true
      },
      content: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop'
      },
      caption: 'Just wrapped up an incredible data science conference! 📊 The insights on machine learning trends and AI ethics were mind-blowing. It\'s amazing to see how our field is evolving.\n\nKey takeaway: The future of AI isn\'t just about more powerful models, but about making them more transparent, fair, and accessible to everyone.',
      stats: {
        likes: 187,
        comments: 15,
        shares: 8,
        isLiked: false,
        isBookmarked: false
      },
      timestamp: '12h ago',
      engagement: {
        likedBy: ['Emily Johnson', 'Sarah Chen'],
        topComment: {
          user: 'Alex Rodriguez',
          text: 'Great insights! AI ethics is such an important topic that often gets overlooked.'
        }
      }
    },
    {
      id: '6',
      user: {
        id: 'user6',
        name: 'Startup Accelerator',
        avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop',
        title: 'Leading Startup Accelerator',
        company: 'TechStart Ventures',
        isConnection: false
      },
      content: {
        type: 'video',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        duration: 60
      },
      caption: '🚀 Demo Day highlights from our latest cohort! These startups are solving real-world problems with innovative technology. From AI-powered healthcare solutions to sustainable energy platforms, the future is bright.\n\nApplications for our next cohort open next month! #Startups #Innovation #Entrepreneurship',
      stats: {
        likes: 412,
        comments: 67,
        shares: 89,
        isLiked: false,
        isBookmarked: true
      },
      timestamp: '1d ago',
      engagement: {
        likedBy: ['Sarah Chen', 'Emily Johnson', 'David Kim'],
        topComment: {
          user: 'Mike Wilson',
          text: 'Incredible innovation! Looking forward to seeing how these startups grow.'
        }
      }
    }
  ];

  useEffect(() => {
    const loadFeed = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPosts(mockPosts);
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
  }, [user]);

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
    console.log('Share post:', postId);
  };

  const handleComment = (postId: string) => {
    console.log('Comment on post:', postId);
  };

  const handleConnect = (userId: string) => {
    setPosts(prev => prev.map(post => 
      post.user.id === userId 
        ? {
            ...post,
            user: {
              ...post.user,
              isConnection: true
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
    handleConnect,
    handleApply
  };
};