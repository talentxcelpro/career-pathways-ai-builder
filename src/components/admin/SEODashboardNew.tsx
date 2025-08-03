import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Search, 
  ExternalLink, 
  Zap, 
  BarChart3,
  MapPin,
  Building,
  FileText,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const SEODashboardNew = () => {
  const [enhancing, setEnhancing] = useState(false);
  const [stats, setStats] = useState({
    totalJobs: 0,
    jobsWithSEO: 0,
    sitemapUrls: 0,
    lastUpdated: null
  });

  const handleEnhanceAllJobs = async () => {
    try {
      setEnhancing(true);
      toast.info('Starting SEO enhancement for all jobs...');

      console.log('🔧 Calling SEO enhancer function...');
      console.log('📋 Request payload:', { enhance_all: true });
      
      const { data, error } = await supabase.functions.invoke('seo-job-enhancer', {
        body: { enhance_all: true }
      });

      console.log('📊 Function response:', { data, error });
      console.log('📊 Full response details:', JSON.stringify({ data, error }, null, 2));

      if (error) {
        console.error('❌ Edge function error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          stack: error.stack
        });
        throw new Error(error.message || 'Failed to call edge function');
      }

      if (!data) {
        throw new Error('No response data received from edge function');
      }

      toast.success(`✅ Enhanced ${data.enhanced_count || 0} jobs with SEO data`);
      
      // Update stats
      await fetchStats();
      
    } catch (error: any) {
      console.error('❌ SEO enhancement error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        cause: error.cause
      });
      
      // More specific error handling
      let errorMessage = 'Unknown error occurred';
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(`Failed to enhance jobs: ${errorMessage}`);
    } finally {
      setEnhancing(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get job stats
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('id, meta_title, seo_slug, updated_at')
        .eq('is_active', true);

      const totalJobs = jobsData?.length || 0;
      const jobsWithSEO = jobsData?.filter(job => job.meta_title && job.seo_slug)?.length || 0;

      setStats({
        totalJobs,
        jobsWithSEO,
        sitemapUrls: totalJobs + 20, // Approximate with static pages
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, []);

  const seoProgress = stats.totalJobs > 0 ? Math.round((stats.jobsWithSEO / stats.totalJobs) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">SEO Dashboard</h2>
          <p className="text-gray-600 mt-1">Manage search engine optimization for TalentXcel</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleEnhanceAllJobs}
            disabled={enhancing}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {enhancing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            {enhancing ? 'Enhancing...' : 'Enhance All Jobs'}
          </Button>
        </div>
      </div>

      {/* SEO Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">Active job postings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEO Optimized</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.jobsWithSEO}</div>
            <p className="text-xs text-muted-foreground">
              {seoProgress}% of jobs optimized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sitemap URLs</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sitemapUrls}</div>
            <p className="text-xs text-muted-foreground">Total indexed pages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SEO Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{seoProgress}%</div>
            <p className="text-xs text-muted-foreground">Overall optimization</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Dynamic Sitemap
            </CardTitle>
            <CardDescription>
              Auto-generated XML sitemap with all active jobs and pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open('https://talentxcel.in/sitemap.xml', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Sitemap
              </Button>
              <p className="text-sm text-gray-600">
                Updates automatically when jobs are added/removed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Job SEO Enhancement
            </CardTitle>
            <CardDescription>
              Auto-generate meta titles, descriptions, and structured data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Progress:</span>
                <Badge variant={seoProgress === 100 ? "default" : "secondary"}>
                  {seoProgress}%
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${seoProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                {stats.jobsWithSEO} of {stats.totalJobs} jobs optimized
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Google Search Console
            </CardTitle>
            <CardDescription>
              Submit sitemaps and monitor search performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open('https://search.google.com/search-console', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Console
              </Button>
              <p className="text-sm text-gray-600">
                Verify site ownership and submit sitemap URL
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEO Actions */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Enhancement Actions</CardTitle>
          <CardDescription>
            Tools to improve search engine visibility and ranking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold">Automated SEO Features:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  ✅ Auto-generated meta titles (under 60 chars)
                </li>
                <li className="flex items-center gap-2">
                  ✅ SEO-optimized descriptions (under 160 chars)
                </li>
                <li className="flex items-center gap-2">
                  ✅ JobPosting structured data (Schema.org)
                </li>
                <li className="flex items-center gap-2">
                  ✅ Canonical URLs for duplicate content
                </li>
                <li className="flex items-center gap-2">
                  ✅ Dynamic sitemap generation
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold">Next Steps:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  1. Submit sitemap to Google Search Console
                </li>
                <li className="flex items-center gap-2">
                  2. Monitor search performance and clicks
                </li>
                <li className="flex items-center gap-2">
                  3. Run regular SEO audits
                </li>
                <li className="flex items-center gap-2">
                  4. Optimize page load speeds
                </li>
                <li className="flex items-center gap-2">
                  5. Build quality backlinks to job pages
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};