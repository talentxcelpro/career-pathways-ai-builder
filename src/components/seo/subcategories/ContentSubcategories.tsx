import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  BarChart3, 
  Lightbulb, 
  Copy, 
  RefreshCw, 
  Share2, 
  Calendar, 
  Target 
} from 'lucide-react';

const ContentSubcategories = () => {
  const [activeSubcategory, setActiveSubcategory] = useState('gap-analysis');

  const subcategories = [
    {
      id: 'gap-analysis',
      title: 'Content Gap Analysis',
      icon: Target,
      description: 'Identify content opportunities your competitors are winning with',
      status: 'active'
    },
    {
      id: 'performance',
      title: 'Content Performance Tracking',
      icon: BarChart3,
      description: 'Monitor how your content performs in search results',
      status: 'active'
    },
    {
      id: 'optimization',
      title: 'Content Optimization Suggestions',
      icon: Lightbulb,
      description: 'AI-powered recommendations to improve content rankings',
      status: 'beta'
    },
    {
      id: 'duplicate',
      title: 'Duplicate Content Detection',
      icon: Copy,
      description: 'Find and fix duplicate content issues across your site',
      status: 'active'
    },
    {
      id: 'freshness',
      title: 'Content Freshness Analysis',
      icon: RefreshCw,
      description: 'Analyze content age and update recommendations',
      status: 'active'
    },
    {
      id: 'social',
      title: 'Social Signals Integration',
      icon: Share2,
      description: 'Track social media impact on content performance',
      status: 'beta'
    },
    {
      id: 'calendar',
      title: 'Content Calendar & Planning',
      icon: Calendar,
      description: 'Plan and schedule content for maximum SEO impact',
      status: 'coming-soon'
    },
    {
      id: 'clustering',
      title: 'Topic Clustering',
      icon: FileText,
      description: 'Group related content for topical authority building',
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

        {activeSubcategory === 'gap-analysis' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Gaps Found</CardTitle>
                <CardDescription>Topics your competitors rank for but you don't</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">AI automation tools</span>
                    <Badge variant="destructive">High Priority</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Remote work productivity</span>
                    <Badge variant="secondary">Medium Priority</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Digital marketing trends 2024</span>
                    <Badge variant="outline">Low Priority</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Opportunities</CardTitle>
                <CardDescription>Estimated traffic potential</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Potential monthly traffic:</span>
                    <span className="font-bold">25,400 visits</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average difficulty:</span>
                    <span className="font-bold">Medium (45/100)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Content pieces needed:</span>
                    <span className="font-bold">12 articles</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSubcategory === 'performance' && (
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>Your best content by organic traffic</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'Complete Guide to SEO in 2024', traffic: '15,200', change: '+12%' },
                  { title: 'Best AI Tools for Content Creation', traffic: '8,900', change: '+8%' },
                  { title: 'Digital Marketing Strategy Framework', traffic: '6,500', change: '-3%' }
                ].map((content, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{content.title}</h4>
                      <p className="text-sm text-muted-foreground">Monthly organic traffic: {content.traffic}</p>
                    </div>
                    <Badge variant={content.change.startsWith('+') ? 'default' : 'destructive'}>
                      {content.change}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeSubcategory === 'optimization' && (
          <Card>
            <CardHeader>
              <CardTitle>AI Optimization Suggestions</CardTitle>
              <CardDescription>Powered by advanced SEO algorithms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-l-primary bg-muted/50 rounded-r-lg">
                  <h4 className="font-semibold">Add FAQ Section</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Adding FAQ sections to your top 5 pages could increase featured snippet chances by 40%
                  </p>
                  <Button size="sm" className="mt-2">Apply Suggestion</Button>
                </div>
                <div className="p-4 border-l-4 border-l-yellow-500 bg-muted/50 rounded-r-lg">
                  <h4 className="font-semibold">Optimize Title Tags</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    12 pages have title tags longer than 60 characters
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">Review Pages</Button>
                </div>
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

export default ContentSubcategories;