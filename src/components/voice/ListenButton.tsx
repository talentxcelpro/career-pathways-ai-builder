import React from 'react';
import { Volume2, Pause, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoicePlayer } from '@/contexts/VoicePlayerContext';
import { cn } from '@/lib/utils';

interface ListenButtonProps {
  text: string;
  source?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  className?: string;
  label?: string;
}

/**
 * Drop-in "🔊 Listen" button. Uses the global voice player.
 * If this button's content is the active source, it toggles play/pause.
 */
export const ListenButton: React.FC<ListenButtonProps> = ({
  text,
  source,
  size = 'sm',
  variant = 'outline',
  className,
  label = 'Listen',
}) => {
  const { play, pause, resume, status, source: activeSource, text: activeText } = useVoicePlayer();
  const isActive = (source && activeSource === source) || activeText === text;
  const isPlaying = isActive && status === 'playing';
  const isPaused = isActive && status === 'paused';
  const isLoading = isActive && status === 'loading';

  const onClick = () => {
    if (isPlaying) return pause();
    if (isPaused) return resume();
    play({ text, source });
  };

  const Icon = isLoading ? Loader2 : isPlaying ? Pause : Volume2;

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      onClick={onClick}
      disabled={!text?.trim()}
      className={cn('gap-2', className)}
    >
      <Icon className={cn('h-4 w-4', isLoading && 'animate-spin')} />
      {isPlaying ? 'Playing…' : isPaused ? 'Resume' : label}
    </Button>
  );
};

export default ListenButton;
