
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  Zap, 
  Settings, 
  Calendar, 
  TrendingUp, 
  FileText, 
  Link, 
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause
} from 'lucide-react';
import { toast } from 'sonner';

export const SEOAutomation = () => {
  const [automationRules, setAutomationRules] = useState({
    metaTags: true,
    sitemaps: true,
    schemaMarkup: true,
    contentOptimization: false,
    keywordTracking: true,
    competitorMonitoring: false,
    performanceAlerts: true,
    contentGeneration: false
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const toggleRule = (rule: string) => {
    setAutomationRules(prev => ({
      ...prev,
      [rule]: !prev[rule]
    }));
    toast.success(`${rule} automation ${automationRules[rule] ? 'disabled' : 'enabled'}`);
  };

  const runAutomation = async (type: string) => {
    setIsProcessing(true);
    // Simulate automation process
    setTimeout(() => {
      setIsProcessing(false);
      toast.success(`${type} automation completed successfully`);
    }, 3000);
  };

  const automationTasks = [
    {
      id: 'meta-optimization',
      name: 'Meta Tag Optimization',
      description: 'Automatically optimize meta titles and descriptions based on performance data',
      status: 'active',
      lastRun: '2 hours ago',
      nextRun: 'In 4 hours',
      success: 94,
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: 'sitemap-updates',
      name: 'Sitemap Updates',
      description: 'Auto-generate and update XML sitemaps when new content is added',
      status: 'active',
      lastRun: '1 hour ago',
      nextRun: 'In 5 hours',
      success: 100,
      icon: <Link className="h-5 w-5" />
    },
    {
      id: 'schema-generation',
      name: 'Schema Markup Generation',
      description: 'Dynamically generate structured data for job postings and company profiles',
      status: 'active',
      lastRun: '30 minutes ago',
      nextRun: 'In 2 hours',
      success: 89,
      icon: <Target className="h-5 w-5" />
    },
    {
      id: 'keyword-monitoring',
      name: 'Keyword Monitoring',
      description: 'Track keyword rankings and identify new opportunities',
      status: 'active',
      lastRun: '3 hours ago',
      nextRun: 'Daily at 9 AM',
      success: 87,
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: 'content-optimization',
      name: 'Content Optimization',
      description: 'AI-powered content suggestions for better SEO performance',
      status: 'paused',
      lastRun: '2 days ago',
      nextRun: 'Paused',
      success: 76,
      icon: <Bot className="h-5 w-5" />
    }
  ];

  const contentSuggestions = [
    {
      type: 'New Landing Page',
      title: 'React Developer Jobs in Pune',
      reason: 'High search volume, low competition',
      impact: 'High',
      effort: 'Medium'
    },
    {
      type: 'Content Update',
      title: 'Update salary data for Data Scientists',
      reason: 'Outdated information affecting rankings',
      impact: 'Medium',
      effort: 'Low'
    },
    {
      type: 'Meta Optimization',
      title: 'Optimize CTR for top 10 pages',
      reason: 'Below average click-through rates',
      impact: 'High',
      effort: 'Low'
    },
    {
      type: 'Internal Linking',
      title: 'Add internal links to job category pages',
      reason: 'Improve page authority distribution',
      impact: 'Medium',
      effort: 'Medium'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6" />
            SEO Automation Center
          </h2>
          <p className="text-gray-600">Automated SEO tasks and intelligent optimization</p>
        </div>
        <Button onClick={() => runAutomation('All')} disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Run All Automations
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tasks">Automation Tasks</TabsTrigger>
          <TabsTrigger value="rules">Rules & Settings</TabsTrigger>
          <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {automationTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {task.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{task.name}</h3>
                          <Badge variant={task.status === 'active' ? 'default' : 'secondary'}>
                            {task.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span>Last run: {task.lastRun}</span>
                          <span>Next run: {task.nextRun}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-600">Success Rate</span>
                        <span className="font-semibold">{task.success}%</span>
                      </div>
                      <Progress value={task.success} className="w-20" />
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm">
                          {task.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Rules</CardTitle>
              <CardDescription>Configure which SEO tasks should run automatically</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(automationRules).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <p className="text-sm text-gray-600">
                      {key === 'metaTags' && 'Automatically optimize meta titles and descriptions'}
                      {key === 'sitemaps' && 'Auto-generate XML sitemaps for new content'}
                      {key === 'schemaMarkup' && 'Dynamic structured data generation'}
                      {key === 'contentOptimization' && 'AI-powered content optimization suggestions'}
                      {key === 'keywordTracking' && 'Monitor keyword rankings and opportunities'}
                      {key === 'competitorMonitoring' && 'Track competitor SEO performance'}
                      {key === 'performanceAlerts' && 'Send alerts for SEO issues'}
                      {key === 'contentGeneration' && 'Automatically generate SEO content'}
                    </p>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={() => toggleRule(key)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered SEO Suggestions</CardTitle>
              <CardDescription>Smart recommendations to improve your SEO performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentSuggestions.map((suggestion, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{suggestion.type}</Badge>
                          <h4 className="font-medium">{suggestion.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600">{suggestion.reason}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={suggestion.impact === 'High' ? 'default' : 'secondary'}>
                          {suggestion.impact} Impact
                        </Badge>
                        <Badge variant="outline">
                          {suggestion.effort} Effort
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="default">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Implement
                      </Button>
                      <Button size="sm" variant="outline">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Schedule</CardTitle>
              <CardDescription>Configure when automated tasks should run</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Daily Tasks</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Keyword rank checking</span>
                        <span className="text-gray-600">9:00 AM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Performance monitoring</span>
                        <span className="text-gray-600">Every 2 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sitemap updates</span>
                        <span className="text-gray-600">11:00 PM</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Weekly Tasks</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Competitor analysis</span>
                        <span className="text-gray-600">Monday 8:00 AM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Content optimization</span>
                        <span className="text-gray-600">Wednesday 10:00 AM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SEO audit report</span>
                        <span className="text-gray-600">Friday 3:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    Customize Schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
