import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Play, StopCircle, RefreshCw, Eye, Building, MapPin, 
  DollarSign, Calendar, ExternalLink, Sparkles, Building2, 
  Globe, Zap 
} from 'lucide-react';


interface ScrapingStats {
  total_scraped: number;
  valid_jobs: number;
  published_jobs: number;
  next_run: string;
}

export const JobScraperControl = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isAdzunaRunning, setIsAdzunaRunning] = useState(false);
  const [stats, setStats] = useState<ScrapingStats | null>(null);
  const [adzunaStats, setAdzunaStats] = useState<ScrapingStats | null>(null);
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
      
      // Try direct HTTP call first as fallback
      const directCallUrl = 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/real-job-scraper';
      const payload = { 
        limit, 
        jobType,
        sources: ['government', 'private', 'international']
      };
      
      console.log('🔗 Making direct HTTP call to:', directCallUrl);
      console.log('📦 Payload:', payload);
      
      let data, error;
      
      try {
        // Method 1: Direct HTTP call with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch(directCallUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc`
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('📡 Direct response status:', response.status);
        console.log('📡 Direct response ok:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Direct call failed:', errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        data = await response.json();
        console.log('✅ Direct call successful:', data);
        
      } catch (directError) {
        console.log('🔄 Direct call failed, trying Supabase client...');
        console.error('Direct error:', directError);
        
        // Method 2: Fallback to Supabase client
        const result = await supabase.functions.invoke('real-job-scraper', {
          body: payload
        });
        
        data = result.data;
        error = result.error;
        
        console.log('📊 Supabase client response:', { data, error });
      }
      
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
      
      // Test direct HTTP call to real-job-scraper
      console.log('Testing real-job-scraper function directly...');
      
      const directUrl = 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/real-job-scraper';
      console.log('🔗 Testing URL:', directUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(directUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc`
        },
        body: JSON.stringify({ limit: 50, jobType: 'mixed' }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', [...response.headers.entries()]);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response not ok:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Direct test successful:', data);
      
      if (data?.success) {
        toast.success(`✅ Function test successful! Generated ${data.stats?.published_jobs || 0} jobs`, { id: 'test' });
        if (data.stats) setStats(data.stats);
        if (data.jobs) setRecentJobs(data.jobs);
      } else {
        toast.error(`❌ Function test failed: ${data?.error || 'Unknown error'}`, { id: 'test' });
      }
      
    } catch (error) {
      console.error('=== Test Call Error Details ===');
      console.error('Error:', error);
      console.error('Error name:', error?.name);
      console.error('Error message:', error?.message);
      
      let errorMessage = 'Unknown error';
      if (error?.name === 'AbortError') {
        errorMessage = 'Request timed out after 15 seconds';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(`❌ Test failed: ${errorMessage}`, { id: 'test' });
    }
  };

  const runAdzunaImport = async (limit = 50, keywords = '', location = 'india') => {
    setIsAdzunaRunning(true);
    try {
      toast.loading('🌐 Importing jobs from Adzuna API...', { id: 'adzuna' });
      
      const payload = { 
        limit, 
        keywords, 
        location,
        page: 1
      };
      
      console.log('🌐 Adzuna import started:', payload);
      console.log('🔧 Supabase client available:', !!supabase);
      
      // Prefer direct GET to avoid browser preflight issues; fallback to supabase.invoke
      const directUrl = `https://dthlgsnakhoftinssokm.supabase.co/functions/v1/adzuna-job-importer?limit=${limit}&keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}&page=1`;
      console.log('📞 Trying direct GET:', directUrl);

      let data: any | null = null;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        const response = await fetch(directUrl, {
          method: 'GET',
          headers: {
            apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc'
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        console.log('📡 Direct GET status:', response.status, 'ok:', response.ok);
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP ${response.status}: ${text}`);
        }
        data = await response.json();
        console.log('✅ Direct GET successful');
      } catch (directErr) {
        console.warn('🔄 Direct GET failed, falling back to supabase.invoke...', directErr);
        const { data: invokeData, error: invokeError } = await supabase.functions.invoke('adzuna-job-importer', {
          body: payload
        });
        if (invokeError) {
          console.error('❌ supabase.invoke error:', invokeError);
          throw invokeError;
        }
        data = invokeData;
      }

      if (!data) {
        console.error('❌ No data received from function');
        throw new Error('No response data received from function');
      }

      if (!data.success) {
        console.error('❌ Function returned success=false:', data);
        throw new Error(data.error || 'Function execution failed');
      }

      // Check for errors in the response (like validation errors)
      if (data.errors && data.errors.length > 0) {
        console.warn('⚠️ Some jobs had validation errors:', data.errors);
      }

      setAdzunaStats(data.stats || { total_scraped: 0, valid_jobs: 0, published_jobs: 0, next_run: new Date().toISOString() });
      setRecentJobs(prev => [...(data.jobs || []), ...prev.slice(0, 10)]);
      
      const summary = data.summary || {};
      const errorCount = data.errors ? data.errors.length : 0;
      const successMessage = `✅ Imported ${summary.inserted || 0} jobs from Adzuna! (${summary.duplicates_skipped || 0} duplicates skipped${errorCount > 0 ? `, ${errorCount} validation errors` : ''})`;
      
      toast.success(successMessage, { 
        id: 'adzuna' 
      });

    } catch (error) {
      console.error('❌ Adzuna import comprehensive error:', {
        error: error,
        message: (error as any)?.message,
        stack: (error as any)?.stack,
        name: (error as any)?.name,
        type: typeof error,
        stringified: JSON.stringify(error, null, 2)
      });
      
      let errorMessage = 'Unknown error occurred';
      if ((error as any)?.message) {
        errorMessage = (error as any).message;
      } else if (typeof error === 'string') {
        errorMessage = error as string;
      }
      
      toast.error(`❌ Adzuna import failed: ${errorMessage}`, { 
        id: 'adzuna',
        duration: 8000 
      });
    } finally {
      setIsAdzunaRunning(false);
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
          <div className="space-y-4">
            {/* Adzuna API Import Section */}
            <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Adzuna API Import (Real Jobs)
              </h3>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={() => runAdzunaImport(100, 'developer', 'india')} 
                  disabled={isAdzunaRunning}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600"
                  size="sm"
                >
                  {isAdzunaRunning ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Globe className="h-3 w-3" />
                      100 Developer Jobs
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => runAdzunaImport(50, 'data scientist', 'bangalore')} 
                  disabled={isAdzunaRunning}
                  variant="outline"
                  size="sm"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  50 Data Science
                </Button>
                <Button 
                  onClick={() => runAdzunaImport(75, 'manager', 'mumbai')} 
                  disabled={isAdzunaRunning}
                  variant="outline"
                  size="sm"
                >
                  <Building className="h-3 w-3 mr-1" />
                  75 Management
                </Button>
                <Button 
                  onClick={() => runAdzunaImport(30, '', 'remote')} 
                  disabled={isAdzunaRunning}
                  variant="outline"
                  size="sm"
                >
                  <Globe className="h-3 w-3 mr-1" />
                  30 Remote Jobs
                </Button>
              </div>
            </div>

            {/* Existing Scraper Section */}
            <div className="p-4 border rounded-lg bg-gradient-to-r from-orange-50 to-red-50">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Job Generation (Generated Jobs)
              </h3>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={() => runJobScraper(200, 'mixed')} 
                  disabled={isRunning}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
                  size="sm"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      200 Mixed Jobs
                    </>
                  )}
                </Button>
            
                <Button 
                  onClick={() => runJobScraper(100, 'government')} 
                  disabled={isRunning}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600"
                  size="sm"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Building2 className="h-3 w-3" />
                      100 Govt Jobs
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => runJobScraper(100, 'international')}
                  disabled={isRunning}
                  size="sm"
                >
                  <Play className="h-3 w-3 mr-1" />
                  100 International
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => runJobScraper(50, 'mixed')}
                  disabled={isRunning}
                  size="sm"
                >
                  <Play className="h-3 w-3 mr-1" />
                  Test (50 Mixed)
                </Button>
              </div>
            </div>
            
            
            {/* Control Actions */}
            <div className="flex gap-2 flex-wrap mt-4">
              <Button 
                variant="outline" 
                onClick={checkJobStats}
                size="sm"
              >
                <Eye className="h-3 w-3 mr-1" />
                Check Stats
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={testDirectCall}
                size="sm"
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
                size="sm"
              >
                🔍 Debug Info
              </Button>
            </div>
          </div>

          {(stats || adzunaStats) && (
            <div className="space-y-4 mt-4">
              {adzunaStats && (
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Adzuna API Stats
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{adzunaStats.total_scraped}</div>
                      <div className="text-sm text-green-600">API Fetched</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{adzunaStats.valid_jobs}</div>
                      <div className="text-sm text-blue-600">Valid Jobs</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{adzunaStats.published_jobs}</div>
                      <div className="text-sm text-purple-600">Imported</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-sm text-orange-600">Real Jobs</div>
                      <div className="text-xs text-orange-600">Via Adzuna API</div>
                    </div>
                  </div>
                </div>
              )}
              
              {stats && (
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Generation Stats
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.total_scraped}</div>
                      <div className="text-sm text-blue-600">Total Generated</div>
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
                </div>
              )}
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
              <span className="text-muted-foreground">Adzuna API, RemoteOK, Generated Jobs, Govt Portals</span>
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