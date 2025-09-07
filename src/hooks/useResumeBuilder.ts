
import { useState, useCallback } from 'react';
import { EnhancedResumeData } from '@/types/enhanced-resume';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { enhancedToEditor } from '@/utils/resumeAdapters';

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
          content: enhancedToEditor(resumeData as EnhancedResumeData) as any,
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
      const filename = `${resumeData.personalInfo.fullName || 'resume'}.${format.toLowerCase()}`;
      
      if (format.toLowerCase() === 'docx') {
        const { exportToDOCX } = await import('@/utils/exportResume');
        await exportToDOCX(resumeData, filename);
      } else if (format.toLowerCase() === 'pdf') {
        const { exportToPDF } = await import('@/utils/exportResume');
        await exportToPDF('resume-preview', filename);
      } else {
        throw new Error(`Export format ${format} not supported`);
      }
      
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
