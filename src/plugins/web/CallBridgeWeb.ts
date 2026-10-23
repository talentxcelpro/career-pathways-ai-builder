import { WebPlugin, PluginListenerHandle } from '@capacitor/core';
import type { CallBridgePlugin, IncomingCallPayload } from '../call-bridge';

export class CallBridgeWeb extends WebPlugin implements CallBridgePlugin {
  async reportReady(): Promise<void> {
    console.debug('[CallBridgeWeb] Web call bridge ready');
  }

  async showIncomingCall(options: IncomingCallPayload): Promise<{ shown: boolean }> {
    console.info('[CallBridgeWeb] Incoming call simulation on web:', options);

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`Incoming ${options.callType} call`, {
          body: `${options.callerName} is calling you on TalentXcel`,
          icon: options.callerAvatar || '/favicon.ico',
        });
      } catch (e) {
        console.debug('[CallBridgeWeb] Notification display suppressed:', e);
      }
    }

    // Emit event so in-app React modal can show
    this.notifyListeners('incomingCall', options);
    return { shown: true };
  }

  async dismissIncomingCall(options: { callId: string }): Promise<void> {
    console.info('[CallBridgeWeb] Dismissed incoming call:', options);
  }

  override addListener(
    eventName: string,
    listenerFunc: (data: unknown) => void
  ): Promise<PluginListenerHandle> {
    return super.addListener(eventName, listenerFunc);
  }
}
