import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AITrainingIntegration } from '@/components/marketplace/integrations/AITrainingIntegration';
import { JobMatchingIntegration } from '@/components/marketplace/integrations/JobMatchingIntegration';
import { NetworkIntegration } from '@/components/marketplace/integrations/NetworkIntegration';
import { ProNotificationIntegration } from '@/components/marketplace/integrations/ProNotificationIntegration';
import { 
  Brain, 
  Target, 
  Network, 
  Bell, 
  ArrowRight, 
  CheckCircle, 
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const ServicesIntegration = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  // Fetch user profile for integrations
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile-integration'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return profile;
    }
  });

  // Check if user is Pro
  const { data: isProUser } = useQuery({
    queryKey: ['is-pro-user'],
    queryFn: async () => {
      if (!userProfile) return false;
      
      const { data: proProfile } = await supabase
        .from('pro_service_profiles')
        .select('id')
        .eq('user_id', userProfile.id)
        .eq('is_active', true)
        .single();

      return !!proProfile;
    },
    enabled: !!userProfile
  });

  const handleServiceRecommend = (serviceId: string) => {
    toast.success('Navigating to recommended service...');
    navigate(`/services?service=${serviceId}`);
  };

  const handleServiceSelect = (serviceId: string) => {
    toast.success('Service selected for inquiry...');
    navigate(`/services?selected=${serviceId}`);
  };

  const handleContactLead = (leadId: string) => {
    toast.success('Opening contact form...');
    // Implement contact lead functionality
  };

  const handleServiceInquiry = (leadId: string, serviceType: string) => {
    toast.success(`Inquiring about ${serviceType} services...`);
    // Implement service inquiry functionality
  };

  const userSkills = ['React', 'TypeScript', 'Node.js', 'Python']; // Mock skills for demo

  if (profileLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Services Integration Hub</h1>
          <p className="text-lg text-gray-600 mt-2">
            Connect marketplace services with your existing platform data and network
          </p>
        </div>
        <Button
          onClick={() => navigate('/services')}
          className="bg-gradient-to-r from-blue-600 to-purple-600"
        >
          Browse All Services
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Integration Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Integration Status
          </CardTitle>
          <CardDescription>
            Your connected systems and available integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <div className="font-semibold text-green-900">AI Training Center</div>
                <div className="text-sm text-green-700">Connected</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <div className="font-semibold text-green-900">Job Matching</div>
                <div className="text-sm text-green-700">Connected</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <div className="font-semibold text-green-900">Network Data</div>
                <div className="text-sm text-green-700">Connected</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Bell className="h-8 w-8 text-blue-600" />
              <div>
                <div className="font-semibold text-blue-900">Pro Notifications</div>
                <div className="text-sm text-blue-700">
                  {isProUser ? 'Active' : 'Available'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai-training" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Training
          </TabsTrigger>
          <TabsTrigger value="job-matching" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Job Matching
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Network
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-training" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Brain className="h-6 w-6" />
                AI Training Center Integration
              </h2>
              <p className="text-gray-600">
                Get personalized service recommendations based on your AI/ML training needs
              </p>
            </div>
          </div>
          <AITrainingIntegration
            userSkills={userSkills}
            careerGoals={userProfile?.career_goals || []}
            onServiceRecommend={handleServiceRecommend}
          />
        </TabsContent>

        <TabsContent value="job-matching" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Target className="h-6 w-6" />
                Job Matching Integration
              </h2>
              <p className="text-gray-600">
                Services tailored to improve your job matching performance and career outcomes
              </p>
            </div>
          </div>
          <JobMatchingIntegration
            userProfile={userProfile}
            onServiceSelect={handleServiceSelect}
          />
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Network className="h-6 w-6" />
                Network Lead Generation
              </h2>
              <p className="text-gray-600">
                Leverage your professional network to discover service opportunities
              </p>
            </div>
          </div>
          <NetworkIntegration
            userProfile={userProfile}
            onContactLead={handleContactLead}
            onServiceInquiry={handleServiceInquiry}
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Bell className="h-6 w-6" />
                Pro Notification System
              </h2>
              <p className="text-gray-600">
                Advanced notification management for your marketplace services
              </p>
            </div>
          </div>
          <ProNotificationIntegration
            userProfile={userProfile}
            isProUser={isProUser}
          />
        </TabsContent>
      </Tabs>

      {/* Integration Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Benefits</CardTitle>
          <CardDescription>
            How these integrations enhance your marketplace experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Personalized Recommendations
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• AI-powered service matching based on your skills and goals</li>
                <li>• Job performance analysis drives service suggestions</li>
                <li>• Network-based service discovery through connections</li>
                <li>• Real-time recommendations as your profile evolves</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Enhanced Connectivity
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Leverage existing professional relationships</li>
                <li>• Discover service providers in your network</li>
                <li>• Get referrals from trusted connections</li>
                <li>• Build stronger professional communities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServicesIntegration;