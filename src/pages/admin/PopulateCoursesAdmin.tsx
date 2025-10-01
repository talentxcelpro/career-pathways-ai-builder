import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, BookOpen, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

const PopulateCoursesAdmin = () => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);

  const handlePopulate = async () => {
    setIsPopulating(true);
    setResult(null);
    setProgress(0);

    try {
      console.log('Starting course population process...');
      console.log('Supabase URL:', 'https://dthlgsnakhoftinssokm.supabase.co');
      
      // Test if we can reach Supabase at all
      console.log('Testing Supabase connection...');
      const { data: testData, error: testError } = await supabase
        .from('courses')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.error('Supabase connection test failed:', testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }
      
      console.log('Supabase connection successful');
      
      // Get total courses count first
      const { count } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });
      
      setTotalCourses(count || 0);
      console.log(`Total courses found: ${count}`);

      let totalProcessed = 0;
      let totalModules = 0;
      let totalLessons = 0;
      let totalAssessments = 0;
      let allErrors: any[] = [];

      // Process in batches until no courses remain
      let batchCount = 0;
      const maxBatches = 20; // Safety limit
      
      while (batchCount < maxBatches) {
        batchCount++;
        console.log(`🔄 Batch ${batchCount}: Invoking populate-courses...`);
        
        const { data, error } = await supabase.functions.invoke('populate-courses', {
          body: { batchSize: 5, skipExisting: true }
        });

        console.log(`📊 Batch ${batchCount} response:`, { data, error });

        if (error) {
          console.error('❌ Function error:', error);
          throw new Error(`Function failed: ${error.message || JSON.stringify(error)}`);
        }

        if (!data || !data.success) {
          console.error('❌ Invalid response:', data);
          throw new Error(`Invalid response from function: ${JSON.stringify(data)}`);
        }

        totalProcessed += data.coursesPopulated || 0;
        totalModules += data.modulesCreated || 0;
        totalLessons += data.lessonsCreated || 0;
        totalAssessments += data.assessmentsCreated || 0;
        
        if (data.errors && data.errors.length > 0) {
          allErrors = [...allErrors, ...data.errors];
          console.warn('⚠️ Errors in batch:', data.errors);
        }

        // Update progress
        if (count && count > 0) {
          const progressPercent = Math.min(100, Math.round((totalProcessed / count) * 100));
          setProgress(progressPercent);
        }

        toast.success(`Batch ${batchCount}: Processed ${data.coursesPopulated} courses (${totalProcessed} total)`);

        // Check if done
        if (data.remaining === 0 || data.coursesPopulated === 0) {
          console.log('✅ All courses processed');
          break;
        }

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setResult({
        coursesPopulated: totalProcessed,
        modulesCreated: totalModules,
        lessonsCreated: totalLessons,
        assessmentsCreated: totalAssessments,
        errors: allErrors.length > 0 ? allErrors : undefined,
        message: allErrors.length > 0 
          ? `Completed with ${allErrors.length} errors. Check console for details.`
          : 'Successfully populated all courses!'
      });

      if (allErrors.length > 0) {
        console.error('Errors during population:', allErrors);
        toast.warning(`Completed with ${allErrors.length} errors`);
      } else {
        toast.success('Successfully populated all courses!');
      }
      
      setProgress(100);
    } catch (error: any) {
      console.error('Error populating courses:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        fullError: error
      });
      
      const errorMessage = error.message || 'Unknown error occurred';
      toast.error(`Failed: ${errorMessage}`);
      
      setResult({
        error: true,
        message: errorMessage,
        details: error.stack || String(error)
      });
    } finally {
      setIsPopulating(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setProgress(0);
    setTotalCourses(0);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Populate Course Content (Production Ready)
          </CardTitle>
          <CardDescription>
            Generate comprehensive modules and lessons for all courses in the database.
            This uses smart batch processing to handle large datasets efficiently.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              <strong>Production Features:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Processes courses in batches of 5 (prevents timeouts)</li>
                <li>Automatically skips courses that already have content</li>
                <li>Resumable - can be run multiple times safely</li>
                <li>Shows real-time progress updates</li>
                <li>Comprehensive error handling and logging</li>
              </ul>
            </AlertDescription>
          </Alert>

          {isPopulating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing courses...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              {totalCourses > 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  This may take several minutes for {totalCourses} courses
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handlePopulate} 
              disabled={isPopulating}
              size="lg"
              className="flex-1"
            >
              {isPopulating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Populating Courses...
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Start Population
                </>
              )}
            </Button>

            {result && !isPopulating && (
              <Button 
                onClick={handleReset} 
                variant="outline"
                size="lg"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            )}
          </div>

          {result && !result.error && (
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
                
                {result.errors && result.errors.length > 0 && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Warning:</strong> {result.errors.length} errors occurred during population.
                      Check the browser console for details.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {result && result.error && (
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  Error Occurred
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-red-600 font-semibold">{result.message}</p>
                {result.details && (
                  <details className="text-xs text-red-800 mt-2">
                    <summary className="cursor-pointer font-medium">Technical Details</summary>
                    <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto max-h-40">
                      {result.details}
                    </pre>
                  </details>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  You can retry the operation. The system will skip already populated courses.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Check the browser console (F12) for more details.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>What this will do:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Create 7 comprehensive modules for each course</li>
              <li>Add 5-7 detailed lessons per module (text content & quizzes)</li>
              <li>Generate course assessments</li>
              <li>Set up a Coursera-level learning experience</li>
            </ul>
            <p className="mt-4"><strong>Safe to run multiple times:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Automatically skips courses that already have content</li>
              <li>Can be stopped and resumed at any time</li>
              <li>Won't create duplicate content</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PopulateCoursesAdmin;
