import { registerPlugin, PluginListenerHandle } from '@capacitor/core';

export interface IncomingCallPayload {
  callId: string;
  callerName: string;
  callerAvatar?: string;
  callType: 'video' | 'audio';
  roomUrl?: string;
}

export interface CallBridgePlugin {
  /**
   * Notifies native layer that the JavaScript runtime is initialized and listening for call events.
   */
  reportReady(): Promise<void>;

  /**
   * Displays full-screen native incoming call UI (CallKit on iOS, Full-screen lockscreen notification on Android).
   */
  showIncomingCall(options: IncomingCallPayload): Promise<{ shown: boolean }>;

  /**
   * Dismisses the incoming call notification / ends CallKit ringing.
   */
  dismissIncomingCall(options: { callId: string }): Promise<void>;

  /**
   * Listener fired when user taps Answer in the native incoming call UI.
   */
  addListener(
    eventName: 'callAnswered',
    listener: (data: { callId: string; callType?: string }) => void
  ): Promise<PluginListenerHandle>;

  /**
   * Listener fired when user taps Decline in the native incoming call UI.
   */
  addListener(
    eventName: 'callDeclined',
    listener: (data: { callId: string }) => void
  ): Promise<PluginListenerHandle>;

  /**
   * Listener fired when a background VoIP push arrives and notifies JavaScript.
   */
  addListener(
    eventName: 'incomingCall',
    listener: (data: IncomingCallPayload) => void
  ): Promise<PluginListenerHandle>;
}

export const CallBridge = registerPlugin<CallBridgePlugin>('CallBridge', {
  web: () => import('./web/CallBridgeWeb').then((m) => new m.CallBridgeWeb()),
});
