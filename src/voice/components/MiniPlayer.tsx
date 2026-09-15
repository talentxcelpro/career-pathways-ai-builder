import React from 'react';
import { Pause, Play, Square, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoicePlayer } from '../VoicePlayerContext';

function providerLabel(provider: string) {
  return provider === 'elevenlabs' ? 'ElevenLabs' : 'Browser voice';
}

export function MiniPlayer() {
  const { currentText, isPaused, isPlaying, pause, progress, provider, resume, stop } = useVoicePlayer();
  const isActive = Boolean(currentText) && (isPlaying || isPaused || (progress > 0 && progress < 1));

  if (!isActive) return null;

  const progressPercent = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-[70] px-3 md:bottom-4">
      <div className="pointer-events-auto mx-auto flex w-full max-w-xl items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/95 px-3 py-3 text-slate-950 shadow-2xl shadow-slate-950/15 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 dark:text-white">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
          <Volume2 className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-semibold">{currentText}</p>
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {providerLabel(provider)}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10" aria-hidden="true">
            <div
              className="h-full rounded-full bg-blue-600 transition-[width] duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="sr-only" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}>
            Voice playback progress {progressPercent} percent
          </div>
        </div>

        <button
          type="button"
          onClick={isPlaying ? pause : resume}
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition active:scale-95',
            isPlaying ? 'bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15' : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
          aria-label={isPlaying ? 'Pause voice playback' : 'Resume voice playback'}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={stop}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 transition hover:bg-slate-200 active:scale-95 dark:bg-white/10 dark:hover:bg-white/15"
          aria-label="Stop voice playback"
        >
          <Square className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
