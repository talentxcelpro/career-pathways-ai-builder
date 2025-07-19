
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { EnhancedResumeBuilder } from './EnhancedResumeBuilder';
import { EnhancedResumeData, ProcessedResumeData } from '@/types/enhanced-resume';

interface UnifiedResumeInterfaceProps {
  mode?: 'create' | 'edit';
  resumeId?: string;
}

export const UnifiedResumeInterface: React.FC<UnifiedResumeInterfaceProps> = ({
  mode = 'create',
  resumeId
}) => {
  const location = useLocation();
  const [resumeData, setResumeData] = useState<EnhancedResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeData = () => {
      // Check if we have resume data from navigation state (upload flow)
      const navigationData = location.state?.resumeData;
      
      if (navigationData) {
        console.log('Processing navigation data:', navigationData);
        
        // Convert ProcessedResumeData to EnhancedResumeData
        const convertedData: EnhancedResumeData = {
          personalInfo: {
            fullName: navigationData.personalInfo?.fullName || '',
            email: navigationData.personalInfo?.email || '',
            phone: navigationData.personalInfo?.phone || '',
            location: navigationData.personalInfo?.location || '',
            summary: navigationData.personalInfo?.summary || '',
            linkedin: navigationData.personalInfo?.linkedin || '',
            website: navigationData.personalInfo?.website || '',
            github: navigationData.personalInfo?.github || ''
          },
          professionalSummary: {
            content: navigationData.personalInfo?.summary || '',
            keyHighlights: []
          },
          experience: navigationData.experience || [],
          education: navigationData.education || [],
          skills: navigationData.skills || [],
          projects: navigationData.projects || [],
          certifications: navigationData.certifications || [],
          awards: navigationData.awards || [],
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
            fontSize: 12,
            spacing: 'normal'
          }
        };
        
        setResumeData(convertedData);
      }
      
      setIsLoading(false);
    };

    initializeData();
  }, [location.state, resumeId]);

  const handleSave = async (data: EnhancedResumeData) => {
    try {
      console.log('Saving resume data:', data);
      // TODO: Implement actual save logic
      // await saveResumeData(data);
    } catch (error) {
      console.error('Failed to save resume:', error);
      throw error;
    }
  };

  const handleExport = async (data: EnhancedResumeData) => {
    try {
      console.log('Exporting resume data:', data);
      // TODO: Implement actual export logic
      // await exportResume(data);
    } catch (error) {
      console.error('Failed to export resume:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <EnhancedResumeBuilder
      initialData={resumeData || undefined}
      onSave={handleSave}
      onExport={handleExport}
    />
  );
};
