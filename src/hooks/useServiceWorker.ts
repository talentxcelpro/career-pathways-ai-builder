import { useEffect, useState } from 'react';

interface NetworkState {
  isOnline: boolean;
}

export const useServiceWorker = () => {
  const [state, setState] = useState<NetworkState>({
    isOnline: navigator.onLine,
  });

  useEffect(() => {
    const handleOnline = () => setState({ isOnline: true });
    const handleOffline = () => setState({ isOnline: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline: state.isOnline,
    isSupported: false,
    isRegistered: false,
    updateAvailable: false,
    updateServiceWorker: () => {}
  };
};