
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Settings, 
  TestTube, 
  BarChart3, 
  Zap, 
  Shield,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { AISystemTester } from './AISystemTester';
import { AIToolsConfiguration } from './AIToolsConfiguration';
import { AIUsageAnalytics } from './AIUsageAnalytics';
import { AIPerformanceMonitor } from './AIPerformanceMonitor';
import { useAIManagementStats } from '@/hooks/useAIManagementStats';

export const AIManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { stats, isLoading } = useAIManagementStats();

  const statsCards = [
    { 
      label: 'Total AI Requests', 
      value: stats?.totalRequests || 0, 
      icon: Brain, 
      color: 'text-blue-600',
      trend: '+12%'
    },
    { 
      label: 'Success Rate', 
      value: `${stats?.successRate || 0}%`, 
      icon: Shield, 
      color: 'text-green-600',
      trend: '+2.3%'
    },
    { 
      label: 'Avg Response Time', 
      value: `${stats?.avgResponseTime || 0}ms`, 
      icon: Zap, 
      color: 'text-orange-600',
      trend: '-15ms'
    },
    { 
      label: 'Active Tools', 
      value: stats?.activeTools || 0, 
      icon: Settings, 
      color: 'text-purple-600',
      trend: '+3'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Management Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage AI features across the platform
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Brain className="h-4 w-4 mr-2" />
          AI System Online
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">{stat.trend}</span>
                  </div>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tools">Tools Config</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Service Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Resume Enhancement</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Job Matching</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cover Letter Gen</span>
                    <Badge variant="secondary">Limited</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Career Analysis</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium">High API usage detected</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium">All systems operational</p>
                      <p className="text-xs text-muted-foreground">5 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tools">
          <AIToolsConfiguration />
        </TabsContent>

        <TabsContent value="testing">
          <AISystemTester />
        </TabsContent>

        <TabsContent value="analytics">
          <AIUsageAnalytics />
        </TabsContent>

        <TabsContent value="monitoring">
          <AIPerformanceMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
};
