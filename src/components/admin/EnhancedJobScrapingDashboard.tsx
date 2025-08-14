import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  useEnhancedJobSources, 
  useCreateBatchScraping, 
  useExecuteHighVolumeScraping,
  useAISalaryNormalization,
  useBulkSEOOptimization,
  useSystemPerformanceMetrics,
  useInitializeDefaultSources
} from '@/hooks/useEnhancedJobScraping';
import { toast } from 'sonner';
import { 
  RocketIcon, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Search,
  BarChart3,
  Zap,
  Globe
} from 'lucide-react';

export const EnhancedJobScrapingDashboard = () => {
  const [targetJobCount, setTargetJobCount] = useState(10000);
  const [batchName, setBatchName] = useState('High-Volume-Batch-' + Date.now());

  const { data: sources } = useEnhancedJobSources();
  const { data: performanceMetrics } = useSystemPerformanceMetrics(7);
  const createBatch = useCreateBatchScraping();
  const executeHighVolume = useExecuteHighVolumeScraping();
  const normalizeSalaries = useAISalaryNormalization();
  const optimizeSEO = useBulkSEOOptimization();
  const initializeSources = useInitializeDefaultSources();

  const handleStartHighVolumeScraping = async () => {
    try {
      // Create batch first
      const batch = await createBatch.mutateAsync({
        batch_name: batchName,
        source_ids: sources?.slice(0, 15).map(s => s.id) || [],
        target_job_count: targetJobCount,
        priority: 100
      });

      // Execute high-volume scraping
      await executeHighVolume.mutateAsync({
        batchId: (batch as any)?.id,
        targetJobCount,
        enableAISalaryNormalization: true,
        enableSEOOptimization: true
      });
    } catch (error) {
      console.error('High-volume scraping failed:', error);
    }
  };

  const todayMetrics = performanceMetrics?.[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Job Scraping System</h1>
          <p className="text-muted-foreground">Scale to 10,000+ jobs daily with AI optimization</p>
        </div>
        <Button
          onClick={() => initializeSources.mutate()}
          disabled={initializeSources.isPending}
          variant="outline"
        >
          <Zap className="w-4 h-4 mr-2" />
          Initialize Default Sources
        </Button>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs Today</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayMetrics?.total_jobs_scraped || 0}</div>
            <p className="text-xs text-muted-foreground">
              Target: {targetJobCount.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Normalized</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayMetrics?.salary_normalized_jobs || 0}</div>
            <p className="text-xs text-muted-foreground">
              Quality salary data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEO Optimized</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayMetrics?.seo_optimized_jobs || 0}</div>
            <p className="text-xs text-muted-foreground">
              Search ready content
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Users</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayMetrics?.daily_active_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              Target: 1,000+
            </p>
          </CardContent>
        </Card>
      </div>

      {/* High-Volume Scraping Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RocketIcon className="w-5 h-5" />
            High-Volume Job Scraping
          </CardTitle>
          <CardDescription>
            Launch batch scraping for 10,000+ jobs with AI salary normalization and SEO optimization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Batch Name</label>
              <Input
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="Enter batch name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Target Job Count</label>
              <Input
                type="number"
                value={targetJobCount}
                onChange={(e) => setTargetJobCount(parseInt(e.target.value))}
                min={1000}
                max={50000}
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button
              onClick={handleStartHighVolumeScraping}
              disabled={executeHighVolume.isPending}
              className="flex-1"
            >
              <RocketIcon className="w-4 h-4 mr-2" />
              {executeHighVolume.isPending ? 'Launching...' : 'Start High-Volume Scraping'}
            </Button>
          </div>

          {sources && (
            <div className="text-sm text-muted-foreground">
              Ready to scrape from {sources.length} enhanced sources
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Enhancement Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              AI Salary Normalization
            </CardTitle>
            <CardDescription>
              Normalize salary data with AI-powered parsing and validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => normalizeSalaries.mutate({ batchSize: 1000 })}
              disabled={normalizeSalaries.isPending}
              className="w-full"
            >
              {normalizeSalaries.isPending ? 'Processing...' : 'Normalize All Salaries'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Bulk SEO Optimization
            </CardTitle>
            <CardDescription>
              Generate SEO content and landing pages for maximum visibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => optimizeSEO.mutate({ 
                contentType: 'job_pages', 
                batchSize: 500,
                generateStructuredData: true 
              })}
              disabled={optimizeSEO.isPending}
              className="w-full"
            >
              Optimize Job Pages
            </Button>
            <Button
              onClick={() => optimizeSEO.mutate({ 
                contentType: 'location_pages', 
                createLandingPages: true 
              })}
              disabled={optimizeSEO.isPending}
              variant="outline"
              className="w-full"
            >
              Create Location Pages
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Sources Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Job Sources ({sources?.length || 0})</CardTitle>
          <CardDescription>
            High-performance job sources optimized for volume and quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources?.slice(0, 9).map((source) => (
              <div key={source.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{source.source_name}</span>
                  <Badge variant={source.is_active ? 'default' : 'secondary'}>
                    {source.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>Priority: {source.priority}</div>
                  <div>Success Rate: {source.success_rate.toFixed(1)}%</div>
                  <div>Jobs/Hour: {source.jobs_per_hour}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};