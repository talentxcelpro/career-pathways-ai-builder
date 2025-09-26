import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { TalentSparkJobCard } from './TalentSparkJobCard';
import { JobApplicationDialog } from './JobApplicationDialog';
import { Heart, X, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SwipeableJobCardProps {
  jobs: any[];
  currentIndex: number;
  onSave: (jobId: string) => Promise<void>;
  onQuickApply: (jobId: string) => Promise<void>;
  onReject: (jobId: string) => Promise<void>;
  onApplication: (jobId: string, applicationData: any) => Promise<void>;
  isLoggedIn: boolean;
}

export const SwipeableJobCard: React.FC<SwipeableJobCardProps> = ({
  jobs,
  currentIndex,
  onSave,
  onQuickApply,
  onReject,
  onApplication,
  isLoggedIn
}) => {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [transform, setTransform] = useState('translateX(0px) translateY(0px) rotate(0deg)');
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);

  const currentJob = jobs[currentIndex];
  const nextJob = jobs[currentIndex + 1];

  console.log('🎯 SwipeableJobCard RENDER:', {
    currentIndex,
    jobsLength: jobs.length,
    currentJobId: currentJob?.id,
    hasCurrentJob: !!currentJob
  });

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

  const handleSwipeAction = async (direction: 'left' | 'right' | 'up') => {
    if (isAnimating) return;

    console.log(`🎯 SWIPE ACTION: ${direction} for job ${currentJob.id}`);
    
    setIsAnimating(true);
    setSwipeDirection(direction);

    // Visual feedback
    const animationTransform = direction === 'left' 
      ? 'translateX(-150%) rotate(-30deg)' 
      : direction === 'right'
        ? 'translateX(150%) rotate(30deg)'
        : 'translateY(-150%) scale(0.8)';
    
    setTransform(animationTransform);

    try {
      // Execute the appropriate action
      if (direction === 'left') {
        await onReject(currentJob.id);
      } else if (direction === 'right') {
        await onSave(currentJob.id);
      } else if (direction === 'up') {
        setShowApplicationDialog(true);
      }
    } catch (error) {
      console.error('Swipe action error:', error);
    }

    // Reset animation after delay
    setTimeout(() => {
      setSwipeDirection(null);
      setIsAnimating(false);
      setTransform('translateX(0px) translateY(0px) rotate(0deg)');
    }, 300);
  };

  const handleApplicationSubmit = async (applicationData: any) => {
    try {
      await onApplication(currentJob.id, applicationData);
      setShowApplicationDialog(false);
    } catch (error) {
      console.error('Application submission error:', error);
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      console.log('👈 SWIPED LEFT detected');
      handleSwipeAction('left');
    },
    onSwipedRight: () => {
      console.log('👉 SWIPED RIGHT detected');
      handleSwipeAction('right');
    },
    onSwipedUp: () => {
      console.log('👆 SWIPED UP detected');
      handleSwipeAction('up');
    },
    
    trackMouse: true,
    delta: 10,
    swipeDuration: 500,
    touchEventOptions: { passive: false }
  });

  return (
    <div className="relative w-full h-[600px] mx-auto max-w-md">
      {/* Background Cards for Depth */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Next card (background) */}
        {nextJob && (
          <div 
            className="absolute w-[95%] h-[95%] bg-white rounded-2xl shadow-lg border border-gray-100 opacity-50 -z-10"
            style={{ transform: 'scale(0.95) translateY(10px)' }}
          >
            <TalentSparkJobCard
              job={nextJob}
              onSave={onSave}
              onQuickApply={onQuickApply}
              isSaved={false}
              txcReward={10}
              viewMode="swipe"
            />
          </div>
        )}

        {/* Third card (background) */}
        {jobs[currentIndex + 2] && (
          <div 
            className="absolute w-[90%] h-[90%] bg-white rounded-2xl shadow border border-gray-100 opacity-25 -z-20"
            style={{ transform: 'scale(0.9) translateY(20px)' }}
          />
        )}
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
            onQuickApply={() => setShowApplicationDialog(true)}
            isSaved={false}
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

      {/* Application Dialog */}
      <JobApplicationDialog
        job={currentJob}
        isOpen={showApplicationDialog}
        onClose={() => setShowApplicationDialog(false)}
        onApply={handleApplicationSubmit}
      />
    </div>
  );
};