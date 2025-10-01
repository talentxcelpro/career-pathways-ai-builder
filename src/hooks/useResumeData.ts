import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CoreResumeData, createEmptyResumeData, generateResumeId } from '@/types/resume-core';
import { editorToCore } from '@/utils/resume-adapters';
import { toast } from 'sonner';

const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const useResumeData = () => {
  const { id: resumeId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState<CoreResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewResume, setIsNewResume] = useState(false);

  const loadResumeData = useCallback(async () => {
    console.log('Loading resume data for ID:', resumeId, 'User:', user?.id);
    setIsLoading(true);
    setError(null);

    try {
      // Handle new resume creation
      if (!resumeId || resumeId === 'new') {
        console.log('Creating new resume with empty data');
        const newResumeData = createEmptyResumeData(user?.id);
        newResumeData.metadata.id = generateResumeId();
        setResumeData(newResumeData);
        setIsNewResume(true);
        setIsLoading(false);
        return;
      }

      // Validate UUID format
      if (!isValidUUID(resumeId)) {
        console.error('Invalid UUID format:', resumeId);
        setError('Invalid resume ID format');
        const fallbackData = createEmptyResumeData(user?.id);
        setResumeData(fallbackData);
        setIsNewResume(true);
        setIsLoading(false);
        return;
      }

      console.log('Fetching existing resume from database...');
      const { data, error: fetchError } = await supabase
        .from('ai_resumes')
        .select('*')
        .eq('id', resumeId)
        .maybeSingle();

      if (fetchError) {
        console.error('Database error:', fetchError);
        setError('Failed to load resume data');
        toast.error('Failed to load resume');
        const fallbackData = createEmptyResumeData(user?.id);
        setResumeData(fallbackData);
        setIsNewResume(true);
      } else if (data) {
        console.log('Found resume data:', data);
        console.log('📊 Database content structure:', {
          hasPersonalInfo: !!data.content?.personalInfo,
          hasSummary: !!(data.content?.summary || data.content?.personalInfo?.summary),
          experienceCount: data.content?.experience?.length || 0,
          educationCount: data.content?.education?.length || 0,
          email: data.content?.personalInfo?.email,
          name: data.content?.personalInfo?.fullName
        });
        setIsNewResume(false);
        
        try {
          // Convert from editor format to core format
          const editorData = data.content;
          console.log('🔄 Converting editor data to core format...');
          const coreData = editorToCore(editorData);
          
          console.log('✅ Conversion successful:', {
            name: coreData.personalInfo.fullName,
            email: coreData.personalInfo.email,
            summary: coreData.personalInfo.summary?.substring(0, 50) + '...',
            experienceCount: coreData.experience.length,
            educationCount: coreData.education.length
          });
          
          // Update metadata from database
          coreData.metadata = {
            ...coreData.metadata,
            id: data.id,
            userId: data.user_id,
            title: data.title,
            atsScore: data.ats_score,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
          
          setResumeData(coreData);
        } catch (parseError) {
          console.error('Failed to parse resume data:', parseError);
          setError('Failed to parse resume data');
          toast.error('Resume data is corrupted');
          const fallbackData = createEmptyResumeData(user?.id);
          setResumeData(fallbackData);
          setIsNewResume(true);
        }
      } else {
        console.log('Resume not found, creating new one');
        setError('Resume not found');
        const newResumeData = createEmptyResumeData(user?.id);
        newResumeData.metadata.id = generateResumeId();
        setResumeData(newResumeData);
        setIsNewResume(true);
      }
    } catch (err) {
      console.error('Unexpected error loading resume:', err);
      setError('An unexpected error occurred');
      toast.error('Failed to load resume');
      const fallbackData = createEmptyResumeData(user?.id);
      setResumeData(fallbackData);
      setIsNewResume(true);
    } finally {
      setIsLoading(false);
    }
  }, [resumeId, user?.id]);

  useEffect(() => {
    loadResumeData();
  }, [loadResumeData]);

  const refreshData = useCallback(() => {
    if (resumeId && resumeId !== 'new' && isValidUUID(resumeId)) {
      loadResumeData();
    }
  }, [resumeId, loadResumeData]);

  return {
    resumeData,
    setResumeData,
    isLoading,
    error,
    isNewResume,
    resumeId,
    refreshData
  };
};