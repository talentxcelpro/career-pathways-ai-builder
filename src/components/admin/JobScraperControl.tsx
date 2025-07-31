import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Play, StopCircle, RefreshCw, Eye, Building, MapPin, 
  DollarSign, Calendar, ExternalLink, Sparkles 
} from 'lucide-react';

interface ScrapingStats {
  total_scraped: number;
  valid_jobs: number;
  published_jobs: number;
  next_run: string;
}

export const JobScraperControl = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<ScrapingStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  const runJobScraper = async (limit = 100) => {
    setIsRunning(true);
    try {
      toast.loading('🚀 Starting job scraper...', { id: 'scraper' });
      
      console.log('Calling job-scraper function with limit:', limit);
      
      const { data, error } = await supabase.functions.invoke('job-scraper', {
        body: { limit }
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Unknown error occurred');
      }

      setStats(data.stats);
      setRecentJobs(data.jobs || []);
      
      toast.success(`✅ Successfully scraped ${data.stats.published_jobs} jobs!`, { 
        id: 'scraper' 
      });

      // Trigger sitemap generation
      try {
        await supabase.functions.invoke('sitemap-generator');
        toast.success('🗺️ Sitemap updated with new jobs');
      } catch (sitemapError) {
        console.warn('Sitemap generation failed:', sitemapError);
        // Don't show error toast for non-critical sitemap failure
      }

    } catch (error) {
      console.error('Scraper error:', error);
      toast.error(`❌ Scraper failed: ${error.message}`, { id: 'scraper' });
    } finally {
      setIsRunning(false);
    }
  };

  const testDirectCall = async () => {
    try {
      console.log('Testing direct function call...');
      toast.loading('Testing direct function call...', { id: 'test' });
      
      // Make a direct fetch call to test
      const response = await fetch(`https://dthlgsnakhoftinssokm.supabase.co/functions/v1/job-scraper`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc`,
        },
        body: JSON.stringify({ limit: 5 })
      });
      
      console.log('Direct call response status:', response.status);
      const result = await response.json();
      console.log('Direct call result:', result);
      
      if (result.success) {
        toast.success('✅ Direct call successful!', { id: 'test' });
        setStats(result.stats);
        setRecentJobs(result.jobs || []);
      } else {
        toast.error(`❌ Direct call failed: ${result.error}`, { id: 'test' });
      }
    } catch (error) {
      console.error('Direct call error:', error);
      toast.error(`❌ Direct call error: ${error.message}`, { id: 'test' });
    }
  };

  const checkJobStats = async () => {
    try {
      const { data: jobCount } = await supabase
        .from('jobs')
        .select('id', { count: 'exact' })
        .eq('status', 'active');

      const { data: recentJobsData } = await supabase
        .from('jobs')
        .select('id, title, company_name, source, created_at, salary_range, location')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentJobs(recentJobsData || []);
      toast.success(`📊 Found ${jobCount?.length || 0} active jobs`);
    } catch (error) {
      toast.error('Failed to fetch job stats');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            TalentXcel Job Scraper Control
          </CardTitle>
          <CardDescription>
            Live job scraping system for TalentXcel.in - Scrapes 100+ real jobs every 3 hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={() => runJobScraper(100)} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running Scraper...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Job Scraper (100 Jobs)
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => runJobScraper(25)}
              disabled={isRunning}
            >
              <Play className="h-4 w-4 mr-2" />
              Quick Test (25 Jobs)
            </Button>
            
            <Button 
              variant="outline" 
              onClick={checkJobStats}
            >
              <Eye className="h-4 w-4 mr-2" />
              Check Stats
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={testDirectCall}
            >
              🧪 Test Direct Call
            </Button>
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.total_scraped}</div>
                <div className="text-sm text-blue-600">Total Scraped</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.valid_jobs}</div>
                <div className="text-sm text-green-600">Valid Jobs</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.published_jobs}</div>
                <div className="text-sm text-purple-600">Published</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-sm text-orange-600">Next Run</div>
                <div className="text-xs text-orange-600">
                  {new Date(stats.next_run).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {recentJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs ({recentJobs.length})</CardTitle>
            <CardDescription>Latest jobs added to the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{job.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {job.company_name}
                      </span>
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                      )}
                      {job.salary_range && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {job.salary_range}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {job.source || 'Unknown'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>🔄 Auto-scraping:</span>
              <Badge className="bg-green-100 text-green-800">Every 3 Hours</Badge>
            </div>
            <div className="flex justify-between">
              <span>🚫 Blocked sources:</span>
              <span className="text-muted-foreground">Naukri, LinkedIn, Shine, Monster</span>
            </div>
            <div className="flex justify-between">
              <span>✅ Valid sources:</span>
              <span className="text-muted-foreground">RemoteOK, Generated Jobs, Other APIs</span>
            </div>
            <div className="flex justify-between">
              <span>🤖 AI Enhancement:</span>
              <Badge className="bg-blue-100 text-blue-800">Active</Badge>
            </div>
            <div className="flex justify-between">
              <span>🗺️ SEO Sitemap:</span>
              <Badge className="bg-purple-100 text-purple-800">Auto-Generated</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};