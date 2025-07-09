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
      const { data, error } = await supabase.functions.invoke('enhance-resume', {
        body: {
          ...cleanedSections,
          sectionType: options.sectionType === 'all' ? undefined : options.sectionType
        }
      });

      if (error) {
        console.error('Enhancement error:', error);
        throw new Error(error.message || 'Enhancement failed');
      }

      if (data?.error) {
        console.error('Enhancement returned error:', data.error);
        throw new Error(data.error);
      }

      setEnhancementProgress(90);
      
      // Merge enhanced content with original sections
      const enhancedSections: ParsedSections = {
        summary: data.summary || cleanedSections.summary,
        experience: data.experience || cleanedSections.experience,
        skills: data.skills || cleanedSections.skills,
        education: data.education || cleanedSections.education,
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
      
      const { data, error } = await supabase.functions.invoke('enhance-resume', {
        body: {
          [sectionType]: cleanedContent,
          sectionType
        }
      });

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