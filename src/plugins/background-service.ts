import { registerPlugin } from '@capacitor/core';

export interface ForegroundServiceOptions {
  title: string;
  body: string;
  notificationId?: number;
  importance?: 'low' | 'default' | 'high';
  actionUrl?: string;
}

export interface BackgroundTaskOptions {
  taskId: string;
  minIntervalMs?: number;
  requiresNetwork?: boolean;
}

export interface BackgroundServicePlugin {
  /**
   * Starts an Android Foreground Service with an unkillable sticky notification.
   * Keeps execution active even when the app is backgrounded or device is locked.
   */
  startForegroundService(options: ForegroundServiceOptions): Promise<{ success: boolean; serviceId?: number }>;

  /**
   * Stops the ongoing Foreground Service and removes the sticky notification.
   */
  stopForegroundService(options?: { notificationId?: number }): Promise<{ success: boolean }>;

  /**
   * Schedules a background task using Android WorkManager / iOS BGTaskScheduler.
   */
  scheduleBackgroundTask(options: BackgroundTaskOptions): Promise<{ success: boolean }>;

  /**
   * Queries whether the foreground daemon is currently executing.
   */
  isBackgroundServiceRunning(): Promise<{ running: boolean }>;
}

export const BackgroundService = registerPlugin<BackgroundServicePlugin>('BackgroundService', {
  web: () => import('./web/BackgroundServiceWeb').then((m) => new m.BackgroundServiceWeb()),
});
