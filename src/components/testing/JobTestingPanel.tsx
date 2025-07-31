import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RefreshCw, Database, CheckCircle, AlertCircle } from 'lucide-react';

export const JobTestingPanel = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedingProgress, setSeedingProgress] = useState(0);
  const [seedingResults, setSeedingResults] = useState(null);

  const handleSeedJobs = async () => {
    setIsSeeding(true);
    setSeedingProgress(0);
    setSeedingResults(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setSeedingProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      console.log('Starting job seeding...');
      
      const { data, error } = await supabase.functions.invoke('seed-test-jobs', {
        body: {}
      });

      clearInterval(progressInterval);
      setSeedingProgress(100);

      if (error) {
        throw new Error(error.message);
      }

      setSeedingResults(data);
      toast.success(`✅ Successfully created ${data.jobsCreated} fresh test jobs!`);
      
      // Refresh the page after a short delay to show new jobs
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Job seeding failed:', error);
      toast.error(`❌ Job seeding failed: ${error.message}`);
      setSeedingProgress(0);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearJobs = async () => {
    try {
      // Clear all jobs
      const { error } = await supabase
        .from('jobs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) {
        throw new Error(error.message);
      }

      toast.success('All jobs cleared successfully');
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Failed to clear jobs:', error);
      toast.error('Failed to clear jobs');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Job Testing Panel</h1>
        <p className="text-muted-foreground">Replace mock jobs with real scraped data for final testing</p>
      </div>

      <div className="grid gap-4 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Seed Fresh Jobs
            </CardTitle>
            <CardDescription>
              Replace all current jobs with 10 high-quality jobs from scraped data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSeeding && (
              <div className="space-y-2">
                <Progress value={seedingProgress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  {seedingProgress < 50 ? 'Fetching scraped jobs...' : 
                   seedingProgress < 90 ? 'Processing with AI...' : 
                   'Creating SEO-optimized jobs...'}
                </p>
              </div>
            )}

            {seedingResults && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Seeding Complete!</span>
                </div>
                <p className="text-sm text-green-700 mb-2">
                  Created {seedingResults.jobsCreated} fresh jobs ready for testing
                </p>
                <div className="space-y-1">
                  {seedingResults.processedJobs?.slice(0, 3).map((job, index) => (
                    <div key={index} className="text-xs text-green-600">
                      ✓ {job.title} at {job.company} - {job.location}
                    </div>
                  ))}
                  {seedingResults.processedJobs?.length > 3 && (
                    <div className="text-xs text-green-600">
                      + {seedingResults.processedJobs.length - 3} more jobs...
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleSeedJobs}
                disabled={isSeeding}
                className="flex-1"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSeeding ? 'animate-spin' : ''}`} />
                {isSeeding ? 'Seeding...' : 'Seed Fresh Jobs'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleClearJobs}
                disabled={isSeeding}
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testing Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">1</Badge>
                <span className="text-sm">Clear old mock jobs</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">2</Badge>
                <span className="text-sm">Seed 10 real jobs from scraped data</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">3</Badge>
                <span className="text-sm">Verify SEO optimization (titles, descriptions, slugs)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">4</Badge>
                <span className="text-sm">Test Google Rich Results</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">5</Badge>
                <span className="text-sm">Check job application flow</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Current Issue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You're seeing old mock jobs (like "Naukri Software Engineer") instead of real scraped jobs. 
              Click "Seed Fresh Jobs" to replace them with actual company job postings that have been 
              AI-validated and SEO-optimized.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};