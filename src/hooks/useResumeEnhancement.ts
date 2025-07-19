import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ResumeSectionParser, ParsedSections } from '@/utils/resumeSectionParser';

export interface EnhancementOptions {
  sectionType?: 'summary' | 'experience' | 'skills' | 'education' | 'all';
  enhancementType?: 'professional' | 'achievements' | 'ats' | 'general';
}

export const useResumeEnhancement = () => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementProgress, setEnhancementProgress] = useState(0);
  
  const parser = new ResumeSectionParser();
  
  // API constants
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
  const FUNCTION_URL = 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/enhance-resume';

  const enhanceResumeText = async (
    text: string, 
    options: EnhancementOptions = {}
  ): Promise<ParsedSections | null> => {
    setIsEnhancing(true);
    setEnhancementProgress(0);

    try {
      console.log('Starting resume enhancement with options:', options);
      
      // Step 1: Parse sections from text
      setEnhancementProgress(25);
      const sections = parser.parseSections(text);
      console.log('Parsed sections:', Object.keys(sections).filter(key => sections[key as keyof ParsedSections]));
      
      // Step 2: Clean section content
      setEnhancementProgress(40);
      const cleanedSections = {
        summary: parser.cleanSectionContent(sections.summary),
        experience: parser.cleanSectionContent(sections.experience),
        skills: parser.cleanSectionContent(sections.skills),
        education: parser.cleanSectionContent(sections.education)
      };

      // Step 3: Enhance via AI
      setEnhancementProgress(60);
      
      console.log('Calling ai-resume-enhancement function with data:', {
        summary: cleanedSections.summary ? cleanedSections.summary.substring(0, 100) + '...' : 'empty',
        experience: cleanedSections.experience ? cleanedSections.experience.substring(0, 100) + '...' : 'empty',
        skills: cleanedSections.skills ? cleanedSections.skills.substring(0, 100) + '...' : 'empty',
        education: cleanedSections.education ? cleanedSections.education.substring(0, 100) + '...' : 'empty',
        sectionType: options.sectionType === 'all' ? undefined : options.sectionType
      });
      
      // Use unified AI gateway
      let { data, error } = await supabase.functions.invoke('ai-gateway', {
        body: {
          toolSlug: 'resume-enhancer',
          inputData: {
            ...cleanedSections,
            sectionType: options.sectionType === 'all' ? undefined : options.sectionType,
            enhancementType: options.enhancementType || 'general'
          },
          requestMetadata: {
            category: 'resume',
            operation: 'resume_enhancement'
          }
        }
      });

      // Direct fetch fallback if Supabase client fails
      if (error && error.message?.includes('Failed to send a request')) {
        console.warn('Supabase client failed, attempting direct fetch...');
        try {
          const response = await fetch(FUNCTION_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'apikey': SUPABASE_ANON_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...cleanedSections,
              sectionType: options.sectionType === 'all' ? undefined : options.sectionType,
              enhancementType: options.enhancementType || 'general'
            })
          });

          if (response.ok) {
            data = await response.json();
            error = null;
            console.log('✅ Direct fetch fallback successful');
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (fetchError) {
          console.error('❌ Both Supabase client and direct fetch failed:', fetchError);
        }
      }

      if (error) {
        console.error('Enhancement error:', error);
        throw new Error(`Enhancement failed: ${error.message || 'Unknown error'}`);
      }

      if (data?.error) {
        console.error('Enhancement returned error:', data.error);
        throw new Error(`Enhancement service error: ${data.error}`);
      }
      
      if (!data) {
        console.error('Enhancement returned no data');
        throw new Error('Enhancement service returned no data');
      }

      setEnhancementProgress(90);
      
      // Merge enhanced content with original sections
      const enhancedSections: ParsedSections = {
        summary: data.data?.summary || cleanedSections.summary,
        experience: data.data?.experience || cleanedSections.experience,
        skills: data.data?.skills || cleanedSections.skills,
        education: data.data?.education || cleanedSections.education,
        projects: sections.projects,
        certifications: sections.certifications,
        awards: sections.awards,
        volunteer: sections.volunteer
      };

      setEnhancementProgress(100);
      console.log('Enhancement completed successfully');
      toast.success('Resume enhanced successfully!');
      
      return enhancedSections;

    } catch (error: any) {
      console.error('Resume enhancement failed:', error);
      
      let errorMessage = 'Failed to enhance resume';
      if (error.message?.includes('AI service')) {
        errorMessage = 'AI enhancement service is currently unavailable. Please try again in a few minutes.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      return null;
    } finally {
      setIsEnhancing(false);
      setEnhancementProgress(0);
    }
  };

  const enhanceSingleSection = async (
    sectionContent: string,
    sectionType: 'summary' | 'experience' | 'skills' | 'education'
  ): Promise<string | null> => {
    setIsEnhancing(true);

    try {
      console.log(`Enhancing single section: ${sectionType}`);
      
      const cleanedContent = parser.cleanSectionContent(sectionContent);
      
      // Enhanced request with fallback and proper function name
      let { data, error } = await supabase.functions.invoke('enhance-resume', {
        body: {
          [sectionType]: cleanedContent,
          sectionType,
          enhancementType: 'section_specific'
        }
      });

      // Direct fetch fallback if Supabase client fails
      if (error && error.message?.includes('Failed to send a request')) {
        console.warn('Supabase client failed, attempting direct fetch...');
        try {
          const response = await fetch(FUNCTION_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'apikey': SUPABASE_ANON_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              [sectionType]: cleanedContent,
              sectionType,
              enhancementType: 'section_specific'
            })
          });

          if (response.ok) {
            data = await response.json();
            error = null;
            console.log('✅ Direct fetch fallback successful for section');
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (fetchError) {
          console.error('❌ Both Supabase client and direct fetch failed for section:', fetchError);
        }
      }

      if (error) {
        console.error('Section enhancement error:', error);
        throw new Error(error.message || 'Section enhancement failed');
      }

      if (data?.error) {
        console.error('Section enhancement returned error:', data.error);
        throw new Error(data.error);
      }

      const enhancedContent = data[sectionType];
      if (!enhancedContent) {
        throw new Error('No enhanced content returned');
      }

      console.log(`Successfully enhanced ${sectionType} section`);
      toast.success(`${sectionType.charAt(0).toUpperCase() + sectionType.slice(1)} section enhanced!`);
      
      return enhancedContent;

    } catch (error: any) {
      console.error(`${sectionType} enhancement failed:`, error);
      
      let errorMessage = `Failed to enhance ${sectionType} section`;
      if (error.message?.includes('AI service')) {
        errorMessage = 'AI enhancement service is currently unavailable. Please try again in a few minutes.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      return null;
    } finally {
      setIsEnhancing(false);
    }
  };

  const extractContactInfo = (text: string) => {
    return parser.extractContactInfo(text);
  };

  return {
    enhanceResumeText,
    enhanceSingleSection,
    extractContactInfo,
    isEnhancing,
    enhancementProgress
  };
};