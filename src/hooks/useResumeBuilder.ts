
import { useState, useCallback } from 'react';
import { CoreResumeData, createEmptyResumeData, validateResumeData } from '@/types/resume-core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { coreToEditor } from '@/utils/resume-adapters';
import { useTXCIntegration } from './useTXCIntegration';

export const useResumeBuilder = (initialData?: CoreResumeData) => {
  const { user } = useAuth();
  const { triggerResumeCreated } = useTXCIntegration();
  const [resumeData, setResumeData] = useState<CoreResumeData | null>(
    initialData || (user ? createEmptyResumeData(user.id) : null)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateResumeData = useCallback((updates: Partial<CoreResumeData>) => {
    setResumeData(prev => {
      if (!prev) return null;
      
      // Validate the updates
      const updated = {
        ...prev,
        ...updates,
        personalInfo: { ...prev.personalInfo, ...updates.personalInfo },
        settings: { ...prev.settings, ...updates.settings },
        metadata: { 
          ...prev.metadata, 
          ...updates.metadata, 
          updatedAt: new Date().toISOString() 
        },
      };
      
      setHasChanges(true);
      return updated;
    });
  }, []);

  const saveResume = useCallback(async () => {
    if (!resumeData || !user) {
      toast.error('Cannot save: Missing resume data or user');
      return;
    }

    // Validate resume data before saving
    const validation = validateResumeData(resumeData);
    if (!validation.valid) {
      toast.error(`Cannot save: ${validation.errors.join(', ')}`);
      return;
    }

    setIsSaving(true);
    try {
      const resumeToSave = {
        id: resumeData.metadata.id,
        user_id: user.id,
        title: resumeData.metadata.title || resumeData.personalInfo.fullName || 'Untitled Resume',
        content: coreToEditor(resumeData) as any,
        ats_score: resumeData.metadata.atsScore || 0,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('ai_resumes')
        .upsert(resumeToSave);

      if (error) throw error;

      // Update local metadata
      updateResumeData({
        metadata: {
          ...resumeData.metadata,
          updatedAt: new Date().toISOString()
        }
      });

      setHasChanges(false);
      
      // Trigger TXC mining for resume creation
      await triggerResumeCreated();
      
      toast.success('Resume saved successfully!');
    } catch (error) {
      console.error('Failed to save resume:', error);
      toast.error('Failed to save resume. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [resumeData, user, updateResumeData]);

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
