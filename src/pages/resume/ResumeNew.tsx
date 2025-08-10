import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ThreePaneResumeBuilder } from '@/components/resume/enhanced/ThreePaneResumeBuilder';
import { createEmptyEditorResume } from '@/types/editor-resume';

const ResumeNew: React.FC = () => {
  const [data, setData] = React.useState(() => {
    const defaultData = createEmptyEditorResume();
    // Set some sample data like in the screenshot
    defaultData.personalInfo.fullName = 'John Doe';
    defaultData.personalInfo.professionalTitle = 'Senior Software Engineer';
    defaultData.personalInfo.email = 'john@example.com';
    defaultData.personalInfo.phone = '+1 (555) 123-4567';
    defaultData.personalInfo.location = 'San Francisco, CA';
    defaultData.personalInfo.linkedin = 'linkedin.com/in/johndoe';
    defaultData.personalInfo.github = 'github.com/johndoe';
    defaultData.personalInfo.website = 'johndoe.com';
    defaultData.personalInfo.summary = 'Write a brief professional summary highlighting your key skills and experience...';
    return defaultData;
  });

  const handleSave = async (resumeData: any) => {
    console.log('Saving resume data:', resumeData);
    // TODO: Save to Supabase
  };

  return (
    <div>
      <Helmet>
        <title>Create Resume | Upload & Edit</title>
        <meta name="description" content="Upload your PDF/DOCX resume, auto-parse it, and edit instantly in the builder." />
        <link rel="canonical" href="https://talentxcel.in/resume/new" />
      </Helmet>
      <ThreePaneResumeBuilder 
        data={data} 
        onChange={setData}
        onSave={handleSave}
      />
    </div>
  );
};

export default ResumeNew;
