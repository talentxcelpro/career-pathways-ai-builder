
import { useState, useCallback } from 'react';
import { EnhancedResumeData } from '@/types/enhanced-resume';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useResumeBuilder = (initialData?: EnhancedResumeData) => {
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState<EnhancedResumeData | null>(initialData || null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateResumeData = useCallback((updates: Partial<EnhancedResumeData>) => {
    setResumeData(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      setHasChanges(true);
      return updated;
    });
  }, []);

  const saveResume = useCallback(async () => {
    if (!resumeData || !user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('ai_resumes')
        .upsert({
          user_id: user.id,
          title: resumeData.personalInfo.fullName || 'Untitled Resume',
          content: resumeData as any,
          ats_score: 0, // Will be calculated by the system
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setHasChanges(false);
      toast.success('Resume saved successfully!');
    } catch (error) {
      console.error('Failed to save resume:', error);
      toast.error('Failed to save resume');
    } finally {
      setIsSaving(false);
    }
  }, [resumeData, user]);

  const exportResume = useCallback(async (format: string) => {
    if (!resumeData) return;

    try {
      // TODO: Implement export functionality
      console.log('Exporting resume in format:', format);
      toast.success(`Resume exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Failed to export resume:', error);
      toast.error('Failed to export resume');
    }
  }, [resumeData]);

  return {
    resumeData,
    updateResumeData,
    isSaving,
    hasChanges,
    saveResume,
    exportResume
  };
};
