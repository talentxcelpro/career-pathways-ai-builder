
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Pause, Play, X, CheckCircle, XCircle, Clock, Wifi, WifiOff, Zap, Database } from 'lucide-react';

interface ImportProgressProps {
  progress: {
    total: number;
    completed: number;
    successful: number;
    failed: number;
    currentUser?: string;
    isRunning: boolean;
    connectionStatus?: 'testing' | 'healthy' | 'unhealthy';
    processedBatches?: number;
    totalBatches?: number;
    processingTimeMs?: number;
    usersPerSecond?: number;
  };
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}

export const ImportProgress: React.FC<ImportProgressProps> = ({
  progress,
  isPaused,
  onPause,
  onResume,
  onCancel
}) => {
  const progressPercentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  if (!progress.isRunning && progress.completed === 0 && !progress.connectionStatus) {
    return null;
  }

  const getConnectionStatusIcon = () => {
    switch (progress.connectionStatus) {
      case 'testing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'healthy':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'unhealthy':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getConnectionStatusText = () => {
    switch (progress.connectionStatus) {
      case 'testing':
        return 'Testing connection...';
      case 'healthy':
        return 'Connection healthy';
      case 'unhealthy':
        return 'Connection issues detected';
      default:
        return '';
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Enhanced Batch Import Progress</h3>
        <div className="flex gap-2">
          {progress.isRunning && (
            <>
              {isPaused ? (
                <Button onClick={onResume} size="sm" variant="outline">
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </Button>
              ) : (
                <Button onClick={onPause} size="sm" variant="outline">
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
              )}
              <Button onClick={onCancel} size="sm" variant="destructive">
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Connection Status */}
      {progress.connectionStatus && (
        <div className="flex items-center gap-2 text-sm">
          {getConnectionStatusIcon()}
          <span>{getConnectionStatusText()}</span>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            {progress.completed} of {progress.total} users processed
          </span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Batch Processing Information */}
      {(progress.processedBatches !== undefined || progress.totalBatches !== undefined) && (
        <div className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded">
          <Database className="h-4 w-4 text-blue-500" />
          <span>
            Batch Processing: {progress.processedBatches || 0} / {progress.totalBatches || 0} batches
          </span>
        </div>
      )}

      {/* Performance Metrics */}
      {(progress.processingTimeMs || progress.usersPerSecond) && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          {progress.processingTimeMs && (
            <div className="flex items-center gap-2 bg-green-50 p-2 rounded">
              <Clock className="h-4 w-4 text-green-500" />
              <span>Time: {formatTime(progress.processingTimeMs)}</span>
            </div>
          )}
          {progress.usersPerSecond && (
            <div className="flex items-center gap-2 bg-purple-50 p-2 rounded">
              <Zap className="h-4 w-4 text-purple-500" />
              <span>Speed: {progress.usersPerSecond}/sec</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Successful: {progress.successful}</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-red-500" />
          <span>Failed: {progress.failed}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" />
          <span>
            {isPaused ? 'Paused' : progress.isRunning ? 'Running' : 'Complete'}
          </span>
        </div>
      </div>

      {progress.currentUser && (
        <div className="text-xs text-gray-600">
          Currently processing: {progress.currentUser}
        </div>
      )}

      {/* Enhanced Import Speed Recommendations */}
      {progress.isRunning && (
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
          <div className="font-semibold mb-1">🚀 Enhanced Batch Processing Active</div>
          <div>• Users are processed in parallel batches for maximum efficiency</div>
          <div>• "Fast" speed: Optimized for high volume (10K+ users daily)</div>
          <div>• "Medium" speed: Balanced performance and stability</div>
          <div>• "Slow" speed: Conservative approach for maximum reliability</div>
        </div>
      )}

      {/* High Volume Tips */}
      {progress.total >= 1000 && !progress.isRunning && (
        <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
          <div className="font-semibold">💡 High Volume Import Tips:</div>
          <div>• For 10K+ daily imports, consider using "Fast" speed</div>
          <div>• Monitor system performance during large imports</div>
          <div>• Split extremely large imports (50K+) into multiple sessions</div>
        </div>
      )}
    </div>
  );
};
