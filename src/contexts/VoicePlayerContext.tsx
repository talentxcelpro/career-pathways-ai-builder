import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  DEFAULT_VOICE_ID,
  VOICE_PERSONAS,
  VoicePersona,
  getPersona,
  pickBrowserVoice,
} from '@/lib/voices/voiceCatalog';

const STORAGE_KEYS = {
  voice: 'tx_voice_persona_id',
  rate: 'tx_voice_rate',
  volume: 'tx_voice_volume',
};

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface PlayPayload {
  text: string;
  source?: string; // e.g. "Resume preview", "Job description"
  voiceId?: string;
}

interface VoicePlayerContextValue {
  status: PlaybackStatus;
  source: string | null;
  text: string | null;
  voice: VoicePersona;
  voices: VoicePersona[];
  rate: number;
  volume: number;
  progress: number; // 0..1
  duration: number;
  currentTime: number;
  errorMessage: string | null;
  setVoice: (id: string) => void;
  setRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  play: (payload: PlayPayload) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (seconds: number) => void;
  previewVoice: (id: string) => Promise<void>;
}

const VoicePlayerContext = createContext<VoicePlayerContextValue | undefined>(undefined);

const SAMPLE_TEXT =
  "Hi, I'm your TalentXcel reading voice. I'll help you listen to resumes, jobs, and lessons.";

export const VoicePlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [source, setSource] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [voiceId, setVoiceIdState] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_VOICE_ID;
    return localStorage.getItem(STORAGE_KEYS.voice) || DEFAULT_VOICE_ID;
  });
  const [rate, setRateState] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    return Number(localStorage.getItem(STORAGE_KEYS.rate)) || 1;
  });
  const [volume, setVolumeState] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const v = Number(localStorage.getItem(STORAGE_KEYS.volume));
    return Number.isFinite(v) && v > 0 ? v : 1;
  });
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);

  const voice = useMemo(() => getPersona(voiceId), [voiceId]);

  // Persist prefs
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.voice, voiceId); } catch {} }, [voiceId]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.rate, String(rate)); } catch {} }, [rate]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.volume, String(volume)); } catch {} }, [volume]);

  // Apply volume / rate live to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = rate;
    }
  }, [volume, rate]);

  const stopAll = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (fallbackTimerRef.current) {
      window.clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    utteranceRef.current = null;
  }, []);

  const playWithBrowser = useCallback((payload: PlayPayload, persona: VoicePersona) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setStatus('error');
      setErrorMessage('Speech synthesis not available in this browser.');
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    const utter = new SpeechSynthesisUtterance(payload.text);
    utter.rate = (persona.browserHints.rate ?? 1) * rate;
    utter.pitch = persona.browserHints.pitch ?? 1;
    utter.volume = volume;

    const assignVoice = () => {
      const all = synth.getVoices();
      const matched = pickBrowserVoice(persona, all);
      if (matched) utter.voice = matched;
    };
    assignVoice();
    if (!utter.voice) {
      // Voices may load async on Chrome
      const handler = () => { assignVoice(); synth.removeEventListener('voiceschanged', handler); };
      synth.addEventListener('voiceschanged', handler);
    }

    // Approximate progress: ~14 chars/sec at rate=1
    const estDuration = Math.max(2, payload.text.length / (14 * (utter.rate || 1)));
    setDuration(estDuration);
    setCurrentTime(0);
    const startedAt = performance.now();
    fallbackTimerRef.current = window.setInterval(() => {
      const elapsed = (performance.now() - startedAt) / 1000;
      setCurrentTime(Math.min(elapsed, estDuration));
    }, 250);

    utter.onstart = () => setStatus('playing');
    utter.onend = () => {
      if (fallbackTimerRef.current) window.clearInterval(fallbackTimerRef.current);
      setCurrentTime(estDuration);
      setStatus('idle');
    };
    utter.onerror = (e) => {
      if (fallbackTimerRef.current) window.clearInterval(fallbackTimerRef.current);
      setStatus('error');
      setErrorMessage(e.error || 'Playback error');
    };

    utteranceRef.current = utter;
    synth.speak(utter);
  }, [rate, volume]);

  const playWithElevenLabs = useCallback(async (payload: PlayPayload, persona: VoicePersona): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
        body: { text: payload.text, voiceId: persona.elevenLabsId },
      });
      if (error || !data?.audioContent) {
        // Will trigger fallback
        return false;
      }
      const audio = new Audio(`data:audio/mpeg;base64,${data.audioContent}`);
      audio.volume = volume;
      audio.playbackRate = rate;
      audio.onloadedmetadata = () => setDuration(audio.duration || 0);
      audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
      audio.onended = () => setStatus('idle');
      audio.onerror = () => {
        setStatus('error');
        setErrorMessage('Playback failed');
      };
      audioRef.current = audio;
      await audio.play();
      setStatus('playing');
      return true;
    } catch (err) {
      console.warn('ElevenLabs failed, falling back to browser TTS', err);
      return false;
    }
  }, [rate, volume]);

  const play = useCallback(async (payload: PlayPayload) => {
    if (!payload.text?.trim()) return;
    stopAll();
    setErrorMessage(null);
    setSource(payload.source ?? null);
    setText(payload.text);
    const persona = getPersona(payload.voiceId ?? voiceId);
    setStatus('loading');

    const ok = await playWithElevenLabs(payload, persona);
    if (!ok) {
      playWithBrowser(payload, persona);
    }
  }, [playWithElevenLabs, playWithBrowser, stopAll, voiceId]);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setStatus('paused');
      return;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setStatus('paused');
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused && audioRef.current.src) {
      audioRef.current.play().catch(() => {});
      setStatus('playing');
      return;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setStatus('playing');
    }
  }, []);

  const stop = useCallback(() => {
    stopAll();
    setStatus('idle');
    setCurrentTime(0);
    setDuration(0);
    setSource(null);
    setText(null);
  }, [stopAll]);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(seconds, audioRef.current.duration || 0));
      setCurrentTime(audioRef.current.currentTime);
    }
    // Browser SpeechSynthesis does not support seeking — no-op
  }, []);

  const setVoice = useCallback((id: string) => {
    setVoiceIdState(id);
  }, []);

  const previewVoice = useCallback(async (id: string) => {
    const persona = getPersona(id);
    await play({ text: SAMPLE_TEXT, source: `Preview · ${persona.name}`, voiceId: id });
  }, [play]);

  // Cleanup on unmount
  useEffect(() => () => stopAll(), [stopAll]);

  const value: VoicePlayerContextValue = {
    status,
    source,
    text,
    voice,
    voices: VOICE_PERSONAS,
    rate,
    volume,
    progress: duration > 0 ? Math.min(currentTime / duration, 1) : 0,
    duration,
    currentTime,
    errorMessage,
    setVoice,
    setRate: setRateState,
    setVolume: setVolumeState,
    play,
    pause,
    resume,
    stop,
    seek,
    previewVoice,
  };

  return <VoicePlayerContext.Provider value={value}>{children}</VoicePlayerContext.Provider>;
};

export const useVoicePlayer = (): VoicePlayerContextValue => {
  const ctx = useContext(VoicePlayerContext);
  if (!ctx) throw new Error('useVoicePlayer must be used within VoicePlayerProvider');
  return ctx;
};
