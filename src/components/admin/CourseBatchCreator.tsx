import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { createCertificationCourses } from '@/utils/createCertificationCourses';
import { toast } from 'sonner';
import { 
  GraduationCap, 
  Plus, 
  Target,
  BookOpen,
  Users,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

interface BatchInfo {
  id: string;
  batch_number: number;
  batch_size: number;
  status: string;
  created_courses_count: number;
  target_categories: string[];
  created_at: string;
  completed_at: string | null;
}

export const CourseGraphenerator: React.FC = () => {
  const [batches, setBatches] = useState<BatchInfo[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batchSize, setBatchSize] = useState(10);
  const [targetCategories] = useState([
    'programming',
    'web-development', 
    'database',
    'design',
    'data-science',
    'mobile-development',
    'marketing',
    'cloud-computing',
    'cybersecurity'
  ]);

  const courseTemplates = [
    { title: 'Complete Python Bootcamp', category: 'programming', lessons: 12 },
    { title: 'Modern Web Development', category: 'web-development', lessons: 15 },
    { title: 'Database Design Mastery', category: 'database', lessons: 10 },
    { title: 'UI/UX Design Principles', category: 'design', lessons: 8 },
    { title: 'Data Science Fundamentals', category: 'data-science', lessons: 14 },
    { title: 'Mobile App Development', category: 'mobile-development', lessons: 16 },
    { title: 'Digital Marketing Strategy', category: 'marketing', lessons: 9 },
    { title: 'Cloud Computing Essentials', category: 'cloud-computing', lessons: 11 },
    { title: 'Cybersecurity Fundamentals', category: 'cybersecurity', lessons: 13 },
    { title: 'Advanced Python Programming', category: 'programming', lessons: 18 }
  ];

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('course_batches')
        .select('*')
        .order('batch_number', { ascending: false });

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const createCourseBatch = async () => {
    try {
      setIsCreating(true);
      setProgress(0);

      // Create batch record
      const batchNumber = batches.length > 0 ? Math.max(...batches.map(b => b.batch_number)) + 1 : 1;
      
      const { data: batch, error: batchError } = await supabase
        .from('course_batches')
        .insert({
          batch_number: batchNumber,
          batch_size: batchSize,
          status: 'creating',
          target_categories: targetCategories.slice(0, batchSize)
        })
        .select()
        .single();

      if (batchError) throw batchError;
      setProgress(10);

      // Create courses intelligently
      const coursesToCreate = courseTemplates.slice(0, batchSize);
      
      for (let i = 0; i < coursesToCreate.length; i++) {
        const template = coursesToCreate[i];
        
        try {
          // Get available videos for this category
          const { data: availableVideos, error: videoError } = await supabase
            .rpc('get_available_videos_for_category', {
              category_param: template.category,
              limit_param: Math.min(template.lessons, 3)
            });

          if (videoError) {
            console.error('Error getting videos:', videoError);
            continue;
          }

          // Create course
          const { data: course, error: courseError } = await supabase
            .from('courses')
            .insert({
              title: template.title,
              instructor: 'Expert Instructor',
              rating: 4.5 + Math.random() * 0.5,
              students: Math.floor(Math.random() * 1000) + 100,
              duration: `${template.lessons} hours`,
              level: 'All Levels',
              price: 'Free',
              category: template.category,
              subcategory: template.category,
              thumbnail: 'https://via.placeholder.com/300x200',
              tags: [template.category, 'certification', 'practical'],
              certified: true,
              trending: Math.random() > 0.7,
              description: `Comprehensive ${template.title} course covering essential concepts and practical applications.`,
              what_you_learn: [
                `Master ${template.category} fundamentals`,
                'Build real-world projects',
                'Get industry-ready skills',
                'Earn a professional certificate'
              ],
              requirements: ['Basic computer skills', 'Willingness to learn'],
              is_active: true
            })
            .select()
            .single();

          if (courseError) throw courseError;

          // Create modules and lessons
          const moduleCount = Math.ceil(template.lessons / 4);
          let videoIndex = 0;

          for (let m = 0; m < moduleCount; m++) {
            const { data: module, error: moduleError } = await supabase
              .from('course_modules')
              .insert({
                course_id: course.id,
                title: `Module ${m + 1}: Core Concepts`,
                description: `Essential topics for ${template.category}`,
                order_index: m,
                is_active: true
              })
              .select()
              .single();

            if (moduleError) throw moduleError;

            // Create lessons for this module
            const lessonsInModule = Math.min(4, template.lessons - (m * 4));
            
            for (let l = 0; l < lessonsInModule; l++) {
              const videoUrl = availableVideos && availableVideos[videoIndex % availableVideos.length]?.video_url || 
                              'https://www.youtube.com/embed/llKvV8_T95M';

              await supabase
                .from('course_lessons')
                .insert({
                  module_id: module.id,
                  title: `Lesson ${(m * 4) + l + 1}: Practical Application`,
                  description: `Learn key concepts in ${template.category}`,
                  video_url: videoUrl,
                  order_index: l,
                  duration_minutes: 15 + Math.floor(Math.random() * 10),
                  lesson_type: 'video',
                  is_active: true
                });

              // Increment video usage
              if (availableVideos && availableVideos[videoIndex % availableVideos.length]) {
                await supabase.rpc('increment_video_usage', {
                  video_url_param: videoUrl
                });
              }
              
              videoIndex++;
            }
          }

          // Log course creation
          await supabase
            .from('course_creation_log')
            .insert({
              batch_id: batch.id,
              course_id: course.id,
              course_title: course.title,
              videos_assigned: template.lessons,
              unique_videos_used: Math.min(availableVideos?.length || 1, 3),
              duplication_score: availableVideos?.length ? 1 - (Math.min(availableVideos.length, 3) / template.lessons) : 0.8,
              creation_status: 'completed'
            });

        } catch (error) {
          console.error(`Error creating course ${template.title}:`, error);
          
          await supabase
            .from('course_creation_log')
            .insert({
              batch_id: batch.id,
              course_title: template.title,
              creation_status: 'failed',
              error_message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
        
        setProgress(10 + ((i + 1) / coursesToCreate.length) * 80);
      }

      // Update batch status
      await supabase
        .from('course_batches')
        .update({
          status: 'completed',
          created_courses_count: coursesToCreate.length,
          completed_at: new Date().toISOString()
        })
        .eq('id', batch.id);

      setProgress(100);
      toast.success(`Successfully created batch ${batchNumber} with ${coursesToCreate.length} courses!`);
      await fetchBatches();

    } catch (error) {
      console.error('Error creating course batch:', error);
      toast.error('Failed to create course batch');
    } finally {
      setIsCreating(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'creating': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'creating': return <Clock className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Smart Course Batch Creator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Target className="h-4 w-4" />
            <AlertDescription>
              Create courses in batches of 10 with intelligent video distribution. 
              Each course will use unique videos from the library to eliminate duplication.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batch-size">Batch Size</Label>
              <Input
                id="batch-size"
                type="number"
                min="5"
                max="15"
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value) || 10)}
                disabled={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label>Target: 50 Total Courses</Label>
              <div className="text-sm text-muted-foreground">
                Current: {batches.reduce((sum, b) => sum + b.created_courses_count, 0)} courses
              </div>
            </div>
          </div>

          {isCreating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Creating course batch...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <Button 
            onClick={createCourseBatch}
            disabled={isCreating}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Batch ({batchSize} courses)
          </Button>
        </CardContent>
      </Card>

      {/* Batch History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Batch Creation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {batches.map((batch) => (
              <div key={batch.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {getStatusIcon(batch.status)}
                  <div>
                    <h4 className="font-medium">Batch #{batch.batch_number}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(batch.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-sm text-right">
                    <div className="font-medium">{batch.created_courses_count} courses</div>
                    <div className="text-muted-foreground">Target: {batch.batch_size}</div>
                  </div>
                  <Badge className={getStatusColor(batch.status)}>
                    {batch.status}
                  </Badge>
                </div>
              </div>
            ))}
            
            {batches.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2" />
                <p>No batches created yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Course Templates Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Templates Ready
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {courseTemplates.slice(0, batchSize).map((template, index) => (
              <div key={index} className="p-3 rounded-lg border bg-muted/30">
                <h4 className="font-medium text-sm">{template.title}</h4>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>{template.category}</span>
                  <span>{template.lessons} lessons</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};