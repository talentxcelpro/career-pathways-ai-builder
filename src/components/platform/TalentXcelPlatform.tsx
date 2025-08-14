import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlatformRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { apiClient, safeApiCall } from '@/utils/api';
import { ModuleConfig, ModuleName, User, CareerPassport } from '@/types/platform';
import { ModuleLayout } from './ModuleLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  Building2, 
  FileText, 
  Wrench, 
  Headphones, 
  GraduationCap, 
  School, 
  MapPin,
  IdCard,
  TrendingUp,
  Star,
  Clock,
  Award,
  Shield,
  Zap
} from 'lucide-react';

// Module configurations
const PLATFORM_MODULES: ModuleConfig[] = [
  {
    name: 'passport',
    title: 'Career Passport',
    description: 'Your comprehensive career profile and progress tracking',
    icon: '🛡️',
    route: '/passport',
    isEnabled: true,
    requiresAuth: true,
    isPremium: false,
    sortOrder: 1
  },
  {
    name: 'network',
    title: 'Professional Network',
    description: 'Connect with professionals and build your network',
    icon: '🌐',
    route: '/network',
    isEnabled: true,
    requiresAuth: true,
    isPremium: false,
    sortOrder: 2
  },
  {
    name: 'jobs',
    title: 'Job Search',
    description: 'Find and apply for your dream job',
    icon: '💼',
    route: '/jobs',
    isEnabled: true,
    requiresAuth: false,
    isPremium: false,
    sortOrder: 3
  },
  {
    name: 'employer',
    title: 'Employer Dashboard',
    description: 'Manage job postings and recruit talent',
    icon: '🏢',
    route: '/employer',
    isEnabled: true,
    requiresAuth: true,
    isPremium: true,
    sortOrder: 4
  },
  {
    name: 'companies',
    title: 'Company Profiles',
    description: 'Explore companies and their culture',
    icon: '🏭',
    route: '/companies',
    isEnabled: true,
    requiresAuth: false,
    isPremium: false,
    sortOrder: 5
  },
  {
    name: 'resume-builder',
    title: 'Resume Builder',
    description: 'Create professional resumes with AI assistance',
    icon: '📄',
    route: '/resume',
    isEnabled: true,
    requiresAuth: true,
    isPremium: false,
    sortOrder: 6
  },
  {
    name: 'tools',
    title: 'Career Tools',
    description: 'Professional tools and utilities',
    icon: '🔧',
    route: '/tools',
    isEnabled: true,
    requiresAuth: true,
    isPremium: false,
    sortOrder: 7
  },
  {
    name: 'services',
    title: 'Professional Services',
    description: 'Get expert career guidance and services',
    icon: '🎯',
    route: '/services',
    isEnabled: true,
    requiresAuth: true,
    isPremium: true,
    sortOrder: 8
  },
  {
    name: 'learning',
    title: 'Learning Paths',
    description: 'Enhance your skills with curated learning content',
    icon: '📚',
    route: '/learning',
    isEnabled: true,
    requiresAuth: true,
    isPremium: false,
    sortOrder: 9
  },
  {
    name: 'colleges',
    title: 'College Network',
    description: 'Connect with educational institutions',
    icon: '🎓',
    route: '/colleges',
    isEnabled: true,
    requiresAuth: false,
    isPremium: false,
    sortOrder: 10
  },
  {
    name: 'career-map',
    title: 'Career Roadmap',
    description: 'Plan your career journey with AI insights',
    icon: '🗺️',
    route: '/career-map',
    isEnabled: true,
    requiresAuth: true,
    isPremium: true,
    sortOrder: 11
  }
];

interface PlatformOverviewProps {
  userProfile?: User;
  careerPassport?: CareerPassport;
}

