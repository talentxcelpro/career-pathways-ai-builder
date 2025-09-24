import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Volume2, 
  Maximize, 
  SkipBack, 
  SkipForward,
  Download,
  BookOpen,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  title: string;
  description?: string;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
}

// Helper function to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url: string): string => {
  const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  if (videoIdMatch) {
    return `https://www.youtube.com/embed/${videoIdMatch[1]}?enablejsapi=1&rel=0&modestbranding=1`;
  }
  return url;
};

export const DirectVideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  description,
  onComplete,
  onProgress
}) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const isYouTubeVideo = src.includes('youtube.com') || src.includes('youtu.be');
  const embedUrl = isYouTubeVideo ? getYouTubeEmbedUrl(src) : src;

  const handleComplete = () => {
    setIsCompleted(true);
    setProgress(100);
    onComplete?.();
    onProgress?.(1);
  };

  const handleWatchOnYouTube = () => {
    window.open(src, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Video Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-foreground">{title}</h3>
            <Badge variant="secondary" className="mt-1">
              <BookOpen className="h-3 w-3 mr-1" />
              TalentXcel Learning
            </Badge>
          </div>
          {isYouTubeVideo && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleWatchOnYouTube}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Watch on YouTube
            </Button>
          )}
        </div>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Video Player */}
      <Card>
        <CardContent className="p-0">
          <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
            {isYouTubeVideo ? (
              <iframe
                src={embedUrl}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                onLoad={() => setIsVideoLoaded(true)}
              />
            ) : (
              <video
                src={src}
                controls
                className="w-full h-full"
                poster="/placeholder.svg"
                preload="metadata"
                onLoadedMetadata={() => setIsVideoLoaded(true)}
                onEnded={handleComplete}
                onTimeUpdate={(e) => {
                  const video = e.target as HTMLVideoElement;
                  const progressPercent = (video.currentTime / video.duration) * 100;
                  setProgress(progressPercent);
                  onProgress?.(video.currentTime / video.duration);
                  
                  // Mark as completed when 90% watched
                  if (progressPercent > 90 && !isCompleted) {
                    handleComplete();
                  }
                }}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress and Actions */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isCompleted && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleComplete}
            variant={isCompleted ? "outline" : "default"}
            disabled={isCompleted}
          >
            {isCompleted ? 'Completed' : 'Mark as Complete'}
          </Button>
        </div>
      </div>

      {/* Video Instructions */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">💡 Learning Tips:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Take notes while watching the video</li>
              <li>Pause and replay sections as needed</li>
              <li>Apply what you learn immediately</li>
              <li>Complete the lesson to track your progress</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};