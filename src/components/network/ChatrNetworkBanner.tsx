import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, Wallet, X } from 'lucide-react';

export const ChatrNetworkBanner: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      setIsMobile(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent));
    };
    checkMobile();
  }, []);

  const handleOpenChatr = () => {
    window.open('https://chatr.chat', '_blank');
  };

  const handleInstallApp = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/android/.test(userAgent)) {
      window.open('https://play.google.com/store/apps/details?id=com.chatr.app', '_blank');
    } else {
      window.open('https://chatr.chat', '_blank');
    }
  };

  if (isDismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-ai-violet/10 to-accent/10 backdrop-blur-sm mb-6">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-ai-violet/5 animate-pulse" />
      
      {/* Dismiss button */}
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-background/50 transition-colors z-10"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>

      <div className="relative z-10 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Logo & Text */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-ai-violet flex items-center justify-center shadow-lg shadow-primary/30">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold bg-gradient-to-r from-primary via-ai-violet to-accent bg-clip-text text-transparent">
                  CHATR
                </h3>
                <span className="text-xs font-medium text-muted-foreground">by TalentXcel</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Chat, call & collaborate with your network
              </p>
            </div>
          </div>

          {/* Features pills */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/60 border border-border/50">
              <MessageCircle className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium">Chat</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/60 border border-border/50">
              <Phone className="w-3.5 h-3.5 text-ai-violet" />
              <span className="text-xs font-medium">Call</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/60 border border-border/50">
              <Wallet className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-medium">Pay</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isMobile ? (
              <>
                <Button
                  onClick={handleInstallApp}
                  size="sm"
                  className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-ai-violet hover:from-primary/90 hover:to-ai-violet/90 text-white font-semibold shadow-lg shadow-primary/30"
                >
                  Install App
                </Button>
                <Button
                  onClick={handleOpenChatr}
                  size="sm"
                  variant="outline"
                  className="flex-1 sm:flex-none border-primary/30 hover:border-primary"
                >
                  Open Web
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleOpenChatr}
                  size="sm"
                  className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-ai-violet hover:from-primary/90 hover:to-ai-violet/90 text-white font-semibold shadow-lg shadow-primary/30"
                >
                  Open CHATR
                </Button>
                <Button
                  onClick={handleInstallApp}
                  size="sm"
                  variant="outline"
                  className="flex-1 sm:flex-none border-primary/30 hover:border-primary"
                >
                  Get App
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
