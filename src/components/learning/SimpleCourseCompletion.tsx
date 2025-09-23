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
      console.log('=== PRODUCTION EDGE FUNCTION TEST ===');
      console.log('Environment:', window.location.origin);
      console.log('Testing direct connectivity...');
      
      // Test 1: Direct fetch to edge function
      console.log('Test 1: Direct fetch test...');
      const directUrl = 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/simple-test';
      
      const fetchResponse = await fetch(directUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc'
        },
        body: JSON.stringify({ test: true, timestamp: new Date().toISOString() })
      });
      
      console.log('Direct fetch status:', fetchResponse.status);
      console.log('Direct fetch ok:', fetchResponse.ok);
      
      if (fetchResponse.ok) {
        const fetchData = await fetchResponse.json();
        console.log('Direct fetch data:', fetchData);
        toast.success('✅ Direct fetch to edge function works!');
      } else {
        console.error('Direct fetch failed:', fetchResponse.statusText);
        toast.error(`❌ Direct fetch failed: ${fetchResponse.status} ${fetchResponse.statusText}`);
      }
      
      // Test 2: Supabase client
      console.log('Test 2: Supabase client test...');
      const { data, error } = await supabase.functions.invoke('simple-test', {
        body: { test: true, timestamp: new Date().toISOString() }
      });
      
      if (error) {
        console.error('Supabase client error:', error);
        toast.error(`❌ Supabase client error: ${error.message}`);
        return false;
      }
      
      if (data && data.success === true) {
        console.log('✅ Supabase client test succeeded!');
        toast.success('✅ Supabase client test works!');
        return true;
      } else {
        console.error('❌ Unexpected response from Supabase client');
        toast.error('❌ Unexpected response from edge function');
        return false;
      }
      
    } catch (error) {
      console.error('=== PRODUCTION TEST EXCEPTION ===');
      console.error('Exception:', error);
      toast.error(`❌ Test failed: ${error.message}`);
      return false;
    }
  };

  const completeCourses = async () => {
    setIsGenerating(true);
    setProgress(0);
    
    try {
      console.log('🚀 Starting course completion using direct fetch...');
      
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

      // Use direct fetch since Supabase client has issues
      console.log('Calling complete-course-content via direct fetch...');
      
      const response = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/complete-course-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc'
        },
        body: JSON.stringify({
          action: 'complete_existing_courses',
          course_limit: 50
        })
      });

      clearInterval(progressInterval);
      setProgress(100);

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Course completion successful:', data);
      
      setResults(data);
      
      if (data?.stats?.courses_processed > 0) {
        toast.success(`🎉 Successfully completed ${data.stats.courses_processed} courses!`);
      } else {
        toast.info(data?.message || 'All courses already have complete content!');
      }

    } catch (error) {
      console.error('Course completion failed:', error);
      
      const errorMessage = error.message || 'Course completion failed. Please check console logs.';
      toast.error(errorMessage);
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

        <div className="space-y-3">
          <Button
            onClick={testEdgeFunction}
            disabled={isGenerating}
            variant="outline"
            className="w-full"
          >
            🧪 Test Edge Function Connectivity
          </Button>
          
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
        </div>

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