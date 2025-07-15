import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Crown, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  CreditCard,
  Settings,
  BarChart3,
  Briefcase,
  Star,
  ArrowRight,
  Plus
} from "lucide-react";

interface SubscriptionTier {
  name: string;
  price_monthly: number;
  features: any; // JSON array from database
  has_crm: boolean;
  has_analytics: boolean;
  has_ai_tools: boolean;
  has_payments: boolean;
  has_contracts: boolean;
  has_branding: boolean;
}

interface ServiceProfile {
  id: string;
  subscription_tier: string;
  business_name: string;
  total_reviews: number;
  average_rating: number;
  total_bookings: number;
  is_verified: boolean;
}

export const ProDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ServiceProfile | null>(null);
  const [currentTier, setCurrentTier] = useState<SubscriptionTier | null>(null);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalInquiries: 0,
    conversionRate: 0,
    revenue: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Load service profile
      const { data: profileData } = await supabase
        .from('pro_service_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);

        // Load subscription tier details
        const { data: tierData } = await supabase
          .from('pro_subscription_tiers')
          .select('*')
          .eq('name', profileData.subscription_tier)
          .single();

        setCurrentTier(tierData);

        // Load analytics
        const { data: analyticsData } = await supabase
          .from('pro_analytics')
          .select('*')
          .eq('profile_id', profileData.id)
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        if (analyticsData) {
          const totalViews = analyticsData.reduce((sum, day) => sum + (day.views_count || 0), 0);
          const totalInquiries = analyticsData.reduce((sum, day) => sum + (day.inquiries_count || 0), 0);
          const totalRevenue = analyticsData.reduce((sum, day) => sum + (day.revenue || 0), 0);
          
          setStats({
            totalViews,
            totalInquiries,
            conversionRate: totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0,
            revenue: totalRevenue
          });
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = () => {
    navigate('/pro/setup');
  };

  const handleUpgrade = () => {
    navigate('/pro/subscription');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Crown className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Welcome to TalentXcel Pro</h1>
          <p className="text-muted-foreground mb-8">
            Create your professional service profile and start attracting clients with AI-powered tools.
          </p>
          <Button onClick={handleCreateProfile} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create Your Pro Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Pro Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile.business_name || 'Professional'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {profile.is_verified && (
            <Badge variant="default" className="bg-blue-100 text-blue-800">
              <Star className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
          <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-pink-100">
            <Crown className="h-3 w-3 mr-1" />
            {currentTier?.name}
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profile Views</p>
                <p className="text-2xl font-bold">{stats.totalViews}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inquiries</p>
                <p className="text-2xl font-bold">{stats.totalInquiries}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue (30d)</p>
                <p className="text-2xl font-bold">₹{stats.revenue.toLocaleString()}</p>
              </div>
              <CreditCard className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/pro/services')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-2">Manage Services</h3>
                <p className="text-sm text-muted-foreground">Add, edit, and optimize your service offerings</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {currentTier?.has_crm && (
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/pro/leads')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-2">CRM & Leads</h3>
                  <p className="text-sm text-muted-foreground">Manage client inquiries and follow-ups</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        )}

        {currentTier?.has_analytics && (
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/pro/analytics')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-2">Analytics</h3>
                  <p className="text-sm text-muted-foreground">Track performance and growth metrics</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        )}

        {currentTier?.has_ai_tools && (
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/pro/ai-tools')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-2">AI Business Tools</h3>
                  <p className="text-sm text-muted-foreground">Optimize with AI-powered suggestions</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/pro/profile')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-2">Profile Settings</h3>
                <p className="text-sm text-muted-foreground">Update your professional profile</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/services')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-2">Marketplace</h3>
                <p className="text-sm text-muted-foreground">View your public profile in marketplace</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Prompt */}
      {currentTier?.name === 'Pro Starter' && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-2">Unlock More Features</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upgrade to Pro Business for CRM, Analytics, and AI Tools
                </p>
              </div>
              <Button onClick={handleUpgrade} className="bg-gradient-to-r from-purple-600 to-pink-600">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};