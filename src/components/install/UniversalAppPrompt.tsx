import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, X, Smartphone, Monitor, Apple } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface UniversalAppPromptProps {
  showImmediate?: boolean;
  className?: string;
}

export const UniversalAppPrompt: React.FC<UniversalAppPromptProps> = ({ 
  showImmediate = false,
  className = ""
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(showImmediate);
  const [showManualInstructions, setShowManualInstructions] = useState(false);
  const { triggerHaptic } = useHapticFeedback();

  // Detect platform
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  useEffect(() => {
    // Don't show if already installed
    if (isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      const dismissed = localStorage.getItem('app-install-dismissed');
      const lastShown = localStorage.getItem('app-install-last-shown');
      const now = Date.now();
      
      // Show again after 7 days even if dismissed
      if (!dismissed || (lastShown && now - parseInt(lastShown) > 7 * 24 * 60 * 60 * 1000)) {
        setTimeout(() => setShowPrompt(true), showImmediate ? 0 : 2000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS and other browsers without beforeinstallprompt
    if (!deferredPrompt && !localStorage.getItem('app-install-dismissed')) {
      setTimeout(() => {
        setShowPrompt(true);
        setShowManualInstructions(true);
      }, showImmediate ? 0 : 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [deferredPrompt, showImmediate]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      triggerHaptic?.('medium');
      deferredPrompt.prompt();
      
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        triggerHaptic?.('success');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } else {
      setShowManualInstructions(true);
    }
  };

  const handleDismiss = () => {
    triggerHaptic?.('light');
    setShowPrompt(false);
    localStorage.setItem('app-install-dismissed', 'true');
    localStorage.setItem('app-install-last-shown', Date.now().toString());
  };

  const handleRemindLater = () => {
    triggerHaptic?.('light');
    setShowPrompt(false);
    // Show again in 24 hours
    localStorage.setItem('app-install-last-shown', (Date.now() - 6 * 24 * 60 * 60 * 1000).toString());
  };

  if (!showPrompt || isStandalone) return null;

  const getInstallInstructions = () => {
    if (isIOS) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Apple className="h-4 w-4" />
            <span>iOS Installation:</span>
          </div>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Tap the Share button in Safari</li>
            <li>Scroll down and tap "Add to Home Screen"</li>
            <li>Tap "Add" to install TalentXcel</li>
          </ol>
        </div>
      );
    }
    
    if (isMobile) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Smartphone className="h-4 w-4" />
            <span>Android Installation:</span>
          </div>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Tap the menu (⋮) in your browser</li>
            <li>Select "Add to Home screen" or "Install app"</li>
            <li>Tap "Add" or "Install"</li>
          </ol>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Monitor className="h-4 w-4" />
          <span>Desktop Installation:</span>
        </div>
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Look for the install icon in your browser's address bar</li>
          <li>Or check browser menu for "Install TalentXcel"</li>
          <li>Click "Install" to add to your desktop</li>
        </ol>
      </div>
    );
  };

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 animate-fade-in ${className}`}>
      <Card className="p-4 bg-card/95 backdrop-blur-sm border shadow-xl">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2 rounded-full shrink-0">
            <Download className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">Get the TalentXcel App</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Install for instant access, offline support, and push notifications
            </p>
            
            {showManualInstructions ? (
              <div className="space-y-3">
                {getInstallInstructions()}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setShowManualInstructions(false)}
                    className="h-8 text-xs"
                  >
                    Back
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={handleDismiss}
                    className="h-8 text-xs"
                  >
                    Got it
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 flex-wrap">
                <Button 
                  size="sm" 
                  onClick={handleInstall}
                  className="h-8 text-xs"
                >
                  {deferredPrompt ? 'Install Now' : 'Show Instructions'}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleRemindLater}
                  className="h-8 text-xs"
                >
                  Remind Later
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleDismiss}
                  className="h-8 text-xs"
                >
                  Not Now
                </Button>
              </div>
            )}
          </div>
          
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 shrink-0"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};