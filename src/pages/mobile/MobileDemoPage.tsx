import React, { useState } from 'react';
import { MobileNavWrapper } from '@/components/layout/MobileNavWrapper';
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
  MessageCircle,
  Search
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
    <MobileNavWrapper>
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/10 native-app-style ios-scroll">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 safe-area-top">
          <div className="px-4 py-3">
            <h1 className="text-xl font-bold text-gray-900">TalentXcel Mobile</h1>
            <p className="text-sm text-gray-600">Your career companion</p>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Mobile Job Swiper */}
          <div className="native-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Trending Jobs</h2>
            <MobileJobSwiper 
              jobs={mockJobs}
              onLike={handleJobLike}
              onPass={handleJobPass}
              onViewDetails={handleViewDetails}
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <div className="native-card p-4 text-center touch-feedback">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Search className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-medium">Search Jobs</p>
            </div>
            <div className="native-card p-4 text-center touch-feedback">
              <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm font-medium">Network</p>
            </div>
          </div>

          {/* Mobile Social Network */}
          <div className="native-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Network</h2>
            <MobileSocialNetwork />
          </div>

          {/* Stats */}
          <div className="native-card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Your Progress</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">24</div>
                <div className="text-xs text-gray-600">Connections</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-xs text-gray-600">Applications</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">5</div>
                <div className="text-xs text-gray-600">Interviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileNavWrapper>
  );
}