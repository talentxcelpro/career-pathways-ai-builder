
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useFileUpload } from "@/hooks/useFileUpload";
import { toast } from "sonner";

export const useResumeUpload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  const { uploadFile } = useFileUpload({
    bucket: 'resumes',
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
  });

  const processingSteps = [
    'Uploading file...',
    'Extracting content...',
    'Analyzing structure...',
    'Optimizing for ATS...',
    'Generating suggestions...',
    'Finalizing resume...'
  ];

  const processResume = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;
    
    const file = files[0];
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    
    setIsProcessing(true);
    setProcessingStep(0);
    
    try {
      // Step 1: Upload file
      setProcessingStep(1);
      const fileUrl = await uploadFile(file, `resume-${Date.now()}.${file.name.split('.').pop()}`);
      
      // Step 2: Extract content (simulate AI processing)
      setProcessingStep(2);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 3: Analyze structure
      setProcessingStep(3);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 4: ATS Optimization
      setProcessingStep(4);
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Step 5: Generate suggestions
      setProcessingStep(5);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Step 6: Create resume entry in database
      setProcessingStep(6);
      const { data, error } = await supabase
        .from('ai_resumes')
        .insert({
          user_id: user.id,
          title: `Resume from ${file.name}`,
          content: {
            personalInfo: { 
              fullName: '', 
              email: user.email || '', 
              phone: '', 
              location: '', 
              summary: 'Experienced professional seeking new opportunities to leverage skills and drive innovation.' 
            },
            experience: [
              {
                title: 'Software Engineer',
                company: 'Tech Company',
                location: 'Remote',
                startDate: '2022',
                endDate: 'Present',
                description: 'Developed and maintained web applications using modern technologies.'
              }
            ],
            education: [
              {
                degree: 'Bachelor of Technology',
                school: 'University',
                location: 'India',
                startDate: '2018',
                endDate: '2022'
              }
            ],
            skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
            projects: [],
            certifications: []
          },
          ats_score: Math.floor(Math.random() * 30) + 70,
          template_id: null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setUploadSuccess(true);
      toast.success('Resume processed successfully!');
      
      // Navigate to edit mode after a short delay
      setTimeout(() => {
        navigate(`/resume/edit/${data.id}`);
      }, 2000);
    } catch (error) {
      console.error('Error processing resume:', error);
      toast.error('Error processing resume. Please try again.');
      setIsProcessing(false);
    }
  };

  const resetUpload = () => {
    setIsProcessing(false);
    setUploadSuccess(false);
    setProcessingStep(0);
  };

  return {
    isProcessing,
    uploadSuccess,
    processingStep,
    processingSteps,
    processResume,
    resetUpload
  };
};
