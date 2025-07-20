
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useFileUpload } from "@/hooks/useFileUpload";
import { EnhancedResumeProcessor } from "@/services/resume-enhancer/EnhancedResumeProcessor";
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
    allowedTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain']
  });

  const processingSteps = [
    'Uploading file...',
    'Advanced text extraction...',
    'AI-powered parsing with NLP...',
    'Structure analysis & validation...',
    'ATS optimization & scoring...',
    'Generating enhancement suggestions...',
    'Finalizing enhanced resume...'
  ];

  const processResume = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;
    
    const file = files[0];
    
    // Enhanced file validation
    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/msword',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, Word document, or text file');
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
      // Step 1: Upload file to storage
      setProcessingStep(1);
      const fileUrl = await uploadFile(file, `resume-${Date.now()}.${file.name.split('.').pop()}`);
      console.log('File uploaded successfully:', fileUrl);
      
      // Step 2-7: Enhanced AI Processing handled by ProcessingStep component
      // The actual processing will be done in the ProcessingStep component
      // This hook just handles the file upload and database operations
      
      setUploadSuccess(true);
      toast.success('Resume uploaded successfully! Processing will begin in the next step.');
      
    } catch (error) {
      console.error('Error uploading resume:', error);
      
      let errorMessage = 'Error uploading resume. Please try again.';
      if (error.message?.includes('File size')) {
        errorMessage = 'File is too large. Please use a file smaller than 10MB.';
      } else if (error.message?.includes('File type')) {
        errorMessage = 'Unsupported file type. Please use PDF, Word, or text files.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  const saveProcessedResume = async (processedData: any) => {
    if (!user) {
      toast.error('Please sign in to save your resume');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('ai_resumes')
        .insert({
          user_id: user.id,
          title: processedData.enhancedContent.personalInfo.fullName 
            ? `${processedData.enhancedContent.personalInfo.fullName}'s Resume`
            : 'Enhanced Resume',
          content: processedData.enhancedContent as any,
          ats_score: processedData.enhancementScore?.atsCompatibility || 75,
          template_id: processedData.selectedTemplate || 'modern-professional'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }
      
      console.log('Enhanced resume saved to database:', data);
      toast.success('Resume processed and saved successfully!');
      
      // Navigate to edit mode
      setTimeout(() => {
        navigate(`/resume-builder/edit/${data.id}`);
      }, 1500);

    } catch (error) {
      console.error('Error saving processed resume:', error);
      toast.error('Failed to save processed resume. Please try again.');
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
    saveProcessedResume,
    resetUpload
  };
};
