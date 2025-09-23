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
  batch_id: string;
  batch_name: string;
  batch_number: number;
  total_courses: number;
  courses_created: number;
  status: string;
  video_distribution: any;
  created_at: string;
  completed_at: string | null;
}

export const CourseGraphenerator: React.FC = () => {
  const [batches, setBatches] = useState<BatchInfo[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batchSize, setBatchSize] = useState(10);
  const [batchName, setBatchName] = useState('');

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
        .rpc('get_batch_progress');

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const createCourseBatch = async () => {
    if (!batchName.trim()) {
      toast.error('Please enter a batch name');
      return;
    }

    setIsCreating(true);
    setProgress(10);
    
    try {
      const { data: result, error } = await supabase
        .rpc('create_course_batch', {
          p_batch_name: batchName,
          p_courses_per_batch: batchSize
        });

      if (error) throw error;
      setProgress(100);

      toast.success(`Successfully created ${result.courses_created} courses in batch ${result.batch_number}!`);
      
      // Reset form and refresh data
      setBatchName('');
      await fetchBatches();

    } catch (error: any) {
      console.error('Error creating course batch:', error);
      toast.error(error.message || 'Failed to create course batch');
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
              <Label htmlFor="batch-name">Batch Name</Label>
              <Input
                id="batch-name"
                placeholder="e.g., AI & Tech Batch"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                disabled={isCreating}
              />
            </div>
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
          </div>
          
          <div className="space-y-2">
            <Label>Progress Tracking</Label>
            <div className="text-sm text-muted-foreground">
              Total courses created: {batches.reduce((sum, b) => sum + (b.courses_created || 0), 0)}
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
            disabled={isCreating || !batchName.trim()}
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
              <div key={batch.batch_id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {getStatusIcon(batch.status)}
                  <div>
                    <h4 className="font-medium">{batch.batch_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Batch #{batch.batch_number} • {new Date(batch.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-sm text-right">
                    <div className="font-medium">{batch.courses_created || 0} / {batch.total_courses}</div>
                    <div className="text-muted-foreground">courses</div>
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