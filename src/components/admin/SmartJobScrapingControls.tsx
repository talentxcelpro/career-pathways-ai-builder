import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bot, 
  Play, 
  Pause, 
  Square, 
  Settings, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity,
  Target,
  Download,
  Upload
} from 'lucide-react';
import { useLinkedInRealTime } from '@/hooks/useLinkedInRealTime';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const SmartJobScrapingControls = () => {
  const { scrapingProgress, liveMetrics } = useLinkedInRealTime();
  const { toast } = useToast();
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [newJobConfig, setNewJobConfig] = useState({
    job_title: 'Software Engineer',
    search_query: 'Software Engineer India',
    location: 'India',
    employment_type: 'full_time',
    experience_level: 'mid_level',
    auto_start: true,
    rate_limit: 30,
    max_jobs: 100
  });

  const [scraperSettings, setScraperSettings] = useState({
    enabled: true,
    max_concurrent_jobs: 3,
    rate_limit_per_minute: 30,
    retry_attempts: 3,
    delay_between_requests: 2000,
    quality_threshold: 80,
    auto_deduplication: true,
    smart_filtering: true
  });

  const startScrapingJob = async () => {
    setIsCreatingJob(true);
    try {
      const { data, error } = await supabase.functions.invoke('linkedin-job-scraper', {
        body: {
          action: 'start-scraping',
          payload: newJobConfig
        }
      });

      if (error) throw error;

      toast({
        title: "Scraping Job Started",
        description: `Started scraping for ${newJobConfig.job_title}`,
      });

      // Reset form
      setNewJobConfig({
        job_title: 'Software Engineer',
        search_query: 'Software Engineer India',
        location: 'India',
        employment_type: 'full_time',
        experience_level: 'mid_level',
        auto_start: true,
        rate_limit: 30,
        max_jobs: 100
      });
    } catch (error) {
      console.error('Error starting scraping job:', error);
      toast({
        title: "Error",
        description: "Failed to start scraping job",
        variant: "destructive"
      });
    } finally {
      setIsCreatingJob(false);
    }
  };

  const stopScrapingJob = async (jobId: string) => {
    try {
      await supabase.functions.invoke('linkedin-job-scraper', {
        body: {
          action: 'stop-scraping',
          payload: { job_id: jobId }
        }
      });

      toast({
        title: "Job Stopped",
        description: "Scraping job has been stopped",
      });
    } catch (error) {
      console.error('Error stopping scraping job:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'stopped': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      case 'stopped': return <Clock className="h-4 w-4" />;
      default: return <RefreshCw className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Metrics Dashboard */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(scrapingProgress).length}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs Found Today</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(scrapingProgress).reduce((sum, job) => sum + job.jobs_found, 0)}
            </div>
            <p className="text-xs text-muted-foreground">New opportunities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Optimal</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Scraping Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Active Scraping Jobs</CardTitle>
          <CardDescription>Real-time progress tracking for LinkedIn job scraping</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.values(scrapingProgress).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active scraping jobs</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.values(scrapingProgress).map((job) => (
                <div key={job.job_id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      <span className="font-medium">Job {job.job_id.slice(0, 8)}</span>
                      <Badge 
                        variant={job.status === 'running' ? 'default' : 
                                job.status === 'completed' ? 'secondary' : 
                                job.status === 'failed' ? 'destructive' : 'outline'}
                      >
                        {job.status}
                      </Badge>
                    </div>
                    {job.status === 'running' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => stopScrapingJob(job.job_id)}
                      >
                        <Square className="h-4 w-4 mr-1" />
                        Stop
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{job.progress_percentage}%</span>
                    </div>
                    <Progress value={job.progress_percentage} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{job.jobs_found} jobs found</span>
                      {job.error_message && (
                        <span className="text-red-600">{job.error_message}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create New Scraping Job */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Scraping Job</CardTitle>
          <CardDescription>Configure and start intelligent LinkedIn job scraping</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="job-title">Job Title</Label>
              <Input
                id="job-title"
                value={newJobConfig.job_title}
                onChange={(e) => setNewJobConfig(prev => ({ ...prev, job_title: e.target.value }))}
                placeholder="e.g., Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={newJobConfig.location}
                onChange={(e) => setNewJobConfig(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Bangalore, India"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search-query">Search Query</Label>
            <Textarea
              id="search-query"
              value={newJobConfig.search_query}
              onChange={(e) => setNewJobConfig(prev => ({ ...prev, search_query: e.target.value }))}
              placeholder="Detailed search query for LinkedIn jobs"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="employment-type">Employment Type</Label>
              <Select
                value={newJobConfig.employment_type}
                onValueChange={(value) => setNewJobConfig(prev => ({ ...prev, employment_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience-level">Experience Level</Label>
              <Select
                value={newJobConfig.experience_level}
                onValueChange={(value) => setNewJobConfig(prev => ({ ...prev, experience_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry_level">Entry Level</SelectItem>
                  <SelectItem value="mid_level">Mid Level</SelectItem>
                  <SelectItem value="senior_level">Senior Level</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-jobs">Max Jobs</Label>
              <Input
                id="max-jobs"
                type="number"
                value={newJobConfig.max_jobs}
                onChange={(e) => setNewJobConfig(prev => ({ ...prev, max_jobs: parseInt(e.target.value) }))}
                min="10"
                max="500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="auto-start"
              checked={newJobConfig.auto_start}
              onCheckedChange={(checked) => setNewJobConfig(prev => ({ ...prev, auto_start: checked }))}
            />
            <Label htmlFor="auto-start">Start scraping immediately</Label>
          </div>

          <Button 
            onClick={startScrapingJob} 
            disabled={isCreatingJob}
            className="w-full"
          >
            {isCreatingJob ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isCreatingJob ? 'Creating Job...' : 'Start Scraping Job'}
          </Button>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Scraping Settings</CardTitle>
          <CardDescription>Configure intelligent scraping behavior and quality controls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="concurrent-jobs">Max Concurrent Jobs</Label>
              <Input
                id="concurrent-jobs"
                type="number"
                value={scraperSettings.max_concurrent_jobs}
                onChange={(e) => setScraperSettings(prev => ({ 
                  ...prev, 
                  max_concurrent_jobs: parseInt(e.target.value) 
                }))}
                min="1"
                max="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate-limit">Rate Limit (requests/min)</Label>
              <Input
                id="rate-limit"
                type="number"
                value={scraperSettings.rate_limit_per_minute}
                onChange={(e) => setScraperSettings(prev => ({ 
                  ...prev, 
                  rate_limit_per_minute: parseInt(e.target.value) 
                }))}
                min="10"
                max="100"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-dedup">Auto Deduplication</Label>
              <Switch
                id="auto-dedup"
                checked={scraperSettings.auto_deduplication}
                onCheckedChange={(checked) => setScraperSettings(prev => ({ 
                  ...prev, 
                  auto_deduplication: checked 
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="smart-filter">Smart Filtering</Label>
              <Switch
                id="smart-filter"
                checked={scraperSettings.smart_filtering}
                onCheckedChange={(checked) => setScraperSettings(prev => ({ 
                  ...prev, 
                  smart_filtering: checked 
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="scraper-enabled">Enable Scraper</Label>
              <Switch
                id="scraper-enabled"
                checked={scraperSettings.enabled}
                onCheckedChange={(checked) => setScraperSettings(prev => ({ 
                  ...prev, 
                  enabled: checked 
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};