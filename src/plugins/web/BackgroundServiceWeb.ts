import { WebPlugin } from '@capacitor/core';
import type { BackgroundServicePlugin, ForegroundServiceOptions, BackgroundTaskOptions } from '../background-service';

export class BackgroundServiceWeb extends WebPlugin implements BackgroundServicePlugin {
  private isRunning = false;

  async startForegroundService(options: ForegroundServiceOptions): Promise<{ success: boolean; serviceId?: number }> {
    console.info('[BackgroundServiceWeb] Foreground services are an Android/iOS native capability. Simulating in browser:', options);
    this.isRunning = true;
    return { success: true, serviceId: options.notificationId ?? 1001 };
  }

  async stopForegroundService(options?: { notificationId?: number }): Promise<{ success: boolean }> {
    console.info('[BackgroundServiceWeb] Stopping simulated foreground service:', options);
    this.isRunning = false;
    return { success: true };
  }

  async scheduleBackgroundTask(options: BackgroundTaskOptions): Promise<{ success: boolean }> {
    console.info('[BackgroundServiceWeb] Background task scheduled (web simulation):', options);
    return { success: true };
  }

  async isBackgroundServiceRunning(): Promise<{ running: boolean }> {
    return { running: this.isRunning };
  }
}
