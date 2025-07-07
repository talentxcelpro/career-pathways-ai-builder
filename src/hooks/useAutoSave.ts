import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface UseAutoSaveOptions {
  data: any;
  saveFunction: (data: any) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export const useAutoSave = ({ data, saveFunction, delay = 2000, enabled = true }: UseAutoSaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedDataRef = useRef<string>('');
  const isSavingRef = useRef(false);

  const debouncedSave = useCallback(async () => {
    if (!enabled || isSavingRef.current) return;

    const currentDataString = JSON.stringify(data);
    
    // Don't save if data hasn't changed
    if (currentDataString === lastSavedDataRef.current) return;

    try {
      isSavingRef.current = true;
      await saveFunction(data);
      lastSavedDataRef.current = currentDataString;
      
      // Show subtle save confirmation
      toast.success('Draft auto-saved', {
        duration: 1500,
        position: 'bottom-right',
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
      toast.error('Auto-save failed. Please save manually.', {
        duration: 3000,
      });
    } finally {
      isSavingRef.current = false;
    }
  }, [data, saveFunction, enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(debouncedSave, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, debouncedSave, delay, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    triggerSave: debouncedSave,
    isSaving: isSavingRef.current
  };
};