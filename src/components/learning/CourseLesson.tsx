
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, CheckCircle, Clock, FileText, Award, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface CourseLesson {
  id: string;
  title: string;
  content: string;
  lesson_type: 'video' | 'text' | 'quiz' | 'assignment';
  video_url?: string;
  duration_minutes: number;
  lesson_order: number;
  is_free: boolean;
  is_completed?: boolean;
}

interface CourseLessonProps {
  lesson: CourseLesson;
  isEnrolled: boolean;
  onComplete: (lessonId: string) => void;
}

export const CourseLessonComponent: React.FC<CourseLessonProps> = ({
  lesson,
  isEnrolled,
  onComplete
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const queryClient = useQueryClient();

  const completeLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed_at: new Date().toISOString(),
          is_completed: true,
          time_spent_minutes: lesson.duration_minutes
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Lesson completed!');
      onComplete(lesson.id);
      queryClient.invalidateQueries({ queryKey: ['user_lesson_progress'] });
    },
    onError: () => {
      toast.error('Failed to mark lesson as complete');
    }
  });

  const getLessonIcon = () => {
    if (lesson.is_completed) return <CheckCircle className="h-5 w-5 text-green-600" />;
    
    switch (lesson.lesson_type) {
      case 'video': return <Play className="h-5 w-5 text-blue-600" />;
      case 'quiz': return <Award className="h-5 w-5 text-purple-600" />;
      case 'assignment': return <FileText className="h-5 w-5 text-orange-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const canAccess = isEnrolled || lesson.is_free;

  return (
    <Card className={`hover:shadow-md transition-shadow ${lesson.is_completed ? 'bg-green-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getLessonIcon()}
            <div>
              <CardTitle className="text-lg">{lesson.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{lesson.duration_minutes} min</span>
                {lesson.is_free && <Badge variant="secondary">Free</Badge>}
                <Badge variant="outline" className="capitalize">
                  {lesson.lesson_type}
                </Badge>
              </div>
            </div>
          </div>
          {!canAccess && <Lock className="h-5 w-5 text-gray-400" />}
        </div>
      </CardHeader>
      
      {canAccess && (
        <CardContent>
          <div className="space-y-4">
            {lesson.lesson_type === 'video' && lesson.video_url && (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                {isPlaying ? (
                  <div className="w-full h-full bg-black rounded-lg flex items-center justify-center text-white">
                    Video Player Placeholder
                  </div>
                ) : (
                  <Button onClick={() => setIsPlaying(true)} size="lg">
                    <Play className="h-6 w-6 mr-2" />
                    Play Video
                  </Button>
                )}
              </div>
            )}
            
            {lesson.content && (
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
              </div>
            )}
            
            {lesson.lesson_type === 'quiz' && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Quiz Assessment</h4>
                <p className="text-purple-700 text-sm mb-3">
                  Test your knowledge with this interactive quiz.
                </p>
                <Button variant="outline" className="text-purple-700 border-purple-300">
                  Start Quiz
                </Button>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2">
              {lesson.is_completed ? (
                <Badge variant="secondary" className="text-green-700 bg-green-100">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completed
                </Badge>
              ) : (
                <div />
              )}
              
              {!lesson.is_completed && canAccess && (
                <Button
                  onClick={() => completeLessonMutation.mutate(lesson.id)}
                  disabled={completeLessonMutation.isPending}
                >
                  Mark as Complete
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
