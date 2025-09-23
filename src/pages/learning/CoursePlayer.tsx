import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { PublicLearningHeader } from '@/components/learning/PublicLearningHeader';
import { updateMetaTags } from '@/utils/metaTags';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AdaptiveVideoPlayer } from '@/components/video/AdaptiveVideoPlayer';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Play, Pause, SkipForward, SkipBack, BookOpen, CheckCircle, Loader2, Volume2, VolumeX } from 'lucide-react';

const CoursePlayer = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get('lesson');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted to allow autoplay
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  // Add debug logging
  useEffect(() => {
    console.log('CoursePlayer mounted with params:', { id, lessonId });
    setDebugInfo(`Course ID: ${id}, Lesson ID: ${lessonId}`);
  }, [id, lessonId]);

  // Fetch course data with better error handling
  const { data: course, isLoading: courseLoading, error: courseError } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('Course ID is required');
      }
      
      console.log('Fetching course data for ID:', id);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Course fetch error:', error);
        throw error;
      }
      
      console.log('Course data fetched successfully:', data?.title);
      return data;
    },
    enabled: !!id,
    retry: false // Don't retry on errors to avoid auth loops
  });

  // Fetch course modules and lessons
  const { data: modules, isLoading: modulesLoading } = useQuery({
    queryKey: ['course-modules', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_modules')
        .select(`
          *,
          course_lessons (*)
        `)
        .eq('course_id', id)
        .order('module_order');
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    retry: false
  });

  // Calculate derived values
  const allLessons = modules?.flatMap(module => 
    module.course_lessons?.map(lesson => ({
      ...lesson,
      moduleTitle: module.title,
      moduleId: module.id
    })) || []
  ) || [];

  const currentLesson = allLessons[currentLessonIndex];
  const completedLessons = allLessons.filter(l => l.is_completed).length;
  const progress = allLessons.length > 0 ? (completedLessons / allLessons.length) * 100 : 0;
  const isLoading = courseLoading || modulesLoading;

  // Set initial lesson based on URL parameter
  useEffect(() => {
    if (lessonId && allLessons.length > 0) {
      const lessonIndex = allLessons.findIndex(lesson => lesson.id === lessonId);
      if (lessonIndex !== -1) {
        console.log('Setting lesson from URL:', lessonId, 'at index:', lessonIndex);
        setCurrentLessonIndex(lessonIndex);
      }
    }
  }, [lessonId, allLessons]);

  useEffect(() => {
    if (course) {
      updateMetaTags({
        title: `${course.title} | Course Player`,
        description: course.description || 'Learn with interactive course content, videos, and exercises.'
      });
    }
  }, [course]);

  // Render error state
  if (courseError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-lg p-6">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-4">Unable to Load Course</h2>
          <p className="text-muted-foreground mb-4">
            {courseError?.message || 'There was an error loading the course content.'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Debug: {debugInfo}
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  // Render not found state
  if (!course || !modules) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Course not found</p>
          <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PublicLearningHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <Card className="mb-6">
              <CardContent className="p-0">
                {currentLesson?.video_url ? (
                  <div className="relative">
                    <AdaptiveVideoPlayer
                      videoUrl={currentLesson.video_url}
                      lessonId={currentLesson.id}
                      className="aspect-video rounded-t-lg"
                      onProgress={(progress, position) => {
                        console.log('Video progress:', progress, position);
                      }}
                      onComplete={() => {
                        console.log('Video completed');
                      }}
                      autoplay={false}
                      allowDownload={true}
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                    <div className="text-center">
                      <Play className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-semibold">{currentLesson?.title}</h3>
                      <p className="text-muted-foreground">
                        Duration: {currentLesson?.duration_minutes || 0} minutes
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">Video not available</p>
                    </div>
                  </div>
                )}
                
                {/* Player Controls */}
                <div className="p-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentLessonIndex(Math.max(0, currentLessonIndex - 1));
                        setIsPlaying(false);
                      }}
                      disabled={currentLessonIndex === 0}
                    >
                      <SkipBack className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    
                    <div className="text-center">
                      <p className="text-lg font-semibold">
                        {currentLesson?.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isPlaying ? 'Playing' : 'Ready to play'} • {currentLesson?.duration_minutes} min
                      </p>
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentLessonIndex(Math.min(allLessons.length - 1, currentLessonIndex + 1));
                        setIsPlaying(false);
                      }}
                      disabled={currentLessonIndex === allLessons.length - 1}
                    >
                      Next
                      <SkipForward className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                  
                  <Progress value={((currentLessonIndex + 1) / allLessons.length) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Lesson Content */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">{currentLesson?.title}</h2>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    Module: {currentLesson?.moduleTitle}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Duration: {currentLesson?.duration_minutes || 0} minutes
                  </p>
                </div>
                {currentLesson?.content && (
                  <div className="prose max-w-none" 
                       dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Course Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  {course.title}
                </h3>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="space-y-2">
                  {allLessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        index === currentLessonIndex
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setCurrentLessonIndex(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {lesson.is_completed ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          ) : (
                            <div className="h-4 w-4 border-2 border-muted-foreground rounded-full mr-2" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{lesson.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {lesson.duration_minutes} min • {lesson.moduleTitle}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;