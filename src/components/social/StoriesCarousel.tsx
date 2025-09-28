import React from 'react';
import { useAdvancedStories } from '@/hooks/useAdvancedStories';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StoriesCarouselProps {
  onStoryClick?: (userId: string, storyIndex: number) => void;
  onCreateStory?: () => void;
}

export const StoriesCarousel: React.FC<StoriesCarouselProps> = ({
  onStoryClick,
  onCreateStory
}) => {
  const { getStoriesGroupedByUser, loading } = useAdvancedStories();
  const groupedStories = getStoriesGroupedByUser();

  if (loading) {
    return (
      <div className="flex gap-4 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
            <div className="w-12 h-3 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 p-4 min-w-max">
        {/* Add Story Button */}
        <div className="flex flex-col items-center gap-2 min-w-[80px]">
          <Button
            variant="outline"
            size="icon"
            className="w-16 h-16 rounded-full border-2 border-dashed hover:border-primary"
            onClick={onCreateStory}
          >
            <Plus className="w-6 h-6" />
          </Button>
          <span className="text-xs text-center text-muted-foreground truncate w-full">
            Your story
          </span>
        </div>

        {/* Stories */}
        {groupedStories.map((group, groupIndex) => (
          <div 
            key={group.stories[0].user_id}
            className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer"
            onClick={() => onStoryClick?.(group.stories[0].user_id, 0)}
          >
            <div className={`relative w-16 h-16 rounded-full p-0.5 ${
              group.hasUnviewed 
                ? 'bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500' 
                : 'bg-muted'
            }`}>
              <div className="w-full h-full rounded-full bg-background p-0.5">
                <Avatar className="w-full h-full">
                  <AvatarImage src={group.user?.profile_picture_url} />
                  <AvatarFallback className="text-xs">
                    {group.user?.full_name?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              {/* Unviewed indicator */}
              {group.hasUnviewed && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background" />
              )}
            </div>
            
            <span className="text-xs text-center text-muted-foreground truncate w-full">
              {group.user?.full_name || 'Unknown'}
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};