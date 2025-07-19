
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedResumeData } from '@/types/enhanced-resume';
import { toast } from 'sonner';

const createEmptyResumeData = (): EnhancedResumeData => ({
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
  },
  professionalSummary: {
    content: '',
    keyHighlights: []
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  awards: [],
  languages: [],
  publications: [],
  references: [],
  volunteerWork: [],
  trainings: [],
  tools: {
    development: [],
    design: [],
    analytics: [],
    productivity: [],
    other: []
  },
  careerObjectives: {
    statement: '',
    goals: []
  },
  sectionOrder: ['personalInfo', 'professionalSummary', 'experience', 'education', 'skills'],
  selectedTemplate: 'modern',
  customization: {
    colorScheme: 'blue',
    fontFamily: 'Inter',
    fontSize: 14,
    spacing: 'normal'
  }
});

const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const useResumeData = () => {
  const { id } = useParams<{ id: string }>();
  const [resumeData, setResumeData] = useState<EnhancedResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewResume, setIsNewResume] = useState(false);

  useEffect(() => {
    const loadResumeData = async () => {
      console.log('Loading resume data for ID:', id);
      setIsLoading(true);
      setError(null);

      try {
        // Handle new resume creation
        if (!id || id === 'new') {
          console.log('Creating new resume with empty data');
          setIsNewResume(true);
          setResumeData(createEmptyResumeData());
          setIsLoading(false);
          return;
        }

        // Validate UUID format
        if (!isValidUUID(id)) {
          console.error('Invalid UUID format:', id);
          setError('Invalid resume ID format');
          setResumeData(createEmptyResumeData());
          setIsLoading(false);
          return;
        }

        console.log('Fetching existing resume from database...');
        const { data, error: fetchError } = await supabase
          .from('ai_resumes')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (fetchError) {
          console.error('Database error:', fetchError);
          setError('Failed to load resume data');
          toast.error('Failed to load resume');
          setResumeData(createEmptyResumeData());
        } else if (data) {
          console.log('Resume data loaded successfully:', data);
          setIsNewResume(false);
          
          // Process the content from database
          const processedData = {
            ...createEmptyResumeData(),
            ...data.content,
          };
          
          setResumeData(processedData);
        } else {
          console.log('Resume not found, creating new one');
          setError('Resume not found');
          setResumeData(createEmptyResumeData());
          setIsNewResume(true);
        }
      } catch (err) {
        console.error('Unexpected error loading resume:', err);
        setError('An unexpected error occurred');
        toast.error('Failed to load resume');
        setResumeData(createEmptyResumeData());
      } finally {
        setIsLoading(false);
      }
    };

    loadResumeData();
  }, [id]);

  const refreshData = () => {
    if (id && id !== 'new' && isValidUUID(id)) {
      setIsLoading(true);
      setError(null);
      // Re-trigger the effect
      loadResumeData();
    }
  };

  return {
    resumeData,
    setResumeData,
    isLoading,
    error,
    isNewResume,
    resumeId: id,
    refreshData
  };
};
