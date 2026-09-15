import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Presentation, 
  Settings, 
  FileText, 
  TrendingUp, 
  Link, 
  Users, 
  Wrench, 
  Calendar 
} from 'lucide-react';

const ReportsSubcategories = () => {
  const [activeSubcategory, setActiveSubcategory] = useState('executive');

  const subcategories = [
    {
      id: 'executive',
      title: 'Executive Summary Reports',
      icon: Presentation,
      description: 'High-level SEO performance overview for stakeholders',
      status: 'active'
    },
    {
      id: 'technical',
      title: 'Technical SEO Reports',
      icon: Settings,
      description: 'Detailed technical SEO audit and recommendations',
      status: 'active'
    },
    {
      id: 'content',
      title: 'Content Performance Reports',
      icon: FileText,
      description: 'Content analytics and optimization insights',
      status: 'active'
    },
    {
      id: 'ranking',
      title: 'Ranking Reports',
      icon: TrendingUp,
      description: 'Keyword ranking progress and trends',
      status: 'active'
    },
    {
      id: 'backlink',
      title: 'Backlink Reports',
      icon: Link,
      description: 'Link profile analysis and link building progress',
      status: 'beta'
    },
    {
      id: 'competitor',
      title: 'Competitor Analysis Reports',
      icon: Users,
      description: 'Competitive landscape and opportunity analysis',
      status: 'beta'
    },
    {
      id: 'custom',
      title: 'Custom Report Builder',
      icon: Wrench,
      description: 'Build custom reports with specific metrics',
      status: 'coming-soon'
    },
    {
      id: 'automated',
      title: 'Automated Report Scheduling',
      icon: Calendar,
      description: 'Schedule and automate report delivery',
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

        {activeSubcategory === 'executive' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Metrics</CardTitle>
                <CardDescription>Monthly SEO performance summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Organic Traffic Growth</span>
                    <Badge variant="default">+24%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Keyword Rankings Improved</span>
                    <Badge variant="default">+156</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>New Backlinks Acquired</span>
                    <Badge variant="default">+23</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Technical Issues Resolved</span>
                    <Badge variant="default">12</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
                <CardDescription>Pre-built executive report formats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Monthly Executive Summary', frequency: 'Monthly', status: 'Active' },
                    { name: 'Quarterly Business Review', frequency: 'Quarterly', status: 'Active' },
                    { name: 'Campaign Performance Report', frequency: 'Weekly', status: 'Draft' }
                  ].map((template, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{template.name}</span>
                        <p className="text-sm text-muted-foreground">{template.frequency}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{template.status}</Badge>
                        <Button size="sm">Generate</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSubcategory === 'technical' && (
          <Card>
            <CardHeader>
              <CardTitle>Technical SEO Audit Report</CardTitle>
              <CardDescription>Comprehensive technical analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Site Health Score</h4>
                  <div className="text-4xl font-bold text-green-600">87/100</div>
                  <p className="text-sm text-muted-foreground">+5 points this month</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Critical Issues</h4>
                  <div className="text-4xl font-bold text-red-600">3</div>
                  <p className="text-sm text-muted-foreground">Requires immediate attention</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Warnings</h4>
                  <div className="text-4xl font-bold text-yellow-600">12</div>
                  <p className="text-sm text-muted-foreground">Should be addressed soon</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <h4 className="font-semibold">Top Issues to Fix</h4>
                {[
                  { issue: 'Missing meta descriptions', count: 15, priority: 'High' },
                  { issue: 'Slow page load times', count: 8, priority: 'Critical' },
                  { issue: 'Broken internal links', count: 6, priority: 'Medium' },
                  { issue: 'Missing alt text', count: 23, priority: 'Medium' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">{item.issue}</span>
                      <p className="text-sm text-muted-foreground">{item.count} pages affected</p>
                    </div>
                    <Badge variant={
                      item.priority === 'Critical' ? 'destructive' :
                      item.priority === 'High' ? 'secondary' : 'outline'
                    }>
                      {item.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeSubcategory === 'ranking' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ranking Progress</CardTitle>
                <CardDescription>Keyword performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Keywords in Top 3:</span>
                    <span className="font-bold">45 (+8)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Keywords in Top 10:</span>
                    <span className="font-bold">156 (+23)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Keywords in Top 50:</span>
                    <span className="font-bold">423 (+67)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Tracked Keywords:</span>
                    <span className="font-bold">1,247</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Keywords</CardTitle>
                <CardDescription>Best ranking improvements this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { keyword: 'AI content generator', position: 3, improvement: '+12' },
                    { keyword: 'SEO audit tool', position: 7, improvement: '+8' },
                    { keyword: 'keyword research', position: 5, improvement: '+15' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <span className="font-medium">{item.keyword}</span>
                        <p className="text-sm text-muted-foreground">Position #{item.position}</p>
                      </div>
                      <Badge variant="default">{item.improvement}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
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

export default ReportsSubcategories;