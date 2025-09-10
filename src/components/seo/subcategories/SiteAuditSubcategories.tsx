import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  FileText, 
  Zap, 
  Smartphone, 
  Shield, 
  Lock, 
  Code, 
  Globe
} from 'lucide-react';

export const SiteAuditSubcategories = () => {
  const [activeSubTab, setActiveSubTab] = useState('technical');

  const subcategories = [
    { id: 'technical', label: 'Technical SEO', icon: Settings, desc: 'Core technical issues' },
    { id: 'onpage', label: 'On-Page SEO', icon: FileText, desc: 'Content optimization' },
    { id: 'vitals', label: 'Core Web Vitals', icon: Zap, desc: 'Performance metrics' },
    { id: 'mobile', label: 'Mobile-First', icon: Smartphone, desc: 'Mobile optimization' },
    { id: 'accessibility', label: 'Accessibility', icon: Shield, desc: 'User accessibility' },
    { id: 'security', label: 'Security & HTTPS', icon: Lock, desc: 'Security analysis' },
    { id: 'structured', label: 'Structured Data', icon: Code, desc: 'Schema validation' },
    { id: 'international', label: 'International SEO', icon: Globe, desc: 'Multi-language' }
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
        <TabsContent value="technical">
          <TechnicalSEOComponent />
        </TabsContent>
        <TabsContent value="onpage">
          <OnPageSEOComponent />
        </TabsContent>
        <TabsContent value="vitals">
          <CoreWebVitalsComponent />
        </TabsContent>
        <TabsContent value="mobile">
          <MobileFirstComponent />
        </TabsContent>
        <TabsContent value="accessibility">
          <AccessibilityComponent />
        </TabsContent>
        <TabsContent value="security">
          <SecurityComponent />
        </TabsContent>
        <TabsContent value="structured">
          <StructuredDataComponent />
        </TabsContent>
        <TabsContent value="international">
          <InternationalSEOComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const TechnicalSEOComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Settings className="h-5 w-5" />
        Technical SEO Audit
      </CardTitle>
      <CardDescription>Comprehensive technical SEO analysis</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Crawlability Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { issue: 'Broken internal links', count: 12, severity: 'high' },
                { issue: 'Missing robots.txt', count: 1, severity: 'medium' },
                { issue: 'Blocked by robots', count: 3, severity: 'low' },
                { issue: 'Redirect chains', count: 8, severity: 'medium' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <div>
                    <div className="font-medium text-sm">{item.issue}</div>
                    <div className="text-xs text-muted-foreground">{item.count} found</div>
                  </div>
                  <Badge variant={
                    item.severity === 'high' ? 'destructive' : 
                    item.severity === 'medium' ? 'secondary' : 'outline'
                  }>
                    {item.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Indexing Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { status: 'Indexed Pages', count: 1247, color: 'bg-green-500' },
                { status: 'Pending Index', count: 23, color: 'bg-yellow-500' },
                { status: 'Blocked Pages', count: 8, color: 'bg-red-500' },
                { status: 'Error Pages', count: 5, color: 'bg-red-500' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  <span className="text-sm font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Site Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { metric: 'Page Load Time', value: '2.1s', status: 'good' },
                { metric: 'First Contentful Paint', value: '1.2s', status: 'good' },
                { metric: 'Time to Interactive', value: '3.4s', status: 'needs improvement' },
                { metric: 'Cumulative Layout Shift', value: '0.05', status: 'good' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <div>
                    <div className="font-medium text-sm">{item.metric}</div>
                    <div className="text-xs text-muted-foreground">{item.value}</div>
                  </div>
                  <Badge variant={item.status === 'good' ? 'default' : 'secondary'}>
                    {item.status === 'good' ? '✓' : '⚠'}
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

const OnPageSEOComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <FileText className="h-5 w-5" />
        On-Page SEO Analysis
      </CardTitle>
      <CardDescription>Content and on-page optimization analysis</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Meta Tag Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { element: 'Title Tags', optimized: 890, total: 920, percentage: 97 },
                { element: 'Meta Descriptions', optimized: 845, total: 920, percentage: 92 },
                { element: 'H1 Tags', optimized: 912, total: 920, percentage: 99 },
                { element: 'Alt Text', optimized: 1250, total: 1420, percentage: 88 }
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.element}</span>
                    <span className="font-medium">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.optimized} of {item.total} optimized
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Content Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { metric: 'Average Word Count', value: '1,245', benchmark: '1,000+', status: 'good' },
                { metric: 'Keyword Density', value: '2.3%', benchmark: '1-3%', status: 'good' },
                { metric: 'Readability Score', value: '72', benchmark: '60+', status: 'good' },
                { metric: 'Internal Links/Page', value: '8.5', benchmark: '5+', status: 'good' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <div>
                    <div className="font-medium text-sm">{item.metric}</div>
                    <div className="text-xs text-muted-foreground">Benchmark: {item.benchmark}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">{item.value}</div>
                    <Badge variant="default">✓</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </CardContent>
  </Card>
);

// Placeholder components for other subcategories
const CoreWebVitalsComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Zap className="h-5 w-5" />
        Core Web Vitals Monitoring
      </CardTitle>
      <CardDescription>Real-time performance metrics tracking</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Core Web Vitals Coming Soon</h3>
        <p className="text-muted-foreground">Real-time performance monitoring dashboard</p>
      </div>
    </CardContent>
  </Card>
);

const MobileFirstComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Smartphone className="h-5 w-5" />
        Mobile-First Audit
      </CardTitle>
      <CardDescription>Mobile optimization analysis</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Mobile Audit Coming Soon</h3>
        <p className="text-muted-foreground">Comprehensive mobile optimization analysis</p>
      </div>
    </CardContent>
  </Card>
);

const AccessibilityComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Shield className="h-5 w-5" />
        Accessibility Audit
      </CardTitle>
      <CardDescription>WCAG compliance and accessibility analysis</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Accessibility Audit Coming Soon</h3>
        <p className="text-muted-foreground">WCAG compliance checking and analysis</p>
      </div>
    </CardContent>
  </Card>
);

const SecurityComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Lock className="h-5 w-5" />
        Security & HTTPS Check
      </CardTitle>
      <CardDescription>Security analysis and HTTPS implementation</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Security Check Coming Soon</h3>
        <p className="text-muted-foreground">Comprehensive security and HTTPS analysis</p>
      </div>
    </CardContent>
  </Card>
);

const StructuredDataComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Code className="h-5 w-5" />
        Structured Data Validation
      </CardTitle>
      <CardDescription>Schema markup analysis and validation</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Structured Data Coming Soon</h3>
        <p className="text-muted-foreground">Schema markup validation and optimization</p>
      </div>
    </CardContent>
  </Card>
);

const InternationalSEOComponent = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Globe className="h-5 w-5" />
        International SEO Audit
      </CardTitle>
      <CardDescription>Multi-language and international optimization</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">International SEO Coming Soon</h3>
        <p className="text-muted-foreground">Multi-language and hreflang analysis</p>
      </div>
    </CardContent>
  </Card>
);