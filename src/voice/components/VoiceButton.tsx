import React from 'react';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVoice } from '../useVoice';
import type { VoiceButtonProps } from '../types';

export function VoiceButton({
  className,
  disabled,
  label = 'Listen',
  size = 'sm',
  text,
  variant = 'outline',
}: VoiceButtonProps) {
  const { speak } = useVoice();
  const canSpeak = Boolean(text?.trim());

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={disabled || !canSpeak}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (text) void speak(text);
      }}
      className={cn('gap-2 rounded-full', className)}
      aria-label={canSpeak ? `Listen to ${label.toLowerCase()}` : 'Nothing to listen to'}
    >
      <Volume2 className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}
