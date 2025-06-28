
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { populateCourseContent } from '@/utils/populateCourseContent';
import { Database, BookOpen, Award } from 'lucide-react';
import { toast } from 'sonner';

export const AdminCoursePopulator: React.FC = () => {
  const handlePopulateCourses = async () => {
    try {
      toast.info('Populating course content...');
      await populateCourseContent();
      toast.success('Course content populated successfully!');
    } catch (error) {
      toast.error('Failed to populate course content');
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Course Content Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">
          Populate courses with detailed modules, lessons, and assessments.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="font-semibold">10 Courses</div>
            <div className="text-sm text-gray-600">Complete curriculum</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="font-semibold">Assessments</div>
            <div className="text-sm text-gray-600">With certificates</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Database className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="font-semibold">Full Content</div>
            <div className="text-sm text-gray-600">Ready to learn</div>
          </div>
        </div>

        <Button onClick={handlePopulateCourses} className="w-full" size="lg">
          Populate Course Content
        </Button>
      </CardContent>
    </Card>
  );
};
