import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Play, StopCircle, RefreshCw, Eye, Building, MapPin, 
  DollarSign, Calendar, ExternalLink, Sparkles, Building2 
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

  const runJobScraper = async (limit = 100, jobType = 'mixed') => {
    setIsRunning(true);
    try {
      const message = jobType === 'government' ? '🏛️ Scraping Government Jobs...' : 
                     jobType === 'international' ? '🌍 Scraping International Jobs...' : 
                     '🚀 Scraping Quality Jobs...';
      toast.loading(message, { id: 'scraper' });
      
      console.log('=== Real Job Scraper Started ===');
      console.log('Job Count:', limit);
      console.log('Job Type:', jobType);
      
      // Use Supabase client for proper authentication
      const { data, error } = await supabase.functions.invoke('real-job-scraper', {
        body: { 
          limit, 
          jobType,
          sources: ['government', 'private', 'international']
        }
      });
      
      console.log('📊 Scraper response:', { data, error });
      
      if (error) {
        console.error('❌ Supabase invoke error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No response data received from scraper');
      }

      if (!data.success) {
        throw new Error(data?.error || 'Scraper returned unsuccessful response');
      }

      setStats(data.stats || { total_scraped: 0, valid_jobs: 0, published_jobs: 0, next_run: new Date().toISOString() });
      setRecentJobs(data.jobs || []);
      
      const summary = data.summary || {};
      toast.success(`✅ Successfully generated ${summary.inserted || 0} jobs! (${summary.duplicates_skipped || 0} duplicates skipped)`, { 
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
      console.error('=== Scraper Error Details ===');
      console.error('Error object:', error);
      console.error('Error type:', typeof error);
      console.error('Error keys:', Object.keys(error || {}));
      
      let errorMessage = 'Unknown error occurred';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.details) {
        errorMessage = error.details;
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        errorMessage = JSON.stringify(error);
      }
      
      console.error('Final error message:', errorMessage);
      
      toast.error(`❌ Scraper failed: ${errorMessage}`, { 
        id: 'scraper',
        duration: 8000 
      });
    } finally {
      setIsRunning(false);
    }
  };

  const testDirectCall = async () => {
    try {
      console.log('=== Testing Edge Function Connectivity ===');
      toast.loading('Testing function connectivity...', { id: 'test' });
      
      // Test the simple test-connection function first
      console.log('Testing basic connectivity...');
      const testResponse = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc'
        },
        body: JSON.stringify({ message: 'Hello from admin!' })
      });
      
      if (!testResponse.ok) {
        throw new Error(`Basic connectivity failed: HTTP ${testResponse.status}`);
      }
      
      const testData = await testResponse.json();
      console.log('Test connection result:', testData);
      
      if (!testData?.success) {
        throw new Error('Basic connectivity test failed');
      }
      
      // Now test the real-job-scraper function
      console.log('Testing real-job-scraper function...');
      const { data: scraperData, error: scraperError } = await supabase.functions.invoke('real-job-scraper', {
        body: { limit: 10, jobType: 'mixed' }
      });
      
      console.log('📊 Scraper test result:', { scraperData, scraperError });
      
      if (scraperError) {
        toast.error(`❌ Job scraper test failed: ${scraperError.message}`, { id: 'test' });
        return;
      }
      
      if (scraperData?.success) {
        toast.success('✅ All function tests successful!', { id: 'test' });
        if (scraperData.stats) setStats(scraperData.stats);
        if (scraperData.jobs) setRecentJobs(scraperData.jobs);
      } else {
        toast.error(`❌ Job scraper test failed: ${scraperData?.error || 'Unknown error'}`, { id: 'test' });
      }
    } catch (error) {
      console.error('=== Test Call Error Details ===');
      console.error('Error:', error);
      toast.error(`❌ Test failed: ${error?.message || 'Unknown error'}`, { id: 'test' });
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
              onClick={() => runJobScraper(200, 'mixed')} 
              disabled={isRunning}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating Jobs...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate 200 Mixed Jobs
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => runJobScraper(100, 'government')} 
              disabled={isRunning}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running Govt Scraper...
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4" />
                  Generate 100 Govt Jobs
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => runJobScraper(100, 'international')}
              disabled={isRunning}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              100 International Jobs
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => runJobScraper(50, 'mixed')}
              disabled={isRunning}
            >
              <Play className="h-4 w-4 mr-2" />
              Quick Test (50 Mixed)
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
              🧪 Test Connectivity
            </Button>
            
            <Button 
              variant="outline" 
              onClick={async () => {
                console.log('=== Supabase Client Debug ===');
                console.log('Supabase client exists:', !!supabase);
                console.log('Functions available:', !!supabase.functions);
                
                const { data: { user }, error } = await supabase.auth.getUser();
                console.log('Current user:', user?.id ? 'Authenticated' : 'Not authenticated');
                console.log('User error:', error);
                
                toast.info(`User: ${user?.id ? 'Authenticated' : 'Not authenticated'}`);
              }}
            >
              🔍 Debug Info
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
              <span className="text-muted-foreground">RemoteOK, Generated Jobs, Govt Portals</span>
            </div>
            <div className="flex justify-between">
              <span>🏛️ Government sources:</span>
              <span className="text-muted-foreground">UPSC, SSC, Railway, Banking, PSU</span>
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