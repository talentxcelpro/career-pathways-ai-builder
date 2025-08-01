import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Zap, RefreshCw } from 'lucide-react';

export const JobScraperTest: React.FC = () => {
  const [isRunning, setIsRunning] = React.useState(false);
  const [lastResult, setLastResult] = React.useState<any>(null);

  const triggerJobScraper = async () => {
    setIsRunning(true);
    try {
      console.log('🚀 Triggering job scraper...');
      
      const { data, error } = await supabase.functions.invoke('job-scraper', {
        body: {
          limit: 25 // Start with small batch
        }
      });

      if (error) {
        console.error('❌ Scraper error:', error);
        throw error;
      }

      console.log('✅ Scraper result:', data);
      setLastResult(data);
      
      toast.success(`Job scraping completed!`, {
        description: `Generated ${data?.stats?.published_jobs || 0} jobs`
      });
      
    } catch (error: any) {
      console.error('❌ Scraper failed:', error);
      toast.error('Job scraping failed', {
        description: error.message || 'Unknown error'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const checkJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, company_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      console.log('📊 Recent jobs:', data);
      toast.success(`Found ${data?.length || 0} jobs in database`);
      
    } catch (error: any) {
      console.error('❌ Jobs check failed:', error);
      toast.error('Failed to check jobs');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="w-5 h-5" />
          <span>Job Scraper Test</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-4">
          <Button
            onClick={triggerJobScraper}
            disabled={isRunning}
            className="flex items-center space-x-2"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>{isRunning ? 'Scraping...' : 'Start Job Scraper'}</span>
          </Button>

          <Button
            variant="outline"
            onClick={checkJobs}
          >
            Check Jobs
          </Button>
        </div>

        {lastResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Last Result:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(lastResult, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>• Click "Start Job Scraper" to generate 25 test jobs</p>
          <p>• Click "Check Jobs" to see what's in the database</p>
          <p>• Watch the console for detailed logs</p>
        </div>
      </CardContent>
    </Card>
  );
};