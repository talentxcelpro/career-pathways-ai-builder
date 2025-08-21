import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface VideoErrorFallbackProps {
  onRetry?: () => void;
  error?: string;
  className?: string;
}

export const VideoErrorFallback: React.FC<VideoErrorFallbackProps> = ({
  onRetry,
  error,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 p-6 rounded-lg ${className}`}>
      <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
      <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
        {error || 'Unable to load video'}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
};