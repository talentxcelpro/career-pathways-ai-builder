
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdvancedSEOAnalytics } from '@/components/seo/AdvancedSEOAnalytics';
import { SEOAutomation } from '@/components/seo/SEOAutomation';
import { InteractiveSEOLandingPages } from '@/components/seo/InteractiveSEOLandingPages';
import { SEOContentCalendar } from '@/components/seo/SEOContentCalendar';
import { 
  BarChart3, 
  Bot, 
  Globe, 
  Calendar, 
  TrendingUp, 
  Users, 
  Search, 
  Target,
  Zap,
  Eye,
  MousePointer,
  Clock
} from 'lucide-react';

const Phase5SEOAdmin = () => {
  const phase5Stats = [
    { label: 'Advanced Analytics', value: 'Active', icon: <BarChart3 className="h-4 w-4" />, status: 'success' },
    { label: 'SEO Automation', value: '8 Rules', icon: <Bot className="h-4 w-4" />, status: 'success' },
    { label: 'Interactive Pages', value: '24 Pages', icon: <Globe className="h-4 w-4" />, status: 'success' },
    { label: 'Content Calendar', value: '15 Tasks', icon: <Calendar className="h-4 w-4" />, status: 'success' },
  ];

  const performanceMetrics = [
    { label: 'Total Impressions', value: '2.1M', change: '+34%', icon: <Eye className="h-5 w-5" /> },
    { label: 'Organic Clicks', value: '156K', change: '+28%', icon: <MousePointer className="h-5 w-5" /> },
    { label: 'Avg Position', value: '3.2', change: '-0.8', icon: <Target className="h-5 w-5" /> },
    { label: 'CTR', value: '7.4%', change: '+1.2%', icon: <TrendingUp className="h-5 w-5" /> },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-blue-600" />
            Phase 5 - Advanced SEO & Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            Advanced analytics, automation, and interactive SEO landing pages
          </p>
        </div>
        <Badge variant="default" className="px-4 py-2">
          Phase 5 Complete
        </Badge>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {phase5Stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Phase 5 Performance Impact</CardTitle>
          <CardDescription>
            SEO performance improvements since implementing Phase 5 features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {metric.icon}
                </div>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="text-sm text-gray-600">{metric.label}</div>
                <div className={`text-sm font-medium ${
                  metric.change.startsWith('+') ? 'text-green-600' : 
                  metric.change.startsWith('-') && metric.label === 'Avg Position' ? 'text-green-600' : 
                  'text-red-600'
                }`}>
                  {metric.change} vs baseline
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Advanced Analytics
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            SEO Automation
          </TabsTrigger>
          <TabsTrigger value="landing-pages" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Interactive Pages
          </TabsTrigger>
          <TabsTrigger value="content-calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Content Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <AdvancedSEOAnalytics />
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <SEOAutomation />
        </TabsContent>

        <TabsContent value="landing-pages" className="space-y-4">
          <InteractiveSEOLandingPages />
        </TabsContent>

        <TabsContent value="content-calendar" className="space-y-4">
          <SEOContentCalendar />
        </TabsContent>
      </Tabs>

      {/* Feature Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Phase 5 Features Summary</CardTitle>
          <CardDescription>
            Complete overview of all Phase 5 SEO enhancements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Advanced Analytics</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Real-time SEO performance tracking
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Keyword ranking monitoring
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Competitor analysis dashboard
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Traffic source analysis
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">SEO Automation</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Automated meta tag optimization
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Dynamic sitemap updates
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  AI-powered content suggestions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Performance alerts system
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Interactive Landing Pages</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Enhanced user experience
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Dynamic content personalization
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Interactive search and filtering
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Mobile-first design
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Content Strategy</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  SEO content calendar
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  AI content suggestions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Content gap analysis
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Performance tracking
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Phase5SEOAdmin;
