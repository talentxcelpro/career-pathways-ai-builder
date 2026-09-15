import type { ButtonProps } from '@/components/ui/button';

export type VoiceProvider = 'elevenlabs' | 'browser';

export interface VoiceStorageState {
  voice_enabled: boolean;
  last_text: string;
  provider: VoiceProvider;
}

export interface VoiceEngineCallbacks {
  onStart?: (provider: VoiceProvider) => void;
  onProgress?: (progress: number) => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
}

export interface VoicePlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string;
  progress: number;
  provider: VoiceProvider;
}

export interface VoicePlayerContextValue extends VoicePlayerState {
  play: (text: string) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

export interface VoiceButtonProps {
  text?: string | null;
  label?: string;
  className?: string;
  disabled?: boolean;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
}
