
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SitemapManager } from '@/components/seo/SitemapManager';
import { SEOCronManager } from '@/components/seo/SEOCronManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Globe, Bot, TrendingUp } from 'lucide-react';

const SEOManagement = () => {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <Helmet>
        <title>SEO Management - TalentXcel Admin</title>
        <meta name="description" content="Manage SEO settings, sitemaps, and search engine optimization for TalentXcel platform" />
      </Helmet>

      <div className="flex items-center gap-3 mb-6">
        <Search className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">SEO Management</h1>
          <p className="text-gray-600">Comprehensive search engine and AI indexing optimization</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Search Engine Visibility</CardTitle>
            <Globe className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Excellent</div>
            <p className="text-xs text-gray-600">Google, Bing, DuckDuckGo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Crawler Support</CardTitle>
            <Bot className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-gray-600">GPT, Claude, Perplexity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEO Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">95%</div>
            <p className="text-xs text-gray-600">Optimization Score</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <SEOCronManager />
        <SitemapManager />
      </div>

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
