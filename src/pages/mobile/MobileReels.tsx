import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { InfiniteReelsPulse } from '@/components/Pulse/InfiniteReelsPulse';
import { ReelsUploadModal } from '@/components/mobile/ReelsUploadModal';
import { ReelsHeader } from '@/components/mobile/ReelsHeader';
import { Button } from '@/components/ui/button';
import { Plus, Home, Search, User, Heart, MessageCircle, Zap, Shield, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { realtimeManager } from '@/lib/realtimeManager';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export const MobileReels = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'following' | 'explore'>('explore');
  const navigate = useNavigate();

  useEffect(() => {
    try {
      realtimeManager.cleanup();
    } catch (error) {
      console.warn('Failed to cleanup realtime:', error);
    }
  }, []);

  const handleUploadSuccess = () => {
    toast.success("Talent story shared successfully!");
    setShowUploadModal(false);
  };

  return (
    <div className="edge-to-edge">
      <Helmet>
        <title>Talent Reels | Professional Discovery | TalentXcel</title>
        <meta name="description" content="High-velocity professional stories and Professional Intelligence signals on TalentXcel." />
      </Helmet>
      
      <div className="w-full h-screen overflow-hidden bg-slate-950 relative">
        {/* TalentXcel Stream Header */}
        <div className="absolute top-0 left-0 right-0 z-[60] bg-gradient-to-b from-black/80 via-black/40 to-transparent pt-12 pb-8 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-apple-heavy text-white tracking-tight">Talent Reels</h1>
            </div>
            
            <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/10">
              <button 
                onClick={() => setActiveTab('explore')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-apple-heavy transition-all",
                  activeTab === 'explore' ? "bg-white text-slate-950" : "text-white/60"
                )}
              >
                DISCOVER
              </button>
              <button 
                onClick={() => setActiveTab('following')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-apple-heavy transition-all",
                  activeTab === 'following' ? "bg-white text-slate-950" : "text-white/60"
                )}
              >
                FOLLOWING
              </button>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/communication/messages')}
              className="rounded-full bg-white/10 backdrop-blur-md text-white border border-white/10"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Infinite Reels Pulse - Main Stream */}
        <InfiniteReelsPulse 
          onUploadClick={() => setShowUploadModal(true)}
          PulseType={activeTab}
        />

        {/* Premium Bottom Navigation Overlays */}
        <div className="absolute bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-20 bg-gradient-to-t from-black via-black/60 to-transparent">
          <div className="flex items-center justify-between max-w-lg mx-auto bg-white/10 backdrop-blur-2xl rounded-[32px] border border-white/10 p-2 shadow-2xl">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="rounded-2xl h-14 w-14 text-white/60 hover:text-white hover:bg-white/10"
            >
              <Home className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/network')}
              className="rounded-2xl h-14 w-14 text-white/60 hover:text-white hover:bg-white/10"
            >
              <Sparkles className="h-6 w-6" />
            </Button>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 text-white rounded-[24px] h-16 w-16 shadow-xl shadow-blue-500/20 hover:bg-blue-500"
              >
                <Plus className="h-8 w-8" />
              </Button>
            </motion.div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/communication/messages')}
              className="rounded-2xl h-14 w-14 text-white/60 hover:text-white hover:bg-white/10"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
              className="rounded-2xl h-14 w-14 text-white/60 hover:text-white hover:bg-white/10"
            >
              <User className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-1 text-[10px] font-apple-bold text-white/40 uppercase tracking-tighter">
              <Shield className="h-3 w-3" /> TalentXcel Encrypted Stream
            </div>
          </div>
        </div>
      
        {/* Upload Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <ReelsUploadModal
              isOpen={showUploadModal}
              onClose={() => setShowUploadModal(false)}
              onUploadSuccess={handleUploadSuccess}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MobileReels;
