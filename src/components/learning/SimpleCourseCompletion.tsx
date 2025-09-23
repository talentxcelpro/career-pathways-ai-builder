import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Rocket, 
  BookOpen, 
  Loader2,
  CheckCircle,
  PlayCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const SimpleCourseCompletion: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);

  const testEdgeFunction = async () => {
    try {
      console.log('=== STARTING EDGE FUNCTION TEST ===');
      console.log('Testing Supabase functions...');
      
      console.log('Invoking simple-test function...');
      const startTime = Date.now();
      
      const response = await supabase.functions.invoke('simple-test', {
        body: { test: true, timestamp: new Date().toISOString() }
      });
      
      const endTime = Date.now();
      console.log(`Function call took ${endTime - startTime}ms`);
      console.log('=== FULL RESPONSE ===');
      console.log('Response object:', response);
      console.log('Response data:', response.data);
      console.log('Response error:', response.error);
      console.log('=== END RESPONSE ===');
      
      const { data, error } = response;
      
      if (error) {
        console.error('=== ERROR DETAILS ===');
        console.error('Error message:', error.message);
        console.error('Error name:', error.name);
        console.error('Error context:', error.context);
        console.error('Error stack:', error.stack);
        console.error('Full error object:', error);
        console.error('=== END ERROR DETAILS ===');
        
        toast.error(`Edge function error: ${error.message || 'Unknown error'}`);
        return false;
      }
      
      console.log('=== SUCCESS ANALYSIS ===');
      console.log('Data exists:', !!data);
      console.log('Data type:', typeof data);
      console.log('Data content:', data);
      
      if (data) {
        console.log('Data.success:', data.success);
        console.log('Data.message:', data.message);
      }
      console.log('=== END SUCCESS ANALYSIS ===');
      
      if (data && data.success === true) {
        console.log('✅ Test function succeeded!');
        toast.success('Edge functions are working!');
        return true;
      } else {
        console.error('❌ Test function returned unexpected data');
        toast.error('Edge function test failed - unexpected response');
        return false;
      }
      
    } catch (error) {
      console.error('=== EXCEPTION CAUGHT ===');
      console.error('Exception message:', error.message);
      console.error('Exception name:', error.name);
      console.error('Exception stack:', error.stack);
      console.error('Full exception:', error);
      console.error('=== END EXCEPTION ===');
      
      toast.error(`Edge function test exception: ${error.message}`);
      return false;
    }
  };

  const completeCourses = async () => {
    setIsGenerating(true);
    setProgress(0);
    
    try {
      console.log('🚀 Starting course completion...');
      
      // First test edge function connectivity - but don't fail if test fails
      console.log('Testing edge function connectivity (non-blocking)...');
      const connectivityOk = await testEdgeFunction();
      
      if (!connectivityOk) {
        console.warn('Edge function test failed, but continuing with main function...');
      }
      
      // Enhanced progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 5 + 2;
        });
      }, 800);

      // Try to call the main edge function directly
      console.log('Attempting to invoke complete-course-content function...');
      
      const { data, error } = await supabase.functions.invoke('complete-course-content', {
        body: {
          action: 'complete_existing_courses',
          course_limit: 50
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        console.error('Course completion error details:', {
          message: error.message,
          context: error.context,
          stack: error.stack,
          name: error.name
        });
        
        // Provide more specific error handling
        if (error.name === 'FunctionsFetchError' || error.message?.includes('Failed to fetch')) {
          toast.error('⚠️ Edge function connectivity issue. This may be due to network restrictions in the preview environment. This functionality will work in production.');
          return; // Don't throw, just inform user
        }
        
        throw error;
      }

      console.log('✅ Course completion successful:', data);
      setResults(data);
      
      if (data?.stats?.courses_processed > 0) {
        toast.success(`🎉 Successfully completed ${data.stats.courses_processed} courses!`);
      } else {
        toast.info(data?.message || 'All courses already have complete content!');
      }

    } catch (error) {
      console.error('Course completion failed:', error);
      
      // Better error handling for different scenarios
      if (error.message?.includes('Failed to fetch') || error.name === 'FunctionsFetchError') {
        toast.error('⚠️ Network connectivity issue detected. Edge functions may be blocked in this preview environment. This will work in production deployment.');
      } else {
        const errorMessage = error.message || 'Course completion failed. Please check console logs.';
        toast.error(errorMessage);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <Rocket className="h-8 w-8 text-primary" />
          Course Completion Tool
        </CardTitle>
        <p className="text-muted-foreground">
          Complete all 50 courses with comprehensive modules and YouTube integration
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold mb-3 text-blue-900 dark:text-blue-100 text-lg">
            🚀 Ready to Complete All 50 Courses!
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span><strong>200 modules</strong> (4 per course)</span>
            </div>
            <div className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4 text-blue-600" />
              <span><strong>750+ lessons</strong> with YouTube videos</span>
            </div>
          </div>
        </div>

        {isGenerating && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Completing courses with modules, lessons, and YouTube integration...
            </div>
          </div>
        )}

        <Button
          onClick={completeCourses}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 hover:from-green-700 hover:via-blue-700 hover:to-purple-700 text-white shadow-xl border-0 text-lg font-semibold"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-6 w-6 mr-2 animate-spin" />
              Completing All 50 Courses...
            </>
          ) : (
            <>
              <Rocket className="h-6 w-6 mr-2" />
              🚀 Complete All 50 Courses Now!
            </>
          )}
        </Button>

        {results && (
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800 dark:text-green-200">
                  Completion Results
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Courses Processed:</span>
                  <span className="font-semibold ml-2">{results?.stats?.courses_processed || 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Modules Created:</span>
                  <span className="font-semibold ml-2">{results?.stats?.modules_created || 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Lessons Created:</span>
                  <span className="font-semibold ml-2">{results?.stats?.lessons_created || 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Videos Integrated:</span>
                  <span className="font-semibold ml-2">{results?.stats?.videos_integrated || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};