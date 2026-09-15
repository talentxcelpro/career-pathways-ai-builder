import type { VoiceEngineCallbacks, VoiceProvider } from './types';

const DEFAULT_ELEVENLABS_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';
const DEFAULT_ELEVENLABS_MODEL = 'eleven_multilingual_v2';
const ELEVENLABS_TIMEOUT_MS = Number(import.meta.env.VITE_ELEVENLABS_TIMEOUT_MS || 6000);

let activeAudio: HTMLAudioElement | null = null;
let activeObjectUrl: string | null = null;
let activeAbortController: AbortController | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeProvider: VoiceProvider = 'browser';
let runId = 0;

function normalizeText(text: string) {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function clampProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function isRunActive(id: number) {
  return id === runId;
}

function createAbortError() {
  try {
    return new DOMException('Voice playback was stopped.', 'AbortError');
  } catch {
    return new Error('Voice playback was stopped.');
  }
}

function isAbortLike(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}

function cleanupAudio() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.removeAttribute('src');
    activeAudio.load();
    activeAudio = null;
  }

  if (activeObjectUrl) {
    URL.revokeObjectURL(activeObjectUrl);
    activeObjectUrl = null;
  }
}

function stopActiveResources() {
  activeAbortController?.abort();
  activeAbortController = null;
  cleanupAudio();

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  activeUtterance = null;
}

function beginRun() {
  runId += 1;
  stopActiveResources();
  return runId;
}

export function hasElevenLabsKey() {
  return Boolean(import.meta.env.VITE_ELEVENLABS_API_KEY?.trim());
}

export function getPreferredProvider(): VoiceProvider {
  return hasElevenLabsKey() ? 'elevenlabs' : 'browser';
}

export function getActiveProvider(): VoiceProvider {
  return activeProvider;
}

export function splitTextIntoChunks(text: string, maxLength: number) {
  const normalized = normalizeText(text);
  if (!normalized) return [];
  if (normalized.length <= maxLength) return [normalized];

  const chunks: string[] = [];
  const sentences = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [normalized];

  const pushChunk = (value: string) => {
    let remaining = value.trim();
    while (remaining.length > maxLength) {
      const spaceIndex = remaining.lastIndexOf(' ', maxLength);
      const cutIndex = spaceIndex > Math.floor(maxLength * 0.45) ? spaceIndex : maxLength;
      chunks.push(remaining.slice(0, cutIndex).trim());
      remaining = remaining.slice(cutIndex).trim();
    }
    if (remaining) chunks.push(remaining);
  };

  let buffer = '';
  for (const sentence of sentences) {
    const next = sentence.trim();
    if (!next) continue;

    if (next.length > maxLength) {
      if (buffer) {
        chunks.push(buffer);
        buffer = '';
      }
      pushChunk(next);
      continue;
    }

    const candidate = buffer ? `${buffer} ${next}` : next;
    if (candidate.length > maxLength) {
      if (buffer) chunks.push(buffer);
      buffer = next;
    } else {
      buffer = candidate;
    }
  }

  if (buffer) chunks.push(buffer);
  return chunks;
}

async function fetchElevenLabsAudio(text: string) {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY?.trim();
  if (!apiKey) throw new Error('ElevenLabs key is not configured.');

  const voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID?.trim() || DEFAULT_ELEVENLABS_VOICE_ID;
  const controller = new AbortController();
  activeAbortController = controller;

  const timeout = window.setTimeout(() => controller.abort(), ELEVENLABS_TIMEOUT_MS);
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?optimize_streaming_latency=3`,
      {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: import.meta.env.VITE_ELEVENLABS_MODEL_ID || DEFAULT_ELEVENLABS_MODEL,
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs request failed with status ${response.status}.`);
    }

    return response.blob();
  } finally {
    window.clearTimeout(timeout);
    if (activeAbortController === controller) activeAbortController = null;
  }
}

