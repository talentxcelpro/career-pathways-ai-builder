
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
          
          // Process the content from database and normalize data structure
          let processedData: any = {
            ...createEmptyResumeData(),
            ...(data.content && typeof data.content === 'object' ? data.content : {}),
          };

          // Handle different skills structures - normalize for ResumeEditor compatibility
          if (processedData.skills) {
            // If skills is an array of skill objects (EnhancedResumeData format), convert to editor format
            if (Array.isArray(processedData.skills)) {
              const skillsArray = processedData.skills;
              processedData.skills = {
                technical: skillsArray
                  .filter((skill: any) => 
                    skill.category?.includes('programming') || 
                    skill.category?.includes('technical') || 
                    skill.category?.includes('frontend') || 
                    skill.category?.includes('backend') ||
                    skill.category?.includes('frameworks') ||
                    skill.category?.includes('databases') ||
                    skill.category?.includes('cloud')
                  )
                  .map((skill: any) => skill.skill || skill.name || String(skill)),
                soft: skillsArray
                  .filter((skill: any) => skill.category === 'soft')
                  .map((skill: any) => skill.skill || skill.name || String(skill)),
                languages: skillsArray
                  .filter((skill: any) => skill.category === 'languages' || skill.language)
                  .map((skill: any) => skill.skill || skill.language || skill.name || String(skill)),
                tools: []
              };
            }
            // If skills already has the editor format but with object arrays, normalize to strings
            else if (processedData.skills.technical && Array.isArray(processedData.skills.technical)) {
              processedData.skills.technical = processedData.skills.technical.map((skill: any) => 
                typeof skill === 'string' ? skill : skill?.skill || skill?.name || String(skill)
              );
            }
          }
          
          setResumeData(processedData as EnhancedResumeData);
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
      // Re-trigger the effect by forcing a re-render
      setIsLoading(true);
      setError(null);
      setResumeData(null);
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
