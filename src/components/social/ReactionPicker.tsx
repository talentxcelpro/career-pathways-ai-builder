import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Heart, ThumbsUp, Laugh, Angry, Frown, Zap } from 'lucide-react';
import { ReactionType } from '@/hooks/useEnhancedReactions';

interface ReactionPickerProps {
  onReaction: (reaction: ReactionType) => void;
  currentReaction?: ReactionType;
  disabled?: boolean;
  children: React.ReactNode;
}

const reactions = [
  { type: 'like' as ReactionType, icon: ThumbsUp, emoji: '👍', label: 'Like' },
  { type: 'love' as ReactionType, icon: Heart, emoji: '❤️', label: 'Love' },
  { type: 'laugh' as ReactionType, icon: Laugh, emoji: '😂', label: 'Haha' },
  { type: 'wow' as ReactionType, icon: Zap, emoji: '😮', label: 'Wow' },
  { type: 'sad' as ReactionType, icon: Frown, emoji: '😢', label: 'Sad' },
  { type: 'angry' as ReactionType, icon: Angry, emoji: '😡', label: 'Angry' }
];

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  onReaction,
  currentReaction,
  disabled,
  children
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="flex gap-1">
          {reactions.map((reaction) => {
            const Icon = reaction.icon;
            const isSelected = currentReaction === reaction.type;
            
            return (
              <Button
                key={reaction.type}
                variant={isSelected ? "default" : "ghost"}
                size="sm"
                className={`h-10 w-10 p-0 hover:scale-110 transition-transform ${
                  isSelected ? 'bg-primary text-primary-foreground' : ''
                }`}
                onClick={() => onReaction(reaction.type)}
                disabled={disabled}
                title={reaction.label}
              >
                <span className="text-lg">{reaction.emoji}</span>
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};