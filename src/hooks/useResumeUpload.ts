
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useFileUpload } from "@/hooks/useFileUpload";
import { EnhancedResumeProcessor } from "@/services/enhancedResumeProcessor";
import { ResumeDataService } from "@/services/resumeDataService";
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
      console.log('File uploaded successfully:', fileUrl);
      
      // Step 2: Enhanced AI Processing with direct file upload
      setProcessingStep(2);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('fileType', file.type);
      formData.append('extractionLevel', 'comprehensive');

      const response = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/ai-resume-extraction', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
        },
        body: formData
      });

      if (!response.ok) {
        console.error('Resume extraction failed:', response.status, response.statusText);
        let errorMessage = 'Failed to process resume';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Could not parse error response as JSON:', e);
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      let extractedContent;
      try {
        extractedContent = await response.json();
      } catch (e) {
        console.error('Could not parse response as JSON:', e);
        throw new Error('Invalid response from server. Please try again.');
      }
      console.log('Enhanced content processed:', extractedContent);
      
      // Step 3: Advanced structure analysis (built into processor)
      setProcessingStep(3);
      console.log('Structure analysis complete');
      
      // Step 4: ATS Optimization (built into processor) 
      setProcessingStep(4);
      console.log('ATS optimization complete - Score:', extractedContent.atsOptimization.score);
      
      // Step 5: Generate enhancement suggestions (built into processor)
      setProcessingStep(5);
      console.log('Enhancement suggestions generated:', extractedContent.suggestions.length);
      
      // Step 6: Save to normalized database tables
      setProcessingStep(6);
      await ResumeDataService.saveExtractedData(
        user.id,
        extractedContent as any,
        extractedContent.atsOptimization?.score || 75,
        file.name
      );
      
      console.log('Resume data saved to normalized tables');
      setUploadSuccess(true);
      toast.success('Resume processed successfully!');
      
      // Navigate to editor after a short delay
      setTimeout(() => {
        navigate('/resume-builder/editor');
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
