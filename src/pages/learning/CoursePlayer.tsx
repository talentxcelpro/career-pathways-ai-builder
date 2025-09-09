import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { LearningHeader } from '@/components/learning/LearningHeader';
import { updateMetaTags } from '@/utils/metaTags';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, SkipForward, SkipBack, BookOpen, CheckCircle } from 'lucide-react';

const CoursePlayer = () => {
  const { id } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(0);

  React.useEffect(() => {
    updateMetaTags({
      title: 'Course Player | TalentXcel Learning',
      description: 'Learn with interactive course content, videos, and exercises.'
    });
  }, []);

  // Mock course data
  const course = {
    title: 'React Advanced Patterns',
    lessons: [
      { id: 1, title: 'Introduction to Advanced React', duration: '15:30', completed: true },
      { id: 2, title: 'Higher-Order Components', duration: '22:45', completed: true },
      { id: 3, title: 'Render Props Pattern', duration: '18:20', completed: false },
      { id: 4, title: 'Context API Deep Dive', duration: '25:10', completed: false },
      { id: 5, title: 'Custom Hooks Mastery', duration: '20:30', completed: false }
    ]
  };

  const currentLessonData = course.lessons[currentLesson];
  const progress = (course.lessons.filter(l => l.completed).length / course.lessons.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LearningHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <Card className="mb-6">
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-900 rounded-t-lg flex items-center justify-center text-white">
                  <div className="text-center">
                    <Play className="h-16 w-16 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold">{currentLessonData.title}</h3>
                    <p className="text-gray-300">Duration: {currentLessonData.duration}</p>
                  </div>
                </div>
                
                {/* Player Controls */}
                <div className="p-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentLesson(Math.max(0, currentLesson - 1))}
                      disabled={currentLesson === 0}
                    >
                      <SkipBack className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    
                    <Button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="px-8"
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setCurrentLesson(Math.min(course.lessons.length - 1, currentLesson + 1))}
                      disabled={currentLesson === course.lessons.length - 1}
                    >
                      Next
                      <SkipForward className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                  
                  <Progress value={30} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Lesson Content */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">{currentLessonData.title}</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-600 mb-4">
                    In this lesson, we'll explore advanced React patterns that will help you build 
                    more maintainable and scalable applications.
                  </p>
                  <h3 className="text-lg font-semibold mb-2">What you'll learn:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Understanding the render props pattern</li>
                    <li>Implementing reusable component logic</li>
                    <li>Best practices and common pitfalls</li>
                    <li>Real-world examples and use cases</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Course Content
                </h3>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="space-y-2">
                  {course.lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        index === currentLesson
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setCurrentLesson(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {lesson.completed ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          ) : (
                            <div className="h-4 w-4 border-2 border-gray-300 rounded-full mr-2" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{lesson.title}</p>
                            <p className="text-xs text-gray-500">{lesson.duration}</p>
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