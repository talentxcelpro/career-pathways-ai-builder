import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Helmet } from 'react-helmet-async';
import { BarChart3, TrendingUp, Eye, Download, Share2 } from 'lucide-react';

const ResumeAnalytics = () => {
  return (
    <>
      <Helmet>
        <title>Resume Analytics | TalentXcel Resume Builder</title>
        <meta name="description" content="Track your resume performance and insights" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Resume Analytics</h1>
            <p className="text-muted-foreground">Track performance and get insights</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">1,234</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      +12% from last month
                    </p>
                  </div>
                  <Eye className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Downloads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">89</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      +23% from last month
                    </p>
                  </div>
                  <Download className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Shares
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">45</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      +8% from last month
                    </p>
                  </div>
                  <Share2 className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  ATS Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-green-600">85%</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Excellent compatibility
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>
                Advanced analytics features are being developed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Resume view tracking by company and location</li>
                <li>• Application response rates</li>
                <li>• Keyword performance analysis</li>
                <li>• Industry benchmarking</li>
                <li>• Export detailed reports</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ResumeAnalytics;