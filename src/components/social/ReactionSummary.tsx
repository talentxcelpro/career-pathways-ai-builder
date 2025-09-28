import React from 'react';
import { PostReactions, ReactionType } from '@/hooks/useEnhancedReactions';

interface ReactionSummaryProps {
  reactions: PostReactions;
  onClick?: () => void;
  showAll?: boolean;
}

const reactionEmojis = {
  like: '👍',
  love: '❤️',
  laugh: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😡'
};

export const ReactionSummary: React.FC<ReactionSummaryProps> = ({
  reactions,
  onClick,
  showAll = false
}) => {
  const sortedReactions = Object.entries(reactions)
    .filter(([key, count]) => key.endsWith('_count') && count > 0)
    .map(([key, count]) => ({
      type: key.replace('_count', '') as ReactionType,
      count: count as number
    }))
    .sort((a, b) => b.count - a.count);

  if (sortedReactions.length === 0) return null;

  const totalCount = sortedReactions.reduce((sum, r) => sum + r.count, 0);
  const displayReactions = showAll ? sortedReactions : sortedReactions.slice(0, 3);

  return (
    <div 
      className={`flex items-center gap-1 text-sm text-muted-foreground ${
        onClick ? 'cursor-pointer hover:text-foreground' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-0.5">
        {displayReactions.map((reaction) => (
          <span 
            key={reaction.type}
            className="inline-flex items-center justify-center w-5 h-5 bg-background border rounded-full text-xs"
            title={`${reaction.count} ${reaction.type}`}
          >
            {reactionEmojis[reaction.type]}
          </span>
        ))}
      </div>
      <span>{totalCount}</span>
      {!showAll && sortedReactions.length > 3 && (
        <span className="text-xs">+{sortedReactions.length - 3} more</span>
      )}
    </div>
  );
};