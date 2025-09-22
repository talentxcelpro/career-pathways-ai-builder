
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { populateCourseContent } from '@/utils/populateCourseContent';
import { populateMassiveCourseDatabase } from '@/utils/massiveCoursePopulator';
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

  const handlePopulateMassiveCourses = async () => {
    try {
      toast.info('Generating 500+ courses... This may take a few minutes.');
      const result = await populateMassiveCourseDatabase();
      toast.success(`Successfully created ${result.count} courses!`);
    } catch (error) {
      toast.error('Failed to populate massive course database');
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
            <div className="font-semibold">500+ Courses</div>
            <div className="text-sm text-gray-600">Complete curriculum</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="font-semibold">Assessments</div>
            <div className="text-sm text-gray-600">With certificates</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Database className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="font-semibold">LMS Integration</div>
            <div className="text-sm text-gray-600">External platforms</div>
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={handlePopulateCourses} className="w-full" size="lg">
            Populate Course Content (Basic)
          </Button>
          
          <Button onClick={handlePopulateMassiveCourses} className="w-full" size="lg" variant="outline">
            Generate 500+ Courses Database
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
