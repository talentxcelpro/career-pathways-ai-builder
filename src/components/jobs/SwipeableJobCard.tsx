import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { TalentSparkJobCard } from './TalentSparkJobCard';
import { JobApplicationDialog } from './JobApplicationDialog';
import { Heart, X, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SwipeableJobCardProps {
  jobs: any[];
  currentIndex: number;
  onSwipe: (direction: 'left' | 'right' | 'up', job: any) => void;
  onSave: (jobId: string) => void;
  savedJobs: string[];
  onApply?: (jobId: string, applicationData: any) => void;
}

export const SwipeableJobCard: React.FC<SwipeableJobCardProps> = ({
  jobs,
  currentIndex,
  onSwipe,
  onSave,
  savedJobs,
  onApply
}) => {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [transform, setTransform] = useState('translateX(0px) translateY(0px) rotate(0deg)');
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);

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
    console.log('🎯 SWIPE ACTION TRIGGERED:', direction, 'Job:', currentJob?.id);
    setSwipeDirection(direction);
    setIsAnimating(true);
    
    // Animate out based on direction
    let animationTransform = '';
    if (direction === 'left') {
      animationTransform = 'translateX(-100%) rotate(-30deg)';
    } else if (direction === 'right') {
      animationTransform = 'translateX(100%) rotate(30deg)';
    } else if (direction === 'up') {
      animationTransform = 'translateY(-50%) scale(1.1)';
    }
    
    setTransform(animationTransform);

    // For Super Apply, show dialog immediately then proceed
    if (direction === 'up') {
      setShowApplicationDialog(true);
    }

    // Execute action after animation
    setTimeout(() => {
      onSwipe(direction, currentJob);
      setSwipeDirection(null);
      setIsAnimating(false);
      setTransform('translateX(0px) translateY(0px) rotate(0deg)');
    }, 300);
  };

  const handleApplicationSubmit = (applicationData: any) => {
    if (onApply) {
      onApply(currentJob.id, applicationData);
    }
    setShowApplicationDialog(false);
    // Note: The card will already have moved to the next one due to the swipe action
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      console.log('📱 react-swipeable: onSwipedLeft triggered');
      handleSwipeAction('left');
    },
    onSwipedRight: () => {
      console.log('📱 react-swipeable: onSwipedRight triggered');
      handleSwipeAction('right');
    },
    onSwipedUp: () => {
      console.log('📱 react-swipeable: onSwipedUp triggered');
      handleSwipeAction('up');
    },
    onSwiping: (eventData) => {
      console.log('📱 react-swipeable: onSwiping', eventData.deltaX, eventData.deltaY);
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
      console.log('📱 react-swipeable: onSwiped - resetting transform');
      if (!isAnimating) {
        setTransform('translateX(0px) translateY(0px) rotate(0deg)');
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  return (
    <div className="relative w-full max-w-sm mx-auto h-[450px] md:h-[600px]">
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
            onQuickApply={(jobId) => setShowApplicationDialog(true)}
            isSaved={savedJobs.includes(currentJob.id)}
            txcReward={10}
            viewMode="swipe"
          />
        </div>
      </div>

      {/* Action Buttons - Enhanced with TXC Rewards */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center gap-4 z-50">
        <Button
          variant="outline"
          size="lg"
          className="w-12 h-12 md:w-16 md:h-16 rounded-full border-red-200 hover:bg-red-50 hover:border-red-300 transition-all hover:scale-110 shadow-lg bg-white group animate-fade-in"
          onClick={() => {
            console.log('🔴 REJECT BUTTON CLICKED');
            handleSwipeAction('left');
          }}
          disabled={isAnimating}
        >
          <X className="h-5 w-5 md:h-8 md:w-8 text-red-500 group-hover:animate-pulse" />
        </Button>
        
        <Button
          size="lg"
          className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all hover:scale-110 shadow-lg group animate-scale-in relative overflow-hidden"
          onClick={() => {
            console.log('🌟 SUPER APPLY BUTTON CLICKED');
            handleSwipeAction('up');
          }}
          disabled={isAnimating}
        >
          <Star className="h-5 w-5 md:h-8 md:w-8 text-white group-hover:animate-pulse" />
          <div className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full px-1 font-bold shadow-sm">
            20
          </div>
        </Button>
        
        <Button
          size="lg"
          className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all hover:scale-110 shadow-lg group animate-fade-in"
          onClick={() => {
            console.log('💚 SAVE BUTTON CLICKED');
            handleSwipeAction('right');
          }}
          disabled={isAnimating}
        >
          <Heart className="h-5 w-5 md:h-8 md:w-8 text-white group-hover:animate-pulse" />
        </Button>
      </div>

      {/* Action Labels - Mobile Optimized */}
      <div className="absolute bottom-16 md:bottom-20 left-1/2 transform -translate-x-1/2 flex justify-center gap-8 md:gap-12 z-40">
        <div className="text-center">
          <span className="text-xs text-red-600 font-medium">Reject</span>
          <div className="text-xs text-gray-500 mt-1">+2 TXC</div>
        </div>
        <div className="text-center">
          <span className="text-xs text-blue-600 font-medium">Super Apply</span>
          <div className="text-xs text-gray-500 mt-1">+20 TXC</div>
        </div>
        <div className="text-center">
          <span className="text-xs text-green-600 font-medium">Save</span>
          <div className="text-xs text-gray-500 mt-1">+5 TXC</div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-40">
        <div className="text-xs text-gray-600 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
          {currentIndex + 1} / {jobs.length}
        </div>
      </div>

      {/* Job Application Dialog */}
      <JobApplicationDialog
        isOpen={showApplicationDialog}
        onClose={() => setShowApplicationDialog(false)}
        job={currentJob}
        onApply={handleApplicationSubmit}
      />
    </div>
  );
};