import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import {
  getPreferredProvider,
  pauseVoicePlayback,
  resumeVoicePlayback,
  speak as engineSpeak,
  stopVoicePlayback,
} from './VoiceEngine';
import type { VoicePlayerContextValue, VoicePlayerState, VoiceProvider, VoiceStorageState } from './types';

const STORAGE_KEY = 'talentxcel_voice_player';

const defaultState: VoicePlayerState = {
  isPlaying: false,
  isPaused: false,
  currentText: '',
  progress: 0,
  provider: getPreferredProvider(),
};

const VoicePlayerContext = createContext<VoicePlayerContextValue | null>(null);

function readStoredState(): VoiceStorageState | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<VoiceStorageState>;
    if (parsed.provider !== 'elevenlabs' && parsed.provider !== 'browser') return null;

    return {
      voice_enabled: parsed.voice_enabled !== false,
      last_text: parsed.last_text || '',
      provider: parsed.provider,
    };
  } catch {
    return null;
  }
}

function persistVoiceState(lastText: string, provider: VoiceProvider, enabled = true) {
  if (typeof window === 'undefined') return;

  const payload: VoiceStorageState = {
    voice_enabled: enabled,
    last_text: lastText,
    provider,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage failure should never block voice playback.
  }
}

export function VoicePlayerProvider({ children }: { children: React.ReactNode }) {
  const activeRequestRef = useRef(0);
  const [state, setState] = useState<VoicePlayerState>(() => {
    const stored = readStoredState();
    if (!stored) return defaultState;

    return {
      ...defaultState,
      currentText: stored.last_text,
      provider: stored.provider,
    };
  });

  const play = useCallback(async (text: string) => {
    const cleanText = text?.trim();
    if (!cleanText) return;

    const requestId = activeRequestRef.current + 1;
    activeRequestRef.current = requestId;
    const initialProvider = getPreferredProvider();

    setState({
      isPlaying: true,
      isPaused: false,
      currentText: cleanText,
      progress: 0,
      provider: initialProvider,
    });
    persistVoiceState(cleanText, initialProvider);

    try {
      await engineSpeak(cleanText, {
        onStart: (provider) => {
          if (activeRequestRef.current !== requestId) return;
          setState((current) => ({
            ...current,
            provider,
            isPlaying: true,
            isPaused: false,
          }));
          persistVoiceState(cleanText, provider);
        },
        onProgress: (progress) => {
          if (activeRequestRef.current !== requestId) return;
          setState((current) => ({
            ...current,
            progress,
          }));
        },
        onEnd: () => {
          if (activeRequestRef.current !== requestId) return;
          setState((current) => ({
            ...current,
            isPlaying: false,
            isPaused: false,
            progress: 1,
          }));
        },
        onError: (error) => {
          console.warn('Voice provider failed, falling back when possible:', error);
        },
      });
    } catch (error) {
      if (activeRequestRef.current !== requestId) return;
      console.warn('Voice playback failed:', error);
      setState((current) => ({
        ...current,
        isPlaying: false,
        isPaused: false,
      }));
    }
  }, []);

  const pause = useCallback(() => {
    pauseVoicePlayback();
    setState((current) => ({
      ...current,
      isPlaying: false,
      isPaused: Boolean(current.currentText),
    }));
  }, []);

  const resume = useCallback(() => {
    resumeVoicePlayback();
    setState((current) => ({
      ...current,
      isPlaying: Boolean(current.currentText),
      isPaused: false,
    }));
  }, []);

  const stop = useCallback(() => {
    activeRequestRef.current += 1;
    stopVoicePlayback();
    setState((current) => {
      persistVoiceState('', current.provider);
      return {
        ...current,
        isPlaying: false,
        isPaused: false,
        currentText: '',
        progress: 0,
      };
    });
  }, []);

  const value = useMemo<VoicePlayerContextValue>(
    () => ({
      ...state,
      play,
      pause,
      resume,
      stop,
    }),
    [pause, play, resume, state, stop]
  );

  return <VoicePlayerContext.Provider value={value}>{children}</VoicePlayerContext.Provider>;
}

export function useVoicePlayer() {
  const context = useContext(VoicePlayerContext);
  if (!context) {
    throw new Error('useVoicePlayer must be used inside VoicePlayerProvider.');
  }
  return context;
}
