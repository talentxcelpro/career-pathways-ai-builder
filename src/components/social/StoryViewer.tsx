import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, X, Heart, Send, MoreHorizontal } from 'lucide-react';
import { useAdvancedStories, Story } from '@/hooks/useAdvancedStories';
import { Input } from '@/components/ui/input';

interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  storyIndex?: number;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  isOpen,
  onClose,
  userId,
  storyIndex = 0
}) => {
  const { getStoriesGroupedByUser, viewStory } = useAdvancedStories();
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(storyIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [comment, setComment] = useState('');

  const groupedStories = getStoriesGroupedByUser();
  const currentUserGroup = groupedStories[currentUserIndex];
  const currentStory = currentUserGroup?.stories[currentStoryIndex];

  // Auto-advance stories
  useEffect(() => {
    if (!isOpen || isPaused || !currentStory) return;

    const duration = 5000; // 5 seconds per story
    const interval = 50; // Update progress every 50ms
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          nextStory();
          return 0;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, currentStory, currentStoryIndex, currentUserIndex]);

  // Initialize viewer with specific user and story
  useEffect(() => {
    if (userId && isOpen) {
      const userIndex = groupedStories.findIndex(
        group => group.stories[0]?.user_id === userId
      );
      if (userIndex !== -1) {
        setCurrentUserIndex(userIndex);
        setCurrentStoryIndex(storyIndex);
        setProgress(0);
      }
    }
  }, [userId, storyIndex, isOpen, groupedStories]);

  // Track story view
  useEffect(() => {
    if (currentStory && isOpen) {
      viewStory(currentStory.id);
    }
  }, [currentStory, isOpen, viewStory]);

  const nextStory = () => {
    if (!currentUserGroup) return;

    if (currentStoryIndex < currentUserGroup.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      // Move to next user's stories
      if (currentUserIndex < groupedStories.length - 1) {
        setCurrentUserIndex(prev => prev + 1);
        setCurrentStoryIndex(0);
      } else {
        onClose();
      }
    }
    setProgress(0);
  };

  const previousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else {
      // Move to previous user's stories
      if (currentUserIndex > 0) {
        const prevUserIndex = currentUserIndex - 1;
        const prevUserGroup = groupedStories[prevUserIndex];
        setCurrentUserIndex(prevUserIndex);
        setCurrentStoryIndex(prevUserGroup.stories.length - 1);
      }
    }
    setProgress(0);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
        e.preventDefault();
        nextStory();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        previousStory();
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStoryIndex, currentUserIndex]);

  if (!isOpen || !currentStory || !currentUserGroup) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-black text-white border-0 h-screen max-h-screen">
        <div className="relative h-full flex flex-col">
          {/* Progress bars */}
          <div className="absolute top-4 left-4 right-4 z-10 flex gap-1">
            {currentUserGroup.stories.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-100"
                  style={{
                    width: index < currentStoryIndex ? '100%' : 
                           index === currentStoryIndex ? `${progress}%` : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-6 left-4 right-4 z-10 flex items-center justify-between pt-6">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={currentUserGroup.user?.profile_picture_url} />
                <AvatarFallback>
                  {currentUserGroup.user?.full_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {currentUserGroup.user?.full_name || 'Unknown'}
                </p>
                <p className="text-xs text-white/70">
                  {new Date(currentStory.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? '▶️' : '⏸️'}
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Story Content */}
          <div 
            className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black relative cursor-pointer"
            onClick={() => setIsPaused(!isPaused)}
            style={currentStory.background ? { background: currentStory.background } : {}}
          >
            {/* Navigation areas */}
            <div 
              className="absolute left-0 top-0 w-1/3 h-full z-20 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                previousStory();
              }}
            />
            <div 
              className="absolute right-0 top-0 w-1/3 h-full z-20 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                nextStory();
              }}
            />

            {currentStory.type === 'photo' && currentStory.media_url && (
              <img 
                src={currentStory.media_url}
                alt="Story"
                className="max-w-full max-h-full object-contain"
              />
            )}

            {currentStory.type === 'video' && currentStory.media_url && (
              <video 
                src={currentStory.media_url}
                autoPlay
                muted
                className="max-w-full max-h-full object-contain"
                onEnded={nextStory}
              />
            )}

            {currentStory.type === 'text' && (
              <div 
                className="p-8 text-center max-w-sm"
                style={{
                  fontFamily: currentStory.font || 'inherit',
                  fontSize: currentStory.font_size || '18px'
                }}
              >
                <p className="text-white leading-relaxed">
                  {currentStory.content}
                </p>
              </div>
            )}

            {/* Navigation buttons */}
            {currentStoryIndex > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  previousStory();
                }}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
              onClick={(e) => {
                e.stopPropagation();
                nextStory();
              }}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          {/* Footer - Comment Input */}
          <div className="p-4 flex items-center gap-3">
            <Input
              placeholder="Send a message..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1 bg-transparent border-white/30 text-white placeholder:text-white/70"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && comment.trim()) {
                  // TODO: Send comment
                  console.log('Sending comment:', comment);
                  setComment('');
                }
              }}
            />
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Heart className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={() => {
                if (comment.trim()) {
                  // TODO: Send comment
                  console.log('Sending comment:', comment);
                  setComment('');
                }
              }}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};