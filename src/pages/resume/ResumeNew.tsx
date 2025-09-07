import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ThreePaneResumeBuilder } from '@/components/resume/enhanced/ThreePaneResumeBuilder';
import { createEmptyEditorResume } from '@/types/editor-resume';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    try {
      console.log('Saving resume data:', resumeData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save your resume');
        return;
      }

      const { data, error } = await supabase
        .from('ai_resumes')
        .upsert({
          user_id: user.id,
          content: resumeData,
          title: resumeData.personalInfo?.fullName || 'Resume',
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Resume saved successfully!');
      console.log('Resume saved:', data);
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume');
    }
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
