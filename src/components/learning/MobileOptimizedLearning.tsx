import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Download, 
  Wifi, 
  WifiOff,
  BookOpen,
  Headphones,
  Clock,
  CheckCircle,
  ArrowLeft,
  MoreVertical,
  Zap,
  Bookmark,
  Share,
  Volume2,
  Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileLesson {
  id: string;
  title: string;
  duration: number;
  progress: number;
  isDownloaded: boolean;
  isCompleted: boolean;
  type: 'video' | 'audio' | 'reading' | 'quiz';
  downloadSize?: string;
}

interface MobileCourse {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  currentLesson: number;
  downloadedLessons: number;
  lessons: MobileLesson[];
}

interface MobileOptimizedLearningProps {
  courseId?: string;
  className?: string;
}

export const MobileOptimizedLearning: React.FC<MobileOptimizedLearningProps> = ({ 
  courseId, 
  className 
}) => {
  const [course, setCourse] = useState<MobileCourse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [showMobilePlayer, setShowMobilePlayer] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<MobileLesson | null>(null);

  useEffect(() => {
    // Check network status
    const updateOnlineStatus = () => {
      setIsOfflineMode(!navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    // Load course data
    loadCourse();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [courseId]);

  const loadCourse = () => {
    // Mock course data optimized for mobile
    const mockCourse: MobileCourse = {
      id: '1',
      title: 'React Native Development',
      instructor: 'John Doe',
      progress: 65,
      totalLessons: 12,
      completedLessons: 8,
      currentLesson: 8,
      downloadedLessons: 5,
      lessons: [
        {
          id: '1',
          title: 'Introduction to React Native',
          duration: 15 * 60, // 15 minutes in seconds
          progress: 100,
          isDownloaded: true,
          isCompleted: true,
          type: 'video',
          downloadSize: '45 MB'
        },
        {
          id: '2',
          title: 'Setting up Development Environment',
          duration: 12 * 60,
          progress: 100,
          isDownloaded: true,
          isCompleted: true,
          type: 'video',
          downloadSize: '38 MB'
        },
        {
          id: '3',
          title: 'Core Components Overview',
          duration: 18 * 60,
          progress: 45,
          isDownloaded: false,
          isCompleted: false,
          type: 'video',
          downloadSize: '52 MB'
        },
        {
          id: '4',
          title: 'Navigation Patterns',
          duration: 20 * 60,
          progress: 0,
          isDownloaded: false,
          isCompleted: false,
          type: 'video',
          downloadSize: '58 MB'
        }
      ]
    };

    setCourse(mockCourse);
    if (mockCourse.lessons.length > 0) {
      setCurrentLesson(mockCourse.lessons[mockCourse.currentLesson - 1] || mockCourse.lessons[0]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const handleLessonSelect = (lesson: MobileLesson) => {
    setCurrentLesson(lesson);
    setCurrentTime(0);
    setShowMobilePlayer(true);
  };

  const handleDownload = (lesson: MobileLesson) => {
    // Simulate download
    console.log('Downloading lesson:', lesson.title);
  };

  const canPlayOffline = (lesson: MobileLesson) => {
    return lesson.isDownloaded || !isOfflineMode;
  };

  const getLessonIcon = (type: MobileLesson['type']) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'audio': return <Headphones className="h-4 w-4" />;
      case 'reading': return <BookOpen className="h-4 w-4" />;
      case 'quiz': return <CheckCircle className="h-4 w-4" />;
      default: return <Play className="h-4 w-4" />;
    }
  };

  if (!course) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={cn("max-w-md mx-auto bg-background min-h-screen", className)}>
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b safe-area-padding-top">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h1 className="font-semibold text-lg truncate">{course.title}</h1>
            {isOfflineMode && (
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <WifiOff className="h-3 w-3" />
                Offline Mode
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Course Progress Banner */}
      <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Course Progress</span>
            <span className="text-sm text-muted-foreground">
              {course.completedLessons}/{course.totalLessons} lessons
            </span>
          </div>
          <Progress value={course.progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{course.progress}% complete</span>
            <span>{course.downloadedLessons} downloaded</span>
          </div>
        </div>
      </div>

      {/* Offline Status Banner */}
      {isOfflineMode && (
        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              You're offline. Only downloaded content is available.
            </span>
          </div>
        </div>
      )}

      {/* Lessons List */}
      <div className="p-4 space-y-3">
        <h2 className="font-semibold text-lg mb-4">Lessons</h2>
        
        {course.lessons.map((lesson, index) => (
          <Card 
            key={lesson.id} 
            className={cn(
              "touch-target cursor-pointer transition-all",
              !canPlayOffline(lesson) && "opacity-50",
              lesson.isCompleted && "bg-success/5 border-success/20"
            )}
            onClick={() => canPlayOffline(lesson) && handleLessonSelect(lesson)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {/* Lesson Number */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                  lesson.isCompleted 
                    ? "bg-success text-success-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {lesson.isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Lesson Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm truncate">{lesson.title}</h3>
                    {getLessonIcon(lesson.type)}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(lesson.duration)}</span>
                    {lesson.downloadSize && (
                      <>
                        <span>•</span>
                        <span>{lesson.downloadSize}</span>
                      </>
                    )}
                  </div>

                  {lesson.progress > 0 && !lesson.isCompleted && (
                    <Progress value={lesson.progress} className="h-1 mt-2" />
                  )}
                </div>

                {/* Download Status */}
                <div className="flex items-center gap-2">
                  {lesson.isDownloaded ? (
                    <Badge variant="secondary" className="text-xs">
                      <Download className="h-3 w-3 mr-1" />
                      Downloaded
                    </Badge>
                  ) : isOfflineMode ? (
                    <Badge variant="outline" className="text-xs">
                      <WifiOff className="h-3 w-3 mr-1" />
                      Offline
                    </Badge>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(lesson);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mobile Video Player (Bottom Sheet Style) */}
      {showMobilePlayer && currentLesson && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Player Header */}
          <div className="safe-area-padding-top bg-black/90 p-4 flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white"
              onClick={() => setShowMobilePlayer(false)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 mx-4">
              <h3 className="text-white font-medium text-sm truncate">
                {currentLesson.title}
              </h3>
            </div>
            <Button variant="ghost" size="sm" className="text-white">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>

          {/* Video Area */}
          <div className="flex-1 bg-black flex items-center justify-center">
            <div className="text-white text-center">
              <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm opacity-75">Video Player Placeholder</p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="bg-black/90 p-6 safe-area-padding-bottom">
            {/* Progress Bar */}
            <div className="mb-6">
              <Progress value={currentLesson.progress} className="h-1 mb-2" />
              <div className="flex justify-between text-xs text-white/70">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(currentLesson.duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-8 mb-4">
              <Button variant="ghost" size="lg" className="text-white">
                <SkipBack className="h-6 w-6" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="lg" 
                className="w-16 h-16 rounded-full bg-white/20 text-white"
                onClick={togglePlayback}
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8 ml-1" />
                )}
              </Button>
              
              <Button variant="ghost" size="lg" className="text-white">
                <SkipForward className="h-6 w-6" />
              </Button>
            </div>

            {/* Additional Controls */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" className="text-white flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="text-xs">{playbackSpeed}x</span>
              </Button>
              
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-white">
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white">
                  <Share className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white">
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};