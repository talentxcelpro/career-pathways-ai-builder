import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { X, Download, Share, Plus } from 'lucide-react';

export function InstallPrompt() {
  const { canInstall, isIOS, installApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Check if user has dismissed the prompt before
  useEffect(() => {
    const isDismissed = localStorage.getItem('pwa-install-dismissed');
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleInstall = async () => {
    if (isIOS) {
      setShowInstructions(true);
    } else {
      const success = await installApp();
      if (success) {
        setDismissed(true);
      }
    }
  };

  if (dismissed || !canInstall) {
    return null;
  }

  if (showInstructions && isIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <Card className="bg-primary text-primary-foreground p-6 rounded-lg shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Download className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Install TalentXcel App</h3>
                <p className="text-sm opacity-90">Follow these steps to install:</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-primary-foreground hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div className="flex items-center gap-2">
                <span>Tap the Share button</span>
                <Share className="h-4 w-4" />
                <span>below</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div className="flex items-center gap-2">
                <span>Select "Add to Home Screen"</span>
                <Plus className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleDismiss}
              variant="outline" 
              className="flex-1 bg-white/20 border-white/30 text-primary-foreground hover:bg-white/30"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDismiss}
              className="flex-1 bg-white text-primary hover:bg-white/90"
            >
              Got it
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="bg-primary text-primary-foreground p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Install TalentXcel App</h3>
              <p className="text-sm opacity-90">
                Install the TalentXcel app for a better experience
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-primary-foreground hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleDismiss}
            variant="outline" 
            className="flex-1 bg-white/20 border-white/30 text-primary-foreground hover:bg-white/30"
          >
            Cancel
          </Button>
          <Button
            onClick={handleInstall}
            className="flex-1 bg-white text-primary hover:bg-white/90"
          >
            Install
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Floating install button for persistent access
export function InstallButton() {
  const { canInstall, isIOS, installApp } = usePWA();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Show button after user has been on site for a while
    const timer = setTimeout(() => {
      if (canInstall) {
        setShowButton(true);
      }
    }, 30000); // Show after 30 seconds

    return () => clearTimeout(timer);
  }, [canInstall]);

  const handleInstall = async () => {
    if (isIOS) {
      // Show instructions for iOS
      alert('To install: Tap Share button → Add to Home Screen');
    } else {
      await installApp();
    }
  };

  if (!showButton || !canInstall) {
    return null;
  }

  return (
    <Button
      onClick={handleInstall}
      className="fixed bottom-20 right-4 z-40 rounded-full w-14 h-14 shadow-lg"
      size="sm"
    >
      <Download className="h-5 w-5" />
    </Button>
  );
}