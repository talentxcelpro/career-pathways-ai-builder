import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { TalentSparkJobCard } from './TalentSparkJobCard';
import { Heart, X, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SwipeableJobCardProps {
  jobs: any[];
  currentIndex: number;
  onSwipe: (direction: 'left' | 'right' | 'up', job: any) => void;
  onSave: (jobId: string) => void;
  savedJobs: string[];
}

export const SwipeableJobCard: React.FC<SwipeableJobCardProps> = ({
  jobs,
  currentIndex,
  onSwipe,
  onSave,
  savedJobs
}) => {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [transform, setTransform] = useState('translateX(0px) translateY(0px) rotate(0deg)');

  const currentJob = jobs[currentIndex];
  const nextJob = jobs[currentIndex + 1];

  if (!currentJob) {
    return (
      <div className="text-center py-12">
        <Star className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">You've seen all jobs!</h3>
        <p className="text-gray-500 mb-4">Great job exploring opportunities</p>
        <Button onClick={() => window.location.reload()}>
          Start Over
        </Button>
      </div>
    );
  }

  const handleSwipeAction = (direction: 'left' | 'right' | 'up') => {
    setSwipeDirection(direction);
    setIsAnimating(true);
    
    // Animate out based on direction
    let animationTransform = '';
    if (direction === 'left') {
      animationTransform = 'translateX(-100%) rotate(-30deg)';
    } else if (direction === 'right') {
      animationTransform = 'translateX(100%) rotate(30deg)';
    } else if (direction === 'up') {
      animationTransform = 'translateY(-100%) scale(0.8)';
    }
    
    setTransform(animationTransform);

    // Execute action after animation
    setTimeout(() => {
      onSwipe(direction, currentJob);
      setSwipeDirection(null);
      setIsAnimating(false);
      setTransform('translateX(0px) translateY(0px) rotate(0deg)');
    }, 300);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipeAction('left'),
    onSwipedRight: () => handleSwipeAction('right'),
    onSwipedUp: () => handleSwipeAction('up'),
    onSwiping: (eventData) => {
      if (!isAnimating) {
        if (Math.abs(eventData.deltaX) > 50) {
          const rotation = eventData.deltaX * 0.1;
          setTransform(`translateX(${eventData.deltaX}px) rotate(${rotation}deg)`);
        } else if (Math.abs(eventData.deltaY) > 50 && eventData.deltaY < 0) {
          setTransform(`translateY(${eventData.deltaY}px) scale(${1 + eventData.deltaY * 0.001})`);
        }
      }
    },
    onSwiped: () => {
      if (!isAnimating) {
        setTransform('translateX(0px) translateY(0px) rotate(0deg)');
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  return (
    <div className="relative max-w-sm mx-auto">
      {/* Background Cards (Next Jobs Preview) */}
      {nextJob && (
        <div className="absolute inset-0 z-0 opacity-50 scale-95">
          <TalentSparkJobCard
            job={nextJob}
            onSave={() => {}}
            onQuickApply={() => {}}
            isSaved={savedJobs.includes(nextJob.id)}
            txcReward={10}
            viewMode="swipe"
          />
        </div>
      )}

      {/* Swipe Action Indicators */}
      <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-10">
        <div className={`w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white transition-all duration-200 ${
          swipeDirection === 'left' || (transform.includes('translateX(-') && transform.includes('-')) ? 'opacity-100 scale-110' : 'opacity-0 scale-90'
        }`}>
          <X className="h-6 w-6" />
        </div>
        <div className={`w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white transition-all duration-200 ${
          swipeDirection === 'right' || (transform.includes('translateX(') && !transform.includes('translateX(-')) ? 'opacity-100 scale-110' : 'opacity-0 scale-90'
        }`}>
          <Heart className="h-6 w-6" />
        </div>
      </div>

      {/* Super Like Indicator (Swipe Up) */}
      <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white transition-all duration-200 z-10 ${
        swipeDirection === 'up' || transform.includes('translateY(-') ? 'opacity-100 scale-110' : 'opacity-0 scale-90'
      }`}>
        <Star className="h-6 w-6" />
      </div>

      {/* Main Swipeable Card */}
      <div
        {...handlers}
        className={`relative z-20 transition-transform duration-300 ease-out cursor-grab active:cursor-grabbing ${isAnimating ? 'pointer-events-none' : ''}`}
        style={{
          transform,
          touchAction: 'pan-y pan-x'
        }}
      >
        <TalentSparkJobCard
          job={currentJob}
          onSave={onSave}
          onQuickApply={(jobId) => handleSwipeAction('up')}
          isSaved={savedJobs.includes(currentJob.id)}
          txcReward={10}
          viewMode="swipe"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-6">
        <Button
          variant="outline"
          size="lg"
          className="w-14 h-14 rounded-full border-red-200 hover:bg-red-50 hover:border-red-300 transition-all hover:scale-110"
          onClick={() => handleSwipeAction('left')}
          disabled={isAnimating}
        >
          <X className="h-6 w-6 text-red-500" />
        </Button>
        
        <Button
          size="lg"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all hover:scale-110"
          onClick={() => handleSwipeAction('up')}
          disabled={isAnimating}
        >
          <Star className="h-6 w-6 text-white" />
        </Button>
        
        <Button
          size="lg"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all hover:scale-110"
          onClick={() => handleSwipeAction('right')}
          disabled={isAnimating}
        >
          <Heart className="h-6 w-6 text-white" />
        </Button>
      </div>

      {/* Swipe Instructions */}
      <div className="text-center mt-4 space-y-1">
        <div className="text-xs text-muted-foreground">
          ← Swipe left to <span className="text-red-500 font-medium">reject</span>
        </div>
        <div className="text-xs text-muted-foreground">
          ↑ Swipe up to <span className="text-blue-500 font-medium">super apply</span>
        </div>
        <div className="text-xs text-muted-foreground">
          → Swipe right to <span className="text-green-500 font-medium">save</span>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center mt-4">
        <div className="text-xs text-muted-foreground bg-white/50 backdrop-blur-sm rounded-full px-3 py-1">
          {currentIndex + 1} / {jobs.length}
        </div>
      </div>
    </div>
  );
};