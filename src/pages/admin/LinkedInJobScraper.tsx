import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bot, 
  Search, 
  Settings, 
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  Linkedin,
  Database,
  Filter,
  Target,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const LinkedInJobScraper = () => {
  const { data: scraperStats } = useQuery({
    queryKey: ['linkedin-scraper-stats'],
    queryFn: async () => ({
      totalJobsScraped: 45230,
      activeScrapeJobs: 8,
      successRate: 94.2,
      avgScrapingTime: '4.5 hours',
      dailyScrapedJobs: 1240,
      weeklyGrowth: 15.3
    })
  });

  const { data: activeScrapeJobs } = useQuery({
    queryKey: ['active-scrape-jobs'],
    queryFn: async () => [
      {
        id: '1',
        name: 'Tech Jobs - Bangalore',
        query: 'Software Engineer Bangalore',
        status: 'running',
        progress: 65,
        found: 156,
        lastRun: '2024-01-20T10:30:00Z',
        nextRun: '2024-01-20T16:00:00Z'
      },
      {
        id: '2',
        name: 'Marketing Roles - Mumbai',
        query: 'Marketing Manager Mumbai',
        status: 'completed',
        progress: 100,
        found: 89,
        lastRun: '2024-01-20T08:00:00Z',
        nextRun: '2024-01-21T08:00:00Z'
      },
      {
        id: '3',
        name: 'Data Science Jobs',
        query: 'Data Scientist Python',
        status: 'failed',
        progress: 25,
        found: 34,
        lastRun: '2024-01-20T06:00:00Z',
        nextRun: '2024-01-20T18:00:00Z'
      },
      {
        id: '4',
        name: 'Remote Opportunities',
        query: 'Remote Developer India',
        status: 'scheduled',
        progress: 0,
        found: 0,
        lastRun: null,
        nextRun: '2024-01-20T14:00:00Z'
      }
    ]
  });

  const { data: scrapingTargets } = useQuery({
    queryKey: ['scraping-targets'],
    queryFn: async () => [
      { id: '1', name: 'Technology Sector', keywords: ['Software Engineer', 'Developer', 'DevOps'], enabled: true },
      { id: '2', name: 'Marketing & Sales', keywords: ['Marketing Manager', 'Sales Executive', 'Digital Marketing'], enabled: true },
      { id: '3', name: 'Finance & Banking', keywords: ['Financial Analyst', 'Accountant', 'Investment Banking'], enabled: false },
      { id: '4', name: 'Healthcare', keywords: ['Nurse', 'Doctor', 'Healthcare Admin'], enabled: true },
      { id: '5', name: 'Education', keywords: ['Teacher', 'Professor', 'Training Specialist'], enabled: false }
    ]
  });

  const { data: performanceMetrics } = useQuery({
    queryKey: ['scraper-performance'],
    queryFn: async () => ({
      avgJobsPerHour: 285,
      dataAccuracy: 96.8,
      duplicateRate: 4.2,
      processingSpeed: '1.2s per job',
      systemLoad: 68,
      errorRate: 2.1
    })
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'blue';
      case 'completed': return 'green';
      case 'failed': return 'red';
      case 'scheduled': return 'yellow';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return Activity;
      case 'completed': return CheckCircle;
      case 'failed': return AlertTriangle;
      case 'scheduled': return Clock;
      default: return Search;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">LinkedIn Job Scraper</h1>
        <p className="text-muted-foreground">
          Automated job scraping from LinkedIn with intelligent scheduling and quality controls
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs Scraped</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scraperStats?.totalJobsScraped?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              LinkedIn jobs collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scraperStats?.successRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Successful scraping operations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scraperStats?.activeScrapeJobs || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently running scrapers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Collection</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scraperStats?.dailyScrapedJobs?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              +{scraperStats?.weeklyGrowth || 0}% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Active Jobs</TabsTrigger>
          <TabsTrigger value="targets">Scraping Targets</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="settings">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Active Scraping Jobs</h3>
            <Button>
              <Bot className="h-4 w-4 mr-2" />
              Create New Job
            </Button>
          </div>
          
          <div className="grid gap-4">
            {activeScrapeJobs?.map((job) => {
              const StatusIcon = getStatusIcon(job.status);
              return (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`h-5 w-5 text-${getStatusColor(job.status)}-500`} />
                        <div>
                          <CardTitle className="text-base">{job.name}</CardTitle>
                          <CardDescription>{job.query}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={job.status === 'running' ? 'default' : 
                                      job.status === 'completed' ? 'secondary' : 
                                      job.status === 'failed' ? 'destructive' : 'outline'}>
                          {job.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          {job.status === 'running' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{job.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-${getStatusColor(job.status)}-500`}
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Jobs Found</p>
                          <p className="font-medium">{job.found}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Run</p>
                          <p className="font-medium">
                            {job.lastRun ? new Date(job.lastRun).toLocaleTimeString() : 'Never'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Next Run</p>
                          <p className="font-medium">
                            {new Date(job.nextRun).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="targets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scraping Target Configuration</CardTitle>
              <CardDescription>
                Define industry sectors and keywords for automated job discovery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scrapingTargets?.map((target) => (
                  <div key={target.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{target.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Keywords: {target.keywords.join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Switch checked={target.enabled} />
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Add New Target
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Scraping Speed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceMetrics?.avgJobsPerHour || 0}</div>
                <p className="text-sm text-muted-foreground">Jobs per hour</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Data Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {performanceMetrics?.dataAccuracy || 0}%
                </div>
                <p className="text-sm text-muted-foreground">Valid job data</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {performanceMetrics?.errorRate || 0}%
                </div>
                <p className="text-sm text-muted-foreground">Failed operations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Processing Speed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceMetrics?.processingSpeed || '0s'}</div>
                <p className="text-sm text-muted-foreground">Per job processing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Load</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {performanceMetrics?.systemLoad || 0}%
                </div>
                <p className="text-sm text-muted-foreground">Current CPU usage</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Duplicate Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {performanceMetrics?.duplicateRate || 0}%
                </div>
                <p className="text-sm text-muted-foreground">Duplicate jobs found</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Scraping Configuration</CardTitle>
                <CardDescription>
                  General settings for LinkedIn job scraping operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="scrape-frequency">Scraping Frequency</Label>
                  <select id="scrape-frequency" className="w-full p-2 border rounded">
                    <option>Every 4 hours</option>
                    <option>Every 6 hours</option>
                    <option>Every 12 hours</option>
                    <option>Daily</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-concurrent">Max Concurrent Jobs</Label>
                  <Input id="max-concurrent" type="number" defaultValue="5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeout">Request Timeout (seconds)</Label>
                  <Input id="timeout" type="number" defaultValue="30" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dedup">Enable Deduplication</Label>
                    <Switch id="dedup" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="validate">Validate Job Data</Label>
                    <Switch id="validate" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Email Notifications</Label>
                    <Switch id="notifications" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Limiting</CardTitle>
                <CardDescription>
                  Configure request rates to avoid being blocked by LinkedIn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="requests-per-minute">Requests per Minute</Label>
                  <Input id="requests-per-minute" type="number" defaultValue="30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delay-between">Delay Between Requests (ms)</Label>
                  <Input id="delay-between" type="number" defaultValue="2000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retry-attempts">Max Retry Attempts</Label>
                  <Input id="retry-attempts" type="number" defaultValue="3" />
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Conservative rate limits help prevent IP blocking. 
                    Monitor performance metrics and adjust accordingly.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end">
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LinkedInJobScraper;