import React, { useState } from 'react';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { MobileJobSwiper } from '@/components/mobile/MobileJobSwiper';
import { MobileSocialNetwork } from '@/components/mobile/MobileSocialNetwork';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { 
  Users, 
  Briefcase, 
  Building2,
  GraduationCap,
  Wrench,
  MapPin,
  User,
  Heart,
  X,
  ChevronRight,
  Smartphone,
  Star,
  TrendingUp,
  MessageCircle
} from 'lucide-react';

// Mock job data
const mockJobs = [
  {
    id: '1',
    title: 'Senior React Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    salary: '$120k - $160k',
    type: 'Full-time',
    description: 'We are looking for an experienced React developer to join our growing team.',
    requirements: [
      '5+ years of React experience',
      'Strong TypeScript skills',
      'Experience with modern build tools'
    ],
    postedAt: '2 days ago',
    isRemote: true,
    matchScore: 95
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'Design Studio',
    location: 'New York, NY',
    salary: '$90k - $130k',
    type: 'Full-time',
    description: 'Join our creative team as a Product Designer.',
    requirements: [
      '3+ years of product design experience',
      'Proficiency in Figma and Adobe Creative Suite'
    ],
    postedAt: '1 week ago',
    isRemote: false,
    matchScore: 87
  }
];

// Menu items data
const menuItems = [
  { name: 'Network', icon: Users, route: '/mobile-social-network', primary: true, description: 'Connect with professionals' },
  { name: 'Jobs', icon: Briefcase, route: '/mobile-ai-matching', primary: true, description: 'Discover job opportunities' },
  { name: 'Companies', icon: Building2, route: '/companies', primary: false, description: 'Explore companies' },
  { name: 'Resume Builder', icon: User, route: '/mobile-resume', primary: false, description: 'Build your resume' },
  { name: 'Learning', icon: GraduationCap, route: '/learning', primary: false, description: 'Skill development' },
  { name: 'Tools', icon: Wrench, route: '/tools', primary: false, description: 'Career tools' },
  { name: 'Colleges', icon: GraduationCap, route: '/colleges', primary: false, description: 'Educational institutions' },
  { name: 'Career Map', icon: MapPin, route: '/career-map', primary: false, description: 'Plan your career path' },
];

export default function MobileDemoPage() {
  const [swipeStats, setSwipeStats] = useState({ likes: 0, passes: 0 });
  const [activeTab, setActiveTab] = useState('main');
  const detection = useMobileDetection();

  const handleJobLike = (job: any) => {
    setSwipeStats(prev => ({ ...prev, likes: prev.likes + 1 }));
  };

  const handleJobPass = (job: any) => {
    setSwipeStats(prev => ({ ...prev, passes: prev.passes + 1 }));
  };

  const handleViewDetails = (job: any) => {
    alert(`Viewing details for: ${job.title}`);
  };

  const primaryFeatures = menuItems.filter(item => item.primary);
  const secondaryFeatures = menuItems.filter(item => !item.primary);

  return (
    <MobileLayout showBottomNav={true}>
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/10">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">TalentXcel Mobile</h1>
              </div>
              <Badge variant="outline" className="text-xs">
                {detection.isMobile ? 'Mobile' : 'Desktop'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          
          {/* Primary Features - Network & Jobs */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-primary" />
                Main Features
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Core mobile experience for job seekers
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {primaryFeatures.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <Button size="sm" asChild>
                    <a href={item.route}>
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Mobile Experience Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="main">Overview</TabsTrigger>
              <TabsTrigger value="jobs">Jobs Demo</TabsTrigger>
              <TabsTrigger value="network">Network Demo</TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Job Matches</span>
                  </div>
                  <div className="text-2xl font-bold">47</div>
                  <p className="text-xs text-muted-foreground">Available today</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Connections</span>
                  </div>
                  <div className="text-2xl font-bold">128</div>
                  <p className="text-xs text-muted-foreground">Professional network</p>
                </Card>
              </div>

              {/* Secondary Features */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Additional Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {secondaryFeatures.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded-lg border hover:bg-accent/50 transition-colors">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jobs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Job Discovery
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Swipe through job opportunities
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Swipe Stats */}
                  <div className="flex justify-center space-x-6 mb-6">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-green-500" />
                      <span className="font-medium">{swipeStats.likes} Likes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <X className="h-4 w-4 text-red-500" />
                      <span className="font-medium">{swipeStats.passes} Passes</span>
                    </div>
                  </div>

                  {/* Job Swiper */}
                  <div className="flex justify-center">
                    <MobileJobSwiper
                      jobs={mockJobs}
                      onLike={handleJobLike}
                      onPass={handleJobPass}
                      onViewDetails={handleViewDetails}
                    />
                  </div>

                  <div className="mt-4 text-center">
                    <Button asChild>
                      <a href="/mobile-ai-matching">
                        View All Jobs
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="network" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Professional Network
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Connect and engage with professionals
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-accent/20 rounded-lg p-4">
                      <MobileSocialNetwork />
                    </div>
                    <div className="text-center">
                      <Button asChild>
                        <a href="/mobile-social-network">
                          Open Full Network
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Bottom CTA */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-4 text-center">
              <h3 className="font-bold mb-2">Ready to Get Started?</h3>
              <p className="text-sm mb-4 opacity-90">
                Experience the full power of TalentXcel mobile
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="secondary" size="sm" asChild>
                  <a href="/mobile-auth">Sign Up</a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/mobile-notifications">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Notifications
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
}