
import React, { useState } from 'react';
import { PerformantReelsFeed } from '@/components/performance/PerformantReelsFeed';
import { ReelsUploadModal } from '@/components/mobile/ReelsUploadModal';
import { Button } from '@/components/ui/button';
import { Plus, Home, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const MobileReels = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const navigate = useNavigate();

  const handleUploadSuccess = () => {
    toast.success("Your reel has been uploaded successfully!");
    setShowUploadModal(false);
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-black relative">
      {/* Mobile Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/50 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <h1 className="text-xl font-bold">TalentXcel Reels</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowUploadModal(true)}
            className="text-white hover:bg-white/20 rounded-full"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Performance Optimized Reels Feed */}
      <PerformantReelsFeed 
        enablePerformanceMonitoring={true}
        className="h-full"
        onUploadClick={() => setShowUploadModal(true)}
      />

      {/* Mobile Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-t border-white/20">
        <div className="flex items-center justify-around py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/20 rounded-full h-8 w-8"
          >
            <Home className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/jobs')}
            className="text-white hover:bg-white/20 rounded-full h-8 w-8"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-full h-9 w-9"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/network')}
            className="text-white hover:bg-white/20 rounded-full h-8 w-8"
          >
            <User className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            className="text-white hover:bg-white/20 rounded-full h-8 w-8"
          >
            <User className="h-4 w-4" />
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
  );
};
