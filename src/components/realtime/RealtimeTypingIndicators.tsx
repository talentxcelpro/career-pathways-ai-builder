import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface TypingUser {
  id: string;
  name: string;
  avatar?: string;
  timestamp: number;
}

interface RealtimeTypingIndicatorsProps {
  contentId: string;
  contentType: 'post' | 'message';
  currentUserId?: string | null;
}

export const RealtimeTypingIndicators: React.FC<RealtimeTypingIndicatorsProps> = ({
  contentId,
  contentType,
  currentUserId
}) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  // Start typing indicator
  const startTyping = useCallback(async () => {
    if (!currentUserId) return;

    try {
      await supabase
        .channel(`typing-${contentType}-${contentId}`)
        .send({
          type: 'broadcast',
          event: 'typing-start',
          payload: {
            userId: currentUserId,
            contentId,
            contentType,
            timestamp: Date.now()
          }
        });
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }, [currentUserId, contentId, contentType]);

  // Stop typing indicator
  const stopTyping = useCallback(async () => {
    if (!currentUserId) return;

    try {
      await supabase
        .channel(`typing-${contentType}-${contentId}`)
        .send({
          type: 'broadcast',
          event: 'typing-stop',
          payload: {
            userId: currentUserId,
            contentId,
            contentType,
            timestamp: Date.now()
          }
        });
    } catch (error) {
      console.error('Error stopping typing indicator:', error);
    }
  }, [currentUserId, contentId, contentType]);

  // Listen for typing events
  useEffect(() => {
    const channel = supabase
      .channel(`typing-${contentType}-${contentId}`)
      .on('broadcast', { event: 'typing-start' }, async (payload) => {
        const { userId } = payload.payload;
        if (userId === currentUserId) return; // Don't show own typing

        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, profile_picture_url')
          .eq('id', userId)
          .single();

        if (profile) {
          setTypingUsers(prev => {
            const filtered = prev.filter(u => u.id !== userId);
            return [...filtered, {
              id: userId,
              name: profile.full_name || 'User',
              avatar: profile.profile_picture_url,
              timestamp: Date.now()
            }];
          });
        }
      })
      .on('broadcast', { event: 'typing-stop' }, (payload) => {
        const { userId } = payload.payload;
        setTypingUsers(prev => prev.filter(u => u.id !== userId));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contentId, contentType, currentUserId]);

  // Auto-remove stale typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => prev.filter(u => now - u.timestamp < 5000)); // 5 seconds timeout
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Expose typing functions globally for comment inputs
  useEffect(() => {
    const globalTypingStart = () => startTyping();
    const globalTypingStop = () => stopTyping();

    window.addEventListener(`startTyping-${contentId}`, globalTypingStart);
    window.addEventListener(`stopTyping-${contentId}`, globalTypingStop);

    return () => {
      window.removeEventListener(`startTyping-${contentId}`, globalTypingStart);
      window.removeEventListener(`stopTyping-${contentId}`, globalTypingStop);
    };
  }, [startTyping, stopTyping, contentId]);

  if (typingUsers.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center gap-2 p-2 text-sm text-muted-foreground"
      >
        <div className="flex -space-x-2">
          {typingUsers.slice(0, 3).map((user) => (
            <Avatar key={user.id} className="h-6 w-6 border-2 border-background">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-xs">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        
        <div className="flex items-center gap-1">
          <span>
            {typingUsers.length === 1 
              ? `${typingUsers[0].name} is typing`
              : typingUsers.length === 2
              ? `${typingUsers[0].name} and ${typingUsers[1].name} are typing`
              : `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing`
            }
          </span>
          
          {/* Animated typing dots */}
          <div className="flex space-x-1 ml-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="w-1 h-1 bg-muted-foreground rounded-full"
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};