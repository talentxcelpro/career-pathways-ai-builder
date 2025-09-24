import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DirectVideoPlayer } from './DirectVideoPlayer';
import { 
  Play, 
  FileText, 
  Trophy, 
  Download, 
  CheckCircle,
  Clock,
  X
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'quiz' | 'assignment';
  duration: string;
  videoUrl?: string;
  description?: string;
  completed?: boolean;
}

interface LessonViewerProps {
  lesson: Lesson;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  moduleTitle: string;
}

// Sample video URLs - in real implementation, these would come from your content management system
const sampleVideoUrls = {
  'resume-basics': 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  'cover-letter': 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
  'linkedin-opt': 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  'communication': 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
  'teamwork': 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  'interview-types': 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4'
};

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lesson,
  isOpen,
  onClose,
  onComplete,
  moduleTitle
}) => {
  const [lessonProgress, setLessonProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(lesson.completed || false);

  const handleVideoComplete = () => {
    setIsCompleted(true);
    onComplete();
  };

  const handleVideoProgress = (progress: number) => {
    setLessonProgress(progress * 100);
    // Mark as completed when 90% watched
    if (progress >= 0.9 && !isCompleted) {
      handleVideoComplete();
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'quiz': return <Trophy className="h-4 w-4" />;
      case 'assignment': return <Download className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const renderLessonContent = () => {
    switch (lesson.type) {
      case 'video':
        const videoUrl = sampleVideoUrls[lesson.id as keyof typeof sampleVideoUrls] || 
                        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        
        return (
          <DirectVideoPlayer
            src={videoUrl}
            title={lesson.title}
            description={lesson.description}
            onComplete={handleVideoComplete}
            onProgress={handleVideoProgress}
          />
        );

      case 'pdf':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {lesson.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-8 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">PDF Resource</h3>
                <p className="text-muted-foreground mb-4">
                  Download the comprehensive guide for {lesson.title.toLowerCase()}.
                </p>
                <div className="space-y-2">
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF Guide
                  </Button>
                  <Button variant="outline" onClick={handleVideoComplete} className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'quiz':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                {lesson.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-8 text-center">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                <h3 className="font-semibold mb-2">Knowledge Assessment</h3>
                <p className="text-muted-foreground mb-4">
                  Test your understanding of {lesson.title.toLowerCase()}.
                </p>
                <div className="space-y-2">
                  <Button className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Start Quiz
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    10 questions • 15 minutes • 70% to pass
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'assignment':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                {lesson.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-8 text-center">
                <Download className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Practical Assignment</h3>
                <p className="text-muted-foreground mb-4">
                  Apply what you've learned with this hands-on {lesson.title.toLowerCase()}.
                </p>
                <div className="space-y-2">
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Assignment
                  </Button>
                  <Button variant="outline" onClick={handleVideoComplete} className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit & Complete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Content not available</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                {getLessonIcon(lesson.type)}
                {lesson.title}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{moduleTitle}</Badge>
                <Badge variant="secondary" className="capitalize">
                  {lesson.type}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {lesson.duration}
                </div>
                {isCompleted && (
                  <Badge className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {renderLessonContent()}
          
          {/* Lesson Progress */}
          {lesson.type === 'video' && lessonProgress > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Lesson Progress</span>
                  <span>{Math.round(lessonProgress)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${lessonProgress}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};