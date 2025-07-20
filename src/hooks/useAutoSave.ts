
import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';

interface UseAutoSaveProps {
  data: any;
  onSave: (data: any) => Promise<void>;
  delay?: number;
}

export const useAutoSave = ({ data, onSave, delay = 30000 }: UseAutoSaveProps) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const debouncedData = useDebounce(data, 3000); // 3 second delay for debouncing

  const save = useCallback(async () => {
    if (!data) return;
    
    setSaveStatus('saving');
    try {
      await onSave(data);
      setSaveStatus('saved');
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveStatus('error');
    }
  }, [data, onSave]);

  // Auto-save on data change (debounced)
  useEffect(() => {
    if (debouncedData && saveStatus !== 'saving') {
      save();
    }
  }, [debouncedData, save, saveStatus]);

  // Periodic auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      if (data && saveStatus !== 'saving') {
        save();
      }
    }, delay);

    return () => clearInterval(interval);
  }, [data, save, delay, saveStatus]);

  return {
    saveStatus,
    lastSaved,
    save
  };
};
