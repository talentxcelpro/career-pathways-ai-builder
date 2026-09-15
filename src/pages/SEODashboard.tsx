import React from 'react';
import { SEOPerformanceDashboard } from '@/components/seo/SEOPerformanceDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Globe, TrendingUp, Zap, Target, BarChart3, CheckCircle } from "lucide-react";

const SEODashboard = () => {
  console.log('SEODashboard rendering...'); // Debug log

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">SEO Automation Suite</h1>
          <p className="text-xl text-muted-foreground">Generate millions of SEO pages and scale your online presence</p>
        </div>

        <div className="bg-card p-6 rounded-lg border mb-6">
          <h2 className="text-2xl font-semibold mb-4">Dashboard Status</h2>
          <p className="text-muted-foreground">Dashboard is loading successfully!</p>
        </div>

        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="scalability">Scalability</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <SEOPerformanceDashboard />
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total SEO Pages</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,847,293</div>
                  <p className="text-xs text-muted-foreground">+1,234 today</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Generation Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">15,420/hr</div>
                  <p className="text-xs text-muted-foreground">Average this week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <Progress value={87} className="mt-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Active</div>
                  <p className="text-xs text-muted-foreground">All systems operational</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Manage your SEO automation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="w-full">
                    Generate New Batch
                  </Button>
                  <Button variant="outline" className="w-full">
                    Download Sitemap
                  </Button>
                  <Button variant="outline" className="w-full">
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scalability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Scalability Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">2.8M</div>
                    <div className="text-sm text-muted-foreground">Current Pages</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">10M</div>
                    <div className="text-sm text-muted-foreground">Target Pages</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">15.4K/hr</div>
                    <div className="text-sm text-muted-foreground">Generation Rate</div>
                  </div>
                </div>
                
                <Progress value={28} className="h-3" />
                
                <div className="text-center text-sm text-muted-foreground">
                  28% complete • ETA: 47 days
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Job Pages</Badge>
                      <span className="font-medium">1,234,567</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Location Pages</Badge>
                      <span className="font-medium">856,432</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Company Pages</Badge>
                      <span className="font-medium">456,789</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Skill Pages</Badge>
                      <span className="font-medium">299,505</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quality Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="default">Excellent (90-100%)</Badge>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">Good (70-89%)</Badge>
                      <span className="font-medium">35%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Average (50-69%)</Badge>
                      <span className="font-medium">15%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="destructive">Needs Improvement</Badge>
                      <span className="font-medium">5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SEODashboard;