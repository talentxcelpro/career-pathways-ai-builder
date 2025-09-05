import React, { memo, useCallback, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase, Building, Trophy, MapPin, TrendingUp, Users, Heart } from 'lucide-react';
import { useStories } from '@/hooks/useStories';
import { useAuth } from '@/contexts/AuthContext';
import { StoryViewer } from '@/components/stories/StoryViewer';
import { StoryCreationModal } from '@/components/stories/StoryCreationModal';

const stories = [
  {
    id: 'add',
    title: 'Your Story',
    icon: Plus,
    gradient: 'from-gradient-start to-gradient-end',
    isAdd: true,
    hasStory: false
  },
  {
    id: 'recruiter',
    title: 'Recruiter Updates',
    icon: Briefcase,
    gradient: 'from-blue-500 to-blue-600',
    hasStory: true,
    isViewed: false
  },
  {
    id: 'company',
    title: 'Company News',
    icon: Building,
    gradient: 'from-purple-500 to-purple-600',
    hasStory: true,
    isViewed: true
  },
  {
    id: 'success',
    title: 'Success Stories',
    icon: Trophy,
    gradient: 'from-yellow-500 to-orange-500',
    hasStory: true,
    isViewed: false
  },
  {
    id: 'nearby',
    title: 'Jobs Near You',
    icon: MapPin,
    gradient: 'from-green-500 to-green-600',
    hasStory: true,
    isViewed: true
  },
  {
    id: 'trending',
    title: 'Trending',
    icon: TrendingUp,
    gradient: 'from-red-500 to-pink-500',
    hasStory: true,
    isViewed: false
  },
  {
    id: 'community',
    title: 'Community',
    icon: Users,
    gradient: 'from-indigo-500 to-purple-500',
    hasStory: true,
    isViewed: false
  },
  {
    id: 'featured',
    title: 'Featured',
    icon: Heart,
    gradient: 'from-pink-500 to-rose-500',
    hasStory: true,
    isViewed: true
  }
];

interface StoryBubbleProps {
  story: any;
  onClick: (storyId: string) => void;
  avatar?: string;
}

const StoryBubble = memo<StoryBubbleProps>(({ story, onClick, avatar }) => {
  const IconComponent = story.icon;
  
  const handleClick = useCallback(() => {
    onClick(story.id);
  }, [story.id, onClick]);

  return (
    <Button
      variant="ghost"
      className="flex flex-col items-center p-2 h-auto min-w-0 hover:bg-transparent"
      onClick={handleClick}
    >
      <div className="relative">
        {/* Story Ring */}
        <div 
          className={`relative p-0.5 rounded-full ${
            story.hasStory 
              ? story.isViewed 
                ? 'bg-gradient-to-tr from-muted to-muted' 
                : `bg-gradient-to-tr ${story.gradient}`
              : 'bg-gradient-to-tr from-muted to-muted'
          }`}
        >
          <div className="bg-background rounded-full p-1">
            <Avatar className="h-14 w-14">
              <AvatarImage src={avatar} />
              <AvatarFallback className={`${avatar ? 'bg-muted' : `bg-gradient-to-br ${story.gradient}`} text-white`}>
                {avatar ? (
                  story.title[0]?.toUpperCase()
                ) : (
                  <IconComponent className="h-6 w-6" />
                )}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {/* Add Button for Your Story */}
          {story.isAdd && (
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
              <Plus className="h-3 w-3" />
            </div>
          )}
          
          {/* Notification Dot for New Stories */}
          {story.hasStory && !story.isViewed && !story.isAdd && (
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-background" />
          )}
        </div>
      </div>
      
      <span className="text-xs text-foreground mt-1 text-center max-w-[60px] truncate font-medium">
        {story.title}
      </span>
    </Button>
  );
});

StoryBubble.displayName = 'StoryBubble';

interface FastStoryBubblesProps {
  onStoryClick?: (storyId: string) => void;
}

