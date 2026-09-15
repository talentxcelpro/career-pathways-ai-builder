import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { useRealtimeFeed } from '@/hooks/useRealtimeFeed';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';

export function NewPostsBanner() {
  const { pendingUpdates, clearFeed, feedItems } = useRealtimeFeed();
  const queryClient = useQueryClient();
  
  // Count new post items from pending updates
  const newPostsCount = pendingUpdates.reduce((count, update) => {
    return count + update.items.filter(item => item.type === 'post' && update.action === 'ADD').length;
  }, 0);
  
  const showBanner = newPostsCount > 0;

  const loadNewPosts = () => {
    queryClient.invalidateQueries({ queryKey: ['feed'] });
    clearFeed();
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-40"
        >
          <Button
            onClick={loadNewPosts}
            className="shadow-lg gap-2"
            size="sm"
          >
            <ArrowUp className="w-4 h-4" />
            {newPostsCount} new post{newPostsCount !== 1 ? 's' : ''}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
