
import React from 'react';
import { SEOPerformanceDashboard } from '@/components/seo/SEOPerformanceDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Zap, Globe, Search, Download, Settings } from 'lucide-react';

const AdvancedSEOAdmin = () => {
  const seoMetrics = [
    { label: 'Total SEO Pages', value: '68', trend: '+12', icon: Globe, color: 'text-blue-600' },
    { label: 'Avg Page Speed', value: '1.2s', trend: '-0.3s', icon: Zap, color: 'text-green-600' },
    { label: 'Core Web Vitals', value: '94/100', trend: '+6', icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Search Visibility', value: '87%', trend: '+12%', icon: Search, color: 'text-orange-600' },
  ];

  const phaseStatus = [
    { phase: 'Phase 1', name: 'Basic SEO Setup', status: 'completed', pages: 15 },
    { phase: 'Phase 2', name: 'Dynamic Landing Pages', status: 'completed', pages: 24 },
    { phase: 'Phase 3', name: 'Enhanced SEO Features', status: 'completed', pages: 38 },
    { phase: 'Phase 4', name: 'Performance & Advanced SEO', status: 'active', pages: 68 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced SEO Administration</h1>
          <p className="text-gray-600">
            Phase 4: Performance optimization and advanced SEO features dashboard
          </p>
        </div>

        {/* Advanced Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {seoMetrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <p className="text-sm text-green-600 mt-1">
                      {metric.trend} vs last month
                    </p>
                  </div>
                  <metric.icon className={`h-8 w-8 ${metric.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Phase Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>SEO Implementation Phases</CardTitle>
            <CardDescription>
              Progress across all SEO optimization phases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {phaseStatus.map((phase, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant={phase.status === 'completed' ? 'default' : phase.status === 'active' ? 'secondary' : 'outline'}>
                      {phase.phase}
                    </Badge>
                    <div>
                      <h4 className="font-medium">{phase.name}</h4>
                      <p className="text-sm text-gray-600">{phase.pages} SEO pages generated</p>
                    </div>
                  </div>
                  <Badge variant={
                    phase.status === 'completed' ? 'default' : 
                    phase.status === 'active' ? 'secondary' : 'outline'
                  }>
                    {phase.status === 'completed' ? 'Completed' : 
                     phase.status === 'active' ? 'In Progress' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Performance Dashboard */}
        <SEOPerformanceDashboard />

        {/* Phase 4 Features Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Phase 4 - Advanced Features Implemented</CardTitle>
            <CardDescription>
              Latest performance and advanced SEO enhancements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Performance Optimizations</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Lazy Loading Implementation</span>
                    <Badge variant="default">✓ Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Core Web Vitals Monitoring</span>
                    <Badge variant="default">✓ Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Resource Preloading</span>
                    <Badge variant="default">✓ Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Image Optimization</span>
                    <Badge variant="default">✓ Active</Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Advanced SEO Features</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>RSS Feed Generation</span>
                    <Badge variant="default">✓ Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Enhanced Structured Data</span>
                    <Badge variant="default">✓ Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Multi-language Support</span>
                    <Badge variant="default">✓ Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Advanced Robots.txt</span>
                    <Badge variant="default">✓ Active</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedSEOAdmin;
