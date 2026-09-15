import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, TrendingUp, Database, Merge, BarChart3 } from 'lucide-react';
import LinkedInBulkOperations from '@/components/admin/LinkedInBulkOperations';
import LinkedInDuplicateManager from '@/components/admin/LinkedInDuplicateManager';
import LinkedInAdvancedAnalytics from '@/components/admin/LinkedInAdvancedAnalytics';
import { DataQualityManager } from '@/components/admin/DataQualityManager';
import { SmartJobScrapingControls } from '@/components/admin/SmartJobScrapingControls';
import { useLinkedInRealTime } from '@/hooks/useLinkedInRealTime';

export default function LinkedInToolsHub() {
  const { liveMetrics } = useLinkedInRealTime();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">LinkedIn Tools Hub</h1>
          <p className="text-muted-foreground">
            Advanced LinkedIn data management and automation tools
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Phase 4 - Advanced Features
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profiles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveMetrics?.totalProfiles || 0}</div>
            <p className="text-xs text-muted-foreground">
              Managed profiles
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Imports</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveMetrics?.todayImports || 0}</div>
            <p className="text-xs text-muted-foreground">
              Profiles imported today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveMetrics?.activeJobs || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Database className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tools */}
      <Tabs defaultValue="bulk" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          <TabsTrigger value="duplicates">Duplicates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
          <TabsTrigger value="scraping">Smart Scraping</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bulk" className="space-y-6">
          <LinkedInBulkOperations />
        </TabsContent>
        
        <TabsContent value="duplicates" className="space-y-6">
          <LinkedInDuplicateManager />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <LinkedInAdvancedAnalytics />
        </TabsContent>
        
        <TabsContent value="quality" className="space-y-6">
          <DataQualityManager />
        </TabsContent>
        
        <TabsContent value="scraping" className="space-y-6">
          <SmartJobScrapingControls />
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and automation shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Merge className="h-6 w-6" />
              <span>Merge Duplicates</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <BarChart3 className="h-6 w-6" />
              <span>Generate Report</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Database className="h-6 w-6" />
              <span>Data Cleanup</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}