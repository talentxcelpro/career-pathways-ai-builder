import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AppInstallBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);
    
    if (!standalone) {
      const dismissed = localStorage.getItem('install-banner-dismissed');
      if (!dismissed) {
        // Show banner after a short delay
        setTimeout(() => setShowBanner(true), 1000);
      }
    }
  }, []);

  const handleInstall = () => {
    // Trigger the universal prompt
    const installEvent = new CustomEvent('show-install-prompt');
    window.dispatchEvent(installEvent);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('install-banner-dismissed', 'true');
  };

  if (isStandalone || !showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg"
      >
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-full">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Get the TalentXcel App</p>
              <p className="text-xs opacity-90">Lightning fast • Offline support • Push notifications</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleInstall}
              className="h-8 text-xs bg-white/20 hover:bg-white/30 text-primary-foreground border-white/30"
            >
              <Download className="h-3 w-3 mr-1" />
              Install
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleDismiss}
              className="h-8 w-8 text-primary-foreground hover:bg-white/20"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};