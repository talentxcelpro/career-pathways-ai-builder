import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, BookOpen, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PopulateCoursesAdmin = () => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handlePopulate = async () => {
    setIsPopulating(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('populate-courses');

      if (error) throw error;

      setResult(data);
      toast.success('Successfully populated all courses with modules and lessons!');
    } catch (error: any) {
      console.error('Error populating courses:', error);
      toast.error(`Failed to populate courses: ${error.message}`);
    } finally {
      setIsPopulating(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Populate Course Content
          </CardTitle>
          <CardDescription>
            Generate comprehensive modules and lessons for all courses in the database.
            This will create 7 detailed modules with multiple lessons for each course.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              <strong>Warning:</strong> This will create a large amount of content. Make sure you want to proceed.
              The process may take several minutes to complete.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handlePopulate} 
            disabled={isPopulating}
            size="lg"
            className="w-full"
          >
            {isPopulating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Populating Courses...
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-4 w-4" />
                Populate All Courses
              </>
            )}
          </Button>

          {result && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  Population Complete!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Courses Populated:</p>
                    <p className="text-2xl text-green-700">{result.coursesPopulated}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Modules Created:</p>
                    <p className="text-2xl text-green-700">{result.modulesCreated}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Lessons Created:</p>
                    <p className="text-2xl text-green-700">{result.lessonsCreated}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Assessments Created:</p>
                    <p className="text-2xl text-green-700">{result.assessmentsCreated || 0}</p>
                  </div>
                </div>
                <p className="text-green-600 mt-4">{result.message}</p>
              </CardContent>
            </Card>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>What this will do:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Create 7 comprehensive modules for each course</li>
              <li>Add 5-7 detailed lessons per module</li>
              <li>Include video lessons, text content, and quizzes</li>
              <li>Generate course assessments</li>
              <li>Set up a Coursera-level learning experience</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PopulateCoursesAdmin;
