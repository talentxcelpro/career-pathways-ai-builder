import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Link, 
  Search, 
  AlertTriangle, 
  Users, 
  Mail, 
  ArrowUpDown, 
  TrendingUp, 
  Trash2
} from 'lucide-react';

export const BacklinkSubcategories = () => {
  const [activeSubTab, setActiveSubTab] = useState('profile');

  const subcategories = [
    { id: 'profile', label: 'Backlink Profile', icon: Link, desc: 'Analyze link profile' },
    { id: 'opportunities', label: 'Link Opportunities', icon: Search, desc: 'Find link prospects' },
    { id: 'toxic', label: 'Toxic Links', icon: AlertTriangle, desc: 'Identify harmful links' },
    { id: 'competitor', label: 'Competitor Links', icon: Users, desc: 'Competitor analysis' },
    { id: 'outreach', label: 'Link Outreach', icon: Mail, desc: 'Outreach campaigns' },
    { id: 'internal', label: 'Internal Links', icon: ArrowUpDown, desc: 'Internal linking' },
    { id: 'velocity', label: 'Link Velocity', icon: TrendingUp, desc: 'Link growth tracking' },
    { id: 'disavow', label: 'Disavow Manager', icon: Trash2, desc: 'Disavow file management' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {subcategories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeSubTab === cat.id ? "default" : "outline"}
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => setActiveSubTab(cat.id)}
          >
            <cat.icon className="h-6 w-6" />
            <div className="text-center">
              <div className="font-semibold text-sm">{cat.label}</div>
              <div className="text-xs text-muted-foreground">{cat.desc}</div>
            </div>
          </Button>
        ))}
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsContent value="profile">
          <BacklinkProfileComponent />
        </TabsContent>
        <TabsContent value="opportunities">
          <LinkOpportunitiesComponent />
        </TabsContent>
        <TabsContent value="toxic">
          <ToxicLinksComponent />
        </TabsContent>
        <TabsContent value="competitor">
          <CompetitorLinksComponent />
        </TabsContent>
        <TabsContent value="outreach">
          <LinkOutreachComponent />
        </TabsContent>
        <TabsContent value="internal">
          <InternalLinksComponent />
        </TabsContent>
        <TabsContent value="velocity">
          <LinkVelocityComponent />
        </TabsContent>
        <TabsContent value="disavow">
          <DisavowManagerComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const BacklinkProfileComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Link className="h-5 w-5" />
        Backlink Profile Analysis
      </CardTitle>
      <CardDescription>Comprehensive analysis of your backlink profile</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Link Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { metric: 'Total Backlinks', value: '12,547', change: '+234' },
                { metric: 'Referring Domains', value: '1,423', change: '+18' },
                { metric: 'Authority Score', value: '68/100', change: '+2' },
                { metric: 'Spam Score', value: '8%', change: '-1%' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <div>
                    <div className="font-medium text-sm">{item.metric}</div>
                    <div className="text-xs text-muted-foreground">{item.change} this month</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Link Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { type: 'DoFollow Links', count: 9823, percentage: 78 },
                { type: 'NoFollow Links', count: 2724, percentage: 22 },
                { type: 'Text Links', count: 11205, percentage: 89 },
                { type: 'Image Links', count: 1342, percentage: 11 }
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.type}</span>
                    <span className="font-medium">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.count.toLocaleString()} links
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Top Anchor Texts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { anchor: 'TalentXcel', count: 1456, type: 'brand' },
                { anchor: 'resume builder', count: 892, type: 'keyword' },
                { anchor: 'click here', count: 567, type: 'generic' },
                { anchor: 'career platform', count: 423, type: 'keyword' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <div>
                    <div className="font-medium text-sm">{item.anchor}</div>
                    <div className="text-xs text-muted-foreground">{item.count} occurrences</div>
                  </div>
                  <Badge variant={
                    item.type === 'brand' ? 'default' : 
                    item.type === 'keyword' ? 'secondary' : 'outline'
                  }>
                    {item.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </CardContent>
  </Card>
);

const LinkOpportunitiesComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Search className="h-5 w-5" />
        Link Building Opportunities
      </CardTitle>
      <CardDescription>Discover high-quality link building prospects</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">High Authority Prospects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { domain: 'linkedin.com/pulse', authority: 95, type: 'Guest Post', status: 'new' },
                { domain: 'medium.com/@careers', authority: 88, type: 'Resource Page', status: 'contacted' },
                { domain: 'indeed.com/career-advice', authority: 92, type: 'Link Insert', status: 'pending' },
                { domain: 'glassdoor.com/blog', authority: 87, type: 'Guest Post', status: 'new' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <div>
                    <div className="font-medium text-sm">{item.domain}</div>
                    <div className="text-xs text-muted-foreground">Authority: {item.authority} • {item.type}</div>
                  </div>
                  <Badge variant={
                    item.status === 'new' ? 'default' : 
                    item.status === 'contacted' ? 'secondary' : 'outline'
                  }>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Content Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { topic: 'Remote Work Best Practices', potential: 15, difficulty: 'Medium' },
                { topic: 'AI in Career Development', potential: 23, difficulty: 'High' },
                { topic: 'Resume Writing Tips 2024', potential: 18, difficulty: 'Low' },
                { topic: 'Interview Preparation Guide', potential: 12, difficulty: 'Low' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <div>
                    <div className="font-medium text-sm">{item.topic}</div>
                    <div className="text-xs text-muted-foreground">{item.potential} potential links</div>
                  </div>
                  <Badge variant={
                    item.difficulty === 'Low' ? 'default' : 
                    item.difficulty === 'Medium' ? 'secondary' : 'outline'
                  }>
                    {item.difficulty}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </CardContent>
  </Card>
);

const ToxicLinksComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        Toxic Link Detection
      </CardTitle>
      <CardDescription>Identify and manage potentially harmful backlinks</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Toxic Link Analysis Coming Soon</h3>
        <p className="text-muted-foreground">Advanced toxic link detection and management</p>
      </div>
    </CardContent>
  </Card>
);

const CompetitorLinksComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        Competitor Link Analysis
      </CardTitle>
      <CardDescription>Analyze competitor backlink strategies</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Competitor Analysis Coming Soon</h3>
        <p className="text-muted-foreground">Comprehensive competitor backlink intelligence</p>
      </div>
    </CardContent>
  </Card>
);

const LinkOutreachComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Mail className="h-5 w-5" />
        Link Building Outreach
      </CardTitle>
      <CardDescription>Manage outreach campaigns and communications</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Outreach Manager Coming Soon</h3>
        <p className="text-muted-foreground">Advanced outreach campaign management</p>
      </div>
    </CardContent>
  </Card>
);

const InternalLinksComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <ArrowUpDown className="h-5 w-5" />
        Internal Link Optimization
      </CardTitle>
      <CardDescription>Optimize internal linking structure</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <ArrowUpDown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Internal Links Coming Soon</h3>
        <p className="text-muted-foreground">Internal linking optimization tools</p>
      </div>
    </CardContent>
  </Card>
);

const LinkVelocityComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        Link Velocity Tracking
      </CardTitle>
      <CardDescription>Monitor link acquisition rate and trends</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Velocity Tracking Coming Soon</h3>
        <p className="text-muted-foreground">Link growth rate monitoring and analysis</p>
      </div>
    </CardContent>
  </Card>
);

const DisavowManagerComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Trash2 className="h-5 w-5" />
        Disavow File Management
      </CardTitle>
      <CardDescription>Manage Google disavow files and toxic link removal</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Disavow Manager Coming Soon</h3>
        <p className="text-muted-foreground">Automated disavow file generation and management</p>
      </div>
    </CardContent>
  </Card>
);