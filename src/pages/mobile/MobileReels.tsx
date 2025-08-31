import React, { useState } from 'react';
import { InfiniteReelsFeed } from '@/components/reels/InfiniteReelsFeed';
import { ReelsUploadModal } from '@/components/mobile/ReelsUploadModal';
import { toast } from 'sonner';

export const MobileReels = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleUploadSuccess = () => {
    toast.success("Your reel has been uploaded successfully!");
};

  return (
    <>
      <InfiniteReelsFeed 
        onUploadClick={() => setShowUploadModal(true)}
      />
      
      {/* Upload Modal */}
      <ReelsUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
};