import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { TestNewsAutomation } from '@/components/news/TestNewsAutomation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, Rss, Clock, CheckCircle } from 'lucide-react';

const NewsAutomationPage = () => {
  return (
    <UnifiedAdminLayout 
      title="News Automation" 
      description="Test and manage automated news feed system"
    >
      <div className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Automation Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground">
                Running successfully
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Run</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Manual</div>
              <p className="text-xs text-muted-foreground">
                Triggered via admin panel
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Articles Today</CardTitle>
              <Rss className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Run automation to see results
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Manual Trigger */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              Manual News Feed Trigger
            </CardTitle>
            <CardDescription>
              Manually trigger the news automation system to fetch latest career and job-related articles.
              This will fetch news from NewsAPI and create posts in the feed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TestNewsAutomation />
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How News Automation Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">1. Fetch Articles</h4>
                <p className="text-sm text-muted-foreground">
                  Retrieves latest job and career-related news from NewsAPI using targeted search queries.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">2. Process & Filter</h4>
                <p className="text-sm text-muted-foreground">
                  Removes duplicates, validates content, and filters for relevant career and employment topics.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">3. Create Posts</h4>
                <p className="text-sm text-muted-foreground">
                  Generates social media posts using bot accounts for sharing in the network feed.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">4. Cleanup</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically removes old articles (7+ days) to keep the database optimized.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </UnifiedAdminLayout>
  );
};

export default NewsAutomationPage;