import React from 'react';
import { cn } from '@/lib/utils';

interface VideoProgressIndicatorProps {
  currentTime: number;
  duration: number;
  className?: string;
}

export const VideoProgressIndicator: React.FC<VideoProgressIndicatorProps> = ({
  currentTime,
  duration,
  className
}) => {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn("w-full h-1 bg-white/20 rounded-full overflow-hidden", className)}>
      <div 
        className="h-full bg-white transition-all duration-300 ease-out"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
};