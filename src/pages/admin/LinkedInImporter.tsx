import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Users, 
  TrendingUp, 
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Linkedin,
  Database
} from 'lucide-react';
import { useLinkedInImportStats, useLinkedInJobScraping } from '@/hooks/useLinkedInData';
import { ProtectedAdminRoute } from '@/components/admin/ProtectedAdminRoute';
import { AdvancedLinkedInImporter } from '@/components/admin/AdvancedLinkedInImporter';
import { LinkedInImportManager } from '@/components/admin/LinkedInImportManager';
import { DataQualityManager } from '@/components/admin/DataQualityManager';

const LinkedInImporter = () => {
  const { data: importStats, isLoading: statsLoading } = useLinkedInImportStats();
  const { data: scrapingData, isLoading: scrapingLoading } = useLinkedInJobScraping();

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">LinkedIn Import Management</h1>
        <p className="text-muted-foreground">
          Manage LinkedIn profile imports, job scraping, and data quality monitoring
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profiles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{importStats?.totalProfiles?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              LinkedIn profiles imported
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Imports</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{importStats?.todayImports || '0'}</div>
            <p className="text-xs text-muted-foreground">
              New profiles today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{importStats?.successRate || '0'}%</div>
            <p className="text-xs text-muted-foreground">
              Import success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs Scraped</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scrapingData?.totalScraped || '0'}</div>
            <p className="text-xs text-muted-foreground">
              LinkedIn jobs scraped
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="advanced" className="space-y-4">
        <TabsList>
          <TabsTrigger value="advanced">Advanced Import</TabsTrigger>
          <TabsTrigger value="manager">Import Manager</TabsTrigger>
          <TabsTrigger value="scraping">Job Scraping</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="advanced" className="space-y-4">
          <AdvancedLinkedInImporter />
        </TabsContent>

        <TabsContent value="manager" className="space-y-4">
          <LinkedInImportManager />
        </TabsContent>

        <TabsContent value="scraping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>LinkedIn Job Scraping</CardTitle>
              <CardDescription>
                Monitor and manage automated job scraping from LinkedIn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scrapingLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Total Scraped</h3>
                      <p className="text-2xl font-bold text-primary">{scrapingData?.totalScraped || 0}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Active Jobs</h3>
                      <p className="text-2xl font-bold text-green-600">{scrapingData?.activeJobs || 0}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Success Rate</h3>
                      <p className="text-2xl font-bold text-blue-600">94.2%</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium">Recent Scraped Jobs</h3>
                    {scrapingData?.recentJobs?.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <p className="text-sm text-muted-foreground">{job.company_name}</p>
                        </div>
                        <Badge variant={job.is_active ? "default" : "secondary"}>
                          {job.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Analytics</CardTitle>
              <CardDescription>
                Insights and metrics for LinkedIn data import performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium">Import Trends</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">This Week</span>
                      <span className="text-sm font-medium">+12.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">This Month</span>
                      <span className="text-sm font-medium">+8.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Quality Score</span>
                      <span className="text-sm font-medium">92.1%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Data Sources</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">LinkedIn API</span>
                      <span className="text-sm font-medium">68%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Manual Upload</span>
                      <span className="text-sm font-medium">22%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Bulk Import</span>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <DataQualityManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const WrappedLinkedInImporter = () => (
  <ProtectedAdminRoute requiredPermission="canAccessLinkedIn">
    <LinkedInImporter />
  </ProtectedAdminRoute>
);

export default WrappedLinkedInImporter;