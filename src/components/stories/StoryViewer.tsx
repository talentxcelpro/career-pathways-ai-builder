import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, MoreHorizontal, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Story } from '@/hooks/useStories';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface StoryViewerProps {
  stories: Story[];
  currentStoryIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onStoryView: (storyId: string) => void;
  onStoryDelete?: (storyId: string) => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  currentStoryIndex,
  isOpen,
  onClose,
  onStoryView,
  onStoryDelete,
}) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(currentStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentStory = stories[currentIndex];
  const isOwner = user?.id === currentStory?.user_id;

  // Auto-progress through stories
  useEffect(() => {
    if (!isOpen || isPaused || !currentStory) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Move to next story
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 2; // Increase by 2% every 100ms (5 seconds total)
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, isPaused, currentIndex, stories.length, currentStory, onClose]);

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
    if (currentStory && !currentStory.viewed) {
      onStoryView(currentStory.id);
    }
  }, [currentIndex, currentStory, onStoryView]);

  // Update currentIndex when prop changes
  useEffect(() => {
    setCurrentIndex(currentStoryIndex);
  }, [currentStoryIndex]);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handleDeleteStory = () => {
    if (isOwner && onStoryDelete && currentStory) {
      onStoryDelete(currentStory.id);
      if (stories.length === 1) {
        onClose();
      } else {
        goToNext();
      }
    }
  };

  if (!currentStory) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-black/90 border-none">
        <div className="relative w-full h-[600px] flex flex-col">
          {/* Progress bars */}
          <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
            {stories.map((_, index) => (
              <Progress
                key={index}
                value={index === currentIndex ? progress : index < currentIndex ? 100 : 0}
                className="flex-1 h-1 bg-white/30"
              />
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-8 left-4 right-4 z-20 flex items-center gap-3 mt-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentStory.user?.profile_picture_url} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white">
                {currentStory.user?.full_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <p className="text-white font-medium text-sm">
                {currentStory.user?.full_name || 'Unknown User'}
              </p>
              <p className="text-white/70 text-xs">
                {formatDistanceToNow(new Date(currentStory.created_at), { addSuffix: true })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleDeleteStory} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Story
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Story content */}
          <div 
            className="flex-1 flex items-center justify-center relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
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
                onPlay={() => setIsPaused(false)}
                onPause={() => setIsPaused(true)}
              />
            )}

            {currentStory.type === 'text' && (
              <div 
                className="w-full h-full flex items-center justify-center p-8"
                style={{
                  background: currentStory.background || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                <p 
                  className="text-white text-center text-xl leading-relaxed"
                  style={{
                    fontFamily: currentStory.font || 'Inter',
                    fontSize: currentStory.font_size || '20px',
                  }}
                >
                  {currentStory.content}
                </p>
              </div>
            )}

            {/* Navigation areas */}
            <button
              className="absolute left-0 top-0 w-1/3 h-full z-10"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
            />
            <button
              className="absolute right-0 top-0 w-1/3 h-full z-10"
              onClick={goToNext}
            />
          </div>

          {/* Navigation buttons */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20">
            {currentIndex > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevious}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}
          </div>

          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
            {currentIndex < stories.length - 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNext}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};