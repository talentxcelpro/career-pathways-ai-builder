import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BarChart3, 
  Search, 
  PieChart, 
  Target, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Filter 
} from 'lucide-react';

const AnalyticsSubcategories = () => {
  const [activeSubcategory, setActiveSubcategory] = useState('google-analytics');

  const subcategories = [
    {
      id: 'google-analytics',
      title: 'Google Analytics Integration',
      icon: BarChart3,
      description: 'Connect and analyze Google Analytics data',
      status: 'active'
    },
    {
      id: 'search-console',
      title: 'Google Search Console Integration',
      icon: Search,
      description: 'Import and analyze Search Console metrics',
      status: 'active'
    },
    {
      id: 'custom-dashboard',
      title: 'Custom Analytics Dashboard',
      icon: PieChart,
      description: 'Build custom analytics dashboards',
      status: 'beta'
    },
    {
      id: 'attribution',
      title: 'Attribution Modeling',
      icon: Target,
      description: 'Track conversion attribution across channels',
      status: 'beta'
    },
    {
      id: 'conversion-tracking',
      title: 'Conversion Tracking',
      icon: TrendingUp,
      description: 'Monitor conversion rates and goal completions',
      status: 'active'
    },
    {
      id: 'roi-analytics',
      title: 'ROI Analytics',
      icon: DollarSign,
      description: 'Calculate return on investment for SEO efforts',
      status: 'coming-soon'
    },
    {
      id: 'multi-channel',
      title: 'Multi-Channel Attribution',
      icon: Users,
      description: 'Analyze customer journeys across channels',
      status: 'coming-soon'
    },
    {
      id: 'segmentation',
      title: 'Advanced Segmentation',
      icon: Filter,
      description: 'Create custom audience segments and analysis',
      status: 'beta'
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

        {activeSubcategory === 'google-analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Google Analytics Connection</CardTitle>
                <CardDescription>Connect your Google Analytics account for deeper insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">Connection Status</span>
                    <p className="text-sm text-muted-foreground">Account: marketing@company.com</p>
                  </div>
                  <Badge variant="default">Connected</Badge>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Analytics Property</label>
                  <select className="w-full p-2 border rounded-md mt-2">
                    <option>www.yoursite.com - UA-123456789-1</option>
                    <option>blog.yoursite.com - UA-123456789-2</option>
                    <option>shop.yoursite.com - UA-123456789-3</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Data Range</label>
                  <select className="w-full p-2 border rounded-md mt-2">
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>Last 12 months</option>
                    <option>Custom range</option>
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <Button className="flex-1">Sync Data</Button>
                  <Button variant="outline">Configure</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>Key metrics from Google Analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold">47,892</div>
                    <div className="text-sm text-muted-foreground">Sessions</div>
                    <div className="text-xs text-green-600">+12.5%</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold">34,567</div>
                    <div className="text-sm text-muted-foreground">Users</div>
                    <div className="text-xs text-green-600">+8.2%</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold">2:34</div>
                    <div className="text-sm text-muted-foreground">Avg. Session</div>
                    <div className="text-xs text-red-600">-0.5%</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold">68.5%</div>
                    <div className="text-sm text-muted-foreground">Bounce Rate</div>
                    <div className="text-xs text-green-600">-2.1%</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Top Traffic Sources</h4>
                  {[
                    { source: 'Organic Search', sessions: '28,456', percentage: '59.4%' },
                    { source: 'Direct', sessions: '8,923', percentage: '18.6%' },
                    { source: 'Referral', sessions: '5,234', percentage: '10.9%' },
                    { source: 'Social', sessions: '3,456', percentage: '7.2%' }
                  ].map((source, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm font-medium">{source.source}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">{source.sessions}</div>
                        <div className="text-xs text-muted-foreground">{source.percentage}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSubcategory === 'search-console' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Search Console Integration</CardTitle>
                <CardDescription>Import data from Google Search Console</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">Search Console Status</span>
                    <p className="text-sm text-muted-foreground">Last sync: 2 hours ago</p>
                  </div>
                  <Badge variant="default">Connected</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-xl font-bold">12,458</div>
                    <div className="text-sm text-muted-foreground">Total Clicks</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-xl font-bold">89,234</div>
                    <div className="text-sm text-muted-foreground">Impressions</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-xl font-bold">14.0%</div>
                    <div className="text-sm text-muted-foreground">CTR</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-xl font-bold">8.4</div>
                    <div className="text-sm text-muted-foreground">Avg Position</div>
                  </div>
                </div>
                
                <Button className="w-full">Refresh Data</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Queries</CardTitle>
                <CardDescription>Best performing search queries from Search Console</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { query: 'SEO tools comparison', clicks: 1234, impressions: 8956, ctr: '13.8%', position: 4.2 },
                    { query: 'best keyword research tool', clicks: 892, impressions: 12456, ctr: '7.2%', position: 8.1 },
                    { query: 'free SEO audit', clicks: 756, impressions: 5678, ctr: '13.3%', position: 3.8 },
                    { query: 'backlink analysis tool', clicks: 623, impressions: 9876, ctr: '6.3%', position: 12.4 }
                  ].map((query, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="font-medium text-sm mb-2">{query.query}</div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-medium">{query.clicks}</div>
                          <div className="text-muted-foreground">Clicks</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{query.impressions}</div>
                          <div className="text-muted-foreground">Impressions</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{query.ctr}</div>
                          <div className="text-muted-foreground">CTR</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{query.position}</div>
                          <div className="text-muted-foreground">Position</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSubcategory === 'conversion-tracking' && (
          <Card>
            <CardHeader>
              <CardTitle>Conversion Tracking Dashboard</CardTitle>
              <CardDescription>Monitor conversion rates and goal completions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">3.2%</div>
                  <div className="text-sm text-muted-foreground">Conversion Rate</div>
                  <div className="text-xs text-green-600">+0.4% vs last month</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">1,547</div>
                  <div className="text-sm text-muted-foreground">Total Conversions</div>
                  <div className="text-xs text-green-600">+23% vs last month</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">$45.60</div>
                  <div className="text-sm text-muted-foreground">Cost per Conversion</div>
                  <div className="text-xs text-red-600">+$2.30 vs last month</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">$70,524</div>
                  <div className="text-sm text-muted-foreground">Conversion Value</div>
                  <div className="text-xs text-green-600">+18% vs last month</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Conversion Goals Performance</h4>
                {[
                  { goal: 'Newsletter Signup', conversions: 456, rate: '2.1%', value: '$4,560', trend: '+12%' },
                  { goal: 'Contact Form', conversions: 234, rate: '1.1%', value: '$23,400', trend: '+8%' },
                  { goal: 'Free Trial', conversions: 123, rate: '0.6%', value: '$12,300', trend: '+25%' },
                  { goal: 'Purchase', conversions: 89, rate: '0.4%', value: '$17,800', trend: '+15%' }
                ].map((goal, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <span className="font-medium">{goal.goal}</span>
                      <p className="text-sm text-muted-foreground">{goal.conversions} conversions • {goal.rate} rate</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{goal.value}</div>
                      <Badge variant={goal.trend.startsWith('+') ? 'default' : 'destructive'}>
                        {goal.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
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

export default AnalyticsSubcategories;