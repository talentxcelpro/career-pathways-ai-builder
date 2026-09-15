import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Play, Pause, X, Send } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

interface Story {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  media: string;
  type: 'image' | 'video';
  timestamp: string;
  viewed: boolean;
  duration?: number;
}

interface MobileStoriesProps {
  className?: string;
}

export const MobileStories: React.FC<MobileStoriesProps> = ({ className = '' }) => {
  const [stories] = useState<Story[]>([
    // Empty for now - will be populated with real stories from backend
  ]);

  const [viewingStory, setViewingStory] = useState<Story | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const { triggerHaptic } = useHapticFeedback();
  const { sync } = useRealtimeSync();
  const progressInterval = useRef<NodeJS.Timeout>();

  const handleStoryTap = (story: Story) => {
    triggerHaptic('light');
    setViewingStory(story);
    setProgress(0);
    setIsPlaying(true);
    startProgress();
  };

  const startProgress = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          closeStory();
          return 100;
        }
        return prev + 2; // 5 second duration (100/20 = 5s)
      });
    }, 100);
  };

  const pauseProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    setIsPlaying(false);
  };

  const resumeProgress = () => {
    setIsPlaying(true);
    startProgress();
  };

  const closeStory = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    setViewingStory(null);
    setProgress(0);
    setIsPlaying(true);
  };

  const handleCreateStory = () => {
    triggerHaptic('medium');
    // Trigger story creation flow
    console.log('Create story');
  };

  const StoryViewer = () => {
    if (!viewingStory) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black">
        {/* Progress Bar */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Story Header */}
        <div className="absolute top-8 left-4 right-4 z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8 ring-2 ring-white">
              <AvatarImage src={viewingStory.user.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {viewingStory.user.name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white text-sm font-medium">{viewingStory.user.name}</p>
              <p className="text-white/70 text-xs">{viewingStory.timestamp}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={closeStory}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Story Content */}
        <div 
          className="w-full h-full flex items-center justify-center"
          onClick={isPlaying ? pauseProgress : resumeProgress}
        >
          {viewingStory.type === 'image' ? (
            <img 
              src={viewingStory.media}
              alt="Story content"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="relative">
              <video 
                src={viewingStory.media}
                className="max-w-full max-h-full object-contain"
                autoPlay={isPlaying}
                muted
                loop
              />
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Story Controls */}
        <div className="absolute bottom-6 left-4 right-4 z-10">
          <div className="flex items-center space-x-3">
            <input 
              type="text" 
              placeholder="Send a message..."
              className="flex-1 bg-white/10 text-white placeholder-white/60 rounded-full px-4 py-2 text-sm border border-white/20 focus:outline-none focus:border-white/40"
            />
            <Button size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`${className}`}>
        <div className="flex items-center space-x-3 px-4 py-3 overflow-x-auto scrollbar-hide">
          {/* Add Story Button */}
          <div className="flex-shrink-0 text-center">
            <button
              onClick={handleCreateStory}
              className="relative w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <Plus className="w-6 h-6 text-muted-foreground" />
            </button>
            <p className="text-xs text-muted-foreground mt-1 truncate max-w-[64px]">
              Add Story
            </p>
          </div>

          {/* Stories */}
          {stories.length === 0 ? (
            <div className="flex-shrink-0 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center">
                <div className="text-xs text-muted-foreground">No stories</div>
              </div>
            </div>
          ) : (
            stories.map(story => (
              <div key={story.id} className="flex-shrink-0 text-center">
                <button
                  onClick={() => handleStoryTap(story)}
                  className="relative group"
                >
                  <div className={`w-16 h-16 rounded-full p-0.5 ${
                    story.viewed 
                      ? 'bg-muted-foreground/30' 
                      : 'bg-gradient-to-tr from-primary via-primary-foreground to-primary'
                  }`}>
                    <Avatar className="w-full h-full ring-2 ring-background">
                      <AvatarImage src={story.user.avatar} />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {story.user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {story.type === 'video' && (
                    <div className="absolute bottom-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <Play className="w-2 h-2 text-primary-foreground fill-current" />
                    </div>
                  )}
                </button>
                <p className="text-xs text-foreground mt-1 truncate max-w-[64px]">
                  {story.user.name}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <StoryViewer />
    </>
  );
};