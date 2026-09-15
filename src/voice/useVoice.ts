import { useVoicePlayer } from './VoicePlayerContext';

export function useVoice() {
  const voice = useVoicePlayer();

  return {
    isPlaying: voice.isPlaying,
    isPaused: voice.isPaused,
    currentText: voice.currentText,
    progress: voice.progress,
    provider: voice.provider,
    speak: voice.play,
    pause: voice.pause,
    resume: voice.resume,
    stop: voice.stop,
  };
}
