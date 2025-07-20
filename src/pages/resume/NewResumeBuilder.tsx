import React from 'react';
import { ModernResumeBuilder } from '@/components/resume/modern/ModernResumeBuilder';

const NewResumeBuilder = () => {
  const mockResumeData = {
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  };

  const handleDataChange = (data: any) => {
    console.log('Resume data updated:', data);
  };

  return (
    <ModernResumeBuilder
      resumeData={mockResumeData}
      onDataChange={handleDataChange}
    />
  );
};

export default NewResumeBuilder;