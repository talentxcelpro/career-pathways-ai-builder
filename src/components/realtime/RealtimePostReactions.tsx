import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ThumbsUp, MessageCircle, Share2 } from 'lucide-react';

interface ReactionAnimation {
  id: string;
  type: 'like' | 'love' | 'comment' | 'share';
  x: number;
  y: number;
  timestamp: number;
}

interface RealtimePostReactionsProps {
  postId: string;
}

export const RealtimePostReactions: React.FC<RealtimePostReactionsProps> = ({ postId }) => {
  const [reactions, setReactions] = useState<ReactionAnimation[]>([]);

  // Add new reaction animation
  const addReaction = useCallback((type: ReactionAnimation['type'], event?: MouseEvent) => {
    const rect = (event?.target as HTMLElement)?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : Math.random() * 300;
    const y = rect ? rect.top : Math.random() * 200;

    const newReaction: ReactionAnimation = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: x + (Math.random() - 0.5) * 40, // Add some randomness
      y: y + (Math.random() - 0.5) * 20,
      timestamp: Date.now()
    };

    setReactions(prev => [...prev, newReaction]);

    // Auto-remove after animation duration
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 2000);
  }, []);

  // Listen for real-time engagement events
  useEffect(() => {
    const handleRealtimeReaction = (event: CustomEvent) => {
      if (event.detail.postId === postId) {
        addReaction(event.detail.type);
      }
    };

    // Listen for engagement events
    window.addEventListener('realtimeEngagement', handleRealtimeReaction as EventListener);

    return () => {
      window.removeEventListener('realtimeEngagement', handleRealtimeReaction as EventListener);
    };
  }, [postId, addReaction]);

  const getReactionIcon = (type: ReactionAnimation['type']) => {
    switch (type) {
      case 'like':
        return <ThumbsUp className="h-4 w-4 text-blue-500" />;
      case 'love':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case 'share':
        return <Share2 className="h-4 w-4 text-purple-500" />;
      default:
        return <ThumbsUp className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {reactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ 
              opacity: 0, 
              scale: 0.5, 
              x: reaction.x, 
              y: reaction.y 
            }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              scale: [0.5, 1.2, 1, 0.8],
              x: reaction.x + (Math.random() - 0.5) * 60,
              y: reaction.y - 80
            }}
            exit={{ 
              opacity: 0, 
              scale: 0 
            }}
            transition={{ 
              duration: 2,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="absolute z-10 flex items-center justify-center w-8 h-8 bg-background/90 backdrop-blur-sm rounded-full border shadow-lg"
          >
            {getReactionIcon(reaction.type)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};