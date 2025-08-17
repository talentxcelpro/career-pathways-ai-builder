import React, { memo, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase, Building, Trophy, MapPin, TrendingUp, Users, Heart } from 'lucide-react';

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
  story: typeof stories[0];
  onClick: (storyId: string) => void;
}

const StoryBubble = memo<StoryBubbleProps>(({ story, onClick }) => {
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
              <AvatarImage src="" />
              <AvatarFallback className={`bg-gradient-to-br ${story.gradient} text-white`}>
                <IconComponent className="h-6 w-6" />
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
          {story.hasStory && !story.isViewed && (
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
  const handleStoryClick = useCallback((storyId: string) => {
    console.log('Story clicked:', storyId);
    onStoryClick?.(storyId);
  }, [onStoryClick]);

  return (
    <div className="px-4 py-3 bg-background border-b border-border/50">
      <ScrollArea>
        <div className="flex gap-4 pb-2">
          {stories.map((story) => (
            <StoryBubble 
              key={story.id} 
              story={story} 
              onClick={handleStoryClick}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
});

FastStoryBubbles.displayName = 'FastStoryBubbles';