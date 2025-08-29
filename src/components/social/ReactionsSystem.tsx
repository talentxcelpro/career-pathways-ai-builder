import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart, Lightbulb, Trophy, Handshake, Eye } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from 'framer-motion';

type ReactionType = 'like' | 'celebrate' | 'insightful' | 'support' | 'curious';

interface Reaction {
  id: string;
  reaction_type: ReactionType;
  user_id: string;
  post_id: string;
  created_at: string;
}

interface ReactionsSystemProps {
  postId: string;
  initialReactions?: Reaction[];
  onReactionChange?: (reactions: Reaction[]) => void;
}

const reactionConfig = {
  like: {
    icon: Heart,
    label: 'Like',
    color: 'text-red-500',
    hoverBg: 'hover:bg-red-50 dark:hover:bg-red-950/20',
    emoji: '❤️'
  },
  celebrate: {
    icon: Trophy,
    label: 'Celebrate',
    color: 'text-yellow-500',
    hoverBg: 'hover:bg-yellow-50 dark:hover:bg-yellow-950/20',
    emoji: '🎉'
  },
  insightful: {
    icon: Lightbulb,
    label: 'Insightful',
    color: 'text-blue-500',
    hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-950/20',
    emoji: '💡'
  },
  support: {
    icon: Handshake,
    label: 'Support',
    color: 'text-green-500',
    hoverBg: 'hover:bg-green-50 dark:hover:bg-green-950/20',
    emoji: '🤝'
  },
  curious: {
    icon: Eye,
    label: 'Curious',
    color: 'text-purple-500',
    hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-950/20',
    emoji: '🤔'
  }
};

export const ReactionsSystem: React.FC<ReactionsSystemProps> = ({
  postId,
  initialReactions = [],
  onReactionChange
}) => {
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user?.id || null);
      
      if (user?.id) {
        const userReact = reactions.find(r => r.user_id === user.id);
        setUserReaction(userReact?.reaction_type || null);
      }
    };
    
    getCurrentUser();
  }, [reactions]);

  useEffect(() => {
    const fetchReactions = async () => {
      const { data, error } = await supabase
        .from('post_reactions')
        .select('*')
        .eq('post_id', postId);

      if (error) {
        console.error('Error fetching reactions:', error);
        return;
      }

      setReactions(data || []);
    };

    fetchReactions();
  }, [postId]);

  const handleReaction = async (reactionType: ReactionType) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to react to posts",
        variant: "destructive"
      });
      return;
    }

    try {
      // If user already has this reaction, remove it
      if (userReaction === reactionType) {
        const { error } = await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUser);

        if (error) throw error;

        const newReactions = reactions.filter(r => r.user_id !== currentUser);
        setReactions(newReactions);
        setUserReaction(null);
        onReactionChange?.(newReactions);
        return;
      }

      // Remove existing reaction if any
      if (userReaction) {
        await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUser);
      }

      // Add new reaction
      const { data, error } = await supabase
        .from('post_reactions')
        .insert({
          post_id: postId,
          user_id: currentUser,
          reaction_type: reactionType
        })
        .select()
        .single();

      if (error) throw error;

      const newReactions = reactions.filter(r => r.user_id !== currentUser);
      if (data) {
        newReactions.push(data);
      }
      
      setReactions(newReactions);
      setUserReaction(reactionType);
      onReactionChange?.(newReactions);

    } catch (error) {
      console.error('Error handling reaction:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive"
      });
    }
  };

  const getReactionCounts = () => {
    const counts: Record<ReactionType, number> = {
      like: 0,
      celebrate: 0,
      insightful: 0,
      support: 0,
      curious: 0
    };

    reactions.forEach(reaction => {
      counts[reaction.reaction_type]++;
    });

    return counts;
  };

  const reactionCounts = getReactionCounts();
  const totalReactions = reactions.length;
  const topReactions = Object.entries(reactionCounts)
    .filter(([_, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="flex items-center gap-2">
      {/* Main reaction button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "transition-all duration-200 hover:scale-105",
            userReaction ? reactionConfig[userReaction].color : "text-muted-foreground",
            userReaction ? reactionConfig[userReaction].hoverBg : "hover:bg-muted/50"
          )}
          onClick={() => setShowReactions(!showReactions)}
          onMouseEnter={() => setShowReactions(true)}
        >
          {userReaction ? (
            <span className="text-lg mr-1">{reactionConfig[userReaction].emoji}</span>
          ) : (
            <Heart className="h-4 w-4 mr-1" />
          )}
          {userReaction ? reactionConfig[userReaction].label : 'React'}
          {totalReactions > 0 && (
            <span className="ml-1 text-xs">({totalReactions})</span>
          )}
        </Button>

        {/* Reaction picker */}
        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 mb-2 bg-card border rounded-lg shadow-lg p-2 flex gap-1 z-10"
              onMouseLeave={() => setShowReactions(false)}
            >
              {Object.entries(reactionConfig).map(([type, config]) => {
                const IconComponent = config.icon;
                const count = reactionCounts[type as ReactionType];
                
                return (
                  <Button
                    key={type}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "flex flex-col items-center p-2 h-auto min-w-[60px] transition-all duration-200",
                      userReaction === type ? config.color : "text-muted-foreground",
                      config.hoverBg,
                      "hover:scale-110"
                    )}
                    onClick={() => {
                      handleReaction(type as ReactionType);
                      setShowReactions(false);
                    }}
                  >
                    <span className="text-lg">{config.emoji}</span>
                    <span className="text-xs">{config.label}</span>
                    {count > 0 && (
                      <span className="text-xs text-muted-foreground">({count})</span>
                    )}
                  </Button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reaction summary */}
      {topReactions.length > 0 && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          {topReactions.map(([type, count]) => (
            <span key={type} className="flex items-center gap-1">
              <span>{reactionConfig[type as ReactionType].emoji}</span>
              <span>{count}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};