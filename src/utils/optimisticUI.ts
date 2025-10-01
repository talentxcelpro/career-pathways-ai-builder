/**
 * Optimistic UI Utilities
 * Instant feedback with automatic rollback on failure
 */

import { QueryClient } from '@tanstack/react-query';

interface OptimisticUpdate<T> {
  key: string;
  previousData: T;
  newData: T;
  timestamp: number;
}

class OptimisticUIManager {
  private updates: Map<string, OptimisticUpdate<any>> = new Map();
  private rollbackTimeouts: Map<string, NodeJS.Timeout> = new Map();

  // Apply optimistic update
  applyUpdate<T>(
    queryClient: QueryClient,
    queryKey: string[],
    updateFn: (old: T) => T,
    rollbackDelay = 10000
  ): () => void {
    const key = JSON.stringify(queryKey);

    // Get current data
    const previousData = queryClient.getQueryData<T>(queryKey);
    if (!previousData) return () => {};

    // Apply optimistic update
    const newData = updateFn(previousData);
    queryClient.setQueryData(queryKey, newData);

    // Store update for potential rollback
    this.updates.set(key, {
      key,
      previousData,
      newData,
      timestamp: Date.now(),
    });

    // Set automatic rollback timeout
    const timeout = setTimeout(() => {
      this.rollback(queryClient, queryKey);
    }, rollbackDelay);
    this.rollbackTimeouts.set(key, timeout);

    // Return rollback function
    return () => this.rollback(queryClient, queryKey);
  }

  // Confirm optimistic update (remove rollback)
  confirmUpdate(queryKey: string[]) {
    const key = JSON.stringify(queryKey);
    
    // Clear rollback timeout
    const timeout = this.rollbackTimeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.rollbackTimeouts.delete(key);
    }

    // Remove update record
    this.updates.delete(key);
  }

  // Rollback optimistic update
  rollback<T>(queryClient: QueryClient, queryKey: string[]) {
    const key = JSON.stringify(queryKey);
    const update = this.updates.get(key);

    if (update) {
      queryClient.setQueryData(queryKey, update.previousData);
      this.updates.delete(key);

      const timeout = this.rollbackTimeouts.get(key);
      if (timeout) {
        clearTimeout(timeout);
        this.rollbackTimeouts.delete(key);
      }

      console.warn('Optimistic update rolled back:', queryKey);
    }
  }

  // Get pending updates
  getPendingUpdates() {
    return Array.from(this.updates.values());
  }

  // Clear all updates
  clearAll() {
    this.rollbackTimeouts.forEach(timeout => clearTimeout(timeout));
    this.rollbackTimeouts.clear();
    this.updates.clear();
  }
}

export const optimisticUI = new OptimisticUIManager();

// Helper hooks for common optimistic updates
export const optimisticHelpers = {
  // Like/Unlike post
  toggleLike: (queryClient: QueryClient, postId: string, userId: string) => {
    const queryKey = ['post', postId];
    return optimisticUI.applyUpdate(
      queryClient,
      queryKey,
      (old: any) => ({
        ...old,
        likes_count: (old.likes_count || 0) + (old.is_liked ? -1 : 1),
        is_liked: !old.is_liked,
      })
    );
  },

  // Add comment
  addComment: (queryClient: QueryClient, postId: string, comment: any) => {
    const queryKey = ['comments', postId];
    return optimisticUI.applyUpdate(
      queryClient,
      queryKey,
      (old: any[]) => [comment, ...old]
    );
  },

  // Update connection status
  updateConnection: (queryClient: QueryClient, userId: string, status: string) => {
    const queryKey = ['connection', userId];
    return optimisticUI.applyUpdate(
      queryClient,
      queryKey,
      (old: any) => ({
        ...old,
        status,
      })
    );
  },

  // Job application
  applyToJob: (queryClient: QueryClient, jobId: string, applicationData: any) => {
    const queryKey = ['job', jobId];
    return optimisticUI.applyUpdate(
      queryClient,
      queryKey,
      (old: any) => ({
        ...old,
        has_applied: true,
        applications_count: (old.applications_count || 0) + 1,
      })
    );
  },

  // Update profile
  updateProfile: (queryClient: QueryClient, userId: string, updates: any) => {
    const queryKey = ['profile', userId];
    return optimisticUI.applyUpdate(
      queryClient,
      queryKey,
      (old: any) => ({
        ...old,
        ...updates,
      })
    );
  },
};
