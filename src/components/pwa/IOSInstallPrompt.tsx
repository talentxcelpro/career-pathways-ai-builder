import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Share, Plus, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export function IOSInstallPrompt() {
  const { isIOS, isInstalled } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isIOS || isInstalled) return;

    // Check if user has dismissed the prompt before
    const isDismissed = localStorage.getItem('ios-install-dismissed');
    if (isDismissed) {
      setDismissed(true);
      return;
    }

    // Show the prompt after a delay
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isIOS, isInstalled]);

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('ios-install-dismissed', 'true');
  };

  if (!isIOS || isInstalled || dismissed || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in">
      <Card className="bg-gradient-to-r from-primary to-blue-600 text-white p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Install TalentXcel App</h3>
              <p className="text-sm opacity-90">Get the full app experience</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-white hover:bg-white/20 -mt-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Tap the Share button</span>
              <Share className="h-4 w-4" />
              <span className="text-sm">below</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Select "Add to Home Screen"</span>
              <Plus className="h-4 w-4" />
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
            <span className="text-sm">Tap "Add" to install</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleDismiss}
            variant="outline" 
            className="flex-1 bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleDismiss}
            className="flex-1 bg-white text-primary hover:bg-white/90"
          >
            Got It!
          </Button>
        </div>
      </Card>
    </div>
  );
}