import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  Eye, 
  Heart, 
  Briefcase, 
  TrendingUp, 
  Calendar,
  Plus,
  BarChart3,
  Settings,
  Share2,
  MessageSquare,
  FileText,
  Upload,
  Target,
  Activity,
  Clock,
  CheckCircle,
  Zap,
  Brain,
  Star,
  Award,
  Lightbulb
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Import module components
import { CompanyOverview } from '@/components/company/dashboard/CompanyOverview';
import { CompanyContent } from '@/components/company/dashboard/CompanyContent';
import { CompanyAnalytics } from '@/components/company/dashboard/CompanyAnalytics';
import { CompanyAIInsights } from '@/components/company/dashboard/CompanyAIInsights';
import { CompanyJobManagement } from '@/components/company/dashboard/CompanyJobManagement';
import { CompanySettings } from '@/components/company/dashboard/CompanySettings';

const CompanyDashboard = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Get current user
  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // Get user's companies with comprehensive data
  const { data: userCompanies, isLoading } = useQuery({
    queryKey: ['user-companies-dashboard', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];

      const { data, error } = await supabase
        .from('company_team_members')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            cover_image_url,
            description,
            website,
            industry,
            location,
            employee_count_range,
            founded_year,
            tech_stack,
            benefits,
            social_links,
            created_at
          )
        `)
        .eq('user_id', currentUser.id)
        .eq('is_active', true)
        .in('role', ['owner', 'admin', 'recruiter']);

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUser
  });

  const selectedCompany = userCompanies?.[0]?.companies;
  const userRole = userCompanies?.[0]?.role;

  // Get comprehensive company metrics
  const { data: companyMetrics } = useQuery({
    queryKey: ['company-comprehensive-metrics', selectedCompany?.id],
    queryFn: async () => {
      if (!selectedCompany) return null;

      // Get or create current month metrics
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      
      const { data: metrics, error } = await supabase
        .from('company_metrics')
        .select('*')
        .eq('company_id', selectedCompany.id)
        .eq('month_year', currentMonth)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching metrics:', error);
        return null;
      }

      // If no metrics exist, create them with calculated values
      if (!metrics) {
        // Calculate real-time metrics
        const [followersResult, jobsResult, applicationsResult] = await Promise.all([
          supabase
            .from('company_follows')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', selectedCompany.id),
          supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', selectedCompany.id)
            .eq('is_active', true),
          supabase
            .from('job_applications')
            .select(`
              id,
              jobs!inner(company_id)
            `, { count: 'exact', head: true })
            .eq('jobs.company_id', selectedCompany.id)
        ]);

        const calculatedMetrics = {
          followers_count: followersResult.count || 0,
          active_jobs_count: jobsResult.count || 0,
          total_applications_count: applicationsResult.count || 0,
          profile_views_count: 0, // Will be updated by analytics
          engagement_rate: 0,
          brand_reach: 0,
          success_rate: 0,
          avg_engagement: 0
        };

        // Insert new metrics
        const { data: newMetrics } = await supabase
          .from('company_metrics')
          .insert({
            company_id: selectedCompany.id,
            month_year: currentMonth,
            ...calculatedMetrics
          })
          .select()
          .single();

        return newMetrics || calculatedMetrics;
      }

      return metrics;
    },
    enabled: !!selectedCompany
  });

  // Get recent activity
  const { data: recentActivity } = useQuery({
    queryKey: ['company-recent-activity', selectedCompany?.id],
    queryFn: async () => {
      if (!selectedCompany) return [];

      const { data, error } = await supabase
        .from('company_activity_logs')
        .select('*')
        .eq('company_id', selectedCompany.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompany
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedCompany) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Company Access</h3>
          <p className="text-gray-600 mb-4">
            You don't have access to any company dashboards. Contact your company admin for access.
          </p>
          <Link to="/employer/request-access">
            <Button>Request Company Access</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="relative mb-8">
          {/* Cover Image */}
          {selectedCompany.cover_image_url && (
            <div className="h-48 rounded-2xl bg-cover bg-center relative overflow-hidden" 
                 style={{ backgroundImage: `url(${selectedCompany.cover_image_url})` }}>
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
          )}
          
          {/* Company Info */}
          <div className={`flex justify-between items-start ${selectedCompany.cover_image_url ? '-mt-16 relative z-10' : ''}`}>
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                <AvatarImage src={selectedCompany.logo_url} alt={selectedCompany.name} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {selectedCompany.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={selectedCompany.cover_image_url ? 'text-white' : ''}>
                <h1 className="text-4xl font-bold mb-1">{selectedCompany.name}</h1>
                <p className={`text-lg mb-3 ${selectedCompany.cover_image_url ? 'text-gray-200' : 'text-gray-600'}`}>
                  Company Dashboard
                </p>
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                    {selectedCompany.industry}
                  </Badge>
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                    {selectedCompany.employee_count_range}
                  </Badge>
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                    {userRole?.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex space-x-3">
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Briefcase className="h-4 w-4 mr-2" />
                Post Job
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Followers</CardTitle>
              <Users className="h-5 w-5 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{companyMetrics?.followers_count || 0}</div>
              <p className="text-xs text-blue-200">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Active Jobs</CardTitle>
              <Briefcase className="h-5 w-5 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{companyMetrics?.active_jobs_count || 0}</div>
              <p className="text-xs text-green-200">Currently hiring</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Applications</CardTitle>
              <FileText className="h-5 w-5 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{companyMetrics?.total_applications_count || 0}</div>
              <p className="text-xs text-purple-200">Total received</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">Brand Reach</CardTitle>
              <Target className="h-5 w-5 text-orange-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{companyMetrics?.brand_reach || 0}</div>
              <p className="text-xs text-orange-200">Monthly impressions</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-pink-100">Success Rate</CardTitle>
              <TrendingUp className="h-5 w-5 text-pink-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{companyMetrics?.success_rate || 0}%</div>
              <p className="text-xs text-pink-200">Hire rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm rounded-xl p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="overview">
            <CompanyOverview 
              company={selectedCompany} 
              metrics={companyMetrics} 
              recentActivity={recentActivity}
              userRole={userRole}
            />
          </TabsContent>

          <TabsContent value="content">
            <CompanyContent 
              company={selectedCompany} 
              userRole={userRole}
            />
          </TabsContent>

          <TabsContent value="jobs">
            <CompanyJobManagement 
              company={selectedCompany} 
              userRole={userRole}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <CompanyAnalytics 
              company={selectedCompany} 
              metrics={companyMetrics}
              userRole={userRole}
            />
          </TabsContent>

          <TabsContent value="insights">
            <CompanyAIInsights 
              company={selectedCompany} 
              metrics={companyMetrics}
              userRole={userRole}
            />
          </TabsContent>

          <TabsContent value="settings">
            <CompanySettings 
              company={selectedCompany} 
              userRole={userRole}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CompanyDashboard;