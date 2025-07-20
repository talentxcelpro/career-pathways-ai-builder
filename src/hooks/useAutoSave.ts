
import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';

interface UseAutoSaveProps {
  data: any;
  onSave?: (data: any) => Promise<void>;
  saveFunction?: (data: any) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export const useAutoSave = ({ data, onSave, saveFunction, delay = 30000, enabled = true }: UseAutoSaveProps) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const debouncedData = useDebounce(data, 3000); // 3 second delay for debouncing

  const save = useCallback(async () => {
    if (!data) return;
    
    const saveFunc = saveFunction || onSave;
    if (!saveFunc) return;
    
    setSaveStatus('saving');
    try {
      await saveFunc(data);
      setSaveStatus('saved');
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveStatus('error');
    }
  }, [data, onSave, saveFunction]);

  // Auto-save on data change (debounced)
  useEffect(() => {
    if (enabled && debouncedData && saveStatus !== 'saving') {
      save();
    }
  }, [enabled, debouncedData, save, saveStatus]);

  // Periodic auto-save
  useEffect(() => {
    if (!enabled) return;
    
    const interval = setInterval(() => {
      if (data && saveStatus !== 'saving') {
        save();
      }
    }, delay);

    return () => clearInterval(interval);
  }, [enabled, data, save, delay, saveStatus]);

  return {
    saveStatus,
    lastSaved: lastSaved || new Date(),
    save,
    triggerSave: save,
    isSaving: saveStatus === 'saving'
  };
};
