import { Capacitor } from '@capacitor/core';

export const isNativePushEnabled = () => {
  return Capacitor.isNativePlatform();
};

export const warnNativePushDisabled = () => {
  console.warn('Native push notifications skipped: this is not a native Capacitor runtime.');
};

export const getNativePushNotifications = () => {
  if (!isNativePushEnabled()) {
    return null;
  }

  const capacitor = (window as any).Capacitor;
  const plugin = capacitor?.Plugins?.PushNotifications;

  if (!plugin) {
    console.warn('Native push notifications skipped: PushNotifications plugin is not installed.');
    return null;
  }

  return plugin as {
    checkPermissions: () => Promise<any>;
    requestPermissions: () => Promise<any>;
    register: () => Promise<void>;
    addListener: (eventName: string, listener: (payload: any) => void) => Promise<any> | any;
    removeAllListeners: () => Promise<void>;
  };
};
