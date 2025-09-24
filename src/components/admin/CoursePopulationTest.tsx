import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BookOpen, CheckCircle, Loader2 } from 'lucide-react';

export const CoursePopulationTest: React.FC = () => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [courseCount, setCourseCount] = useState(0);

  const populateDatabase = async () => {
    setIsPopulating(true);
    setProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      console.log('Calling mass-course-population edge function...');
      
      const { data, error } = await supabase.functions.invoke('mass-course-population', {
        body: {
          action: 'populate_professional_courses',
          count: 20
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Population result:', data);
      setCourseCount(data?.courses_created || 0);
      
      toast.success(`Successfully populated database with ${data?.courses_created || 0} courses!`);

    } catch (error: any) {
      console.error('Population failed:', error);
      toast.error(`Population failed: ${error.message}`);
    } finally {
      setIsPopulating(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const checkDatabaseStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('COUNT(*)', { count: 'exact', head: true });
      
      if (!error) {
        toast.info(`Current course count: ${data?.length || 0}`);
      }
    } catch (error) {
      console.error('Check failed:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Course Database Population Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          This will populate the database with 20 professional courses to test the batch creation system.
        </div>
        
        {isPopulating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Populating database...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}
        
        {courseCount > 0 && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Created {courseCount} courses successfully!</span>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            onClick={populateDatabase}
            disabled={isPopulating}
            className="flex-1"
          >
            {isPopulating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Populating...
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                Populate Database
              </>
            )}
          </Button>
          
          <Button 
            onClick={checkDatabaseStatus}
            variant="outline"
          >
            Check Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};