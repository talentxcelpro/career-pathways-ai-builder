import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  BarChart3, 
  FileText, 
  Link, 
  Target, 
  PieChart, 
  Brain, 
  Eye 
} from 'lucide-react';

const CompetitorSubcategories = () => {
  const [activeSubcategory, setActiveSubcategory] = useState('discovery');

  const subcategories = [
    {
      id: 'discovery',
      title: 'Competitor Discovery',
      icon: Search,
      description: 'Find and identify your main SEO competitors',
      status: 'active'
    },
    {
      id: 'traffic',
      title: 'Competitor Traffic Analysis',
      icon: BarChart3,
      description: 'Analyze competitor traffic sources and trends',
      status: 'active'
    },
    {
      id: 'content',
      title: 'Competitor Content Analysis',
      icon: FileText,
      description: 'Study competitor content strategies and performance',
      status: 'beta'
    },
    {
      id: 'backlinks',
      title: 'Competitor Backlink Analysis',
      icon: Link,
      description: 'Explore competitor link building strategies',
      status: 'active'
    },
    {
      id: 'keywords',
      title: 'Competitor Keyword Analysis',
      icon: Target,
      description: 'Discover keywords your competitors rank for',
      status: 'active'
    },
    {
      id: 'market-share',
      title: 'Market Share Analysis',
      icon: PieChart,
      description: 'Understand your position in the market',
      status: 'beta'
    },
    {
      id: 'intelligence',
      title: 'Competitive Intelligence Reports',
      icon: Brain,
      description: 'AI-powered competitor insights and recommendations',
      status: 'coming-soon'
    },
    {
      id: 'serp-tracking',
      title: 'SERP Competitor Tracking',
      icon: Eye,
      description: 'Monitor competitor presence in search results',
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

        {activeSubcategory === 'discovery' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Competitors</CardTitle>
                <CardDescription>Based on keyword overlap and market presence</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'SEMrush', overlap: '68%', strength: 'High', domain: 'semrush.com' },
                    { name: 'Ahrefs', overlap: '62%', strength: 'High', domain: 'ahrefs.com' },
                    { name: 'Moz', overlap: '45%', strength: 'Medium', domain: 'moz.com' },
                    { name: 'Screaming Frog', overlap: '34%', strength: 'Medium', domain: 'screamingfrog.co.uk' }
                  ].map((competitor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{competitor.name}</span>
                        <p className="text-sm text-muted-foreground">{competitor.domain}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{competitor.overlap}</div>
                        <Badge variant={competitor.strength === 'High' ? 'destructive' : 'secondary'}>
                          {competitor.strength}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Competitive Landscape</CardTitle>
                <CardDescription>Market positioning overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Market Leaders:</span>
                    <span className="font-bold">3 domains</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Direct Competitors:</span>
                    <span className="font-bold">8 domains</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Emerging Players:</span>
                    <span className="font-bold">12 domains</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Your Market Position:</span>
                    <Badge variant="outline">#4 in niche</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSubcategory === 'traffic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Comparison</CardTitle>
                <CardDescription>Estimated monthly organic traffic</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { competitor: 'SEMrush', traffic: '2.1M', change: '+8%', trend: 'up' },
                    { competitor: 'Ahrefs', traffic: '1.8M', change: '+12%', trend: 'up' },
                    { competitor: 'Your Site', traffic: '245K', change: '+15%', trend: 'up' },
                    { competitor: 'Moz', traffic: '890K', change: '-3%', trend: 'down' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <span className="font-medium">{item.competitor}</span>
                        <p className="text-sm text-muted-foreground">{item.traffic} visits/month</p>
                      </div>
                      <Badge variant={item.trend === 'up' ? 'default' : 'destructive'}>
                        {item.change}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Breakdown of competitor traffic sources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Organic Search:</span>
                    <span className="font-bold">68%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Direct:</span>
                    <span className="font-bold">18%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Referral:</span>
                    <span className="font-bold">8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Social:</span>
                    <span className="font-bold">4%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paid Search:</span>
                    <span className="font-bold">2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSubcategory === 'keywords' && (
          <Card>
            <CardHeader>
              <CardTitle>Competitor Keyword Gaps</CardTitle>
              <CardDescription>Keywords your competitors rank for but you don't</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { keyword: 'seo audit tool', competitor: 'SEMrush', position: 3, volume: '12,100', difficulty: 'Medium' },
                  { keyword: 'keyword research tool', competitor: 'Ahrefs', position: 1, volume: '8,900', difficulty: 'High' },
                  { keyword: 'backlink checker free', competitor: 'Moz', position: 2, volume: '15,600', difficulty: 'Low' },
                  { keyword: 'rank tracking software', competitor: 'SEMrush', position: 4, volume: '5,400', difficulty: 'Medium' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <span className="font-medium">{item.keyword}</span>
                      <p className="text-sm text-muted-foreground">
                        {item.competitor} ranks #{item.position} • {item.volume} searches/month
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        item.difficulty === 'Low' ? 'default' : 
                        item.difficulty === 'Medium' ? 'secondary' : 'destructive'
                      }>
                        {item.difficulty}
                      </Badge>
                      <Button size="sm" variant="outline" className="ml-2">
                        Target
                      </Button>
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

export default CompetitorSubcategories;