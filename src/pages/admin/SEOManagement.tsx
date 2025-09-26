
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SitemapManager } from '@/components/admin/SitemapManager';
import { SEOCronManager } from '@/components/seo/SEOCronManager';
import { MegaSEODashboard } from '@/components/admin/MegaSEODashboard';
import { DomainConnectionGuide } from '@/components/seo/DomainConnectionGuide';
import { SEORecoveryDashboard } from '@/components/seo/SEORecoveryDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Globe, Bot, TrendingUp, AlertTriangle } from 'lucide-react';

const SEOManagement = () => {
  const isCustomDomain = window.location.hostname === 'talentxcel.in';
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      <Helmet>
        <title>SEO Emergency Management - TalentXcel Admin</title>
        <meta name="description" content="Critical SEO recovery for TalentXcel platform - 0 indexed pages detected" />
      </Helmet>

      <div className="flex items-center gap-3 mb-6">
        <Search className="h-8 w-8 text-red-600" />
        <div>
          <h1 className="text-3xl font-bold text-red-600">SEO EMERGENCY Management</h1>
          <p className="text-gray-600">Critical: 0 indexed pages detected - Immediate action required</p>
        </div>
      </div>

      {/* Critical Status Alert */}
      {!isCustomDomain && (
        <Alert className="border-destructive bg-destructive/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>CRITICAL SEO EMERGENCY:</strong> Domain talentxcel.in is not connected. Platform is invisible to search engines with 0 indexed pages.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indexed Pages</CardTitle>
            <Globe className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">0</div>
            <p className="text-xs text-red-600">CRITICAL: No search visibility</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Domain Status</CardTitle>
            <Bot className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {isCustomDomain ? 'Connected' : 'Not Connected'}
            </div>
            <p className="text-xs text-yellow-600">talentxcel.in</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEO Infrastructure</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Ready</div>
            <p className="text-xs text-blue-600">Awaiting domain connection</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recovery" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recovery" className="text-red-600">SEO Recovery</TabsTrigger>
          <TabsTrigger value="domain" className="text-blue-600">Domain Setup</TabsTrigger>
          <TabsTrigger value="infrastructure" className="text-green-600">Infrastructure</TabsTrigger>
          <TabsTrigger value="monitoring" className="text-purple-600">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="recovery">
          <SEORecoveryDashboard />
        </TabsContent>

        <TabsContent value="domain">
          <DomainConnectionGuide />
        </TabsContent>

        <TabsContent value="infrastructure">
          <div className="space-y-6">
            <MegaSEODashboard />
            <SitemapManager />
            <SEOCronManager />
          </div>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>SEO Monitoring Setup</CardTitle>
              <CardDescription>
                Advanced monitoring will be available after domain connection and initial indexing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Monitoring dashboard will activate after domain connection</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Implementation Overview</CardTitle>
          <CardDescription>Current SEO and AI indexing implementation status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-green-600 mb-2">✅ Phase 1: Completed</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Enhanced robots.txt with AI crawler support</li>
                <li>Comprehensive sitemap system with multiple specialized sitemaps</li>
                <li>AI discovery endpoint (/.well-known/ai-index.json)</li>
                <li>Advanced structured data implementation</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">🔄 Phase 2: In Progress</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Automated search engine submission</li>
                <li>Performance optimization with preload hints</li>
                <li>Enhanced internal linking strategy</li>
                <li>SEO monitoring and analytics dashboard</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-600 mb-2">📋 Phase 3: Planned</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Real-time SEO score monitoring</li>
                <li>Competitive SEO analysis</li>
                <li>Advanced schema markup for all content types</li>
                <li>International SEO expansion</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOManagement;
