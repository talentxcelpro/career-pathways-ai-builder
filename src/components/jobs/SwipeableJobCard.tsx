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
    <div className="relative w-full max-w-sm mx-auto h-[600px]">
      {/* Card Stack Background */}
      <div className="absolute inset-0">
        {/* Background Cards Stack */}
        {jobs.slice(currentIndex + 1, currentIndex + 3).map((job, index) => (
          <div
            key={job.id}
            className={`absolute inset-0 transition-all duration-300`}
            style={{
              transform: `scale(${0.95 - index * 0.02}) translateY(${(index + 1) * 8}px)`,
              opacity: 0.8 - index * 0.2,
              zIndex: 10 - index
            }}
          >
            <div className="w-full h-full bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-4 h-full flex flex-col">
                <div className="h-8 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded mb-4 animate-pulse"></div>
                <div className="flex-1 bg-gray-50 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Swipe Action Indicators */}
      <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-50">
        <div className={`w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-xl ${
          swipeDirection === 'left' || (transform.includes('translateX(-') && transform.includes('-')) ? 'opacity-100 scale-125' : 'opacity-0 scale-90'
        }`}>
          <X className="h-8 w-8" />
        </div>
        <div className={`w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-xl ${
          swipeDirection === 'right' || (transform.includes('translateX(') && !transform.includes('translateX(-')) ? 'opacity-100 scale-125' : 'opacity-0 scale-90'
        }`}>
          <Heart className="h-8 w-8" />
        </div>
      </div>

      {/* Super Apply Indicator (Swipe Up) */}
      <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white transition-all duration-200 z-50 shadow-xl ${
        swipeDirection === 'up' || transform.includes('translateY(-') ? 'opacity-100 scale-125' : 'opacity-0 scale-90'
      }`}>
        <Star className="h-8 w-8" />
      </div>

      {/* Main Swipeable Card */}
      <div
        {...handlers}
        className={`relative z-40 w-full h-full transition-transform duration-300 ease-out cursor-grab active:cursor-grabbing ${isAnimating ? 'pointer-events-none' : ''}`}
        style={{
          transform,
          touchAction: 'pan-y pan-x'
        }}
      >
        <div className="w-full h-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <TalentSparkJobCard
            job={currentJob}
            onSave={onSave}
            onQuickApply={(jobId) => handleSwipeAction('up')}
            isSaved={savedJobs.includes(currentJob.id)}
            txcReward={10}
            viewMode="swipe"
          />
        </div>
      </div>

      {/* Action Buttons - Always Visible */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex justify-center gap-6 z-50">
        <Button
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full border-red-200 hover:bg-red-50 hover:border-red-300 transition-all hover:scale-110 shadow-lg bg-white"
          onClick={() => handleSwipeAction('left')}
          disabled={isAnimating}
        >
          <X className="h-8 w-8 text-red-500" />
        </Button>
        
        <Button
          size="lg"
          className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all hover:scale-110 shadow-lg"
          onClick={() => handleSwipeAction('up')}
          disabled={isAnimating}
        >
          <Star className="h-8 w-8 text-white" />
        </Button>
        
        <Button
          size="lg"
          className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 transition-all hover:scale-110 shadow-lg"
          onClick={() => handleSwipeAction('right')}
          disabled={isAnimating}
        >
          <Heart className="h-8 w-8 text-white" />
        </Button>
      </div>

      {/* Swipe Instructions */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center space-y-1 z-40">
        <div className="text-xs text-gray-600 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1">
          Swipe or tap to interact
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40">
        <div className="text-xs text-gray-600 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
          {currentIndex + 1} / {jobs.length}
        </div>
      </div>
    </div>
  );
};