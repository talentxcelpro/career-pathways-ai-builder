import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { TalentSparkJobCard } from './TalentSparkJobCard';
import { Heart, X, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SwipeableJobCardProps {
  job: any;
  onSave: (jobId: string) => void;
  onQuickApply: (jobId: string) => void;
  onPass?: (jobId: string) => void;
  isSaved: boolean;
  txcReward: number;
  onSwipeComplete?: () => void;
}

export const SwipeableJobCard: React.FC<SwipeableJobCardProps> = ({
  job,
  onSave,
  onQuickApply,
  onPass,
  isSaved,
  txcReward,
  onSwipeComplete
}) => {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [transform, setTransform] = useState('translateX(0px) rotate(0deg)');

  const handleSwipeAction = (direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    setIsAnimating(true);
    
    // Animate out
    setTransform(
      direction === 'left' 
        ? 'translateX(-100%) rotate(-30deg)' 
        : 'translateX(100%) rotate(30deg)'
    );

    // Execute action after animation
    setTimeout(() => {
      if (direction === 'left') {
        onPass?.(job.id);
      } else {
        onSave(job.id);
      }
      onSwipeComplete?.();
    }, 300);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipeAction('left'),
    onSwipedRight: () => handleSwipeAction('right'),
    onSwiping: (eventData) => {
      if (Math.abs(eventData.deltaX) > 50) {
        const rotation = eventData.deltaX * 0.1;
        setTransform(`translateX(${eventData.deltaX}px) rotate(${rotation}deg)`);
      }
    },
    onSwiped: () => {
      if (!isAnimating) {
        setTransform('translateX(0px) rotate(0deg)');
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  return (
    <div className="relative">
      {/* Swipe Action Indicators */}
      <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-10">
        <div className={`w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white transition-opacity duration-200 ${
          swipeDirection === 'left' || transform.includes('-') ? 'opacity-100' : 'opacity-0'
        }`}>
          <X className="h-8 w-8" />
        </div>
        <div className={`w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white transition-opacity duration-200 ${
          swipeDirection === 'right' || (transform.includes('translate') && !transform.includes('-')) ? 'opacity-100' : 'opacity-0'
        }`}>
          <Heart className="h-8 w-8" />
        </div>
      </div>

      {/* Swipeable Card */}
      <div
        {...handlers}
        className={`transition-transform duration-300 ease-out ${isAnimating ? 'pointer-events-none' : ''}`}
        style={{
          transform,
          touchAction: 'pan-y'
        }}
      >
        <TalentSparkJobCard
          job={job}
          onSave={onSave}
          onQuickApply={onQuickApply}
          isSaved={isSaved}
          txcReward={txcReward}
          viewMode="swipe"
        />
      </div>

      {/* Action Buttons for Non-Touch Devices */}
      <div className="flex justify-center gap-4 mt-4 md:hidden">
        <Button
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full border-red-200 hover:bg-red-50 hover:border-red-300"
          onClick={() => handleSwipeAction('left')}
        >
          <X className="h-8 w-8 text-red-500" />
        </Button>
        
        <Button
          size="lg"
          className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary"
          onClick={() => onQuickApply(job.id)}
        >
          <Zap className="h-8 w-8 text-white" />
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full border-green-200 hover:bg-green-50 hover:border-green-300"
          onClick={() => handleSwipeAction('right')}
        >
          <Heart className="h-8 w-8 text-green-500" />
        </Button>
      </div>

      {/* Swipe Instructions */}
      <div className="text-center mt-2 text-xs text-muted-foreground">
        ← Swipe left to pass • Swipe right to save →
      </div>
    </div>
  );
};