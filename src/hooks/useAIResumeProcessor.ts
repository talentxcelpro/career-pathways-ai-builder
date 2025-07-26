import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProcessingResult {
  success: boolean;
  extractedData?: any;
  error?: string;
  confidence?: number;
}

export const useAIResumeProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processResumeFile = async (
    file: File, 
    onProgress?: (progress: number, status: string) => void
  ): Promise<ProcessingResult> => {
    setIsProcessing(true);

    try {
      onProgress?.(10, 'Preparing file for processing...');

      // Convert file to base64 for transmission
      const fileBuffer = await file.arrayBuffer();
      const base64Data = btoa(
        new Uint8Array(fileBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      onProgress?.(30, 'Sending to AI processor...');

      // Call enhanced AI resume extraction function
      const { data, error } = await supabase.functions.invoke('ai-resume-extraction', {
        body: {
          file: {
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64Data
          },
          options: {
            extractPersonalInfo: true,
            extractExperience: true,
            extractEducation: true,
            extractSkills: true,
            extractProjects: true,
            extractCertifications: true,
            enhanceDescriptions: true,
            generateSummary: true
          }
        }
      });

      if (error) {
        console.error('AI processing error:', error);
        return {
          success: false,
          error: error.message || 'Failed to process resume'
        };
      }

      onProgress?.(90, 'Finalizing extraction...');

      // Transform the extracted data to match our resume format
      const extractedData = transformExtractedData(data);

      onProgress?.(100, 'Processing complete!');

      return {
        success: true,
        extractedData,
        confidence: data.confidence || 0.8
      };

    } catch (error) {
      console.error('Resume processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const parseTextContent = async (text: string): Promise<ProcessingResult> => {
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-resume-parser', {
        body: {
          content: text,
          type: 'text',
          options: {
            extractPersonalInfo: true,
            extractExperience: true,
            extractEducation: true,
            extractSkills: true,
            enhanceContent: true
          }
        }
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Failed to parse content'
        };
      }

      return {
        success: true,
        extractedData: transformExtractedData(data),
        confidence: data.confidence || 0.7
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Parsing failed'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const transformExtractedData = (rawData: any) => {
    // Transform AI extraction result to our resume data format
    return {
      personalInfo: {
        fullName: rawData.personalInfo?.name || rawData.personalInfo?.fullName || '',
        email: rawData.personalInfo?.email || '',
        phone: rawData.personalInfo?.phone || '',
        location: rawData.personalInfo?.location || rawData.personalInfo?.address || '',
        linkedin: rawData.personalInfo?.linkedin || '',
        website: rawData.personalInfo?.website || rawData.personalInfo?.portfolio || ''
      },
      summary: rawData.summary || rawData.professionalSummary || '',
      experience: (rawData.experience || []).map((exp: any, index: number) => ({
        id: `exp-${index}-${Date.now()}`,
        title: exp.title || exp.position || '',
        company: exp.company || exp.employer || '',
        location: exp.location || '',
        startDate: exp.startDate || exp.start || '',
        endDate: exp.endDate || exp.end || '',
        current: exp.current || exp.isCurrent || false,
        description: exp.description || exp.responsibilities?.join('\n') || ''
      })),
      education: (rawData.education || []).map((edu: any, index: number) => ({
        id: `edu-${index}-${Date.now()}`,
        degree: edu.degree || edu.qualification || '',
        institution: edu.institution || edu.school || edu.university || '',
        location: edu.location || '',
        graduationDate: edu.graduationDate || edu.year || edu.endDate || '',
        gpa: edu.gpa || edu.grade || ''
      })),
      skills: (rawData.skills || []).map((skill: any, index: number) => ({
        id: `skill-${index}-${Date.now()}`,
        name: typeof skill === 'string' ? skill : skill.name || skill.skill,
        level: typeof skill === 'object' ? skill.level || 'Intermediate' : 'Intermediate'
      })),
      projects: (rawData.projects || []).map((project: any, index: number) => ({
        id: `project-${index}-${Date.now()}`,
        name: project.name || project.title || '',
        description: project.description || '',
        technologies: Array.isArray(project.technologies) 
          ? project.technologies.join(', ') 
          : project.technologies || project.techStack || '',
        link: project.link || project.url || project.github || ''
      })),
      certifications: (rawData.certifications || []).map((cert: any, index: number) => ({
        id: `cert-${index}-${Date.now()}`,
        name: cert.name || cert.title || '',
        issuer: cert.issuer || cert.organization || '',
        date: cert.date || cert.year || cert.issuedDate || ''
      }))
    };
  };

  return {
    processResumeFile,
    parseTextContent,
    isProcessing
  };
};