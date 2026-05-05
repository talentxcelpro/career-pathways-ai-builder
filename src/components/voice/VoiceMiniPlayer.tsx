import React, { useState } from 'react';
import { Play, Pause, Square, Volume2, X, Loader2, ChevronUp, ChevronDown, AudioWaveform } from 'lucide-react';
import { useVoicePlayer } from '@/contexts/VoicePlayerContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { VoicePersonaSelector } from './VoicePersonaSelector';

const RATES = [0.75, 1, 1.25, 1.5, 2];

const fmt = (s: number) => {
  if (!Number.isFinite(s) || s <= 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
};

export const VoiceMiniPlayer: React.FC = () => {
  const {
    status, source, voice, rate, volume, progress, currentTime, duration,
    pause, resume, stop, setRate, setVolume, seek,
  } = useVoicePlayer();
  const [expanded, setExpanded] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);

  if (status === 'idle' && !source) return null;

  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';
  const isPaused = status === 'paused';

  return (
    <>
      <div
        className={cn(
          'fixed bottom-4 right-4 z-[60] w-[min(380px,calc(100vw-2rem))]',
          'rounded-2xl border border-border bg-background/90 backdrop-blur-xl',
          'shadow-[0_10px_40px_-10px_hsl(var(--foreground)/0.25)]',
          'transition-all duration-200',
        )}
        role="region"
        aria-label="Voice player"
      >
        {/* Top row */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <AudioWaveform className={cn('h-4 w-4', isPlaying && 'animate-pulse')} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{source ?? 'Listening'}</p>
            <p className="truncate text-xs text-muted-foreground">{voice.name} · {voice.tagline}</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={stop} aria-label="Close player">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress */}
        <div className="px-4">
          <div className="relative">
            <Slider
              value={[currentTime]}
              max={Math.max(duration, 0.1)}
              step={0.1}
              onValueChange={(v) => seek(v[0])}
              aria-label="Seek"
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground tabular-nums">
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectorOpen(true)}
            className="text-xs"
          >
            Voice
          </Button>

          <Button
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={() => (isPlaying ? pause() : isPaused ? resume() : null)}
            disabled={isLoading}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={stop}
            className="h-9 w-9"
            aria-label="Stop"
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>

        {/* Expanded controls */}
        {expanded && (
          <div className="space-y-4 border-t border-border px-4 py-3">
            <div>
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Speed</span>
                <span className="tabular-nums text-foreground">{rate}x</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {RATES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRate(r)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-xs transition-colors',
                      r === rate
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground',
                    )}
                  >
                    {r}x
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Volume2 className="h-3.5 w-3.5" />
                <span>Volume</span>
                <span className="ml-auto tabular-nums text-foreground">{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume]}
                max={1}
                step={0.05}
                onValueChange={(v) => setVolume(v[0])}
                aria-label="Volume"
              />
            </div>
          </div>
        )}
      </div>

      <VoicePersonaSelector open={selectorOpen} onOpenChange={setSelectorOpen} />
    </>
  );
};

export default VoiceMiniPlayer;
