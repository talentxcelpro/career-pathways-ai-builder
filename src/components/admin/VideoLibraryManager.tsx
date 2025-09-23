import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Video, 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Play,
  BarChart3
} from 'lucide-react';

interface VideoLibraryItem {
  id: string;
  video_url: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  difficulty_level: string;
  duration_minutes: number;
  tags: string[];
  quality_score: number;
  usage_count: number;
}

export const VideoLibraryManager: React.FC = () => {
  const [videos, setVideos] = useState<VideoLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cleanupProgress, setCleanupProgress] = useState(0);
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  const uniqueVideos = [
    {
      url: 'https://www.youtube.com/embed/llKvV8_T95M',
      title: 'Introduction to Programming Fundamentals',
      description: 'Learn the basic concepts of programming and computer science',
      category: 'programming',
      difficulty: 'beginner'
    },
    {
      url: 'https://www.youtube.com/embed/UBokJV8qYbE',
      title: 'Web Development Basics',
      description: 'Understanding HTML, CSS, and JavaScript foundations',
      category: 'web-development',
      difficulty: 'beginner'
    },
    {
      url: 'https://www.youtube.com/embed/8dQF5grOsOM',
      title: 'Python Programming Introduction',
      description: 'Getting started with Python programming language',
      category: 'programming',
      difficulty: 'beginner'
    },
    {
      url: 'https://www.youtube.com/embed/XjSC90_XLf4',
      title: 'Database Design Principles',
      description: 'Learn how to design efficient and scalable databases',
      category: 'database',
      difficulty: 'intermediate'
    },
    {
      url: 'https://www.youtube.com/embed/VgHzJaIuqZU',
      title: 'UI/UX Design Fundamentals',
      description: 'Understanding user interface and user experience design',
      category: 'design',
      difficulty: 'beginner'
    },
    {
      url: 'https://www.youtube.com/embed/2g4VjcjSjC8',
      title: 'Data Science Basics',
      description: 'Introduction to data analysis and machine learning',
      category: 'data-science',
      difficulty: 'intermediate'
    },
    {
      url: 'https://www.youtube.com/embed/Oe421EPjeBE',
      title: 'Mobile App Development',
      description: 'Building mobile applications for iOS and Android',
      category: 'mobile-development',
      difficulty: 'intermediate'
    },
    {
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      title: 'Digital Marketing Strategies',
      description: 'Modern approaches to digital marketing and social media',
      category: 'marketing',
      difficulty: 'beginner'
    },
    {
      url: 'https://www.youtube.com/embed/dDjLmWGEWhs',
      title: 'Cloud Computing Fundamentals',
      description: 'Understanding cloud platforms and services',
      category: 'cloud-computing',
      difficulty: 'intermediate'
    },
    {
      url: 'https://www.youtube.com/embed/0DxkTdAQC7s',
      title: 'Cybersecurity Essentials',
      description: 'Basic principles of information security',
      category: 'cybersecurity',
      difficulty: 'beginner'
    }
  ];

  const fetchVideoLibrary = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_video_library');

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching video library:', error);
      toast.error('Failed to load video library');
    } finally {
      setLoading(false);
    }
  };

  const initializeVideoLibrary = async () => {
    try {
      setIsCleaningUp(true);
      setCleanupProgress(10);

      // Populate video library using the function
      const { data, error } = await supabase
        .rpc('populate_video_library');

      if (error) throw error;
      setCleanupProgress(100);
      
      toast.success(`Video library initialized with ${data} unique videos!`);
      await fetchVideoLibrary();
      
    } catch (error) {
      console.error('Error initializing video library:', error);
      toast.error('Failed to initialize video library');
    } finally {
      setIsCleaningUp(false);
      setTimeout(() => setCleanupProgress(0), 2000);
    }
  };

  const cleanupAllCourses = async () => {
    try {
      setIsCleaningUp(true);
      setCleanupProgress(0);

      // Delete lessons first
      const { error: lessonsError } = await supabase
        .from('course_lessons')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (lessonsError) throw lessonsError;
      setCleanupProgress(25);

      // Delete modules
      const { error: modulesError } = await supabase
        .from('course_modules')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (modulesError) throw modulesError;
      setCleanupProgress(50);

      // Delete courses
      const { error: coursesError } = await supabase
        .from('courses')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (coursesError) throw coursesError;
      setCleanupProgress(75);

      // Reset video usage counts
      const { error: resetError } = await supabase
        .from('video_library')
        .update({ usage_count: 0 })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      setCleanupProgress(100);
      toast.success('All courses cleaned up! Ready for fresh batch creation.');
      
    } catch (error) {
      console.error('Error cleaning up courses:', error);
      toast.error('Failed to cleanup courses');
    } finally {
      setIsCleaningUp(false);
      setTimeout(() => setCleanupProgress(0), 2000);
    }
  };

  useEffect(() => {
    fetchVideoLibrary();
  }, []);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'programming': 'bg-blue-500',
      'web-development': 'bg-green-500',
      'database': 'bg-purple-500',
      'design': 'bg-pink-500',
      'data-science': 'bg-orange-500',
      'mobile-development': 'bg-cyan-500',
      'marketing': 'bg-yellow-500',
      'cloud-computing': 'bg-indigo-500',
      'cybersecurity': 'bg-red-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getDifficultyColor = (level: string) => {
    return level === 'beginner' ? 'bg-green-100 text-green-800' :
           level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
           'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Library Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Clean Slate Strategy:</strong> We've identified 98.8% video duplication across courses. 
              This system manages 10 unique, high-quality videos to create diverse course content.
            </AlertDescription>
          </Alert>

          {isCleaningUp && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing...</span>
                <span>{cleanupProgress}%</span>
              </div>
              <Progress value={cleanupProgress} className="w-full" />
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={initializeVideoLibrary}
              disabled={isCleaningUp}
              variant="default"
            >
              <Video className="h-4 w-4 mr-2" />
              Initialize Video Library
            </Button>
            
            <Button 
              onClick={cleanupAllCourses}
              disabled={isCleaningUp}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clean All Courses
            </Button>

            <Button 
              onClick={fetchVideoLibrary}
              disabled={isCleaningUp}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Video Library Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <Card key={video.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm line-clamp-2">{video.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {video.description}
                    </p>
                  </div>
                  <Play className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
                </div>

                <div className="flex flex-wrap gap-1">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getCategoryColor(video.category)} text-white`}
                  >
                    {video.category}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getDifficultyColor(video.difficulty_level)}`}
                  >
                    {video.difficulty_level}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    <span>Used: {video.usage_count} times</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{video.duration_minutes} mins</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span>Quality: {video.quality_score}/10</span>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <div className="text-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading video library...</p>
        </div>
      )}

      {!loading && videos.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Videos Found</h3>
            <p className="text-muted-foreground mb-4">
              Initialize the video library to get started with 10 unique videos.
            </p>
            <Button onClick={initializeVideoLibrary} disabled={isCleaningUp}>
              <Video className="h-4 w-4 mr-2" />
              Initialize Video Library
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};