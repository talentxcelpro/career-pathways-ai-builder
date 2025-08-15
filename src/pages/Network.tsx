
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfessionalFeed } from "@/components/social/ProfessionalFeed";
import { CareerContentHub } from "@/components/social/CareerContentHub";
import { ConnectionSuggestions } from "@/components/network/ConnectionSuggestions";
import { NetworkStats } from "@/components/network/NetworkStats";
import { SmartConnectAI } from "@/components/network/SmartConnectAI";
import { AdvertisingSidebar } from "@/components/network/AdvertisingSidebar";
import { EnhancedConnections } from "@/components/network/EnhancedConnections";
import { NetworkAnalytics } from "@/components/network/NetworkAnalytics";
import { EmailTestButton } from "@/components/EmailTestButton";
import { Users, UserPlus, TrendingUp, MessageSquare, Sparkles } from "lucide-react";
import Posts from './network/Posts';
import { updateMetaTags } from '@/utils/metaTags';
import { ReferralNetworkAd } from "@/components/referral/ReferralNetworkAd";
import { NetworkMessagingSidebar } from "@/components/network/NetworkMessagingSidebar";

const Network = () => {
  // SEO meta tags and structured data
  React.useEffect(() => {
    updateMetaTags({
      title: 'Professional Network | Connect with Industry Experts | TalentXcel',
      description: 'Build your professional network. Connect with industry experts, join professional groups, attend virtual events, and advance your career through meaningful connections.',
      url: `${window.location.origin}/network`,
      keywords: ['professional networking', 'industry experts', 'career networking', 'professional connections', 'industry events', 'career growth'],
      type: 'website',
      image: '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png'
    });

    // Add SocialMediaPosting structured data
    const networkSchema = {
      "@context": "https://schema.org/",
      "@type": "SocialMediaPosting",
      "headline": "Professional Networking Platform",
      "url": `${window.location.origin}/network`,
      "description": "Connect with professionals, share insights, and grow your career network",
      "author": {
        "@type": "Organization",
        "name": "TalentXcel",
        "url": "https://talentxcel.in"
      },
      "publisher": {
        "@type": "Organization",
        "name": "TalentXcel"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(networkSchema);
    script.id = 'network-schema';
    
    const existing = document.getElementById('network-schema');
    if (existing) existing.remove();
    
    document.head.appendChild(script);

    return () => {
      const schemaScript = document.getElementById('network-schema');
      if (schemaScript) schemaScript.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Card */}
            <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
              <div className="h-20 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
              <div className="px-4 pb-4">
                <div className="relative -mt-8 mb-3">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border-4 border-card flex items-center justify-center">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground">Professional User</h3>
                <p className="text-sm text-muted-foreground">Building connections & growing professionally</p>
                <p className="text-xs text-muted-foreground mt-1">📍 India</p>
                <button className="w-full mt-3 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                  Update profile
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-card rounded-lg border shadow-sm p-4">
              <h4 className="font-semibold text-foreground mb-3">Quick links</h4>
              <div className="space-y-2">
                <button className="w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors">My items</button>
                <button className="w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors">Saved jobs</button>
                <button className="w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors">Groups</button>
                <button className="w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors">Events</button>
              </div>
            </div>

            {/* Recommended Jobs */}
            <div className="bg-card rounded-lg border shadow-sm p-4">
              <h4 className="font-semibold text-foreground mb-3">Recommended jobs</h4>
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-foreground">Product Manager</h5>
                  <p className="text-xs text-muted-foreground">Google</p>
                  <p className="text-xs text-muted-foreground">San Francisco, CA</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-foreground">UI/UX Designer</h5>
                  <p className="text-xs text-muted-foreground">Microsoft</p>
                  <p className="text-xs text-muted-foreground">New York, NY</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-foreground">Skill Assessment</h5>
                  <p className="text-xs text-muted-foreground">Take a test to showcase your skills</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6">
            <Tabs defaultValue="feed" className="w-full">
              {/* Tab Navigation */}
              <div className="bg-card rounded-lg border shadow-sm mb-6">
                <TabsList className="w-full bg-transparent border-0 p-0 h-auto">
                  <TabsTrigger 
                    value="feed" 
                    className="flex-1 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent hover:text-primary transition-colors py-3"
                  >
                    All content
                  </TabsTrigger>
                  <TabsTrigger 
                    value="connections" 
                    className="flex-1 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent hover:text-primary transition-colors py-3"
                  >
                    My network
                  </TabsTrigger>
                  <TabsTrigger 
                    value="discover" 
                    className="flex-1 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent hover:text-primary transition-colors py-3"
                  >
                    Jobs
                  </TabsTrigger>
                  <TabsTrigger 
                    value="smart-feed" 
                    className="flex-1 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent hover:text-primary transition-colors py-3"
                  >
                    Learning
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="feed" className="mt-0 space-y-6">
                <ProfessionalFeed />
                <Posts feedType="all" />
              </TabsContent>

              <TabsContent value="smart-feed" className="mt-0 space-y-6">
                <CareerContentHub />
                <Posts feedType="smart" />
              </TabsContent>

              <TabsContent value="connections" className="mt-0">
                <EnhancedConnections />
              </TabsContent>

              <TabsContent value="discover" className="mt-0 space-y-6">
                <CareerContentHub />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* People You May Know */}
            <div className="bg-card rounded-lg border shadow-sm p-4">
              <h4 className="font-semibold text-foreground mb-4">People you may know</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-foreground">Akash Verma</h5>
                      <p className="text-xs text-muted-foreground">Senior Data Scientist</p>
                      <p className="text-xs text-muted-foreground">6 mutual connections</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 text-xs border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors">
                    Connect
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-foreground">Ritu Khanna</h5>
                      <p className="text-xs text-muted-foreground">Software Engineer</p>
                      <p className="text-xs text-muted-foreground">5 mutual connections</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 text-xs border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors">
                    Connect
                  </button>
                </div>
              </div>
            </div>

            {/* Trending Skills */}
            <div className="bg-card rounded-lg border shadow-sm p-4">
              <h4 className="font-semibold text-foreground mb-4">Trending skills</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-foreground">+ Product Management</h5>
                    <p className="text-xs text-muted-foreground">20,550 followers</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-foreground">● Data Science</h5>
                    <p className="text-xs text-muted-foreground">15,240 followers</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-foreground">○ Python</h5>
                    <p className="text-xs text-muted-foreground">10,430 followers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Section */}
            <div className="bg-card rounded-lg border shadow-sm p-4">
              <h4 className="font-semibold text-foreground mb-4">Learning</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-foreground">Introduction to Python</h5>
                    <p className="text-xs text-muted-foreground">80% completed</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded bg-secondary/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-foreground">Design Thinking</h5>
                    <p className="text-xs text-muted-foreground">50% completed</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                Post
              </button>
            </div>

            {/* Pro Upgrade Card */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/20 text-xs px-2 py-1 rounded">Popular</span>
              </div>
              <h4 className="font-semibold mb-2">Boost Your Career with Pro</h4>
              <p className="text-sm text-white/90 mb-4">Unlock premium features, priority support, and exclusive networking opportunities.</p>
              <button className="w-full bg-white text-green-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-white/90 transition-colors">
                Upgrade Now
              </button>
            </div>

            {/* Job Search Card */}
            <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/20 text-xs px-2 py-1 rounded">New</span>
              </div>
              <h4 className="font-semibold mb-2">Find Your Dream Job</h4>
              <p className="text-sm text-white/90 mb-4">Browse thousands of job opportunities from top companies</p>
              <button className="w-full bg-white text-purple-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-white/90 transition-colors">
                Browse Jobs
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Analytics and AI Connect hidden in tabs */}
      <div className="hidden">
        <NetworkAnalytics />
        <SmartConnectAI />
      </div>
      
      {/* Floating Messaging Sidebar */}
      <NetworkMessagingSidebar />
    </div>
  );
};

export default Network;
