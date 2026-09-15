import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  BarChart3, 
  DollarSign, 
  Target, 
  Clock, 
  AlertTriangle, 
  BarChart, 
  Monitor 
} from 'lucide-react';

const AIStatusSubcategories = () => {
  const [activeSubcategory, setActiveSubcategory] = useState('performance-monitoring');

  const subcategories = [
    {
      id: 'performance-monitoring',
      title: 'AI Model Performance Monitoring',
      icon: Activity,
      description: 'Monitor AI model accuracy and performance metrics',
      status: 'active'
    },
    {
      id: 'usage-analytics',
      title: 'API Usage Analytics',
      icon: BarChart3,
      description: 'Track API calls, usage patterns, and limits',
      status: 'active'
    },
    {
      id: 'cost-tracking',
      title: 'Cost Tracking & Optimization',
      icon: DollarSign,
      description: 'Monitor AI costs and optimize spending',
      status: 'active'
    },
    {
      id: 'accuracy-metrics',
      title: 'Model Accuracy Metrics',
      icon: Target,
      description: 'Track prediction accuracy and model performance',
      status: 'beta'
    },
    {
      id: 'processing-time',
      title: 'Processing Time Analytics',
      icon: Clock,
      description: 'Monitor AI processing times and latency',
      status: 'active'
    },
    {
      id: 'error-monitoring',
      title: 'Error Rate Monitoring',
      icon: AlertTriangle,
      description: 'Track AI errors and failure rates',
      status: 'active'
    },
    {
      id: 'feature-usage',
      title: 'Feature Usage Statistics',
      icon: BarChart,
      description: 'Analyze which AI features are most used',
      status: 'beta'
    },
    {
      id: 'system-health',
      title: 'System Health Dashboard',
      icon: Monitor,
      description: 'Overall system health and uptime monitoring',
      status: 'active'
    }
  ];

  const renderSubcategoryContent = () => {
    const subcategory = subcategories.find(sub => sub.id === activeSubcategory);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">{subcategory?.title}</h3>
            <p className="text-muted-foreground mt-1">{subcategory?.description}</p>
          </div>
          <Badge variant={subcategory?.status === 'active' ? 'default' : 'secondary'}>
            {subcategory?.status?.replace('-', ' ')}
          </Badge>
        </div>

        {activeSubcategory === 'performance-monitoring' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Model Status</CardTitle>
                <CardDescription>Real-time performance of all AI models</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { model: 'Content Generator', status: 'operational', accuracy: 94.2, uptime: 99.8 },
                  { model: 'Keyword Analyzer', status: 'operational', accuracy: 91.7, uptime: 99.9 },
                  { model: 'Ranking Predictor', status: 'degraded', accuracy: 87.3, uptime: 98.2 },
                  { model: 'SERP Analyzer', status: 'operational', accuracy: 93.1, uptime: 99.7 }
                ].map((model, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{model.model}</span>
                      <Badge variant={
                        model.status === 'operational' ? 'default' :
                        model.status === 'degraded' ? 'secondary' : 'destructive'
                      }>
                        {model.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Accuracy</div>
                        <div className="font-medium">{model.accuracy}%</div>
                        <Progress value={model.accuracy} className="h-2 mt-1" />
                      </div>
                      <div>
                        <div className="text-muted-foreground">Uptime</div>
                        <div className="font-medium">{model.uptime}%</div>
                        <Progress value={model.uptime} className="h-2 mt-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Alerts</CardTitle>
                <CardDescription>Recent performance issues and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { 
                      type: 'warning', 
                      message: 'Ranking Predictor accuracy dropped to 87.3%',
                      time: '15 minutes ago',
                      action: 'Investigating'
                    },
                    { 
                      type: 'info', 
                      message: 'Content Generator model updated to v2.1',
                      time: '2 hours ago',
                      action: 'Completed'
                    },
                    { 
                      type: 'error', 
                      message: 'Temporary API timeout on keyword analysis',
                      time: '6 hours ago',
                      action: 'Resolved'
                    }
                  ].map((alert, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        alert.type === 'error' ? 'bg-red-500' :
                        alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{alert.message}</div>
                        <div className="text-xs text-muted-foreground">{alert.time}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">{alert.action}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSubcategory === 'usage-analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>API Usage Overview</CardTitle>
                <CardDescription>Current month API consumption</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold">847,392</div>
                    <div className="text-sm text-muted-foreground">Total Requests</div>
                    <div className="text-xs text-green-600">+12% vs last month</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold">98.7%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                    <div className="text-xs text-green-600">+0.3% vs last month</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Usage by Feature</h4>
                  {[
                    { feature: 'Content Generation', requests: 312456, percentage: 36.9 },
                    { feature: 'Keyword Research', requests: 203847, percentage: 24.1 },
                    { feature: 'Site Auditing', requests: 156293, percentage: 18.4 },
                    { feature: 'Rank Tracking', requests: 174796, percentage: 20.6 }
                  ].map((usage, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{usage.feature}</span>
                        <span>{usage.requests.toLocaleString()} ({usage.percentage}%)</span>
                      </div>
                      <Progress value={usage.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Limits & Quotas</CardTitle>
                <CardDescription>Current usage against limits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { 
                      endpoint: 'Content Generation API',
                      used: 8450,
                      limit: 10000,
                      resetTime: '23h 45m'
                    },
                    { 
                      endpoint: 'Keyword Research API',
                      used: 6230,
                      limit: 8000,
                      resetTime: '23h 45m'
                    },
                    { 
                      endpoint: 'SERP Analysis API',
                      used: 4890,
                      limit: 5000,
                      resetTime: '23h 45m'
                    },
                    { 
                      endpoint: 'Backlink Checker API',
                      used: 2340,
                      limit: 3000,
                      resetTime: '23h 45m'
                    }
                  ].map((quota, index) => {
                    const percentage = (quota.used / quota.limit) * 100;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{quota.endpoint}</span>
                          <Badge variant={percentage > 90 ? 'destructive' : percentage > 75 ? 'secondary' : 'default'}>
                            {quota.used}/{quota.limit}
                          </Badge>
                        </div>
                        <Progress 
                          value={percentage} 
                          className={`h-2 ${percentage > 90 ? 'bg-red-100' : ''}`}
                        />
                        <div className="text-xs text-muted-foreground">
                          Resets in {quota.resetTime}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSubcategory === 'cost-tracking' && (
          <Card>
            <CardHeader>
              <CardTitle>AI Cost Analytics</CardTitle>
              <CardDescription>Track and optimize AI spending across all services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">$2,847</div>
                  <div className="text-sm text-muted-foreground">This Month</div>
                  <div className="text-xs text-red-600">+$234 vs last month</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">$94.90</div>
                  <div className="text-sm text-muted-foreground">Daily Average</div>
                  <div className="text-xs text-green-600">-$5.20 vs last month</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">$0.00336</div>
                  <div className="text-sm text-muted-foreground">Cost per Request</div>
                  <div className="text-xs text-green-600">-$0.00012 vs last month</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">$3,200</div>
                  <div className="text-sm text-muted-foreground">Monthly Budget</div>
                  <div className="text-xs text-green-600">$353 remaining</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Cost Breakdown by Service</h4>
                {[
                  { service: 'OpenAI GPT-4', cost: '$1,234', percentage: 43.4, requests: '312,456' },
                  { service: 'OpenAI GPT-3.5', cost: '$567', percentage: 19.9, requests: '456,789' },
                  { service: 'Google Cloud AI', cost: '$445', percentage: 15.6, requests: '234,567' },
                  { service: 'Azure Cognitive Services', cost: '$389', percentage: 13.7, requests: '189,234' },
                  { service: 'AWS Comprehend', cost: '$212', percentage: 7.4, requests: '123,456' }
                ].map((cost, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <span className="font-medium">{cost.service}</span>
                      <p className="text-sm text-muted-foreground">{cost.requests} requests this month</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{cost.cost}</div>
                      <div className="text-sm text-muted-foreground">{cost.percentage}% of total</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Cost Optimization Suggestions</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Consider batch processing to reduce API calls by ~15%</li>
                  <li>• Switch to GPT-3.5 for simple tasks to save ~$200/month</li>
                  <li>• Implement caching to reduce duplicate requests by ~10%</li>
                  <li>• Review and optimize prompt engineering for better efficiency</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {subcategories.map((subcategory) => {
          const Icon = subcategory.icon;
          return (
            <Button
              key={subcategory.id}
              variant={activeSubcategory === subcategory.id ? "default" : "outline"}
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => setActiveSubcategory(subcategory.id)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs text-center">{subcategory.title}</span>
            </Button>
          );
        })}
      </div>

      {renderSubcategoryContent()}
    </div>
  );
};

export default AIStatusSubcategories;