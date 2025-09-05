import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Bell, 
  Smartphone, 
  Wifi, 
  Battery,
  Signal,
  X,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAFeatures = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
    setIsInstalled(isStandalone || isFullscreen);

    // PWA install prompt handling
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install banner after 30 seconds if not dismissed
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallBanner(true);
        }
      }, 30000);
    };

    // Online/Offline detection
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('You\'re back online!', { duration: 2000 });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You\'re offline. Some features may be limited.', { duration: 5000 });
    };

    // Get notification permission status
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success('App installed successfully!');
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications not supported');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Notifications enabled! You\'ll get job alerts.');
        
        // Send a test notification
        new Notification('TalentXcel', {
          body: 'You\'ll now receive job alerts and updates!',
          icon: '/icon-192x192.png',
          badge: '/icon-72x72.png'
        });
      } else {
        toast.error('Notifications denied. Enable in browser settings.');
      }
    } catch (error) {
      console.error('Notification permission error:', error);
      toast.error('Failed to enable notifications');
    }
  };

  const PWAInstallBanner = () => {
    if (!showInstallBanner || isInstalled || !deferredPrompt) return null;

    return (
      <Card className="fixed bottom-4 left-4 right-4 z-50 border-2 border-primary/20 bg-background shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Install TalentXcel</h4>
                <p className="text-xs text-muted-foreground">
                  Get faster access & offline features
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleInstallClick}>
                Install
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowInstallBanner(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getConnectionQuality = () => {
    if (!isOnline) return { type: 'offline', speed: 'No connection' };
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        type: connection.effectiveType || 'unknown',
        speed: connection.downlink ? `${connection.downlink}mbps` : 'Unknown'
      };
    }
    
    return { type: 'online', speed: 'Good' };
  };

  const connection = getConnectionQuality();

  return (
    <div className="space-y-4">
      {/* PWA Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            App Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isInstalled ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm">
                {isInstalled ? 'Installed as App' : 'Running in Browser'}
              </span>
            </div>
            {isInstalled && <Badge variant="secondary" className="text-xs">PWA</Badge>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className={`h-4 w-4 ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
              <span className="text-sm">
                {connection.type.toUpperCase()} - {connection.speed}
              </span>
            </div>
            <Badge variant={isOnline ? "secondary" : "destructive"} className="text-xs">
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className={`h-4 w-4 ${notificationPermission === 'granted' ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="text-sm">Notifications</span>
            </div>
            <Badge 
              variant={notificationPermission === 'granted' ? "secondary" : "outline"} 
              className="text-xs"
            >
              {notificationPermission === 'granted' ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Quick Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!isInstalled && deferredPrompt && (
            <Button
              onClick={handleInstallClick}
              className="w-full justify-start"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Install as App (2MB)
            </Button>
          )}

          {notificationPermission !== 'granted' && (
            <Button
              onClick={requestNotificationPermission}
              variant="outline"
              className="w-full justify-start"
              size="sm"
            >
              <Bell className="h-4 w-4 mr-2" />
              Enable Job Alerts
            </Button>
          )}

          {isInstalled && notificationPermission === 'granted' && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-300">
                  All set! Enjoy the full mobile experience.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile Optimizations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Mobile Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Battery className="h-3 w-3 text-green-500" />
              <span>Battery Optimized</span>
            </div>
            <div className="flex items-center gap-2">
              <Signal className="h-3 w-3 text-blue-500" />
              <span>Data Saver Mode</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="h-3 w-3 text-purple-500" />
              <span>Offline Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-3 w-3 text-orange-500" />
              <span>Touch Optimized</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Install Banner */}
      <PWAInstallBanner />
    </div>
  );
};