import React from 'react';
import { Check, Play, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useVoicePlayer } from '@/contexts/VoicePlayerContext';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  specialty: 'Specialty',
};

export const VoicePersonaSelector: React.FC<Props> = ({ open, onOpenChange }) => {
  const { voices, voice: current, setVoice, previewVoice, status } = useVoicePlayer();

  const grouped = voices.reduce<Record<string, typeof voices>>((acc, v) => {
    (acc[v.category] ||= []).push(v);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose a voice</DialogTitle>
          <DialogDescription>
            10 distinct AI voices. Tap preview to hear a sample, then select.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-1">
          {Object.entries(grouped).map(([category, list]) => (
            <section key={category}>
              <h3 className="mb-2 text-eyebrow text-muted-foreground">
                {CATEGORY_LABELS[category] ?? category}
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {list.map((v) => {
                  const selected = v.id === current.id;
                  return (
                    <div
                      key={v.id}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border p-3 transition-colors',
                        selected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-foreground/20',
                      )}
                    >
                      <button
                        onClick={() => {
                          setVoice(v.id);
                        }}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        aria-pressed={selected}
                      >
                        <div
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                            selected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {selected ? <Check className="h-4 w-4" /> : v.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{v.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {v.tagline} · {v.ageRange}
                          </p>
                        </div>
                      </button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => previewVoice(v.id)}
                        aria-label={`Preview ${v.name}`}
                        disabled={status === 'loading'}
                      >
                        {status === 'loading' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoicePersonaSelector;