export const FastStoryBubbles = memo<FastStoryBubblesProps>(({ onStoryClick }) => {
  const { user } = useAuth();
  const { stories: userStories, loading, refreshStories, viewStory, deleteStory, getUserStories, hasUserStory, hasUnviewedStories } = useStories();
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [selectedUserStories, setSelectedUserStories] = useState<any[]>([]);
  const [showCreationModal, setShowCreationModal] = useState(false);

  // Group stories by user
  const groupedStories = userStories.reduce((acc, story) => {
    const userId = story.user_id;
    if (!acc[userId]) {
      acc[userId] = [];
    }
    acc[userId].push(story);
    return acc;
  }, {} as Record<string, any[]>);

  // Create story bubbles data combining real stories with static ones
  const storyBubbles = [
    {
      id: 'add',
      title: 'Your Story',
      icon: Plus,
      gradient: 'from-gradient-start to-gradient-end',
      isAdd: true,
      hasStory: hasUserStory(user?.id || ''),
      isViewed: false,
      userId: user?.id,
      userStories: user ? getUserStories(user.id) : []
    },
    // Add real user stories
    ...Object.entries(groupedStories).map(([userId, stories]) => ({
      id: userId,
      title: stories[0].user?.full_name || 'User',
      icon: Heart,
      gradient: 'from-purple-500 to-pink-500',
      isAdd: false,
      hasStory: true,
      isViewed: !hasUnviewedStories(userId),
      userId,
      userStories: stories,
      avatar: stories[0].user?.profile_picture_url
    })),
    // Static story bubbles for system/featured content
    {
      id: 'company',
      title: 'Company News',
      icon: Building,
      gradient: 'from-purple-500 to-purple-600',
      hasStory: true,
      isViewed: true,
      isStatic: true
    },
    {
      id: 'success',
      title: 'Success Stories',
      icon: Trophy,
      gradient: 'from-yellow-500 to-orange-500',
      hasStory: true,
      isViewed: false,
      isStatic: true
    },
    {
      id: 'trending',
      title: 'Trending',
      icon: TrendingUp,
      gradient: 'from-red-500 to-pink-500',
      hasStory: true,
      isViewed: false,
      isStatic: true
    },
  ];

  const handleStoryClick = useCallback((storyId: string) => {
    const bubble = storyBubbles.find(b => b.id === storyId);
    
    if (storyId === 'add') {
      if (bubble?.hasStory && bubble.userStories?.length > 0) {
        // View own stories
        setSelectedUserStories(bubble.userStories);
        setCurrentStoryIndex(0);
        setShowStoryViewer(true);
      } else {
        // Create new story
        setShowCreationModal(true);
      }
    } else if (bubble && !(bubble as any).isStatic) {
      // View other user's stories
      setSelectedUserStories(bubble.userStories || []);
      setCurrentStoryIndex(0);
      setShowStoryViewer(true);
    } else {
      // Handle static story clicks
      onStoryClick?.(storyId);
    }
  }, [storyBubbles, onStoryClick]);

  const handleStoryCreated = () => {
    refreshStories();
  };

  if (loading) {
    return (
      <div className="px-4 py-3 bg-background border-b border-border/50">
        <div className="flex gap-4 pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-muted animate-pulse" />
              <div className="h-3 w-12 bg-muted rounded mt-1 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 py-3 bg-background border-b border-border/50">
        <ScrollArea>
          <div className="flex gap-4 pb-2">
            {storyBubbles.map((story) => (
              <StoryBubble 
                key={story.id} 
                story={story} 
                onClick={handleStoryClick}
                avatar={(story as any).avatar}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      <StoryViewer
        stories={selectedUserStories}
        currentStoryIndex={currentStoryIndex}
        isOpen={showStoryViewer}
        onClose={() => setShowStoryViewer(false)}
        onStoryView={viewStory}
        onStoryDelete={deleteStory}
      />

      <StoryCreationModal
        isOpen={showCreationModal}
        onClose={() => setShowCreationModal(false)}
        onStoryCreated={handleStoryCreated}
      />
    </>
  );
});

FastStoryBubbles.displayName = 'FastStoryBubbles';