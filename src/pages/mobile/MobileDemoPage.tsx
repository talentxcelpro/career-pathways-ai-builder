import React, { useState } from 'react';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { MobileJobSwiper } from '@/components/mobile/MobileJobSwiper';
import { MobilePullToRefresh } from '@/components/mobile/MobilePullToRefresh';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Hand as Touch,
  RotateCcw,
  Heart,
  X
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
    description: 'We are looking for an experienced React developer to join our growing team. You will be responsible for building and maintaining web applications using modern React ecosystem.',
    requirements: [
      '5+ years of React experience',
      'Strong TypeScript skills',
      'Experience with modern build tools',
      'Knowledge of testing frameworks'
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
    description: 'Join our creative team as a Product Designer. You will work on designing user-centered digital experiences for our clients across various industries.',
    requirements: [
      '3+ years of product design experience',
      'Proficiency in Figma and Adobe Creative Suite',
      'Strong portfolio demonstrating user-centered design',
      'Experience with design systems'
    ],
    postedAt: '1 week ago',
    isRemote: false,
    matchScore: 87
  },
  {
    id: '3',
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    location: 'Austin, TX',
    salary: '$100k - $140k',
    type: 'Full-time',
    description: 'Looking for a versatile full-stack engineer to help build our next-generation platform. You will work across the entire technology stack.',
    requirements: [
      'Experience with Node.js and React',
      'Database design and optimization',
      'RESTful API development',
      'Cloud platform experience (AWS/GCP)'
    ],
    postedAt: '3 days ago',
    isRemote: true,
    matchScore: 92
  }
];

export default function MobileDemoPage() {
  const [refreshCount, setRefreshCount] = useState(0);
  const [swipeStats, setSwipeStats] = useState({ likes: 0, passes: 0 });
  const detection = useMobileDetection();

  const handleRefresh = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshCount(prev => prev + 1);
  };

  const handleJobLike = (job: any) => {
    setSwipeStats(prev => ({ ...prev, likes: prev.likes + 1 }));
    console.log('Liked job:', job.title);
  };

  const handleJobPass = (job: any) => {
    setSwipeStats(prev => ({ ...prev, passes: prev.passes + 1 }));
    console.log('Passed on job:', job.title);
  };

  const handleViewDetails = (job: any) => {
    console.log('View details for:', job.title);
    alert(`Viewing details for: ${job.title}`);
  };

  const DeviceIcon = detection.isMobile ? Smartphone : detection.isTablet ? Tablet : Monitor;

  return (
    <MobileLayout showBottomNav={detection.isMobile}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Mobile Experience Demo</h1>
          <p className="text-muted-foreground">
            Experience TalentXcel's mobile-optimized features
          </p>
        </div>

        {/* Device Detection Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DeviceIcon className="h-5 w-5" />
              <span>Device Detection</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Device Type:</span>
                  <Badge variant={detection.isMobile ? "default" : "secondary"}>
                    {detection.deviceType}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Screen Size:</span>
                  <span>{detection.screenWidth} × {detection.screenHeight}</span>
                </div>
                <div className="flex justify-between">
                  <span>Orientation:</span>
                  <span className="capitalize">{detection.orientation}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Touch Device:</span>
                  <div className="flex items-center space-x-1">
                    {detection.touchDevice && <Touch className="h-3 w-3" />}
                    <span>{detection.touchDevice ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Mobile Layout:</span>
                  <span>{detection.isMobile ? 'Active' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Features Tabs */}
        <Tabs defaultValue="swiper" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="swiper">Job Swiper</TabsTrigger>
            <TabsTrigger value="refresh">Pull to Refresh</TabsTrigger>
          </TabsList>

          <TabsContent value="swiper" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mobile Job Swiper</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Swipe right to like, left to pass. Touch-friendly job discovery.
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="refresh" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pull to Refresh</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Pull down to refresh content. Mobile-optimized interaction.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Refresh Count:</span>
                    <Badge variant="outline">{refreshCount}</Badge>
                  </div>

                  <MobilePullToRefresh onRefresh={handleRefresh}>
                    <div className="bg-gradient-to-b from-accent to-background rounded-lg p-6 min-h-[400px]">
                      <h3 className="font-semibold mb-4">Sample Content</h3>
                      <p className="text-muted-foreground mb-4">
                        Pull down from the top to refresh this content. This demonstrates
                        the mobile pull-to-refresh functionality.
                      </p>
                      
                      <div className="space-y-3">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div
                            key={i}
                            className="bg-card rounded-lg p-4 border"
                          >
                            <h4 className="font-medium mb-1">Item {i + 1}</h4>
                            <p className="text-sm text-muted-foreground">
                              Last refreshed: {new Date().toLocaleTimeString()}
                            </p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 text-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleRefresh}
                          className="flex items-center space-x-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span>Manual Refresh</span>
                        </Button>
                      </div>
                    </div>
                  </MobilePullToRefresh>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p><strong>Job Swiper:</strong> Drag cards left/right or use the action buttons</p>
            <p><strong>Pull to Refresh:</strong> Touch and drag down from the top of the content area</p>
            <p><strong>Bottom Navigation:</strong> {detection.isMobile ? 'Active on mobile' : 'Disabled on desktop'}</p>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}