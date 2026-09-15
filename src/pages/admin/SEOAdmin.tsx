
import React from 'react';
import { SEODashboard } from '@/components/seo/SEODashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, Globe, Users } from 'lucide-react';

const SEOAdmin = () => {
  const quickStats = [
    { label: 'SEO Landing Pages', value: 38, icon: Globe, color: 'text-blue-600' },
    { label: 'Indexed URLs', value: '12.5K', icon: Search, color: 'text-green-600' },
    { label: 'Monthly Organic Traffic', value: '45K', icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Conversion Rate', value: '3.2%', icon: Users, color: 'text-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SEO Administration</h1>
          <p className="text-gray-600">
            Comprehensive SEO management dashboard for TalentXcel platform
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main SEO Dashboard */}
        <SEODashboard />

        {/* SEO Strategy Overview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>SEO Strategy Overview</CardTitle>
            <CardDescription>
              Current SEO implementation and future roadmap
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Implemented Features</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Dynamic SEO Landing Pages</span>
                    <Badge variant="default">Live</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Enhanced Structured Data</span>
                    <Badge variant="default">Live</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Advanced Sitemap Generation</span>
                    <Badge variant="default">Live</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Multi-language Support</span>
                    <Badge variant="default">Live</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Image SEO Optimization</span>
                    <Badge variant="default">Live</Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Landing Page Categories</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Jobs by Location (8 cities)</span>
                    <Badge variant="outline">38 URLs</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Jobs by Role (6 roles)</span>
                    <Badge variant="outline">6 URLs</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Jobs by Skill (6 skills)</span>
                    <Badge variant="outline">6 URLs</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Companies by Location</span>
                    <Badge variant="outline">8 URLs</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Course Categories</span>
                    <Badge variant="outline">6 URLs</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Salary Guides</span>
                    <Badge variant="outline">4 URLs</Badge>
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

export default SEOAdmin;
