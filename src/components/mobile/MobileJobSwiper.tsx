import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  X, 
  MapPin, 
  Clock, 
  DollarSign,
  Building2,
  Star,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  type: string;
  description: string;
  requirements: string[];
  postedAt: string;
  companyLogo?: string;
  isRemote?: boolean;
  matchScore?: number;
}

interface MobileJobSwiperProps {
  jobs: Job[];
  onLike: (job: Job) => void;
  onPass: (job: Job) => void;
  onViewDetails: (job: Job) => void;
  className?: string;
}

export const MobileJobSwiper: React.FC<MobileJobSwiperProps> = ({
  jobs,
  onLike,
  onPass,
  onViewDetails,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

  const currentJob = jobs[currentIndex];
  const nextJob = jobs[currentIndex + 1];

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (!currentJob) return;
    
    setExitDirection(direction);
    
    if (direction === 'right') {
      onLike(currentJob);
    } else {
      onPass(currentJob);
    }
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setExitDirection(null);
    }, 200);
  }, [currentJob, onLike, onPass]);

  const handleDragEnd = useCallback((info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThreshold = 100;
    const velocityThreshold = 500;
    
    if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > velocityThreshold) {
      handleSwipe(offset.x > 0 ? 'right' : 'left');
    }
  }, [handleSwipe]);

  if (!currentJob) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-lg font-semibold mb-2">No more jobs!</h3>
        <p className="text-muted-foreground">Check back later for new opportunities</p>
      </div>
    );
  }

  return (
    <div className={cn("relative h-[600px] w-full max-w-sm mx-auto", className)}>
      <AnimatePresence>
        {/* Next Job (Background) */}
        {nextJob && (
          <JobCard
            key={`${nextJob.id}-next`}
            job={nextJob}
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 0.9, opacity: 0.5 }}
            className="absolute inset-0 z-10"
            isInteractive={false}
          />
        )}
        
        {/* Current Job */}
        <motion.div
          key={currentJob.id}
          className="absolute inset-0 z-20"
          initial={{ scale: 1, rotate: 0 }}
          animate={{ 
            scale: 1, 
            rotate: 0,
            x: 0,
            y: 0
          }}
          exit={{
            x: exitDirection === 'right' ? 300 : -300,
            rotate: exitDirection === 'right' ? 30 : -30,
            opacity: 0,
            transition: { duration: 0.2 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => handleDragEnd(info)}
          whileDrag={{
            scale: 1.05,
            transition: { duration: 0 }
          }}
        >
          <JobCard
            job={currentJob}
            onViewDetails={() => onViewDetails(currentJob)}
            isInteractive={true}
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Action Buttons */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-6 z-30">
        <Button
          size="lg"
          variant="outline"
          className="rounded-full h-14 w-14 p-0 border-2 border-red-200 hover:border-red-300 hover:bg-red-50"
          onClick={() => handleSwipe('left')}
        >
          <X className="h-6 w-6 text-red-500" />
        </Button>
        
        <Button
          size="lg"
          className="rounded-full h-14 w-14 p-0 bg-primary hover:bg-primary/90"
          onClick={() => handleSwipe('right')}
        >
          <Heart className="h-6 w-6 text-white" />
        </Button>
      </div>
      
      {/* Progress Indicator */}
      <div className="absolute top-4 left-4 right-4 z-30">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {currentIndex + 1} of {jobs.length}
          </div>
          <div className="h-1 bg-muted rounded-full flex-1 mx-4">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / jobs.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface JobCardProps {
  job: Job;
  onViewDetails?: () => void;
  isInteractive?: boolean;
  className?: string;
  initial?: any;
  animate?: any;
}

const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onViewDetails, 
  isInteractive = true,
  className,
  ...motionProps
}) => {
  return (
    <motion.div className={cn("w-full h-full", className)} {...motionProps}>
      <Card className="h-full shadow-lg overflow-hidden">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">{job.title}</h2>
                <div className="flex items-center space-x-2 mb-2">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">{job.company}</span>
                </div>
              </div>
              {job.matchScore && (
                <div className="flex items-center space-x-1 bg-white/20 rounded-full px-2 py-1">
                  <Star className="h-3 w-3" />
                  <span className="text-xs font-medium">{job.matchScore}%</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 text-sm">
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{job.location}</span>
              </div>
              {job.salary && (
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-3 w-3" />
                  <span>{job.salary}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{job.postedAt}</span>
              </div>
            </div>
          </div>
          
          {/* Body */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <Badge variant="secondary" className="mb-2">
                  {job.type}
                </Badge>
                {job.isRemote && (
                  <Badge variant="outline" className="ml-2">
                    Remote
                  </Badge>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {job.description}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Requirements</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {job.requirements.slice(0, 3).map((req, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          {isInteractive && onViewDetails && (
            <div className="p-4 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onViewDetails}
                className="w-full"
              >
                <ChevronUp className="h-4 w-4 mr-2" />
                View Full Details
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};