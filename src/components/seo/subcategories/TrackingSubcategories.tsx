import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  MapPin, 
  Smartphone, 
  Star, 
  Users, 
  History, 
  Bell, 
  FileBarChart 
} from 'lucide-react';

const TrackingSubcategories = () => {
  const [activeSubcategory, setActiveSubcategory] = useState('dashboard');

  const subcategories = [
    {
      id: 'dashboard',
      title: 'Rank Tracking Dashboard',
      icon: TrendingUp,
      description: 'Monitor keyword rankings across search engines',
      status: 'active'
    },
    {
      id: 'local',
      title: 'Local Rank Tracking',
      icon: MapPin,
      description: 'Track rankings for location-based searches',
      status: 'active'
    },
    {
      id: 'mobile-desktop',
      title: 'Mobile vs Desktop Rankings',
      icon: Smartphone,
      description: 'Compare performance across device types',
      status: 'active'
    },
    {
      id: 'serp-features',
      title: 'SERP Feature Tracking',
      icon: Star,
      description: 'Monitor featured snippets, images, and other SERP features',
      status: 'beta'
    },
    {
      id: 'competitor-tracking',
      title: 'Competitor Rank Monitoring',
      icon: Users,
      description: 'Track competitor keyword performance',
      status: 'active'
    },
    {
      id: 'historical',
      title: 'Historical Rank Data',
      icon: History,
      description: 'Analyze ranking trends over time',
      status: 'active'
    },
    {
      id: 'alerts',
      title: 'Ranking Alerts & Notifications',
      icon: Bell,
      description: 'Get notified of significant ranking changes',
      status: 'beta'
    },
    {
      id: 'reports',
      title: 'Custom Rank Reports',
      icon: FileBarChart,
      description: 'Generate detailed ranking reports',
      status: 'coming-soon'
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

        {activeSubcategory === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1,247</div>
                <p className="text-sm text-muted-foreground">+23 this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Avg. Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">8.4</div>
                <p className="text-sm text-green-600">↑ 1.2 improvement</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top 10 Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">156</div>
                <p className="text-sm text-green-600">+12 this month</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Recent Ranking Changes</CardTitle>
                <CardDescription>Keywords with significant position changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { keyword: 'AI content generator', oldPos: 15, newPos: 8, change: '+7' },
                    { keyword: 'SEO tools comparison', oldPos: 23, newPos: 12, change: '+11' },
                    { keyword: 'digital marketing agency', oldPos: 6, newPos: 4, change: '+2' },
                    { keyword: 'content optimization', oldPos: 3, newPos: 7, change: '-4' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{item.keyword}</span>
                        <p className="text-sm text-muted-foreground">Position: {item.newPos}</p>
                      </div>
                      <Badge variant={item.change.startsWith('+') ? 'default' : 'destructive'}>
                        {item.change}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSubcategory === 'local' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Local Pack Rankings</CardTitle>
                <CardDescription>Your business appearance in local 3-pack</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { location: 'New York, NY', position: 2, keyword: 'digital marketing agency' },
                    { location: 'Los Angeles, CA', position: 1, keyword: 'SEO services' },
                    { location: 'Chicago, IL', position: 3, keyword: 'web design company' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <span className="font-medium">{item.keyword}</span>
                        <p className="text-sm text-muted-foreground">{item.location}</p>
                      </div>
                      <Badge variant="outline">#{item.position}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Performance</CardTitle>
                <CardDescription>Average rankings by location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>New York Metro</span>
                    <span className="font-bold">Avg. 4.2</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Los Angeles Metro</span>
                    <span className="font-bold">Avg. 6.8</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chicago Metro</span>
                    <span className="font-bold">Avg. 5.1</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSubcategory === 'serp-features' && (
          <Card>
            <CardHeader>
              <CardTitle>SERP Features Tracking</CardTitle>
              <CardDescription>Monitor your presence in special search features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { feature: 'Featured Snippets', count: 12, change: '+3' },
                  { feature: 'People Also Ask', count: 8, change: '+2' },
                  { feature: 'Image Pack', count: 5, change: '0' },
                  { feature: 'Local Pack', count: 3, change: '+1' }
                ].map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold">{item.count}</div>
                    <p className="text-sm text-muted-foreground">{item.feature}</p>
                    <Badge variant={item.change.startsWith('+') ? 'default' : 'outline'} className="mt-2">
                      {item.change}
                    </Badge>
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

export default TrackingSubcategories;