import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { InfiniteReelsFeed } from '@/components/reels/InfiniteReelsFeed';
import { ReelsUploadModal } from '@/components/mobile/ReelsUploadModal';
import { ReelsHeader } from '@/components/mobile/ReelsHeader';
import { Button } from '@/components/ui/button';
import { Plus, Home, Search, User, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { realtimeManager } from '@/lib/realtimeManager';

export const MobileReels = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'following' | 'explore'>('explore');
  const [category, setCategory] = useState('all');
  const navigate = useNavigate();

  // Disable realtime on this page to prevent binding conflicts
  useEffect(() => {
    try {
      realtimeManager.cleanup();
    } catch (error) {
      console.warn('Failed to cleanup realtime:', error);
    }

    const handleOpenUpload = () => setShowUploadModal(true);
    window.addEventListener('openReelsUpload', handleOpenUpload);
    return () => window.removeEventListener('openReelsUpload', handleOpenUpload);
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
        <title>TalentXcel Reels — Global Tech, AI & Career Stories</title>
        <meta name="description" content="Watch short-form video stories, system design deep-dives, RAG AI architectures, and salary negotiation strategies from verified tech leaders worldwide across UAE, Europe, Americas, and Asia." />
        <meta name="keywords" content="tech reels, AI architecture videos, system design, salary negotiation, global tech careers, talent network" />
        <meta property="og:title" content="TalentXcel Reels — Global Tech, AI & Career Stories" />
        <meta property="og:description" content="Watch short-form video stories and system design deep-dives from verified tech leaders worldwide." />
        <meta property="og:type" content="video.other" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TalentXcel Reels — Global Tech, AI & Career Stories" />
        <meta name="twitter:description" content="Discover inspiring career stories and engineering breakdowns from global tech leaders." />
        <link rel="canonical" href="https://talentxcel.in/reels" />
      </Helmet>
      
      {/* Centered responsive container (9:16 on desktop, 100% on mobile) */}
      <div className="w-full h-[100dvh] overflow-hidden bg-slate-950 flex justify-center">
        <div className="w-full max-w-[480px] h-full relative bg-black shadow-2xl border-x border-slate-900/60 overflow-hidden">
          {/* Header with Tab switcher and Category pills */}
          <ReelsHeader
            activeTab={activeTab}
            onTabChange={handleTabChange}
            category={category}
            onCategoryChange={setCategory}
            onSearch={() => navigate('/talent')}
            onNotifications={() => navigate('/mobile/notifications')}
            onMessages={() => navigate('/network/messages')}
            notificationCount={0}
            messageCount={0}
          />

          {/* Infinite Reels Feed with responsive controls and category support */}
          <InfiniteReelsFeed 
            onUploadClick={() => setShowUploadModal(true)}
            feedType={activeTab}
            category={category}
          />

          {/* Global bottom navigation handled by PageSpecificBottomNav */}
          {/* Upload Modal */}
          <ReelsUploadModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onUploadSuccess={handleUploadSuccess}
          />
        </div>
      </div>
    </>
  );
};

export default MobileReels;