function playAudioBlob(blob: Blob, id: number, index: number, total: number, callbacks: VoiceEngineCallbacks) {
  return new Promise<void>((resolve, reject) => {
    if (!isRunActive(id)) {
      reject(createAbortError());
      return;
    }

    const objectUrl = URL.createObjectURL(blob);
    const audio = new Audio(objectUrl);
    activeAudio = audio;
    activeObjectUrl = objectUrl;
    audio.preload = 'auto';

    const updateProgress = () => {
      const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 1;
      const chunkProgress = clampProgress(audio.currentTime / duration);
      callbacks.onProgress?.(clampProgress((index + chunkProgress) / total));
    };

    const cleanup = () => {
      audio.removeEventListener('timeupdate', updateProgress);
      if (activeAudio === audio) activeAudio = null;
      if (activeObjectUrl === objectUrl) {
        URL.revokeObjectURL(objectUrl);
        activeObjectUrl = null;
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => {
      updateProgress();
      cleanup();
      resolve();
    });
    audio.addEventListener('error', () => {
      cleanup();
      reject(new Error('ElevenLabs audio playback failed.'));
    });

    audio.play().then(updateProgress).catch((error) => {
      cleanup();
      reject(error);
    });
  });
}

async function playWithElevenLabs(text: string, id: number, callbacks: VoiceEngineCallbacks) {
  const chunks = splitTextIntoChunks(text, 2200);
  for (let index = 0; index < chunks.length; index += 1) {
    if (!isRunActive(id)) throw createAbortError();
    const blob = await fetchElevenLabsAudio(chunks[index]);
    if (!isRunActive(id)) throw createAbortError();
    await playAudioBlob(blob, id, index, chunks.length, callbacks);
  }
}

function speakBrowserChunk(text: string, id: number, index: number, total: number, callbacks: VoiceEngineCallbacks) {
  return new Promise<void>((resolve, reject) => {
    if (!isRunActive(id) || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      reject(createAbortError());
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    activeUtterance = utterance;
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onboundary = (event) => {
      if (!isRunActive(id)) return;
      const charProgress = text.length > 0 ? event.charIndex / text.length : 0;
      callbacks.onProgress?.(clampProgress((index + clampProgress(charProgress)) / total));
    };

    utterance.onend = () => {
      if (activeUtterance === utterance) activeUtterance = null;
      callbacks.onProgress?.(clampProgress((index + 1) / total));
      resolve();
    };

    utterance.onerror = (event) => {
      if (!isRunActive(id) || event.error === 'interrupted' || event.error === 'canceled') {
        resolve();
        return;
      }
      reject(new Error(`Browser voice playback failed: ${event.error}`));
    };

    window.speechSynthesis.speak(utterance);
  });
}

async function playWithBrowser(text: string, id: number, callbacks: VoiceEngineCallbacks) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    throw new Error('Browser SpeechSynthesis is not available.');
  }

  const chunks = splitTextIntoChunks(text, 220);
  window.speechSynthesis.cancel();

  for (let index = 0; index < chunks.length; index += 1) {
    if (!isRunActive(id)) throw createAbortError();
    await speakBrowserChunk(chunks[index], id, index, chunks.length, callbacks);
  }
}

export async function speak(text: string, callbacks: VoiceEngineCallbacks = {}) {
  const cleaned = normalizeText(text);
  if (!cleaned) return;

  const id = beginRun();
  callbacks.onProgress?.(0);

  if (hasElevenLabsKey()) {
    try {
      activeProvider = 'elevenlabs';
      callbacks.onStart?.('elevenlabs');
      await playWithElevenLabs(cleaned, id, callbacks);
      if (isRunActive(id)) callbacks.onEnd?.();
      return;
    } catch (error) {
      if (!isRunActive(id) && isAbortLike(error)) return;
      callbacks.onError?.(error);
    }
  }

  if (!isRunActive(id)) return;
  activeProvider = 'browser';
  callbacks.onStart?.('browser');
  await playWithBrowser(cleaned, id, callbacks);
  if (isRunActive(id)) callbacks.onEnd?.();
}

export function pauseVoicePlayback() {
  activeAudio?.pause();
  if (typeof window !== 'undefined' && window.speechSynthesis?.speaking && !window.speechSynthesis.paused) {
    window.speechSynthesis.pause();
  }
}

export function resumeVoicePlayback() {
  if (activeAudio?.paused) {
    activeAudio.play().catch(() => undefined);
  }

  if (typeof window !== 'undefined' && window.speechSynthesis?.paused) {
    window.speechSynthesis.resume();
  }
}

export function stopVoicePlayback() {
  runId += 1;
  stopActiveResources();
}
