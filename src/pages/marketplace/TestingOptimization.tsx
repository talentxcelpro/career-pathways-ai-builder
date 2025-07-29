import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ABTestingDashboard } from "@/components/marketplace/testing/ABTestingDashboard";
import { PerformanceMonitoring } from "@/components/marketplace/testing/PerformanceMonitoring";
import { UserFeedbackSystem } from "@/components/marketplace/testing/UserFeedbackSystem";
import { SecurityAuditDashboard } from "@/components/marketplace/testing/SecurityAuditDashboard";
import { JobScrapingTester } from "@/components/testing/JobScrapingTester";
import { 
  Target, 
  Activity, 
  MessageSquare, 
  Shield,
  TrendingUp,
  Users,
  Zap,
  CheckCircle
} from "lucide-react";

export default function TestingOptimization() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Testing & Optimization</h1>
          <p className="text-muted-foreground">
            Comprehensive platform optimization through testing, monitoring, and feedback
          </p>
        </div>
        <Badge variant="outline" className="text-blue-500 border-blue-500/20">
          Phase 10: Active
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active A/B Tests</p>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-green-600">+15% conversion</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Performance Score</p>
                <p className="text-2xl font-bold">91</p>
                <p className="text-xs text-green-600">Excellent</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">User Feedback</p>
                <p className="text-2xl font-bold">4.2</p>
                <p className="text-xs text-blue-600">156 responses</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Security Score</p>
                <p className="text-2xl font-bold">87</p>
                <p className="text-xs text-yellow-600">2 open issues</p>
              </div>
              <Shield className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Conversion Optimization
            </CardTitle>
            <CardDescription>
              A/B testing and data-driven improvements for maximum conversion rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">CTA Button Testing</span>
                <Badge className="bg-green-500/10 text-green-500">+47% uplift</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pricing Display</span>
                <Badge className="bg-blue-500/10 text-blue-500">Running</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Service Cards Layout</span>
                <Badge className="bg-yellow-500/10 text-yellow-500">Planning</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-500" />
              Performance Excellence
            </CardTitle>
            <CardDescription>
              Real-time monitoring and optimization for lightning-fast user experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Page Load Time</span>
                <Badge className="bg-green-500/10 text-green-500">1.2s</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Core Web Vitals</span>
                <Badge className="bg-green-500/10 text-green-500">Good</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Lighthouse Score</span>
                <Badge className="bg-green-500/10 text-green-500">91/100</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              User-Centric Design
            </CardTitle>
            <CardDescription>
              Continuous feedback collection and iterative improvements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Satisfaction Score</span>
                <Badge className="bg-green-500/10 text-green-500">84%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Feature Requests</span>
                <Badge className="bg-blue-500/10 text-blue-500">23 active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Response Rate</span>
                <Badge className="bg-yellow-500/10 text-yellow-500">23%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              Security & Compliance
            </CardTitle>
            <CardDescription>
              Proactive security monitoring and regulatory compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">GDPR Compliance</span>
                <Badge className="bg-green-500/10 text-green-500">95%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Critical Issues</span>
                <Badge className="bg-red-500/10 text-red-500">1 open</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Audit</span>
                <Badge className="bg-blue-500/10 text-blue-500">2 hours ago</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="ab-testing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="feedback">User Feedback</TabsTrigger>
          <TabsTrigger value="security">Security Audit</TabsTrigger>
          <TabsTrigger value="job-workflow">Job Workflow</TabsTrigger>
        </TabsList>

        <TabsContent value="ab-testing">
          <ABTestingDashboard />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceMonitoring />
        </TabsContent>

        <TabsContent value="feedback">
          <UserFeedbackSystem />
        </TabsContent>

        <TabsContent value="security">
          <SecurityAuditDashboard />
        </TabsContent>

        <TabsContent value="job-workflow">
          <JobScrapingTester />
        </TabsContent>
      </Tabs>
    </div>
  );
}