import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const useAppInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const fullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      setIsInstalled(standalone || fullscreen);
    };

    checkInstalled();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsInstallable(false);
      console.log('PWA was installed');
    };

    // Listen for custom install prompt trigger
    const handleShowInstallPrompt = () => {
      if (deferredPrompt) {
        installApp();
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('show-install-prompt', handleShowInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('show-install-prompt', handleShowInstallPrompt);
    };
  }, [deferredPrompt]);

  const installApp = async () => {
    if (!deferredPrompt) return false;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        return true;
      } else {
        console.log('User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('Error during installation:', error);
      return false;
    } finally {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  const getInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isIOS) {
      return {
        platform: 'iOS',
        steps: [
          'Tap the Share button in Safari',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to install TalentXcel'
        ]
      };
    }
    
    if (isMobile) {
      return {
        platform: 'Android',
        steps: [
          'Tap the menu (⋮) in your browser',
          'Select "Add to Home screen" or "Install app"',
          'Tap "Add" or "Install"'
        ]
      };
    }

    return {
      platform: 'Desktop',
      steps: [
        'Look for the install icon in your browser\'s address bar',
        'Or check browser menu for "Install TalentXcel"',
        'Click "Install" to add to your desktop'
      ]
    };
  };

  return {
    deferredPrompt,
    isInstallable,
    isInstalled,
    installApp,
    getInstallInstructions
  };
};