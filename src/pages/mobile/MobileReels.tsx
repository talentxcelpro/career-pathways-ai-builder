import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { InfiniteReelsFeed } from '@/components/reels/InfiniteReelsFeed';
import { ReelsUploadModal } from '@/components/mobile/ReelsUploadModal';
import { ReelsHeader } from '@/components/mobile/ReelsHeader';
import { Button } from '@/components/ui/button';
import { Plus, Home, Search, User, Heart, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { realtimeManager } from '@/lib/realtimeManager';

export const MobileReels = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'following' | 'explore'>('explore');
  const navigate = useNavigate();

  // Disable realtime on this page to prevent binding conflicts
  useEffect(() => {
    console.log('🎬 MobileReels: Disabling realtime to prevent conflicts');
    try {
      realtimeManager.cleanup();
    } catch (error) {
      console.warn('Failed to cleanup realtime:', error);
    }
    
    return () => {
      console.log('🎬 MobileReels: Component unmounting');
    };
  }, []);

  const handleUploadSuccess = () => {
    toast.success("Your reel has been uploaded successfully!");
    setShowUploadModal(false);
  };

  const handleTabChange = (tab: 'following' | 'explore') => {
    setActiveTab(tab);
  };

  return (
    <>
      <Helmet>
        <title>TalentXcel Reels - Discover Professional Stories | Career Growth Videos</title>
        <meta name="description" content="Discover inspiring career stories, professional tips, and growth content on TalentXcel Reels. Connect with professionals and share your journey." />
        <meta name="keywords" content="career reels, professional videos, career growth, job tips, networking, professional development" />
        <meta property="og:title" content="TalentXcel Reels - Professional Video Stories" />
        <meta property="og:description" content="Watch and share professional career stories, tips, and insights on TalentXcel Reels." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TalentXcel Reels - Career Growth Videos" />
        <meta name="twitter:description" content="Discover inspiring career stories and professional content." />
        <link rel="canonical" href="https://talentxcel.in/mobile/reels" />
      </Helmet>
      
      <div className="w-full h-screen overflow-hidden bg-black relative">
        {/* Enhanced Mobile Header */}
        <ReelsHeader
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onSearch={() => console.log('Search opened')}
          onNotifications={() => navigate('/mobile/notifications')}
          onMessages={() => navigate('/network/messages')}
          notificationCount={0}
          messageCount={0}
        />

        {/* Infinite Reels Feed with Enhanced Features */}
        <InfiniteReelsFeed 
          onUploadClick={() => setShowUploadModal(true)}
          feedType={activeTab}
        />

        {/* Enhanced Bottom Navigation */}
        <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-black/90 to-transparent backdrop-blur-md">
          <div className="flex items-center justify-around py-3 px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="flex flex-col items-center gap-1 text-white/70 hover:text-white hover:bg-white/10 rounded-xl h-12 w-12 transition-all"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs">Home</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/network/people')}
              className="flex flex-col items-center gap-1 text-white/70 hover:text-white hover:bg-white/10 rounded-xl h-12 w-12 transition-all"
            >
              <Heart className="h-5 w-5" />
              <span className="text-xs">Activity</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-xl h-14 w-14 shadow-lg transform hover:scale-105 transition-all"
            >
              <Plus className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/network/messages')}
              className="flex flex-col items-center gap-1 text-white/70 hover:text-white hover:bg-white/10 rounded-xl h-12 w-12 transition-all"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs">Messages</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/mobile/profile')}
              className="flex flex-col items-center gap-1 text-white/70 hover:text-white hover:bg-white/10 rounded-xl h-12 w-12 transition-all"
            >
              <User className="h-5 w-5" />
              <span className="text-xs">Profile</span>
            </Button>
          </div>
        </div>
      
      {/* Upload Modal */}
      <ReelsUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={handleUploadSuccess}
        />
      </div>
    </>
  );
};