function PlatformOverview({ userProfile, careerPassport }: PlatformOverviewProps) {
  const { user } = useAuth();
  const realtimeUpdates = usePlatformRealtimeUpdates(user?.id);

  return (
    <div className="space-y-8">
      {/* User Profile Overview */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                Welcome back, {userProfile?.name || 'Professional'}! 👋
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                {userProfile?.tagline || 'Transforming careers, one step at a time'}
              </CardDescription>
            </div>
            
            <div className="text-right space-y-2">
              <Badge variant="outline" className="text-sm">
                <IdCard className="h-3 w-3 mr-1" />
                {userProfile?.member_id || 'TXL001'}
              </Badge>
              {realtimeUpdates.isAnyConnected && (
                <Badge variant="secondary" className="text-xs">
                  🔴 Live Updates
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Profile Completion */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profile Completion</span>
                <span className="text-sm text-muted-foreground">
                  {userProfile?.profile_completion || 0}%
                </span>
              </div>
              <Progress value={userProfile?.profile_completion || 0} className="h-2" />
            </div>
            
            {/* Career Readiness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Career Readiness</span>
                <span className="text-sm text-muted-foreground">
                  {userProfile?.career_readiness_score || 0}/100
                </span>
              </div>
              <Progress value={userProfile?.career_readiness_score || 0} className="h-2" />
            </div>
            
            {/* Market Competitiveness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Market Competitiveness</span>
                <span className="text-sm text-muted-foreground">
                  {userProfile?.market_competitiveness_score || 0}/100
                </span>
              </div>
              <Progress value={userProfile?.market_competitiveness_score || 0} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Career Passport Summary */}
      {careerPassport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Career Passport Summary
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-primary">
                  {careerPassport.resumes_created}
                </div>
                <div className="text-sm text-muted-foreground">Resumes Created</div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-primary">
                  {careerPassport.jobs_applied}
                </div>
                <div className="text-sm text-muted-foreground">Jobs Applied</div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-primary">
                  {careerPassport.certifications}
                </div>
                <div className="text-sm text-muted-foreground">Certifications</div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-primary">
                  {careerPassport.tests_completed}
                </div>
                <div className="text-sm text-muted-foreground">Tests Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PLATFORM_MODULES.filter(module => module.isEnabled)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((module) => (
            <Card key={module.name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{module.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      {module.isPremium && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          <Star className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <Link to={module.route}>
                  <Button className="w-full" variant="outline">
                    Access {module.title}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {realtimeUpdates.totalEvents > 0 ? (
              <div className="text-sm text-muted-foreground">
                {realtimeUpdates.totalEvents} real-time updates received
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No recent activity. Start exploring modules to see updates here.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function TalentXcelPlatform() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [careerPassport, setCareerPassport] = useState<CareerPassport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlatformData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load user profile and career passport in parallel
      const [profileResult, passportResult] = await Promise.allSettled([
        safeApiCall(() => apiClient.getCareerPassport(user.id)),
        safeApiCall(() => apiClient.getCareerPassport(user.id))
      ]);

      if (profileResult.status === 'fulfilled' && profileResult.value) {
        setUserProfile(profileResult.value);
      }

      if (passportResult.status === 'fulfilled' && passportResult.value) {
        setCareerPassport(passportResult.value);
      }
    } catch (err) {
      console.error('Platform data loading error:', err);
      setError('Failed to load platform data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlatformData();
  }, [user?.id]);

  const moduleConfig: ModuleConfig = {
    name: 'passport',
    title: 'TalentXcel Platform',
    description: 'Your comprehensive career development platform',
    icon: '🚀',
    route: '/platform',
    isEnabled: true,
    requiresAuth: true,
    isPremium: false,
    sortOrder: 0
  };

  return (
    <ModuleLayout
      module={moduleConfig}
      loading={isLoading}
      error={error}
      onRetry={loadPlatformData}
      enableRealtime={true}
    >
      <PlatformOverview 
        userProfile={userProfile || undefined}
        careerPassport={careerPassport || undefined}
      />
    </ModuleLayout>
  );
}

export default TalentXcelPlatform;