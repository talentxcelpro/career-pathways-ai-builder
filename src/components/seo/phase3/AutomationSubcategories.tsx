import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Search, 
  FileText, 
  Link, 
  BarChart3, 
  Settings, 
  Users, 
  Bell, 
  Zap 
} from 'lucide-react';

const AutomationSubcategories = () => {
  const [activeSubcategory, setActiveSubcategory] = useState('keyword-discovery');

  const subcategories = [
    {
      id: 'keyword-discovery',
      title: 'Automated Keyword Discovery',
      icon: Search,
      description: 'Automatically find and track new keyword opportunities',
      status: 'active'
    },
    {
      id: 'content-optimization',
      title: 'Automated Content Optimization',
      icon: FileText,
      description: 'Auto-optimize content for better search performance',
      status: 'beta'
    },
    {
      id: 'link-building',
      title: 'Automated Link Building',
      icon: Link,
      description: 'Streamline outreach and link building processes',
      status: 'beta'
    },
    {
      id: 'reporting',
      title: 'Automated Reporting',
      icon: BarChart3,
      description: 'Generate and send reports automatically',
      status: 'active'
    },
    {
      id: 'technical-audits',
      title: 'Automated Technical Audits',
      icon: Settings,
      description: 'Regular automated site health checks',
      status: 'active'
    },
    {
      id: 'competitor-monitoring',
      title: 'Automated Competitor Monitoring',
      icon: Users,
      description: 'Track competitor changes and opportunities',
      status: 'coming-soon'
    },
    {
      id: 'alert-systems',
      title: 'Automated Alert Systems',
      icon: Bell,
      description: 'Smart notifications for important SEO events',
      status: 'active'
    },
    {
      id: 'workflow-automation',
      title: 'Workflow Automation',
      icon: Zap,
      description: 'Create custom automated SEO workflows',
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

        {activeSubcategory === 'keyword-discovery' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Automated Discovery Settings</CardTitle>
                <CardDescription>Configure automatic keyword discovery rules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Enable Auto-Discovery</span>
                    <p className="text-sm text-muted-foreground">Find new keywords weekly</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Competitor Keyword Monitoring</span>
                    <p className="text-sm text-muted-foreground">Track competitor new keywords</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Long-tail Suggestions</span>
                    <p className="text-sm text-muted-foreground">Discover long-tail opportunities</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Seasonal Keyword Detection</span>
                    <p className="text-sm text-muted-foreground">Find seasonal opportunities</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Discovery Filters</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Min. Search Volume:</span>
                      <span className="font-medium">500/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max. Keyword Difficulty:</span>
                      <span className="font-medium">70/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discovery Frequency:</span>
                      <span className="font-medium">Weekly</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Discoveries</CardTitle>
                <CardDescription>New keywords found automatically</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { keyword: 'AI content writing assistant', volume: '2,900', difficulty: 42, discovered: '2 days ago' },
                    { keyword: 'automated SEO tools', volume: '1,600', difficulty: 55, discovered: '3 days ago' },
                    { keyword: 'content optimization software', volume: '890', difficulty: 38, discovered: '5 days ago' },
                    { keyword: 'SEO automation platform', volume: '1,200', difficulty: 48, discovered: '1 week ago' }
                  ].map((keyword, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{keyword.keyword}</span>
                        <Badge variant="outline">New</Badge>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{keyword.volume} searches/month</span>
                        <span>Difficulty: {keyword.difficulty}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">{keyword.discovered}</span>
                        <Button size="sm" variant="outline">Track</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSubcategory === 'reporting' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Automated Reports</CardTitle>
                <CardDescription>Configure automatic report generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Weekly Ranking Report', frequency: 'Weekly', recipients: 'team@company.com', enabled: true },
                  { name: 'Monthly SEO Summary', frequency: 'Monthly', recipients: 'management@company.com', enabled: true },
                  { name: 'Competitor Analysis', frequency: 'Bi-weekly', recipients: 'seo@company.com', enabled: false },
                  { name: 'Technical Audit Report', frequency: 'Monthly', recipients: 'dev@company.com', enabled: true }
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">{report.name}</span>
                      <p className="text-sm text-muted-foreground">{report.frequency} • {report.recipients}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch defaultChecked={report.enabled} />
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                  </div>
                ))}
                
                <Button className="w-full mt-4">Create New Automated Report</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report Delivery Stats</CardTitle>
                <CardDescription>Automated report performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">48</div>
                      <div className="text-sm text-muted-foreground">Reports Sent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">96%</div>
                      <div className="text-sm text-muted-foreground">Delivery Rate</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Recent Deliveries</h4>
                    {[
                      { report: 'Weekly Ranking Report', sent: '2 hours ago', status: 'Delivered' },
                      { report: 'Monthly SEO Summary', sent: '1 day ago', status: 'Delivered' },
                      { report: 'Technical Audit Report', sent: '3 days ago', status: 'Delivered' }
                    ].map((delivery, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="text-sm">{delivery.report}</span>
                        <div className="text-right">
                          <Badge variant="default">{delivery.status}</Badge>
                          <p className="text-xs text-muted-foreground">{delivery.sent}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSubcategory === 'technical-audits' && (
          <Card>
            <CardHeader>
              <CardTitle>Automated Technical Audits</CardTitle>
              <CardDescription>Regular automated website health monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Audit Schedule</h4>
                  {[
                    { check: 'Page Speed Analysis', frequency: 'Daily', lastRun: '2 hours ago', status: 'Healthy' },
                    { check: 'Broken Links Check', frequency: 'Weekly', lastRun: '1 day ago', status: 'Issues Found' },
                    { check: 'Meta Tags Audit', frequency: 'Weekly', lastRun: '3 days ago', status: 'Healthy' },
                    { check: 'Mobile Usability', frequency: 'Daily', lastRun: '4 hours ago', status: 'Healthy' },
                    { check: 'Core Web Vitals', frequency: 'Daily', lastRun: '1 hour ago', status: 'Warning' }
                  ].map((audit, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{audit.check}</span>
                        <p className="text-sm text-muted-foreground">{audit.frequency} • Last run: {audit.lastRun}</p>
                      </div>
                      <Badge variant={
                        audit.status === 'Healthy' ? 'default' :
                        audit.status === 'Warning' ? 'secondary' : 'destructive'
                      }>
                        {audit.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Recent Issues Detected</h4>
                  {[
                    { issue: '3 pages with slow load times detected', severity: 'High', detected: '2 hours ago' },
                    { issue: '5 broken internal links found', severity: 'Medium', detected: '1 day ago' },
                    { issue: 'Missing alt text on 12 images', severity: 'Low', detected: '2 days ago' }
                  ].map((issue, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">{issue.issue}</span>
                        <Badge variant={
                          issue.severity === 'High' ? 'destructive' :
                          issue.severity === 'Medium' ? 'secondary' : 'outline'
                        }>
                          {issue.severity}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{issue.detected}</span>
                        <Button size="sm" variant="outline">Fix</Button>
                      </div>
                    </div>
                  ))}
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

export default AutomationSubcategories;